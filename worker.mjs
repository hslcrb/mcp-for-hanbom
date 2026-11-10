
import {BOARD_CATALOG,MENU_CATALOG,LEGACY_IDS} from "./catalog.mjs";
import {PillNavigation} from "./ui/pill-components.mjs";
import {SITE_STYLES} from "./ui/site-styles.mjs";
import {SITE_CLIENT} from "./ui/site-client.mjs";
export const VERSION="2.0.1";
export {BOARD_CATALOG,MENU_CATALOG,LEGACY_IDS};
export const FEEDS=Object.freeze(Object.fromEntries(BOARD_CATALOG.map(b=>[b.id,{
 url:b.url,source:"한봄고등학교 "+b.parent+" · "+b.label,label:b.label,
 group:b.parent_id==="features"||b.parent_id==="curriculum"?b.parent_id:null,
 parent:b.parent,parent_id:b.parent_id,mi:b.mi,bbs:b.bbs,sensitive:b.sensitive
}])));
export const EXTRA_BOARD_CATALOG=Object.freeze(BOARD_CATALOG.filter(b=>LEGACY_IDS.includes(b.id)&&!["notice","letter","news","awards","office_letter","opportunities","health","student_rules"].includes(b.id))
 .map(b=>({id:b.id,label:b.label,mi:b.mi,bbs:b.bbs,route:b.route,group:b.parent_id==="features"||b.parent_id==="curriculum"?b.parent_id:null})));
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
 // Legacy 31-board dataset still fits Workers Free in one 33-subrequest invocation.
 const pageSize=category==="legacy"?31:SHARD_SIZE;
 const shardCount=Math.ceil(totalSourceCount/pageSize);
 if(!Number.isInteger(shard)||shard<0||shard>=shardCount)throw Error("INVALID_SHARD");
 if(FEEDS[category]){
  const data=await readFeed(ctx,category);
  return{...data,shard:0,shard_count:1,total_source_count:1,has_more:false,next_shard:null,complete:true};
 }
 // Workers Free: 50 external subrequests per invocation; each aggregated page has up to 28
 // source fetches + a cache match + cache put = max 30 calls, safely below the quota.
 const ids=sourceIds.slice(shard*pageSize,(shard+1)*pageSize);
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

const pillNavigation=PillNavigation({menus:MENU_CATALOG,boards:BOARD_CATALOG});
const clientScript=SITE_CLIENT
 .replace("__GROUPS__",JSON.stringify(Object.fromEntries(MENU_CATALOG.map(menu=>[menu.id,menu.ids]))))
 .replace("__IDS__",JSON.stringify(BOARD_CATALOG.map(board=>board.id)))
 .replace("__SHARD_COUNT__",String(SHARD_COUNT));
const page=String.raw`<!doctype html>
<html lang="ko">
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width,initial-scale=1">
 <meta name="color-scheme" content="light">
 <title>한봄고등학교 공지사항</title>
 <style>
${SITE_STYLES}
 </style>
</head>
<body>
 <main aria-label="한봄고등학교 공개 RSS 82개 게시판">
  <h1>한봄고 홈페이지 공지사항 MCP</h1>
  ${pillNavigation}
  <ol id="notices" aria-live="polite" aria-busy="true"></ol>
 </main>
 <script>
${clientScript}
 </script>
</body>
</html>`;

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
