import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.mjs";
import {NEIS_SCHOOL,NEIS_TOOLS,NEIS_API_PATHS,NEIS_DEPARTMENTS} from "../neis.mjs";

const base="https://data.hanbom.rhee.life";
const fakeCredential="a".repeat(32); // Synthetic fixture: never an issued API key.
const env={NEIS_API_KEY:fakeCredential};
const school=[{SCHUL_NM:"한봄고등학교",ATPT_OFCDC_SC_CODE:"J10",SD_SCHUL_CODE:"7531327",ATPT_OFCDC_SC_NM:"경기도교육청",SCHUL_KND_SC_NM:"특성화고등학교",ORG_RDNMA:"경기도 수원시",FOND_YMD:"20200301"}];
const meal=[{MLSV_YMD:"20261111",MMEAL_SC_NM:"중식",MMEAL_SC_CODE:"2",DDISH_NM:"쌀밥<br/>국<br/>달걀말이(1)",CAL_INFO:"780.2 Kcal",NTR_INFO:"탄수화물 110g",ORPLC_INFO:"쌀: 국내산",MLSV_FGR:"180"}];
const event=[{AA_YMD:"20261111",EVENT_NM:"대학 진학 상담",EVENT_CNTNT:"3학년 상담",THREE_GRADE_EVENT_YN:"Y",ONE_GRADE_EVENT_YN:"N",TW_GRADE_EVENT_YN:"N"}];
const lessons=[{ALL_TI_YMD:"20261111",AY:"2026",SEM:"2",DDDEP_NM:"빅데이터정보과",GRADE:"3",CLASS_NM:"1",CLRM_NM:"301호",PERIO:"3",ITRT_CNTNT:"자료구조"}];
const datasets={schoolInfo:school,mealServiceDietInfo:meal,SchoolSchedule:event,hisTimetable:lessons};
const fixture=(dataset,rows=datasets[dataset])=>({[dataset]:[
 {head:[{list_total_count:rows.length},{RESULT:{CODE:"INFO-000",MESSAGE:"정상 처리되었습니다."}}]},
 {row:rows}
]});
async function fakeFetch(work,override=null){
 const original=globalThis.fetch,requests=[];
 globalThis.fetch=async value=>{
  const u=new URL(String(value));requests.push(u);
  assert.equal(u.origin,"https://open.neis.go.kr");
  assert.equal(u.searchParams.get("KEY"),fakeCredential);
  assert.equal(u.searchParams.get("ATPT_OFCDC_SC_CODE"),"J10");
  assert.equal(u.searchParams.get("SD_SCHUL_CODE"),"7531327");
  const dataset=u.pathname.split("/").at(-1);
  assert.ok(Object.hasOwn(datasets,dataset));
  const body=override?await override(dataset,u):fixture(dataset);
  return new Response(JSON.stringify(body),{status:200,headers:{"content-type":"application/json"}});
 };
 try{return await work(requests);}finally{globalThis.fetch=original;}
}
const get=async(path,binding=env)=>{
 const response=await worker.fetch(new Request(base+path),binding,{});
 return{status:response.status,data:await response.json()};
};
async function rpc(name,args={},binding=env){
 const request=new Request(base+"/mcp",{
  method:"POST",headers:{"content-type":"application/json","accept":"application/json"},
  body:JSON.stringify({jsonrpc:"2.0",id:17,method:"tools/call",params:{name,arguments:args}})
 });
 return(await worker.fetch(request,binding,{})).json();
}

test("NEIS uses exact Hanbom school codes and today's issued key as a server secret only",async()=>{
 assert.equal(NEIS_SCHOOL.name,"한봄고등학교");
 assert.equal(NEIS_SCHOOL.schoolCode,"7531327");
 assert.equal(NEIS_SCHOOL.educationOffice,"J10");
 assert.equal(NEIS_SCHOOL.keyIssuedOn,"2026-11-11");
 assert.equal(NEIS_TOOLS.length,6);
 assert.equal(NEIS_DEPARTMENTS.length,6);
 assert.equal(Object.keys(NEIS_API_PATHS).length,7);
 const r=await get("/api/neis/meta");
 assert.equal(r.status,200);
 assert.equal(r.data.key_configured,true);
 assert.equal(r.data.key_issued_on,"2026-11-11");
 assert.equal(JSON.stringify(r.data).includes(fakeCredential),false);
 assert.equal((await get("/api/neis/status",{})).data.key_configured,false);
});

