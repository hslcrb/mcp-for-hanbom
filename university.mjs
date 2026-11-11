/**
 * University Information Disclosure: 12 education conditions endpoints.
 * Source: Korean Council for University Education, data.go.kr dataset 15158679.
 * Developer key issued 2026-11-11, approved to 2028-11-11.
 *
 * Secret is NEVER returned, stored in Git, or included in a cache key.
 * The API provider receives it as a required "serviceKey" query parameter.
 */
export const UNIVERSITY_SOURCE=Object.freeze({
 dataset:"15158679",name:"한국대학교육협의회_대학알리미 교육여건 현황_GW",
 organization:"한국대학교육협의회",url:"https://www.data.go.kr/data/15158679/openapi.do",
 apiHost:"https://apis.data.go.kr",apiBase:"/B340014/EducationConditionService",
 keyIssuedOn:"2026-11-11",keyValidThrough:"2028-11-11",
 license:"원본 공공데이터포털: 이용허락범위 제한 없음",
 quotaNote:"개발계정: 상세 기능별 하루 1,000회 요청"
});
export const UNIVERSITY_METRICS=Object.freeze([
 {id:"library",label:"도서관 예산",comparison:"getComparisonLibraryBudgetCrntSt",regional:"getRegionalLibraryBudgetCrntSt"},
 {id:"dormitory",label:"기숙사 수용 현황",comparison:"getComparisonDormitoryAcceptanceCrntSt",regional:"getRegionalDormitoryAcceptanceCrntSt"},
 {id:"burden",label:"수익용 기본재산 부담률",comparison:"getComparisonBasicPropertiesForProfitBurdenRate",regional:"getRegionalBasicPropertiesForProfitBurdenRate"},
 {id:"endowment",label:"수익용 기본재산 확보 현황",comparison:"getComparisonBasicPropertiesForprofitCrntSt",regional:"getRegionalBasicPropertiesForprofitCrntSt"},
 {id:"materials",label:"학생 1인당 자료 구입비",comparison:"getComparisonStudentForPersonDataPurchasePrice",regional:"getRegionalStudentForPersonDataPurchasePrice"},
 {id:"campus",label:"교지·교사 확보율",comparison:"getComparisonSchoolGroundsAndBdsEnsureRate",regional:"getRegionalSchoolGroundsAndBdsEnsureRate"}
]);
export const UNIVERSITY_API_PATHS=Object.freeze({
 "/api/university/meta":"meta","/api/university/status":"status",
 "/api/university/query":"query"
});
const METRICS=Object.freeze(Object.fromEntries(UNIVERSITY_METRICS.map(x=>[x.id,x])));
const SCOPE=Object.freeze(["comparison","regional"]);
const MAX_SIZE=50,MAX_PAGE=10,MAX_XML=900000,TIMEOUT=12000,TTL_SECONDS=7200;
export class UniversityError extends Error{
 constructor(code,status=502){super(code);this.name="UniversityError";this.code=code;this.status=status;}
}
const bad=()=>{throw new UniversityError("INVALID_ARGUMENT",400);};
const object=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const fieldText=(value,n=240)=>String(value??"").replace(/\0/g,"").trim().slice(0,n);
function validateQuery(input,forcedScope){
 if(!object(input))bad();
 const allowed=["scope","metric","schoolId","year","schoolDivisionCode","page","size","indicatorId"];
 if(Object.keys(input).some(k=>!allowed.includes(k)))bad();
 const scope=forcedScope||input.scope;
 if(!SCOPE.includes(scope)|| (forcedScope&&input.scope!==undefined&&input.scope!==forcedScope))bad();
 const metric=String(input.metric||"");
 if(!Object.hasOwn(METRICS,metric))bad();
 const page=input.page===undefined?1:Number(input.page);
 const size=input.size===undefined?20:Number(input.size);
 if(!Number.isInteger(page)||page<1||page>MAX_PAGE||!Number.isInteger(size)||size<1||size>MAX_SIZE)bad();
 const base={scope,metric,page,size};
 if(scope==="comparison"){
  if(input.schoolDivisionCode!==undefined)bad();
  if(typeof input.schoolId!=="string"||!/^[A-Za-z0-9_-]{1,30}$/.test(input.schoolId))bad();
  const yr=String(input.year||"");
  if(!/^\d{4}$/.test(yr)||Number(yr)<2010||Number(yr)>2035)bad();
  base.schoolId=input.schoolId;
  base.year=yr;
 }else{
  if(input.schoolId!==undefined||input.year!==undefined)bad();
  if(typeof input.schoolDivisionCode!=="string"||!/^[A-Za-z0-9_-]{1,12}$/.test(input.schoolDivisionCode))bad();
  base.schoolDivisionCode=input.schoolDivisionCode;
 }
 if(input.indicatorId!==undefined){
  if(metric!=="campus"||typeof input.indicatorId!=="string"||!/^[A-Za-z0-9_-]{1,20}$/.test(input.indicatorId))bad();
  base.indicatorId=input.indicatorId;
 }
 return base;
}
const decodeXml=v=>String(v||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&#(x[0-9a-f]+|\d+);/gi,(full,num)=>{
 try{const n=num.toLowerCase().startsWith("x")?parseInt(num.slice(1),16):parseInt(num,10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):""}catch{return ""}
}).replace(/&(amp|lt|gt|quot|apos);/gi,(full,name)=>({amp:"&",lt:"<",gt:">",quot:'"',apos:"'"}[name.toLowerCase()]));
const getTag=(input,tag)=>{const x=String(tag).replace(/[^A-Za-z0-9]/g,"");const m=String(input).match(new RegExp("<"+x+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+x+"\\s*>","i"));return m?fieldText(decodeXml(m[1]),500):null;};
const plainRecords=items=>{
 const out=[];
 for(const item of items.slice(0,MAX_SIZE)){
  if(!object(item))continue;
  const fields={};
  for(const [key,v] of Object.entries(item).slice(0,65)){
   if(!/^[A-Za-z][A-Za-z0-9]{0,70}$/.test(key)||v===undefined||v===null||typeof v==="object")continue;
   fields[key]=fieldText(decodeXml(v));
  }
  out.push({
   school_name:fields.schlKrnNm||null,school_id:fields.schlId||null,
   year:fields.svyYr||null,region:fields.znNm||null,
   indicator_id:fields.indctId||null,indicator_value:fields.indctVal1||null,
   regional_values:Array.from({length:7},(_,i)=>({type:fields["fieldType"+(i+1)]||null,value:fields["fieldVal"+(i+1)]||null})).filter(v=>v.type!==null||v.value!==null),
   fields
  });
 }
 return out;
};
function xmlRows(xml){
 const parts=[...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item\s*>/gi)];
 return parts.slice(0,MAX_SIZE).map(m=>{
  const rec={};
  for(const x of m[1].matchAll(/<([A-Za-z][A-Za-z0-9]{0,70})(?:\s[^>]*)?>([\s\S]*?)<\/\1\s*>/g)){
   rec[x[1]]=fieldText(decodeXml(x[2]));
  }
  return rec;
 });
}
export function parseUniversityPayload(body){
 if(typeof body!=="string"||body.length>MAX_XML)throw new UniversityError("UNIVERSITY_INVALID_RESPONSE");
 const trimmed=body.trim();
 if(trimmed.startsWith("{")){
  let doc;try{doc=JSON.parse(trimmed)}catch{throw new UniversityError("UNIVERSITY_INVALID_JSON");}
  const message=String(doc?.header?.resultCode??doc?.response?.header?.resultCode??"00");
  if(!["00","0","000","SUCCESS"].includes(message))throw new UniversityError("UNIVERSITY_UPSTREAM_REJECTED");
  const response=doc.response||doc;
  const root=response.body||{};
  const items=root?.items?.item;
  const rows=Array.isArray(items)?items:(object(items)?[items]:[]);
  const total=Number(root.totalCount??rows.length);
  return{rows:plainRecords(rows),total:Number.isFinite(total)?total:rows.length};
 }
 if(!trimmed.startsWith("<"))throw new UniversityError("UNIVERSITY_INVALID_RESPONSE");
 const errorCode=getTag(trimmed,"resultCode")||getTag(trimmed,"returnReasonCode");
 if(errorCode&&!["00","0","000","SUCCESS"].includes(errorCode))throw new UniversityError("UNIVERSITY_UPSTREAM_REJECTED");
 const isXml=/<(?:response|OpenAPI_ServiceResponse|cmmMsgHeader|items)\b/i.test(trimmed);
 if(!isXml)throw new UniversityError("UNIVERSITY_INVALID_RESPONSE");
 if(/<cmmMsgHeader\b/i.test(trimmed))throw new UniversityError("UNIVERSITY_UPSTREAM_REJECTED");
 const rows=plainRecords(xmlRows(trimmed));
 const num=getTag(trimmed,"totalCount"),total=num===null?rows.length:Number(num);
 return{rows,total:Number.isFinite(total)&&total>=0?total:rows.length};
}
const paramsFor=input=>{
 const params={pageNo:String(input.page),numOfRows:String(input.size)};
 if(input.scope==="comparison"){params.schlId=input.schoolId;params.svyYr=input.year;}
 else params.schlDivCd=input.schoolDivisionCode;
 if(input.indicatorId)params.indctId=input.indicatorId;
 return params;
};
function cacheRequest(input){
 const safe=new URLSearchParams();
 for(const [k,v] of Object.entries(input).sort(([a],[b])=>a.localeCompare(b)))safe.set(k,String(v));
 return new Request("https://hanbom-cache.invalid/university/v1/"+input.scope+"/"+input.metric+"?"+safe.toString());
}
async function fetchFromUniversity(input,env){
 const key=env?.UNIVERSITY_INFO_API_KEY;
 if(typeof key!=="string"||!/^[-A-Za-z0-9+/_=%]{32,256}$/.test(key))throw new UniversityError("UNIVERSITY_KEY_NOT_CONFIGURED",503);
 const metric=METRICS[input.metric];
 const operation=metric[input.scope];
 const url=new URL(UNIVERSITY_SOURCE.apiBase+"/"+operation,UNIVERSITY_SOURCE.apiHost);
 url.searchParams.set("serviceKey",key);
 for(const [k,v] of Object.entries(paramsFor(input)))url.searchParams.set(k,v);
 let response;
 try{response=await fetch(url.toString(),{method:"GET",redirect:"manual",signal:AbortSignal.timeout(TIMEOUT)});}
 catch(e){
  if(e?.name==="TimeoutError"||e?.name==="AbortError")throw new UniversityError("UNIVERSITY_TIMEOUT",504);
  throw new UniversityError("UNIVERSITY_NETWORK_ERROR");
 }
 if(response.status>=300&&response.status<400)throw new UniversityError("UNIVERSITY_UNEXPECTED_REDIRECT");
 if(!response.ok)throw new UniversityError("UNIVERSITY_UPSTREAM_HTTP_"+response.status);
 if(Number(response.headers.get("content-length")||0)>MAX_XML)throw new UniversityError("UNIVERSITY_TOO_LARGE");
 let raw;try{raw=await response.text()}catch{throw new UniversityError("UNIVERSITY_INVALID_RESPONSE")}
 if(raw.length>MAX_XML)throw new UniversityError("UNIVERSITY_TOO_LARGE");
 return parseUniversityPayload(raw);
}
export function universityMeta(env){
 return{service:"HANBOM DATA · 대학알리미",source:UNIVERSITY_SOURCE,
  metrics:UNIVERSITY_METRICS.map(({id,label})=>({id,label})),
  scopes:SCOPE,operations:UNIVERSITY_METRICS.flatMap(x=>SCOPE.map(scope=>({metric:x.id,scope,operation:x[scope]}))),
  authentication:"Cloudflare Worker Secret only",key_configured:typeof env?.UNIVERSITY_INFO_API_KEY==="string"&&env.UNIVERSITY_INFO_API_KEY.length>=32,
  limits:{max_size:MAX_SIZE,max_page:MAX_PAGE,cache_ttl_seconds:TTL_SECONDS},
  input_comparison:["metric","schoolId","year","page?","size?","indicatorId? (campus only)"],
  input_regional:["metric","schoolDivisionCode","page?","size?","indicatorId? (campus only)"],
  note:"대학 ID(schlId)와 학교구분 코드(schlDivCd)는 대학알리미 공식 코드여야 합니다. 코드를 추정하지 않습니다. 데이터 공백은 0건으로 표시합니다."};
}
export async function queryUniversity(input,env,ctx,forcedScope){
 const args=validateQuery(input,forcedScope);
 if(typeof env?.UNIVERSITY_INFO_API_KEY!=="string"||env.UNIVERSITY_INFO_API_KEY.length<32)throw new UniversityError("UNIVERSITY_KEY_NOT_CONFIGURED",503);
 const cache=globalThis.caches?.default,key=cacheRequest(args);
 if(cache)try{const existing=await cache.match(key);if(existing)return{...await existing.json(),cached:true}}catch{}
 const fetched=await fetchFromUniversity(args,env);
 const result={scope:args.scope,metric:args.metric,metric_label:METRICS[args.metric].label,
  operation:METRICS[args.metric][args.scope],source:UNIVERSITY_SOURCE.name,
  source_page:UNIVERSITY_SOURCE.url,
  page:args.page,size:args.size,total:fetched.total,count:fetched.rows.length,
  has_more:fetched.total>args.page*args.size,params:args,items:fetched.rows,
  cached:false,cache_ttl_seconds:TTL_SECONDS,updated_at:new Date().toISOString(),
  disclaimer:"공시 지표의 단위·기준은 원본 대학알리미를 확인하세요. 응답에 없는 단위를 추정하지 않습니다."};
 if(cache){
  const promise=cache.put(key,new Response(JSON.stringify(result),{headers:{"cache-control":"public,max-age="+TTL_SECONDS,"content-type":"application/json"}})).catch(()=>{});
  if(ctx?.waitUntil)ctx.waitUntil(promise);else await promise;
 }
 return result;
}
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","access-control-allow-origin":"*","x-content-type-options":"nosniff"}});
export async function handleUniversityApi(request,env,ctx){
 if(request.method!=="GET")return response({error:"Method not allowed"},405);
 const url=new URL(request.url),kind=UNIVERSITY_API_PATHS[url.pathname];
 if(!kind)return response({error:"Not found"},404);
 if(kind==="meta"||kind==="status")return response(universityMeta(env));
 const args={};
 for(const [k,v] of url.searchParams){if(Object.hasOwn(args,k))return response({error:"INVALID_ARGUMENT"},400);args[k]=v;}
 try{return response(await queryUniversity(args,env,ctx));}
 catch(e){const status=e instanceof UniversityError?e.status:502,code=e instanceof UniversityError?e.code:"UNIVERSITY_INTERNAL_ERROR";
  return response({error:code,status:"error"},status);}
}
const STR={type:"string"},LIMIT={type:"integer",minimum:1,maximum:MAX_SIZE},PAGE={type:"integer",minimum:1,maximum:MAX_PAGE};
const METRIC={type:"string",enum:UNIVERSITY_METRICS.map(x=>x.id)};
const BASE={metric:METRIC,page:PAGE,size:LIMIT,indicatorId:STR};
export const UNIVERSITY_TOOLS=Object.freeze([
 {name:"get_university_education_catalog",description:"대학알리미 교육여건 현황의 6개 지표와 대학별·지역별 총 12개 원본 데이터 작업을 조회합니다.",inputSchema:{type:"object",properties:{},additionalProperties:false}},
 {name:"get_university_education_comparison",description:"대학알리미 6개 교육여건 지표 중 하나를 대학 ID·공시년도별로 조회합니다. 학교 ID는 공식 대학알리미 값을 사용하세요.",inputSchema:{type:"object",properties:{...BASE,schoolId:STR,year:STR},required:["metric","schoolId","year"],additionalProperties:false}},
 {name:"get_university_education_region",description:"대학알리미 6개 교육여건 지표 중 하나를 학교구분 코드별 지역통계로 조회합니다. 공식 코드 사용.",inputSchema:{type:"object",properties:{...BASE,schoolDivisionCode:STR},required:["metric","schoolDivisionCode"],additionalProperties:false}},
 {name:"get_university_education_status",description:"대학알리미 공개 데이터의 엔드포인트·승인일·개발계정 키 설정 여부를 확인합니다. 실제 키는 절대 반환하지 않습니다.",inputSchema:{type:"object",properties:{},additionalProperties:false}}
]);
const TOOL_KINDS=Object.freeze({get_university_education_catalog:"meta",get_university_education_comparison:"comparison",get_university_education_region:"regional",get_university_education_status:"meta"});
export const isUniversityTool=name=>Object.hasOwn(TOOL_KINDS,name);
export async function invokeUniversityTool(name,args,env,ctx){
 if(!isUniversityTool(name))throw new UniversityError("UNKNOWN_TOOL",400);
 if(!object(args))bad();
 const kind=TOOL_KINDS[name];
 if(kind==="meta"){
  if(Object.keys(args).length)bad();
  const data=universityMeta(env);
  return{content:[{type:"text",text:JSON.stringify(data)}],structuredContent:data};
 }
 const data=await queryUniversity(args,env,ctx,kind);
 const serialized=JSON.stringify(data);
 return{content:[{type:"text",text:serialized.slice(0,25000)}],structuredContent:data};
}
