/**
 * HANBOM DATA / NEIS official open data proxy.
 *
 * The live NEIS API key is held ONLY in the Cloudflare Worker secret NEIS_API_KEY.
 * Never include the key or an authenticated upstream URL in responses, caches,
 * source code, logs, exceptions, or test fixtures.
 *
 * Datasets verified against user-supplied NEIS API specification snapshots
 * saved on 2026-11-11: mealServiceDietInfo, SchoolSchedule, hisTimetable.
 * schoolInfo is the NEIS public school metadata directory.
 */

export const NEIS_SCHOOL=Object.freeze({
 name:"한봄고등학교",
 educationOffice:"J10",
 schoolCode:"7531327",
 keyIssuedOn:"2026-11-11",
 provider:"교육부 · 나이스 교육정보 개방 포털"
});

export const NEIS_DEPARTMENTS=Object.freeze([
 "뷰티아트과","캐릭터창작과","시각디자인과",
 "빅데이터정보과","스마트제어과","사운드디자인과"
]);

export const NEIS_ENDPOINTS=Object.freeze({
 school:"schoolInfo",
 meals:"mealServiceDietInfo",
 calendar:"SchoolSchedule",
 timetable:"hisTimetable"
});

export const NEIS_API_PATHS=Object.freeze({
 "/api/neis/school":"school",
 "/api/neis/meals":"meals",
 "/api/neis/calendar":"calendar",
 "/api/neis/timetable":"timetable",
 "/api/neis/today":"today",
 "/api/neis/status":"status",
 "/api/neis/meta":"meta"
});

const HOST="https://open.neis.go.kr";
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const SAFE_CLASS=/^[\p{L}\p{N} ._-]{1,20}$/u;
const OUTPUT_MAX=100;
const MAX_UPSTREAM_PAGES=3;
const TIMEOUT_MS=10000;
const CONTENT_LIMIT=1250000;
const NEIS_TTL=300;
const SCHOOL_TTL=86400;