test("NEIS official school directory provides public school metadata",async()=>{
 await fakeFetch(async requests=>{
  const r=await get("/api/neis/school");
  assert.equal(r.status,200);
  assert.equal(r.data.items[0].school_name,"한봄고등학교");
  assert.equal(r.data.items[0].school_code,"7531327");
  assert.equal(r.data.items[0].office_code,"J10");
  assert.equal(r.data.items[0].address,"경기도 수원시");
  assert.equal(requests[0].pathname,"/hub/schoolInfo");
  assert.equal(JSON.stringify(r.data).includes(fakeCredential),false);
 });
});

test("NEIS meals retain dish names, allergy numbers, nutrition and calories",async()=>{
 await fakeFetch(async requests=>{
  const r=await get("/api/neis/meals?date=2026-11-11&mealType=2");
  assert.equal(r.status,200);
  assert.equal(r.data.count,1);
  assert.deepEqual(r.data.items[0].dishes,["쌀밥","국","달걀말이(1)"]);
  assert.equal(r.data.items[0].calories,"780.2 Kcal");
  assert.equal(r.data.items[0].nutrition[0],"탄수화물 110g");
  assert.equal(r.data.items[0].origin[0],"쌀: 국내산");
  assert.equal(requests[0].pathname,"/hub/mealServiceDietInfo");
  assert.equal(requests[0].searchParams.get("MMEAL_SC_CODE"),"2");
  assert.equal(requests[0].searchParams.get("MLSV_FROM_YMD"),"20261111");
 });
});

test("NEIS event grade flags and date filter preserve official records",async()=>{
 await fakeFetch(async()=>{
  const r=await get("/api/neis/calendar?date=2026-11-11&grade=3");
  assert.equal(r.status,200);
  assert.equal(r.data.count,1);
  assert.equal(r.data.items[0].title,"대학 진학 상담");
  assert.equal(r.data.items[0].grades[3],true);
  assert.equal(r.data.items[0].grades[1],false);
  const filtered=await get("/api/neis/calendar?date=2026-11-11&grade=1");
  assert.equal(filtered.status,200);
  assert.equal(filtered.data.count,0);
 });
});

test("NEIS high school timetable restricts the request by grade, class, major",async()=>{
 await fakeFetch(async requests=>{
  const r=await get("/api/neis/timetable?date=2026-11-11&grade=3&className=1&department="+encodeURIComponent("빅데이터정보과"));
  assert.equal(r.status,200);
  assert.equal(r.data.items[0].subject,"자료구조");
  assert.equal(r.data.items[0].period,3);
  assert.equal(r.data.items[0].department,"빅데이터정보과");
  const p=requests[0].searchParams;
  assert.equal(requests[0].pathname,"/hub/hisTimetable");
  assert.equal(p.get("GRADE"),"3");
  assert.equal(p.get("CLASS_NM"),"1");
  assert.equal(p.get("DDDEP_NM"),"빅데이터정보과");
 });
});

test("NEIS daily overview can combine three independently fetched datasets",async()=>{
 await fakeFetch(async requests=>{
  const r=await get("/api/neis/today?date=2026-11-11&grade=3&className=1");
  assert.equal(r.status,200);
  assert.equal(r.data.kind,"today");
  assert.equal(r.data.date,"2026-11-11");
  assert.equal(r.data.partial,false);
  assert.equal(r.data.sections.meals.count,1);
  assert.equal(r.data.sections.calendar.count,1);
  assert.equal(r.data.sections.timetable.count,1);
  assert.equal(requests.length,3);
 });
});

