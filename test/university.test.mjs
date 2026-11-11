import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.mjs";
import {UNIVERSITY_SOURCE,UNIVERSITY_METRICS,UNIVERSITY_TOOLS,parseUniversityPayload,queryUniversity} from "../university.mjs";

const base="https://data.hanbom.rhee.life";
const fakeKey="a".repeat(64); // Synthetic test fixture, NOT an actual issued credential.
const env={UNIVERSITY_INFO_API_KEY:fakeKey};
const comparisonXml='<?xml version="1.0"?><response><header><resultCode>00</resultCode><resultMsg>NORMAL SERVICE.</resultMsg></header><body><items><item><schlId>0001</schlId><schlKrnNm>예시대학교</schlKrnNm><schlDivNm>대학</schlDivNm><svyYr>2026</svyYr><indctId>LIB</indctId><indctVal1>128.4</indctVal1></item></items><numOfRows>20</numOfRows><pageNo>1</pageNo><totalCount>1</totalCount></body></response>';
const regionalXml='<response><header><resultCode>00</resultCode></header><body><totalCount>1</totalCount><items><item><schlDivCd>A</schlDivCd><fieldType1>지역</fieldType1><fieldVal1>서울</fieldVal1><fieldType2>비율</fieldType2><fieldVal2>63.5</fieldVal2><indctId>LIB</indctId></item></items></body></response>';
const emptyXml='<response><header><resultCode>00</resultCode></header><body><totalCount>0</totalCount><items></items></body></response>';
const req=async(path,key=env)=>{
 const response=await worker.fetch(new Request(base+path),key,{});
 return{status:response.status,body:await response.json()};
};
async function withMock(callback,respond){
 const old=globalThis.fetch,seen=[];
 globalThis.fetch=async value=>{
  const url=new URL(String(value));seen.push(url);
  assert.equal(url.origin,"https://apis.data.go.kr");
  assert.ok(url.pathname.startsWith("/B340014/EducationConditionService/get"));
  assert.equal(url.searchParams.get("serviceKey"),fakeKey);
  const reply=respond?await respond(url):comparisonXml;
  return new Response(reply,{status:200,headers:{"content-type":"application/xml"}});
 };
 try{return await callback(seen);}finally{globalThis.fetch=old;}
}
async function mcp(name,args={},binding=env){
 const r=await worker.fetch(new Request(base+"/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:30,method:"tools/call",params:{name,arguments:args}})}),binding,{});
 return(await r.json());
}

test("university source metadata preserves exactly 6 source metrics and 12 official operations",()=>{
 assert.equal(UNIVERSITY_SOURCE.dataset,"15158679");
 assert.equal(UNIVERSITY_SOURCE.keyIssuedOn,"2026-11-11");
 assert.equal(UNIVERSITY_SOURCE.keyValidThrough,"2028-11-11");
 assert.equal(UNIVERSITY_METRICS.length,6);
 assert.equal(UNIVERSITY_TOOLS.length,4);
 const paths=UNIVERSITY_METRICS.flatMap(m=>[m.comparison,m.regional]);
 assert.equal(new Set(paths).size,12);
 assert.ok(paths.every(p=>/^get(?:Comparison|Regional)[A-Za-z]+$/.test(p)));
 assert.ok(paths.includes("getComparisonSchoolGroundsAndBdsEnsureRate"));
 assert.ok(paths.includes("getRegionalLibraryBudgetCrntSt"));
});

test("XML and JSON parsers preserve the original metric value without inventing units",()=>{
 const one=parseUniversityPayload(comparisonXml);
 assert.equal(one.total,1);
 assert.equal(one.rows.length,1);
 assert.equal(one.rows[0].school_name,"예시대학교");
 assert.equal(one.rows[0].school_id,"0001");
 assert.equal(one.rows[0].indicator_value,"128.4");
 assert.equal(one.rows[0].fields.svyYr,"2026");
 const reg=parseUniversityPayload(regionalXml);
 assert.equal(reg.rows[0].regional_values.length,2);
 assert.equal(reg.rows[0].regional_values[0].type,"지역");
 assert.equal(reg.rows[0].regional_values[1].value,"63.5");
 assert.equal(parseUniversityPayload(emptyXml).total,0);
 assert.deepEqual(parseUniversityPayload(emptyXml).rows,[]);
 const j=JSON.stringify({response:{header:{resultCode:"00"},body:{totalCount:1,items:{item:{schlKrnNm:"예시대학교",indctVal1:"1"}}}}});
 assert.equal(parseUniversityPayload(j).rows[0].indicator_value,"1");
 assert.throws(()=>parseUniversityPayload("<script>bad</script>"),/UNIVERSITY_INVALID_RESPONSE/);
 assert.throws(()=>parseUniversityPayload("<response><header><resultCode>30</resultCode></header></response>"),/UNIVERSITY_UPSTREAM_REJECTED/);
});

test("all 12 university education operations route to exact documented paths",async()=>{
 await withMock(async seen=>{
  for(const metric of UNIVERSITY_METRICS){
   const comparison=await req("/api/university/query?scope=comparison&metric="+metric.id+"&schoolId=0001&year=2026&page=1&size=20");
   assert.equal(comparison.status,200,metric.id);
   assert.equal(comparison.body.metric,metric.id);
   assert.equal(comparison.body.items[0].school_name,"예시대학교");
   assert.equal(comparison.body.items[0].indicator_value,"128.4");
   const regional=await req("/api/university/query?scope=regional&metric="+metric.id+"&schoolDivisionCode=A");
   assert.equal(regional.status,200);
   assert.equal(regional.body.scope,"regional");
  }
  assert.equal(seen.length,12);
  for(let i=0;i<UNIVERSITY_METRICS.length;i++){
   const metric=UNIVERSITY_METRICS[i];
   assert.equal(seen[i*2].pathname.endsWith("/"+metric.comparison),true);
   assert.equal(seen[i*2].searchParams.get("schlId"),"0001");
   assert.equal(seen[i*2].searchParams.get("svyYr"),"2026");
   assert.equal(seen[i*2+1].pathname.endsWith("/"+metric.regional),true);
   assert.equal(seen[i*2+1].searchParams.get("schlDivCd"),"A");
  }
 });
});

test("serviceKey is exclusively injected on the server and never leaked into any response",async()=>{
 await withMock(async seen=>{
  const r=await req("/api/university/query?scope=comparison&metric=library&schoolId=0001&year=2026");
  assert.equal(r.status,200);
  assert.equal(r.body.count,1);
  assert.equal(r.body.has_more,false);
  assert.equal(r.body.source_page,UNIVERSITY_SOURCE.url);
  assert.equal(JSON.stringify(r.body).includes(fakeKey),false);
  assert.equal(JSON.stringify(r.body).includes("serviceKey="),false);
  assert.equal(seen[0].searchParams.get("serviceKey"),fakeKey);
  assert.equal(seen[0].searchParams.get("pageNo"),"1");
  assert.equal(seen[0].searchParams.get("numOfRows"),"20");
 });
 const meta=await req("/api/university/meta");
 assert.equal(meta.status,200);
 assert.equal(meta.body.key_configured,true);
 assert.equal(meta.body.operations.length,12);
 assert.equal(JSON.stringify(meta.body).includes(fakeKey),false);
 const emptyKey=await req("/api/university/status",{});
 assert.equal(emptyKey.status,200);
 assert.equal(emptyKey.body.key_configured,false);
});

test("query options must be strictly validated before external requests are attempted",async()=>{
 for(const suffix of [
  "scope=comparison&metric=library&year=2026",
  "scope=comparison&metric=library&schoolId=1",
  "scope=comparison&metric=nope&schoolId=1&year=2026",
  "scope=comparison&metric=library&schoolId=%2Fetc%2Fpasswd&year=2026",
  "scope=comparison&metric=library&schoolId=123&year=2026&serviceKey=attacker",
  "scope=regional&metric=library",
  "scope=regional&metric=library&schoolDivisionCode=../hack",
  "scope=comparison&metric=library&schoolId=1&year=2026&page=1000",
  "scope=comparison&metric=library&schoolId=1&year=2026&size=1000",
  "scope=comparison&metric=library&schoolId=1&year=2026&indicatorId=2",
  "scope=comparison&metric=library&schoolId=1&year=2026&metric=dormitory"
 ]){
  const r=await req("/api/university/query?"+suffix);
  assert.equal(r.status,400,suffix);
 }
 assert.equal((await req("/api/university/unknown")).status,404);
 assert.equal((await req("/api/university/query?scope=regional&metric=library&schoolDivisionCode=A",{})).status,503);
});

test("successful no-data payload is an empty result rather than a fabricated statistic",async()=>{
 await withMock(async()=>{
  const r=await req("/api/university/query?scope=regional&metric=dormitory&schoolDivisionCode=A");
  assert.equal(r.status,200);
  assert.equal(r.body.count,0);
  assert.deepEqual(r.body.items,[]);
 },()=>emptyXml);
});

test("upstream errors are safely classified and reject key-bearing redirects",async()=>{
 await withMock(async()=>{
  const r=await req("/api/university/query?scope=regional&metric=library&schoolDivisionCode=A");
  assert.equal(r.status,502);
  assert.equal(r.body.error,"UNIVERSITY_UPSTREAM_REJECTED");
  assert.equal(JSON.stringify(r.body).includes(fakeKey),false);
 },()=>"<response><header><resultCode>30</resultCode></header></response>");
 const old=globalThis.fetch;
 globalThis.fetch=async()=>new Response(null,{status:302,headers:{location:"https://malicious.invalid/?key="+fakeKey}});
 try{
  const r=await req("/api/university/query?scope=regional&metric=library&schoolDivisionCode=A");
  assert.equal(r.status,502);
  assert.equal(r.body.error,"UNIVERSITY_UNEXPECTED_REDIRECT");
  assert.equal(JSON.stringify(r.body).includes(fakeKey),false);
 }finally{globalThis.fetch=old;}
});

test("MCP catalog, two data tools and safe status extend 74 existing tools",async()=>{
 const registry=await worker.fetch(new Request(base+"/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:3,method:"tools/list",params:{}})}),env,{});
 const names=(await registry.json()).result.tools.map(t=>t.name);
 assert.equal(names.length,78);assert.equal(new Set(names).size,78);
 assert.ok(names.includes("get_board_posts"));assert.ok(names.includes("get_neis_meals"));
 for(const t of UNIVERSITY_TOOLS)assert.ok(names.includes(t.name));
 const catalog=await mcp("get_university_education_catalog");
 assert.equal(catalog.result.structuredContent.operations.length,12);
 const status=await mcp("get_university_education_status");
 assert.equal(status.result.structuredContent.key_configured,true);
 const invalid=await mcp("get_university_education_comparison",{metric:"library",schoolId:"??",year:"2026"});
 assert.equal(invalid.error.code,-32602);
 await withMock(async()=>{
  const stat=await mcp("get_university_education_comparison",{metric:"library",schoolId:"0001",year:"2026"});
  assert.equal(stat.result.structuredContent.items[0].school_name,"예시대학교");
  assert.equal(JSON.stringify(stat.result).includes(fakeKey),false);
 });
 const missing=await mcp("get_university_education_region",{metric:"dormitory",schoolDivisionCode:"A"},{});
 assert.equal(missing.result.isError,true);
 assert.equal(missing.result.content[0].text,"UNIVERSITY_KEY_NOT_CONFIGURED");
});

test("university page renders accessible search inputs and retains dark theme",async()=>{
 const page=await worker.fetch(new Request(base+"/universities"),env,{});
 assert.equal(page.status,200);
 const html=await page.text();
 assert.match(html,/<h1>대학알리미 교육여건<\/h1>/);
 assert.match(html,/id="university-form"/);
 assert.match(html,/id="university-metric"/);
 assert.match(html,/data-uni-scope="comparison"/);
 assert.match(html,/data-uni-scope="regional"/);
 assert.equal((html.match(/<option value="(?:library|dormitory|burden|endowment|materials|campus)"/g)||[]).length,6);
 assert.match(html,/data-theme-choice="dark"/);
 assert.match(html,/source_page|api\/university\/query/);
 assert.equal(html.includes(fakeKey),false);
 assert.equal((await worker.fetch(new Request(base+"/universities/",{method:"HEAD"}),env,{})).status,200);
 assert.equal((await worker.fetch(new Request(base+"/universities",{method:"POST"}),env,{})).status,405);
 const home=await (await worker.fetch(new Request(base+"/"),env,{})).text();
 assert.match(home,/href="\/universities"/);
 assert.equal((home.match(/<hanbom-pill/g)||[]).length,132);
 assert.equal((home.match(/data-category="/g)||[]).length,129);
});