export class NeisError extends Error{
 constructor(code,status=502){super(code);this.name="NeisError";this.code=code;this.status=status;}
}
const invalid=()=>{throw new NeisError("INVALID_ARGUMENT",400);};
const object=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const isoFromCompact=value=>typeof value==="string"&&/^\d{8}$/.test(value)?value.slice(0,4)+"-"+value.slice(4,6)+"-"+value.slice(6,8):null;
const asCompact=date=>date.replaceAll("-","");
const utcDay=date=>new Date(date+"T00:00:00Z").getTime();
const plusDays=(date,days)=>new Date(utcDay(date)+days*86400000).toISOString().slice(0,10);
function currentKst(){
 const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const get=name=>parts.find(p=>p.type===name)?.value;
 return get("year")+"-"+get("month")+"-"+get("day");
}
function dateArg(value,fallback){
 if(value===undefined||value===null||value==="")return fallback;
 if(typeof value!=="string")invalid();
 const candidate=isoFromCompact(value)||value;
 if(!DATE_RE.test(candidate))invalid();
 const date=new Date(candidate+"T00:00:00Z");
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==candidate)invalid();
 const year=Number(candidate.slice(0,4));
 if(year<2019||year>2035)invalid();
 return candidate;
}
const dateDiff=(from,to)=>Math.round((utcDay(to)-utcDay(from))/86400000);
const text=(input,max=280)=>String(input??"").replace(/<\s*br\s*\/?>/gi," / ").replace(/<[^>]*>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/\s+/g," ").trim().slice(0,max);
const mealParts=str=>String(str||"").split(/<\s*br\s*\/?>|\r?\n/gi).map(x=>text(x,160)).filter(Boolean);
const iso=compact=>isoFromCompact(String(compact||""))||null;
function rangeFor(kind,args){
 const today=currentKst();
 if(args.date!==undefined&&(args.from!==undefined||args.to!==undefined))invalid();
 const fallbackFrom=kind==="calendar"?today.slice(0,8)+"01":today;
 let fallbackTo=kind==="meals"?plusDays(today,6):today;
 if(kind==="calendar")fallbackTo=new Date(Date.UTC(Number(today.slice(0,4)),Number(today.slice(5,7)),0)).toISOString().slice(0,10);
 const one=args.date!==undefined?dateArg(args.date):null;
 const from=one||dateArg(args.from,fallbackFrom);
 const to=one||dateArg(args.to,fallbackTo);
 if(dateDiff(from,to)<0)invalid();
 const maxSpan=kind==="calendar"?62:kind==="timetable"?13:30;
 if(dateDiff(from,to)>maxSpan)invalid();
 return{from,to};
}
function validate(kind,input){
 if(!object(input))invalid();
 const allowed={
  school:[],
  status:[],
  meta:[],
  today:["date","grade","className"],
  meals:["date","from","to","mealType","limit"],
  calendar:["date","from","to","grade","limit"],
  timetable:["date","from","to","grade","className","department","semester","year","limit"]
 }[kind];
 if(!allowed||Object.keys(input).some(k=>!allowed.includes(k)))invalid();
 const args={};
 for(const [name,value] of Object.entries(input)){
  if(value===undefined||value===null||value==="")continue;
  if(["date","from","to"].includes(name))args[name]=dateArg(value);
  else if(name==="grade"){
   if(!/^[123]$/.test(String(value)))invalid();
   args.grade=Number(value);
  }else if(name==="className"){
   if(typeof value!=="string"||!SAFE_CLASS.test(value))invalid();
   args.className=value;
  }else if(name==="department"){
   if(typeof value!=="string"||!NEIS_DEPARTMENTS.includes(value))invalid();
   args.department=value;
  }else if(name==="mealType"){
   if(!/^[123]$/.test(String(value)))invalid();
   args.mealType=String(value);
  }else if(name==="semester"){
   if(!/^[12]$/.test(String(value)))invalid();
   args.semester=String(value);
  }else if(name==="year"){
   if(!/^\d{4}$/.test(String(value))||Number(value)<2025||Number(value)>2035)invalid();
   args.year=String(value);
  }else if(name==="limit"){
   if(!Number.isInteger(Number(value))||Number(value)<1||Number(value)>OUTPUT_MAX)invalid();
   args.limit=Number(value);
  }else invalid();
 }
 if(kind==="today"&&args.date===undefined)args.date=currentKst();
 if(["meals","calendar","timetable"].includes(kind))Object.assign(args,rangeFor(kind,args));
 if(kind==="today")args.date=dateArg(args.date);
 return args;
}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{
 "content-type":"application/json; charset=utf-8",
 "cache-control":"no-store",
 "access-control-allow-origin":"*",
 "x-content-type-options":"nosniff"
}});
function safeUpstreamCode(data){
 const head=data?.RESULT || data?.result || null;
 if(head&&typeof head.CODE==="string")return head.CODE;
 return null;
}
function parseNeisResponse(dataset,body){
 if(!object(body))throw new NeisError("NEIS_INVALID_RESPONSE");
 const direct=safeUpstreamCode(body);
 if(direct==="INFO-200")return{rows:[],total:0};
 if(direct&&direct!=="INFO-000")throw new NeisError("NEIS_UPSTREAM_REJECTED");
 const group=body[dataset];
 if(!Array.isArray(group)){
  if(direct==="INFO-000")return{rows:[],total:0};
  throw new NeisError("NEIS_INVALID_RESPONSE");
 }
 const head=group[0]?.head||[];
 const error=head.map(x=>x.RESULT?.CODE).find(Boolean);
 if(error&&error!=="INFO-000"&&error!=="INFO-200")throw new NeisError("NEIS_UPSTREAM_REJECTED");
 if(error==="INFO-200")return{rows:[],total:0};
 const rows=Array.isArray(group[1]?.row)?group[1].row:[];
 const count=Number(head.find(x=>x?.list_total_count!==undefined)?.list_total_count);
 return{rows,total:Number.isFinite(count)?count:rows.length};
}
async function fetchFromNeis(dataset,params,pIndex,pSize,env){
 const key=env?.NEIS_API_KEY;
 if(typeof key!=="string"||key.length<24)throw new NeisError("NEIS_KEY_NOT_CONFIGURED",503);
 const url=new URL("/hub/"+dataset,HOST);
 url.searchParams.set("KEY",key);
 url.searchParams.set("Type","json");
 url.searchParams.set("pIndex",String(pIndex));
 url.searchParams.set("pSize",String(pSize));
 for(const [name,value] of Object.entries(params))url.searchParams.set(name,String(value));
 let response;
 try{
  response=await fetch(url.toString(),{method:"GET",redirect:"manual",signal:AbortSignal.timeout(TIMEOUT_MS)});
 }catch(e){
  // Classify failures without exposing a credential-bearing URL or exception message.
  if(e?.name==="TimeoutError"||e?.name==="AbortError")throw new NeisError("NEIS_TIMEOUT",504);
  if(e?.name==="TypeError")throw new NeisError("NEIS_FETCH_TYPE_ERROR",502);
  throw new NeisError("NEIS_NETWORK_ERROR");
 }
 if(response.status>=300&&response.status<400)throw new NeisError("NEIS_UNEXPECTED_REDIRECT");
 if(!response.ok)throw new NeisError("NEIS_UPSTREAM_HTTP_"+response.status);
 if(Number(response.headers.get("content-length")||0)>CONTENT_LIMIT)throw new NeisError("NEIS_RESPONSE_TOO_LARGE");
 let raw;
 try{raw=await response.text();}catch{throw new NeisError("NEIS_INVALID_RESPONSE");}
 if(raw.length>CONTENT_LIMIT)throw new NeisError("NEIS_RESPONSE_TOO_LARGE");
 let data;try{data=JSON.parse(raw);}catch{throw new NeisError("NEIS_INVALID_JSON");}
 return parseNeisResponse(dataset,data);
}
function paramsFor(kind,args){
 const out={ATPT_OFCDC_SC_CODE:NEIS_SCHOOL.educationOffice,SD_SCHUL_CODE:NEIS_SCHOOL.schoolCode};
 if(kind==="school")return out;
 const {from,to}=args;
 if(kind==="meals"){
  out.MLSV_FROM_YMD=asCompact(from);out.MLSV_TO_YMD=asCompact(to);
  if(args.mealType)out.MMEAL_SC_CODE=args.mealType;
 }else if(kind==="calendar"){
  out.AA_FROM_YMD=asCompact(from);out.AA_TO_YMD=asCompact(to);
 }else if(kind==="timetable"){
  out.TI_FROM_YMD=asCompact(from);out.TI_TO_YMD=asCompact(to);
  if(args.grade)out.GRADE=args.grade;
  if(args.className)out.CLASS_NM=args.className;
  if(args.department)out.DDDEP_NM=args.department;
  if(args.semester)out.SEM=args.semester;
  if(args.year)out.AY=args.year;
 }
 return out;
}
function normalize(kind,rows,args){
 if(kind==="school")return rows.map(x=>({
  school_name:text(x.SCHUL_NM,100),school_code:text(x.SD_SCHUL_CODE,20),
  office_name:text(x.ATPT_OFCDC_SC_NM,70),office_code:text(x.ATPT_OFCDC_SC_CODE,15),
  school_type:text(x.SCHUL_KND_SC_NM,60),address:text(x.ORG_RDNMA,240),
  phone:text(x.ORG_TELNO,30),homepage:text(x.HMPG_ADRES,160),
  coeducational:text(x.COEDU_SC_NM,50),founded_on:iso(x.FOND_YMD)
 }));
 if(kind==="meals")return rows.map(x=>({
  date:iso(x.MLSV_YMD),meal_type:text(x.MMEAL_SC_NM,60),meal_code:text(x.MMEAL_SC_CODE,6),
  dishes:mealParts(x.DDISH_NM),calories:text(x.CAL_INFO,80),
  nutrition:mealParts(x.NTR_INFO),origin:mealParts(x.ORPLC_INFO),
  serving_count:Number(x.MLSV_FGR)||null
 })).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.meal_code).localeCompare(String(b.meal_code)));
 if(kind==="calendar")return rows.map(x=>({
  date:iso(x.AA_YMD),title:text(x.EVENT_NM,150),description:text(x.EVENT_CNTNT,400),
  off_day:text(x.SBTR_DD_SC_NM,50),
  grades:{1:x.ONE_GRADE_EVENT_YN==="Y",2:x.TW_GRADE_EVENT_YN==="Y",3:x.THREE_GRADE_EVENT_YN==="Y"}
 })).filter(x=>!args.grade||x.grades[args.grade]===true)
 .sort((a,b)=>String(a.date).localeCompare(String(b.date))||a.title.localeCompare(b.title,"ko"));
 if(kind==="timetable")return rows.map(x=>({
  date:iso(x.ALL_TI_YMD),year:text(x.AY,6),semester:text(x.SEM,2),
  department:text(x.DDDEP_NM,80),grade:text(x.GRADE,6),class_name:text(x.CLASS_NM,25),
  room:text(x.CLRM_NM,70),period:Number(x.PERIO)||0,subject:text(x.ITRT_CNTNT,200)
 })).sort((a,b)=>String(a.date).localeCompare(String(b.date))||Number(a.grade)-Number(b.grade)||
  String(a.class_name).localeCompare(String(b.class_name),"ko")||a.period-b.period);
 return[];
}
const publicCacheKey=(kind,params)=>"https://hanbom-cache.invalid/neis/v1/"+kind+"?"+
 new URLSearchParams(Object.entries(params).sort(([a],[b])=>a.localeCompare(b))).toString();