test("NO_DATA from NEIS is a successful empty result and not an invented meal",async()=>{
 await fakeFetch(async()=>{
  const r=await get("/api/neis/meals?date=2026-11-11");
  assert.equal(r.status,200);
  assert.equal(r.data.count,0);
  assert.deepEqual(r.data.items,[]);
 },()=>({RESULT:{CODE:"INFO-200",MESSAGE:"해당하는 데이터가 없습니다."}}));
});

test("No configured key returns 503 instead of public sample data; blocks arbitrary URLs",async()=>{
 const notConfigured=await get("/api/neis/meals?date=2026-11-11",{});
 assert.equal(notConfigured.status,503);
 assert.equal(notConfigured.data.error,"NEIS_KEY_NOT_CONFIGURED");
 for(const url of [
  "/api/neis/meals?KEY=attacker",
  "/api/neis/timetable?date=2026-11-11&department="+encodeURIComponent("없는과"),
  "/api/neis/meals?from=2026-10-01&to=2026-11-11",
  "/api/neis/meals?date=2026-11-11&date=2026-11-12",
  "/api/neis/timetable?grade=4",
  "/api/neis/meals?date=not-a-date"
 ]){
  assert.equal((await get(url)).status,400,url);
 }
 assert.equal((await get("/api/neis/arbitrary")).status,404);
});

test("MCP tools extend existing 68 without changing RSS paths or exposing secret",async()=>{
 const req=new Request(base+"/mcp",{
  method:"POST",headers:{"content-type":"application/json","accept":"application/json"},
  body:JSON.stringify({jsonrpc:"2.0",id:6,method:"tools/list",params:{}})
 });
 const res=await worker.fetch(req,env,{});
 const names=(await res.json()).result.tools.map(x=>x.name);
 assert.equal(names.length,74);
 assert.equal(new Set(names).size,74);
 assert.ok(names.includes("get_board_posts"));
 for(const t of NEIS_TOOLS)assert.ok(names.includes(t.name));
 const status=await rpc("get_neis_connection_status",{});
 assert.equal(status.result.structuredContent.key_configured,true);
 assert.equal(JSON.stringify(status.result).includes(fakeCredential),false);
 const invalid=await rpc("get_neis_high_school_timetable",{date:"2026-11-11",grade:99});
 assert.equal(invalid.error.code,-32602);
 const missing=await rpc("get_neis_meals",{date:"2026-11-11"},{});
 assert.equal(missing.result.isError,true);
 assert.equal(missing.result.content[0].text,"NEIS_KEY_NOT_CONFIGURED");
 await fakeFetch(async()=>{
  const meals=await rpc("get_neis_meals",{date:"2026-11-11"});
  assert.equal(meals.result.structuredContent.kind,"meals");
  assert.equal(meals.result.structuredContent.items[0].dishes[2],"달걀말이(1)");
 });
});

test("NEIS page is SSR accessible and existing RSS homepage remains intact",async()=>{
 const page=await worker.fetch(new Request(base+"/neis"),env,{});
 assert.equal(page.status,200);
 const html=await page.text();
 assert.match(html,/<h1>한봄고 나이스 데이터<\/h1>/);
 for(const k of ["today","meals","calendar","timetable","school"])assert.match(html,new RegExp('data-neis-tab="'+k+'"'));
 assert.match(html,/name="color-scheme" content="light dark"/);
 assert.match(html,/data-neis-field="department"/);
 assert.match(html,/id="neis-results"/);
 assert.equal(html.includes(fakeCredential),false);
 assert.equal((await worker.fetch(new Request(base+"/neis/",{method:"HEAD"}),env,{})).status,200);
 assert.equal((await worker.fetch(new Request(base+"/neis",{method:"POST"}),env,{})).status,405);
 const home=await (await worker.fetch(new Request(base+"/"),env,{})).text();
 assert.equal((home.match(/data-category="/g)||[]).length,129);
 assert.match(home,/class="pill-button pill-link" href="\/neis"/);
 const meta=(await get("/api/catalog")).data;
 assert.equal(meta.source_count,82);
});
