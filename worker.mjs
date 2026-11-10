
import {BOARD_CATALOG,MENU_CATALOG,LEGACY_IDS} from "./catalog.mjs";
export const VERSION="2.0.0";
export {BOARD_CATALOG,MENU_CATALOG,LEGACY_IDS};
export const FEEDS=Object.freeze(Object.fromEntries(BOARD_CATALOG.map(b=>[b.id,{
 url:b.url,source:"한봄고등학교 "+b.parent+" · "+b.label,label:b.label,
 group:b.parent_id==="features"||b.parent_id==="curriculum"?b.parent_id:null,
 parent:b.parent,parent_id:b.parent_id,mi:b.mi,bbs:b.bbs,sensitive:b.sensitive
}])));
export const EXTRA_BOARD_CATALOG=Object.freeze(BOARD_CATALOG.filter(b=>LEGACY_IDS.includes(b.id)&&!["notice","letter","news","awards","office_letter","opportunities","health","student_rules"].includes(b.id))
 .map(b=>({id:b.id,label:b.label,mi:b.mi,bbs:b.bbs,route:b.route,group:b.parent_id==="features"||b.parent_id==="curriculum"?b.parent_id:null}))));
export const NEW_BOARD_CATALOG=Object.freeze(BOARD_CATALOG.filter(b=>!LEGACY_IDS.includes(b.id)));
export const GROUPS=Object.freeze(Object.fromEntries([...MENU_CATALOG.map(m=>[m.id,m.ids]),["legacy",LEGACY_IDS]]));
export const GROUP_LABELS=Object.freeze(Object.fromEntries(MENU_CATALOG.map(m=>[m.id,m.label])));
export const API_ROUTES=Object.freeze(Object.fromEntries(EXTRA_BOARD_CATALOG.map(b=>[b.route,b.id])));
export const ALL_API_ROUTES=Object.freeze(Object.fromEntries(BOARD_CATALOG.map(b=>[b.route,b.id])));
export const SHARD_SIZE=28;
export const SHARD_COUNT=Math.ceil(BOARD_CATALOG.length/SHARD_SIZE);
const VERSIONS=["2025-03-26","2025-06-18","2025-11-25"];
const HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,accept,mcp-protocol-version"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
const decode=s=>String(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'");
const plain=s=>decode(s).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
function tag(s,name){const m=s.match(new RegExp("<(?:[\\w-]+:)?"+name+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w-]+:)?"+name+"\\s*>","i"));return m?plain(m[1]):"";}
function safeLink(s){const m=s.match(/<link\b[^>]*href=["']([^"']+)["']/i);const val=m?decode(m[1]):tag(s,"link");if(!val)return null;try{const u=new URL(val,"https://hanbom-h.goesw.kr");return u.protocol==="https:"&&u.hostname==="hanbom-h.goesw.kr"?u.href:null;}catch{return null;}}
export function parseFeed(xml,category="notice"){
 const feed=FEEDS[category];if(!feed)throw Error("INVALID_CATEGORY");
 if(!/<(?:rss|feed|rdf:RDF)\b/i.test(xml))throw Error("INVALID_RSS");
 const matches=[...xml.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)].slice(0,100);
 const items=matches.map(m=>{
  const x=m[1],d=tag(x,"pubDate")||tag(x,"published")||tag(x,"updated"),url=safeLink(x);
  const originalTitle=tag(x,"title").slice(0,300);
  if(!originalTitle)return null;
  // Do not re-publish possible victim or student identifiers from counseling and complaint RSS.
  const title=feed.sensitive?"상담·민원 게시물 (원문 확인)":originalTitle;
  return{id:feed.sensitive?(url||tag(x,"guid")||null):(tag(x,"guid")||tag(x,"id")||url),
    title,url,published_at:d&&!isNaN(Date.parse(d))?new Date(d).toISOString():null,
    summary:feed.sensitive?"":(tag(x,"description")||tag(x,"summary")||tag(x,"content")).slice(0,500),
    category,category_label:feed.label,parent:feed.parent,privacy_redacted:!!feed.sensitive};
 }).filter(Boolean);
 return{category,source:feed.source,source_url:feed.url,feed_title:tag(xml,"title"),fetched_at:new Date().toISOString(),count:items.length,items};
}

async function readFeed(ctx,category="notice",useCache=true){
 const feed=FEEDS[category];if(!feed)throw Error("INVALID_CATEGORY");
 // Separate edge-cache keys prevent different categories from being confused.
 const cache=useCache?globalThis.caches?.default:null,key=new Request("https://hanbom-cache.invalid/feed-v5/"+category);
 if(cache)try{const hit=await cache.match(key);if(hit)return{...await hit.json(),cached:true};}catch{}
 let r;try{r=await fetch(feed.url,{redirect:"manual",headers:{accept:"application/rss+xml,application/atom+xml,application/xml,text/xml"},signal:AbortSignal.timeout(12000)});}catch{throw Error("UPSTREAM_NETWORK_ERROR");}
 if(!r.ok)throw Error(r.status>=300&&r.status<400?"UPSTREAM_REDIRECT":"UPSTREAM_HTTP_"+r.status);
 if(+(r.headers.get("content-length")||0)>700000)throw Error("UPSTREAM_TOO_LARGE");
 const buf=await r.arrayBuffer();if(buf.byteLength>700000)throw Error("UPSTREAM_TOO_LARGE");
 const result=parseFeed(new TextDecoder().decode(buf),category);
 if(cache){const save=cache.put(key,new Response(JSON.stringify(result),{headers:{"cache-control":"public,max-age=180","content-type":"application/json"}})).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(save);else await save;}
 return{...result,cached:false};
}
export function mergeFeeds(results,category="all"){
 const successful=results.filter(Boolean);
 const items=successful.flatMap(f=>f.items).sort((a,b)=>{
  const at=Date.parse(a.published_at||"")||0,bt=Date.parse(b.published_at||"")||0;
  return bt-at||a.title.localeCompare(b.title,"ko");
 });
 return{category,source:"한봄고등학교 공개 RSS "+successful.length+"개 게시판",
  sources:successful.map(f=>({category:f.category,source:f.source,source_url:f.source_url,count:f.count,fetched_at:f.fetched_at,cached:f.cached})),
  fetched_at:new Date().toISOString(),count:items.length,items};
}
export const categories=Object.freeze(["all",...Object.keys(GROUPS),...Object.keys(FEEDS)]);
const knownCategory=c=>categories.includes(c);
async function getData(ctx,category="notice",shard=0){
 if(!knownCategory(category))throw Error("INVALID_CATEGORY");
 const sourceIds=FEEDS[category]?[category]:(category==="all"?BOARD_CATALOG.map(b=>b.id):GROUPS[category]);
 const totalSourceCount=sourceIds.length;
 const shardCount=Math.ceil(totalSourceCount/SHARD_SIZE);
 if(!Number.isInteger(shard)||shard<0||shard>=shardCount)throw Error("INVALID_SHARD");
 if(FEEDS[category]){
  const data=await readFeed(ctx,category);
  return{...data,shard:0,shard_count:1,total_source_count:1,has_more:false,next_shard:null,complete:true};
 }
 // Workers Free: 50 external subrequests per invocation; each aggregated page has up to 28
 // source fetches + a cache match + cache put = max 30 calls, safely below the quota.
 const ids=sourceIds.slice(shard*SHARD_SIZE,(shard+1)*SHARD_SIZE);
 const cache=globalThis.caches?.default,key=new Request("https://hanbom-cache.invalid/aggregate-v5/"+category+"/"+shard);
 if(cache)try{const hit=await cache.match(key);if(hit)return{...await hit.json(),cached:true};}catch{}
 const resolved=[];
 // Limit simultaneous requests to the school origin; still resolve every source independently.
 for(let offset=0;offset<ids.length;offset+=7){
  const part=await Promise.allSettled(ids.slice(offset,offset+7).map(id=>readFeed(ctx,id,false)));
  resolved.push(...part);
 }
 const good=resolved.flatMap(v=>v.status==="fulfilled"?[v.value]:[]);
 if(!good.length)throw Error("ALL_FEEDS_UNAVAILABLE");
 const failed_feeds=resolved.flatMap((v,i)=>v.status==="rejected"?[{category:ids[i],code:String(v.reason?.message||"UPSTREAM_ERROR")}]:[]);
 const data={...mergeFeeds(good,category),partial:failed_feeds.length>0,failed_feeds,
  shard,shard_count:shardCount,total_source_count:totalSourceCount,has_more:shard+1<shardCount,
  next_shard:shard+1<shardCount?shard+1:null,complete:shardCount===1&&failed_feeds.length===0,cached:false};
 if(cache){const task=cache.put(key,new Response(JSON.stringify(data),{headers:{"cache-control":"public,max-age=180","content-type":"application/json"}})).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(task);else await task;}
 return data;
}

function filtered(data,q,limit){
 const term=String(q||"").trim().toLocaleLowerCase("ko").slice(0,100);
 const rows=term?data.items.filter(x=>(x.title+" "+x.summary).toLocaleLowerCase("ko").includes(term)):data.items;
 return{...data,count:rows.length,items:rows.slice(0,limit)};
}
const categorySchema={type:"string",enum:categories,description:"게시판 category 또는 all/features/curriculum 집계"};
const limitSchema={type:"integer",minimum:1,maximum:100,description:"최대 결과 수 (기본 10)"};
const querySchema={type:"string",minLength:1,maxLength:100,description:"제목·요약 검색어"};
const BASE_TOOLS=[
 {name:"get_school_notices",description:"한봄고등학교 공식 RSS의 최신 공지 사항을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_school_notices",description:"한봄고등학교 공지 사항 RSS의 현재 항목을 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_school_feed_status",description:"한봄고등학교 RSS 수집 상태·항목 수·출처를 조회합니다. 기본값 notice로 기존 클라이언트 호환.",inputSchema:{type:"object",properties:{category:categorySchema},additionalProperties:false}},
 {name:"get_family_letters",description:"한봄고등학교 공식 가정통신문 RSS의 최신 항목을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_family_letters",description:"한봄고등학교 가정통신문 RSS를 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_school_news",description:"한봄고등학교 공식 한봄 NEWS RSS의 최신 게시물을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_school_news",description:"한봄 NEWS RSS에 포함된 게시물을 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_student_works_awards",description:"한봄고등학교 공식 학생작품 및 수상내역 RSS의 최근 게시물을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_student_works_awards",description:"한봄고 학생작품 및 수상내역 RSS에서 제목과 요약을 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_education_office_letters",description:"한봄고등학교 가정통신문(교육청) 공식 RSS의 최신 게시물을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_education_office_letters",description:"한봄고등학교 가정통신문(교육청) RSS의 제목·요약을 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_school_opportunities",description:"한봄고등학교 공모전 및 모집공고 RSS를 조회합니다. 빈 피드면 정상 0건입니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_school_opportunities",description:"공모전 및 모집공고 RSS의 제목·요약을 검색하며 빈 피드면 정상 0건입니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_health_notices",description:"한봄고등학교 공식 보건알림 RSS의 최신 게시물을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_health_notices",description:"한봄고등학교 보건알림 RSS를 제목·요약으로 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_student_rules",description:"한봄고등학교 학생생활규정게시판의 공개 RSS 게시물을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_student_rules",description:"한봄고등학교 학생생활규정게시판의 공개 RSS를 제목·요약으로 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_all_school_posts",description:"한봄고 공지 사항·가정통신문·한봄 NEWS·학생작품 및 수상내역·가정통신문(교육청)·공모전 및 모집공고·보건알림·학생생활규정게시판을 통합해 게시 시각순으로 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_all_school_posts",description:"한봄고 공지 사항·가정통신문·한봄 NEWS·학생작품 및 수상내역·가정통신문(교육청)·공모전 및 모집공고·보건알림·학생생활규정게시판을 함께 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}}
];

const EXTRA_TOOL_ROUTING=Object.fromEntries(EXTRA_BOARD_CATALOG.flatMap(b=>[["get_"+b.id+"_posts",b.id],["search_"+b.id+"_posts",b.id]]));
const EXTRA_TOOLS=EXTRA_BOARD_CATALOG.flatMap(b=>[
 {name:"get_"+b.id+"_posts",description:"한봄고 "+(b.group==="features"?"학교특색활동 · ":b.group==="curriculum"?"교과자료실 · ":"")+b.label+" RSS 최신 게시물을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_"+b.id+"_posts",description:"한봄고 "+(b.group==="features"?"학교특색활동 · ":b.group==="curriculum"?"교과자료실 · ":"")+b.label+" RSS 게시물을 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}}
]);
const GENERIC_TOOLS=[
 {name:"get_board_posts",description:"31개 학교 RSS에서 카테고리 하나 또는 all/features/curriculum 집계를 조회합니다.",inputSchema:{type:"object",properties:{category:categorySchema,limit:limitSchema},required:["category"],additionalProperties:false}},
 {name:"search_board_posts",description:"카테고리 하나 또는 all/features/curriculum 집계를 지정해 학교 RSS를 검색합니다.",inputSchema:{type:"object",properties:{category:categorySchema,query:querySchema,limit:limitSchema},required:["category","query"],additionalProperties:false}}
];
const SHARD_ARG={type:"integer",minimum:0,maximum:SHARD_COUNT-1,description:"all 집계에서는 0~2페이지를 순서대로 조회. 메뉴/개별 게시판은 0만 유효."};
const SHARDED_TOOLS=new Set(["get_school_feed_status","get_all_school_posts","search_all_school_posts","get_board_posts","search_board_posts"]);
const CATALOG_TOOL={name:"list_school_boards",description:"학교 공식 공개 RSS 82개에 대한 게시판 ID·상위 메뉴·원본 주소·REST 경로 목록을 제공합니다.",inputSchema:{type:"object",properties:{},additionalProperties:false}};
const TOOL=[...BASE_TOOLS,...EXTRA_TOOLS,...GENERIC_TOOLS,CATALOG_TOOL].map(t=>({
 ...t,inputSchema:SHARDED_TOOLS.has(t.name)?{...t.inputSchema,properties:{...t.inputSchema.properties,shard:SHARD_ARG}}:t.inputSchema,
 annotations:{readOnlyHint:true,destructiveHint:false}
}));

async function mcp(request,ctx){
 if(request.method!=="POST")return json({error:"Use stateless MCP POST JSON-RPC"},405);
 const accept=request.headers.get("accept")||"";
 if(accept&&!accept.includes("application/json")&&!accept.includes("*/*"))return json({error:"Accept application/json required"},406);
 const raw=await request.text();if(raw.length>16000)return json({error:"Payload too large"},413);
 let p;try{p=JSON.parse(raw);}catch{return json({jsonrpc:"2.0",id:null,error:{code:-32700,message:"Parse error"}},400);}
 if(!p||Array.isArray(p)||p.jsonrpc!=="2.0"||typeof p.method!=="string")return json({jsonrpc:"2.0",id:p?.id??null,error:{code:-32600,message:"Invalid Request"}},400);
 if(!Object.hasOwn(p,"id"))return new Response(null,{status:202});
 const ok=result=>json({jsonrpc:"2.0",id:p.id,result});
 const err=(code,message)=>json({jsonrpc:"2.0",id:p.id,error:{code,message}});
 if(p.method==="initialize")return ok({protocolVersion:VERSIONS.includes(p.params?.protocolVersion)?p.params.protocolVersion:"2025-11-25",capabilities:{tools:{listChanged:false}},serverInfo:{name:"hanbom-rss-mcp",version:VERSION},instructions:"학교 RSS 82개를 읽기 전용으로 조회·검색합니다. all 카테고리는 3개 shard(0,1,2)를 순서대로 호출해야 전체를 확인할 수 있습니다. 상담·민원은 개인정보 보호를 위해 제목·요약을 축약합니다."});
 if(request.headers.get("mcp-protocol-version")&&!VERSIONS.includes(request.headers.get("mcp-protocol-version")))return err(-32600,"Unsupported protocol version");
 if(p.method==="ping")return ok({});
 if(p.method==="tools/list")return ok({tools:TOOL});
 if(p.method==="tools/call"){
   const name=p.params?.name,args=p.params?.arguments??{};
   if(!TOOL.some(x=>x.name===name))return err(-32602,"Unknown tool");
   if(!args||Array.isArray(args)||typeof args!=="object")return err(-32602,"Invalid arguments");
   const isSearch=name.startsWith("search_"),isStatus=name==="get_school_feed_status",isGeneric=name==="get_board_posts"||name==="search_board_posts",isList=name==="list_school_boards";
   const paginated=isStatus||isGeneric||name.includes("all_school_posts");
   const allowed=isList?[]:isStatus?["category","shard"]:isGeneric?(isSearch?["category","query","limit","shard"]:["category","limit","shard"]):isSearch?(paginated?["query","limit","shard"]:["query","limit"]):(paginated?["limit","shard"]:["limit"]);
   if(Object.keys(args).some(x=>!allowed.includes(x)))return err(-32602,"Unexpected argument");
   if(isSearch&&(typeof args.query!=="string"||!args.query.trim()||args.query.length>100))return err(-32602,"Invalid query");
   if(args.limit!==undefined&&(!Number.isInteger(args.limit)||args.limit<1||args.limit>100))return err(-32602,"Invalid limit");
   if(args.shard!==undefined&&(!Number.isInteger(args.shard)||args.shard<0||args.shard>=SHARD_COUNT))return err(-32602,"Invalid shard");
   if(isStatus&&args.category!==undefined&&!knownCategory(args.category))return err(-32602,"Invalid category");
   let category="notice";
   if(name.includes("family_letters"))category="letter";
   else if(name.includes("school_news"))category="news";
   else if(name.includes("student_works_awards"))category="awards";
   else if(name.includes("education_office_letters"))category="office_letter";
   else if(name.includes("school_opportunities"))category="opportunities";
   else if(name.includes("health_notices"))category="health";
   else if(name.includes("student_rules"))category="student_rules";
   else if(name.includes("all_school_posts"))category="all";
   else if(isGeneric)category=args.category;
   else if(EXTRA_TOOL_ROUTING[name])category=EXTRA_TOOL_ROUTING[name];
   else if(isStatus)category=args.category||"notice";
   if(isGeneric&&!knownCategory(args.category))return err(-32602,"Invalid category");
   if(isList){const result={count:BOARD_CATALOG.length,menus:MENU_CATALOG,boards:BOARD_CATALOG,shard_size:SHARD_SIZE,shard_count:SHARD_COUNT};return ok({content:[{type:"text",text:JSON.stringify(result)}],structuredContent:result});}
   try{
     const data=await getData(ctx,category,args.shard??0);
     const result=isStatus?{category:data.category,source:data.source,source_url:data.source_url??null,sources:data.sources??null,feed_title:data.feed_title??null,fetched_at:data.fetched_at,count:data.count,cached:data.cached??null,partial:data.partial??false,failed_feeds:data.failed_feeds??[],shard:data.shard,shard_count:data.shard_count,next_shard:data.next_shard,has_more:data.has_more,total_source_count:data.total_source_count,complete:data.complete}:filtered(data,isSearch?args.query:"",args.limit??10);
     return ok({content:[{type:"text",text:JSON.stringify(result)}],structuredContent:result});
   }catch(e){return ok({isError:true,content:[{type:"text",text:"RSS unavailable: "+String(e.message||"ERROR")}]});}
 }
 return err(-32601,"Method not found");
}

const page=String.raw`<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>한봄고등학교 공지사항</title>
<style>
@font-face{font-family: 'Juache';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.woff') format('woff');font-weight:normal;font-display: swap;}
:root{color-scheme:light}
*{box-sizing:border-box}
html,body{min-height:100%;background:#fff}
body{margin:0;color:#111;font-family:"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;-webkit-font-smoothing:antialiased}
main{width:min(980px,calc(100% - 40px));margin-inline:auto;padding:clamp(72px,11vh,136px) 0 96px}
h1{margin:0 0 clamp(44px,6vh,70px);font-family:'Juache',sans-serif;font-size:clamp(32px,4.2vw,46px);font-weight:normal;line-height:1.3;text-align:center;letter-spacing:-.025em}
nav.filters{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;margin:0 0 clamp(36px,5vh,62px)}
nav.filters.subfilters{margin-top:-26px;margin-bottom:clamp(36px,5vh,62px);gap:8px}
nav.filters[hidden]{display:none!important}
nav.filters button{appearance:none;border:1px solid #dedede;border-radius:999px;background:#fff;color:#111;font:500 15px/1.25 "Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;padding:11px 20px;min-height:43px;cursor:pointer;transition:none}
nav.filters.subfilters button{font-size:14px;padding:9px 15px}
nav.filters button[aria-pressed="true"]{color:#fff;background:#111;border-color:#111}
nav.filters button:hover{filter:none;box-shadow:none;transform:none;transition:none}
nav.filters button:focus-visible{outline:2px solid #111;outline-offset:3px}
ol{list-style:none;margin:0 auto;padding:0;display:flex;flex-direction:column;align-items:stretch;gap:28px;max-width:760px}
li{text-align:center;font-size:clamp(17px,1.65vw,20px);font-weight:400;line-height:1.65;letter-spacing:-.025em;word-break:keep-all;overflow-wrap:anywhere}
li a,li a:link,li a:visited,li a:hover,li a:active{color:inherit;text-decoration:none;background:transparent;opacity:1;transition:none}
li a:focus-visible{outline:2px solid #111;outline-offset:5px}
@media(max-width:600px){main{width:calc(100% - 36px);padding:72px 0}nav.filters{gap:8px}nav.filters button{font-size:14px;padding:10px 15px;min-height:42px}ol{gap:24px}li{font-size:17px}}
</style></head>
<body><main aria-label="한봄고등학교 공개 RSS 게시판">
<h1>한봄고 홈페이지 공지사항 MCP</h1>
<nav class="filters primary" aria-label="게시판 종류">
<button type="button" data-category="all" aria-pressed="true">전체 보기</button>
<button type="button" data-category="notice" aria-pressed="false">공지 사항</button>
<button type="button" data-category="letter" aria-pressed="false">가정통신문</button>
<button type="button" data-category="news" aria-pressed="false">한봄 NEWS</button>
<button type="button" data-category="awards" aria-pressed="false">학생작품 및 수상내역</button>
<button type="button" data-category="office_letter" aria-pressed="false">가정통신문(교육청)</button>
<button type="button" data-category="opportunities" aria-pressed="false">공모전 및 모집공고</button>
<button type="button" data-category="health" aria-pressed="false">보건알림</button>
<button type="button" data-category="student_rules" aria-pressed="false">학생생활규정게시판</button>
<button type="button" data-category="volunteer" aria-pressed="false">봉사활동</button>
<button type="button" data-category="after_school" aria-pressed="false">방과후학교</button>
<button type="button" data-category="features" aria-pressed="false">학교특색활동</button>
<button type="button" data-category="meals" aria-pressed="false">급식게시판</button>
<button type="button" data-category="nutrition" aria-pressed="false">영양상담</button>
<button type="button" data-category="livestock" aria-pressed="false">축산물이력표시</button>
<button type="button" data-category="teacher_protection" aria-pressed="false">교육활동침해 예방교육계획</button>
<button type="button" data-category="employment_status" aria-pressed="false">취업현황</button>
<button type="button" data-category="employment_resources" aria-pressed="false">취업자료</button>
<button type="button" data-category="career_resources" aria-pressed="false">진로진학자료</button>
<button type="button" data-category="curriculum" aria-pressed="false">교과자료실</button>
</nav>
<nav class="filters subfilters" data-group="features" aria-label="학교특색활동 학과별" hidden>
<button type="button" data-category="features" aria-pressed="false">전체 보기</button>
<button type="button" data-category="feature_main" aria-pressed="false">학교특색활동 게시판</button>
<button type="button" data-category="feature_beauty" aria-pressed="false">뷰티아트과</button>
<button type="button" data-category="feature_character" aria-pressed="false">캐릭터창작과</button>
<button type="button" data-category="feature_visual" aria-pressed="false">시각디자인과</button>
<button type="button" data-category="feature_bigdata" aria-pressed="false">빅데이터정보과</button>
<button type="button" data-category="feature_smart" aria-pressed="false">스마트제어과</button>
<button type="button" data-category="feature_sound" aria-pressed="false">사운드디자인과</button>
</nav>
<nav class="filters subfilters" data-group="curriculum" aria-label="교과자료실 학과별" hidden>
<button type="button" data-category="curriculum" aria-pressed="false">전체 보기</button>
<button type="button" data-category="curriculum_general" aria-pressed="false">보통교과</button>
<button type="button" data-category="curriculum_beauty" aria-pressed="false">뷰티아트과</button>
<button type="button" data-category="curriculum_character" aria-pressed="false">캐릭터창작과</button>
<button type="button" data-category="curriculum_visual" aria-pressed="false">시각디자인과</button>
<button type="button" data-category="curriculum_bigdata" aria-pressed="false">빅데이터정보과</button>
<button type="button" data-category="curriculum_smart" aria-pressed="false">스마트제어과</button>
<button type="button" data-category="curriculum_sound" aria-pressed="false">사운드디자인과</button>
</nav>
<ol id="notices" aria-live="polite" aria-busy="true"></ol>
</main><script>
(function(){
 const list=document.getElementById("notices");
 const buttons=[...document.querySelectorAll("nav.filters button")];
 const groups={"features":["feature_main","feature_beauty","feature_character","feature_visual","feature_bigdata","feature_smart","feature_sound"],"curriculum":["curriculum_general","curriculum_beauty","curriculum_character","curriculum_visual","curriculum_bigdata","curriculum_smart","curriculum_sound"]};
 const ids=["notice","letter","news","awards","office_letter","opportunities","health","student_rules","volunteer","after_school","feature_main","feature_beauty","feature_character","feature_visual","feature_bigdata","feature_smart","feature_sound","meals","nutrition","livestock","teacher_protection","employment_status","employment_resources","career_resources","curriculum_general","curriculum_beauty","curriculum_character","curriculum_visual","curriculum_bigdata","curriculum_smart","curriculum_sound"];
 let active="all",data=[],errors=new Set(),loaded=false;
 const message=text=>{const li=document.createElement("li");li.textContent=text;list.replaceChildren(li);};
 function groupFor(category){
  if(category==="features"||groups.features.includes(category))return "features";
  if(category==="curriculum"||groups.curriculum.includes(category))return "curriculum";
  return null;
 }
 function render(){
  if(!loaded){message("불러오는 중입니다.");return;}
  const selected=active==="all"?null:(groups[active]||[active]);
  const rows=selected?data.filter(x=>selected.includes(x.category)):data;
  const fragment=document.createDocumentFragment();
  for(const entry of rows){
   if(typeof entry.title!=="string"||!entry.title.trim())continue;
   const li=document.createElement("li");
   let url=null;
   if(typeof entry.url==="string")try{const candidate=new URL(entry.url);if(candidate.protocol==="https:"&&candidate.hostname==="hanbom-h.goesw.kr")url=candidate;}catch{}
   const link=document.createElement(url?"a":"span");link.textContent=entry.title;
   if(url){link.href=url.href;link.target="_blank";link.rel="noopener noreferrer";}
   li.append(link);fragment.append(li);
  }
  if(fragment.childNodes.length)list.replaceChildren(fragment);
  else if(active==="all"?(errors.size===ids.length):(selected?selected.every(k=>errors.has(k)):errors.has(active)))message("게시물을 불러올 수 없습니다.");
  else message("표시할 게시물이 없습니다.");
 }
 function select(category){
  active=category;
  const group=groupFor(category);
  for(const nav of document.querySelectorAll("nav.subfilters"))nav.hidden=nav.dataset.group!==group;
  for(const button of buttons){
   const parent=button.closest("nav.primary");
   const pressed=parent?(button.dataset.category===(group||category)):(button.dataset.category===category);
   button.setAttribute("aria-pressed",String(pressed));
  }
  render();
 }
 for(const button of buttons)button.addEventListener("click",()=>select(button.dataset.category));
 async function load(){
  message("불러오는 중입니다.");
  try{
   const response=await fetch("/api/posts?limit=all",{cache:"no-store"});
   if(!response.ok)throw new Error("RSS_UNAVAILABLE");
   const result=await response.json();
   data=Array.isArray(result.items)?result.items:[];
   errors=new Set((result.failed_feeds||[]).map(x=>x.category));
   loaded=true;render();
  }catch{loaded=true;errors=new Set(ids);render();}
  finally{list.setAttribute("aria-busy","false");}
 }
 load();
})();
</script></body></html>`;

export default{async fetch(request,env,ctx){
 const url=new URL(request.url),path=url.pathname;
 if(request.method==="OPTIONS"&&(path==="/mcp"||path.startsWith("/api/")))return new Response(null,{status:204,headers:HEADERS});
 if(path==="/mcp")return mcp(request,ctx);
 if(path==="/api/meta"||path==="/api/catalog"){
  if(request.method!=="GET")return json({error:"Method not allowed"},405);
  return json({name:"HANBOM DATA",version:VERSION,source_count:BOARD_CATALOG.length,menu_count:MENU_CATALOG.length,
   sources:FEEDS,menus:MENU_CATALOG,groups:GROUPS,extra_board_catalog:EXTRA_BOARD_CATALOG,new_board_catalog:NEW_BOARD_CATALOG,
   catalog:BOARD_CATALOG,api_routes:ALL_API_ROUTES,shard_size:SHARD_SIZE,shard_count:SHARD_COUNT,
   categories,endpoints:["/api/posts?shard=0&limit=all","/api/posts?shard=1&limit=all","/api/posts?shard=2&limit=all",
   "/api/feed?category=<id>","/api/search?q=...&category=<id>","/api/status?category=all&shard=0",
   "/api/board/<id>","/api/catalog","/mcp"],
   authentication:{dashboard:"public",api:"public",mcp:"public — OAuth planned, not enabled"},
   auth:{dashboard:"public (Access rules archived for restoration)",api:"public",mcp:"public — OAuth planned, not enabled"}});
 }
 const direct=ALL_API_ROUTES[path];
 if(direct||["/api/posts","/api/feed","/api/search","/api/status"].includes(path)){
  if(request.method!=="GET")return json({error:"Method not allowed"},405);
  const category=direct||url.searchParams.get("category")||((path==="/api/posts"||path==="/api/feed")?"all":"notice");
  if(!knownCategory(category))return json({error:"Invalid category",allowed:categories},400);
  const shardText=url.searchParams.get("shard")||"0";
  if(!/^(0|[1-9]\d*)$/.test(shardText)||Number(shardText)>=SHARD_COUNT)return json({error:"Invalid shard",shard_count:SHARD_COUNT},400);
  try{
   const data=await getData(ctx,category,Number(shardText));
   if(path==="/api/status")return json({category:data.category,source:data.source,source_url:data.source_url??null,sources:data.sources??null,
    feed_title:data.feed_title??null,fetched_at:data.fetched_at,count:data.count,cached:data.cached??null,
    partial:data.partial??false,failed_feeds:data.failed_feeds??[],shard:data.shard,shard_count:data.shard_count,
    next_shard:data.next_shard,has_more:data.has_more,total_source_count:data.total_source_count,complete:data.complete});
   const param=url.searchParams.get("limit"),num=Number(param||20);
   const limit=param==="all"?100*SHARD_SIZE:(Number.isInteger(num)?Math.max(1,Math.min(100*SHARD_SIZE,num)):20);
   return json(filtered(data,url.searchParams.get("q"),limit));
  }catch(e){
   const error=String(e.message||"RSS_ERROR");
   return json({error:"RSS unavailable",code:error,category},error==="INVALID_SHARD"?400:502);
  }
 }
 if(path.startsWith("/api/"))return json({error:"Not found"},404);
 if(path==="/health")return json({status:"ok",version:VERSION});
 if(path!=="/"&&path!=="/index.html")return json({error:"Not found"},404);
 if(!["GET","HEAD"].includes(request.method))return json({error:"Method not allowed"},405);
 // Cloudflare Access intentionally paused; archived Zero Trust applications remain available for restoration.
 // if(!request.headers.get("cf-access-jwt-assertion"))return json({error:"Dashboard requires Cloudflare Access"},401);
 return new Response(request.method==="HEAD"?null:page,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store",
  "x-content-type-options":"nosniff","content-security-policy":"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src https://cdn.jsdelivr.net; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"}});
}};