async function fetchDataset(kind,args,env,ctx){
 // A missing secret must never fall back to the NEIS public 5-row sample key.
 if(typeof env?.NEIS_API_KEY!=="string"||env.NEIS_API_KEY.length<24)
  throw new NeisError("NEIS_KEY_NOT_CONFIGURED",503);
 const endpoint=NEIS_ENDPOINTS[kind],params=paramsFor(kind,args);
 // Calendar responses can differ by grade even with the same upstream query.
 const cacheScope=kind==="calendar"&&args.grade?{...params,LOCAL_GRADE:args.grade}:params;
 const cache=globalThis.caches?.default,key=new Request(publicCacheKey(kind,cacheScope));
 if(cache)try{
  const hit=await cache.match(key);
  if(hit){const d=await hit.json();return{...d,cached:true};}
 }catch{}
 const pSize=kind==="school"?10:kind==="meals"?200:kind==="calendar"?250:500;
 const pages=kind==="school"?1:MAX_UPSTREAM_PAGES;
 const fetched=[];let total=0;
 for(let i=1;i<=pages;i++){
  const data=await fetchFromNeis(endpoint,params,i,pSize,env);
  if(i===1)total=data.total;
  fetched.push(...data.rows);
  if(!data.rows.length||data.rows.length<pSize||fetched.length>=total)break;
 }
 const normalized=normalize(kind,fetched,args);
 const response={kind,school:NEIS_SCHOOL.name,school_code:NEIS_SCHOOL.schoolCode,
  source:"나이스 교육정보 개방 포털",endpoint:HOST+"/hub/"+endpoint,
  params:{...args},total:kind==="calendar"&&args.grade?normalized.length:total,
  count:normalized.length,items:normalized,
  partial:fetched.length<total,cached:false,updated_at:new Date().toISOString()};
 if(cache){
  const promise=cache.put(key,new Response(JSON.stringify(response),{
   headers:{"cache-control":"public, max-age="+(kind==="school"?SCHOOL_TTL:NEIS_TTL),
    "content-type":"application/json"}})).catch(()=>{});
  if(ctx?.waitUntil)ctx.waitUntil(promise);else await promise;
 }
 return response;
}
function limitOutput(data,args,kind){
 const limit=args.limit??(kind==="timetable"?100:kind==="calendar"?100:30);
 return{...data,count:Math.min(data.items.length,limit),items:data.items.slice(0,limit),
  result_limit:limit,has_more:data.partial||data.items.length>limit};
}
async function todayOverview(args,env,ctx){
 const day=dateArg(args.date,currentKst());
 const list=[
  ["meals",fetchDataset("meals",{from:day,to:day},env,ctx)],
  ["calendar",fetchDataset("calendar",{from:day,to:day},env,ctx)]
 ];
 if(args.grade)list.push(["timetable",fetchDataset("timetable",{
  from:day,to:day,grade:args.grade,className:args.className
 },env,ctx)]);
 const results=await Promise.allSettled(list.map(x=>x[1]));
 const sections={},failed=[];
 for(let i=0;i<results.length;i++){
  const result=results[i],kind=list[i][0];
  if(result.status==="fulfilled")sections[kind]=limitOutput(result.value,{limit:100},kind);
  else failed.push({kind,code:result.reason instanceof NeisError?result.reason.code:"NEIS_DATA_UNAVAILABLE"});
 }
 if(Object.keys(sections).length===0)throw new NeisError("NEIS_ALL_SOURCES_UNAVAILABLE");
 return{kind:"today",date:day,school:NEIS_SCHOOL.name,sections,
  partial:failed.length>0,failed_sources:failed,source:"나이스 교육정보 개방 포털",
  updated_at:new Date().toISOString()};
}
export function neisMeta(env){
 return{service:"HANBOM DATA · NEIS",school:NEIS_SCHOOL.name,
  office_code:NEIS_SCHOOL.educationOffice,school_code:NEIS_SCHOOL.schoolCode,
  data_source:NEIS_SCHOOL.provider,source_url:HOST,
  datasets:{...NEIS_ENDPOINTS},key_configured:typeof env?.NEIS_API_KEY==="string"&&env.NEIS_API_KEY.length>=24,
  key_issued_on:NEIS_SCHOOL.keyIssuedOn,authorization:"Cloudflare Worker Secret (server side only)",
  date_format:"YYYY-MM-DD",departments:NEIS_DEPARTMENTS,
  routes:NEIS_API_PATHS,limits:{max_days_meals:31,max_days_calendar:63,max_days_timetable:14,
   page_size_max:500,max_upstream_pages:MAX_UPSTREAM_PAGES,output_max:OUTPUT_MAX},
  note:"NEIS data can be missing or delayed; no-result is not an error."};
}
export async function queryNeis(kind,rawArgs,env,ctx){
 const args=validate(kind,rawArgs);
 if(kind==="status"||kind==="meta")return neisMeta(env);
 if(kind==="today")return todayOverview(args,env,ctx);
 return limitOutput(await fetchDataset(kind,args,env,ctx),args,kind);
}
function httpArguments(url){
 const args={};
 for(const [key,value] of url.searchParams){
  if(Object.hasOwn(args,key))invalid();
  args[key]=value;
 }
 return args;
}
export async function handleNeisApi(request,env,ctx){
 if(request.method!=="GET")return json({error:"Method not allowed"},405);
 const path=new URL(request.url).pathname,kind=NEIS_API_PATHS[path];
 if(!kind)return json({error:"Not found"},404);
 try{return json(await queryNeis(kind,httpArguments(new URL(request.url)),env,ctx));}
 catch(e){const known=e instanceof NeisError?e:new NeisError("NEIS_INTERNAL_ERROR");
  return json({error:known.code,kind,status:"error"},known.status);}
}
const DATE={type:"string",description:"한국 날짜 YYYY-MM-DD"};
const LIMIT={type:"integer",minimum:1,maximum:OUTPUT_MAX};
const GRADE={type:"integer",minimum:1,maximum:3};
const CLASS={type:"string",maxLength:20,description:"나이스 학급명 예: 1"};
const DEPARTMENT={type:"string",enum:NEIS_DEPARTMENTS};
const rangeProps={date:DATE,from:DATE,to:DATE,limit:LIMIT};
export const NEIS_TOOLS=Object.freeze([
 {name:"get_neis_school_info",description:"한봄고등학교의 나이스 공식 학교 기본정보를 조회합니다.",inputSchema:{type:"object",properties:{},additionalProperties:false}},
 {name:"get_neis_meals",description:"한봄고 나이스 급식·식단·알레르기·영양·원산지 정보 조회. date 또는 from/to.",inputSchema:{type:"object",properties:{...rangeProps,mealType:{type:"string",enum:["1","2","3"]}},additionalProperties:false}},
 {name:"get_neis_school_events",description:"한봄고 나이스 학사일정, 행사명과 학년별 행사 정보를 조회합니다.",inputSchema:{type:"object",properties:{...rangeProps,grade:GRADE},additionalProperties:false}},
 {name:"get_neis_high_school_timetable",description:"한봄고 고등학교 시간표를 날짜·학과·학년·학급·교시별로 조회합니다.",inputSchema:{type:"object",properties:{...rangeProps,grade:GRADE,className:CLASS,department:DEPARTMENT,semester:{type:"integer",minimum:1,maximum:2},year:{type:"integer",minimum:2025,maximum:2035}},additionalProperties:false}},
 {name:"get_neis_daily_briefing",description:"오늘(또는 지정일) 한봄고 급식과 학사일정, 선택적으로 해당 학급 시간표를 통합 조회합니다.",inputSchema:{type:"object",properties:{date:DATE,grade:GRADE,className:CLASS},additionalProperties:false}},
 {name:"get_neis_connection_status",description:"나이스 데이터셋·한봄고 코드 및 Worker Secret 설정 여부만 안전하게 확인합니다. 인증키 값은 반환하지 않습니다.",inputSchema:{type:"object",properties:{},additionalProperties:false}}
]);
const TOOL_KINDS=Object.freeze({
 get_neis_school_info:"school",get_neis_meals:"meals",
 get_neis_school_events:"calendar",get_neis_high_school_timetable:"timetable",
 get_neis_daily_briefing:"today",get_neis_connection_status:"status"
});
export const isNeisTool=name=>Object.hasOwn(TOOL_KINDS,name);
export async function invokeNeisTool(name,args,env,ctx){
 if(!isNeisTool(name))throw new NeisError("UNKNOWN_TOOL",400);
 const data=await queryNeis(TOOL_KINDS[name],args,env,ctx);
 const compact=JSON.stringify(data);
 return{content:[{type:"text",text:compact.length>26000?compact.slice(0,26000)+" [truncated; use structuredContent]":compact}],
  structuredContent:data};
}
