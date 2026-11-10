
export const VERSION="0.2.0";
export const FEEDS=Object.freeze({
  notice:{url:"https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062",source:"한봄고등학교 공지사항",label:"공지 사항"},
  letter:{url:"https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17252&bbsId=10063",source:"한봄고등학교 가정통신문",label:"가정통신문"}
});
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
 const items=matches.map(m=>{const x=m[1],d=tag(x,"pubDate")||tag(x,"published")||tag(x,"updated"),url=safeLink(x);return{id:tag(x,"guid")||tag(x,"id")||url,title:tag(x,"title").slice(0,300),url,published_at:d&&!isNaN(Date.parse(d))?new Date(d).toISOString():null,summary:(tag(x,"description")||tag(x,"summary")||tag(x,"content")).slice(0,500),category,category_label:feed.label};}).filter(x=>x.title);
 return{category,source:feed.source,source_url:feed.url,feed_title:tag(xml,"title"),fetched_at:new Date().toISOString(),count:items.length,items};
}
async function readFeed(ctx,category="notice"){
 const feed=FEEDS[category];if(!feed)throw Error("INVALID_CATEGORY");
 // Separate edge-cache keys prevent a notice cache from being mistaken for a family-letter feed.
 const cache=globalThis.caches?.default,key=new Request("https://hanbom-cache.invalid/feed-v2/"+category);
 if(cache)try{const hit=await cache.match(key);if(hit)return{...await hit.json(),cached:true};}catch{}
 let r;try{r=await fetch(feed.url,{redirect:"manual",headers:{accept:"application/rss+xml,application/atom+xml,application/xml,text/xml"},signal:AbortSignal.timeout(12000)});}catch{throw Error("UPSTREAM_NETWORK_ERROR");}
 if(!r.ok)throw Error(r.status>=300&&r.status<400?"UPSTREAM_REDIRECT":"UPSTREAM_HTTP_"+r.status);
 if(+(r.headers.get("content-length")||0)>700000)throw Error("UPSTREAM_TOO_LARGE");
 const buf=await r.arrayBuffer();if(buf.byteLength>700000)throw Error("UPSTREAM_TOO_LARGE");
 const result=parseFeed(new TextDecoder().decode(buf),category);
 if(cache){const save=cache.put(key,new Response(JSON.stringify(result),{headers:{"cache-control":"public,max-age=180","content-type":"application/json"}})).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(save);else await save;}
 return{...result,cached:false};
}
export function mergeFeeds(results){
 const successful=results.filter(Boolean);
 const items=successful.flatMap(f=>f.items).sort((a,b)=>{
   const at=Date.parse(a.published_at||"")||0,bt=Date.parse(b.published_at||"")||0;
   return bt-at||a.title.localeCompare(b.title,"ko");
 });
 return {
   category:"all",
   source:"한봄고등학교 공개 RSS — 공지 사항·가정통신문",
   sources:successful.map(f=>({category:f.category,source:f.source,source_url:f.source_url,count:f.count,fetched_at:f.fetched_at,cached:f.cached})),
   fetched_at:new Date().toISOString(),count:items.length,items
 };
}
async function getData(ctx,category="notice"){
 if(category!=="all")return readFeed(ctx,category);
 const names=["notice","letter"],resolved=await Promise.allSettled(names.map(c=>readFeed(ctx,c)));
 const good=resolved.map((r,i)=>r.status==="fulfilled"?r.value:null).filter(Boolean);
 if(!good.length)throw Error("ALL_FEEDS_UNAVAILABLE");
 const result=mergeFeeds(good);
 const failed_feeds=resolved.flatMap((r,i)=>r.status==="rejected"?[{category:names[i],code:String(r.reason?.message||"UPSTREAM_ERROR")}]:[]);
 return{...result,partial:failed_feeds.length>0,failed_feeds};
}
function filtered(data,q,limit){
 const term=String(q||"").trim().toLocaleLowerCase("ko").slice(0,100);
 const rows=term?data.items.filter(x=>(x.title+" "+x.summary).toLocaleLowerCase("ko").includes(term)):data.items;
 return{...data,count:rows.length,items:rows.slice(0,limit)};
}
const categorySchema={type:"string",enum:["notice","letter","all"],description:"notice=공지 사항, letter=가정통신문, all=전체"};
const limitSchema={type:"integer",minimum:1,maximum:100,description:"최대 결과 수(기본 10)"};
const querySchema={type:"string",minLength:1,maxLength:100,description:"제목·요약 검색어"};
const TOOL=[
 {name:"get_school_notices",description:"한봄고등학교 공식 RSS의 최신 공지 사항을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_school_notices",description:"한봄고등학교 공지 사항 RSS의 현재 항목을 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_school_feed_status",description:"한봄고등학교 RSS 수집 상태·항목 수·출처를 조회합니다. 기본값 notice로 기존 클라이언트 호환.",inputSchema:{type:"object",properties:{category:categorySchema},additionalProperties:false}},
 {name:"get_family_letters",description:"한봄고등학교 공식 가정통신문 RSS의 최신 항목을 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_family_letters",description:"한봄고등학교 가정통신문 RSS를 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}},
 {name:"get_all_school_posts",description:"한봄고 공지 사항과 가정통신문을 통합해 게시 시각순으로 조회합니다.",inputSchema:{type:"object",properties:{limit:limitSchema},additionalProperties:false}},
 {name:"search_all_school_posts",description:"한봄고 공지 사항과 가정통신문을 함께 검색합니다.",inputSchema:{type:"object",properties:{query:querySchema,limit:limitSchema},required:["query"],additionalProperties:false}}
].map(t=>({...t,annotations:{readOnlyHint:true,destructiveHint:false}}));
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
 if(p.method==="initialize")return ok({protocolVersion:VERSIONS.includes(p.params?.protocolVersion)?p.params.protocolVersion:"2025-11-25",capabilities:{tools:{listChanged:false}},serverInfo:{name:"hanbom-rss-mcp",version:VERSION},instructions:"비공식 한봄고 공지 사항·가정통신문 공개 RSS 읽기 전용 MCP. 자료 출처를 밝히세요."});
 if(request.headers.get("mcp-protocol-version")&&!VERSIONS.includes(request.headers.get("mcp-protocol-version")))return err(-32600,"Unsupported protocol version");
 if(p.method==="ping")return ok({});
 if(p.method==="tools/list")return ok({tools:TOOL});
 if(p.method==="tools/call"){
   const name=p.params?.name,args=p.params?.arguments??{};
   if(!TOOL.some(x=>x.name===name))return err(-32602,"Unknown tool");
   if(!args||Array.isArray(args)||typeof args!=="object")return err(-32602,"Invalid arguments");
   const isSearch=name.startsWith("search_"),isStatus=name==="get_school_feed_status";
   const allowed=isStatus?["category"]:isSearch?["query","limit"]:["limit"];
   if(Object.keys(args).some(x=>!allowed.includes(x)))return err(-32602,"Unexpected argument");
   if(isSearch&&(typeof args.query!=="string"||!args.query.trim()||args.query.length>100))return err(-32602,"Invalid query");
   if(args.limit!==undefined&&(!Number.isInteger(args.limit)||args.limit<1||args.limit>100))return err(-32602,"Invalid limit");
   if(isStatus&&args.category!==undefined&&!["all","notice","letter"].includes(args.category))return err(-32602,"Invalid category");
   let category="notice";
   if(name.includes("family_letters"))category="letter";
   else if(name.includes("all_school_posts"))category="all";
   else if(isStatus)category=args.category||"notice";
   try{
     const data=await getData(ctx,category);
     const result=isStatus?{category:data.category,source:data.source,source_url:data.source_url??null,sources:data.sources??null,feed_title:data.feed_title??null,fetched_at:data.fetched_at,count:data.count,cached:data.cached??null,partial:data.partial??false,failed_feeds:data.failed_feeds??[]}:filtered(data,isSearch?args.query:"",args.limit??10);
     return ok({content:[{type:"text",text:JSON.stringify(result)}],structuredContent:result});
   }catch(e){return ok({isError:true,content:[{type:"text",text:"RSS unavailable: "+String(e.message||"ERROR")}]});}
 }
 return err(-32601,"Method not found");
}

const page=String.raw`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>한봄고등학교 공지사항</title>
<style>
@font-face {
  font-family: 'Juache';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.woff') format('woff');
  font-weight: normal;
  font-display: swap;
}
:root{color-scheme:light}
*{box-sizing:border-box}
html,body{min-height:100%;background:#fff}
body{margin:0;color:#111;font-family:"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;-webkit-font-smoothing:antialiased}
main{width:min(760px,calc(100% - 40px));margin-inline:auto;padding:clamp(72px,11vh,136px) 0 96px}
h1{margin:0 0 clamp(48px,7vh,76px);font-family:'Juache',sans-serif;font-size:clamp(32px,4.2vw,46px);font-weight:normal;line-height:1.3;text-align:center;letter-spacing:-.025em}
nav.filters{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;margin:0 0 clamp(36px,5vh,62px)}
nav.filters button{appearance:none;border:1px solid #dedede;border-radius:999px;background:#fff;color:#111;font:500 15px/1.25 "Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;padding:11px 20px;min-height:43px;cursor:pointer;transition:none}
nav.filters button[aria-pressed="true"]{color:#fff;background:#111;border-color:#111}
nav.filters button:hover{filter:none;box-shadow:none;transform:none}
nav.filters button:focus-visible{outline:2px solid #111;outline-offset:3px}
ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;align-items:stretch;gap:28px}
li{text-align:center;font-size:clamp(17px,1.65vw,20px);font-weight:400;line-height:1.65;letter-spacing:-.025em;word-break:keep-all;overflow-wrap:anywhere}
li a,li a:link,li a:visited,li a:hover,li a:active{color:inherit;text-decoration:none;background:transparent;opacity:1;transition:none}
li a:focus-visible{outline:2px solid #111;outline-offset:5px}
@media(max-width:600px){main{width:calc(100% - 36px);padding:72px 0}ol{gap:24px}li{font-size:17px}}
</style>
</head>
<body>
<main aria-label="한봄고등학교 공지와 가정통신문">
<h1>한봄고 홈페이지 공지사항 MCP</h1>
<nav class="filters" aria-label="게시물 유형">
<button type="button" data-category="all" aria-pressed="true">전체 보기</button>
<button type="button" data-category="notice" aria-pressed="false">공지 사항</button>
<button type="button" data-category="letter" aria-pressed="false">가정통신문</button>
</nav>
<ol id="notices" aria-live="polite" aria-busy="true"></ol>
</main>
<script>
(function(){
 const list=document.getElementById("notices");
 const buttons=[...document.querySelectorAll(".filters button")];
 let category="all",feeds={notice:[],letter:[]},failed={notice:false,letter:false};
 const message=text=>{const li=document.createElement("li");li.textContent=text;list.replaceChildren(li);};
 const compare=(a,b)=>(Date.parse(b.published_at||"")||0)-(Date.parse(a.published_at||"")||0);
 function render(){
   const data=category==="all"?[...feeds.notice,...feeds.letter].sort(compare):feeds[category];
   const frag=document.createDocumentFragment();
   for(const entry of data){
     if(typeof entry.title!=="string"||!entry.title.trim())continue;
     const li=document.createElement("li");
     let valid=null;
     if(typeof entry.url==="string")try{const link=new URL(entry.url);if(link.protocol==="https:"&&link.hostname==="hanbom-h.goesw.kr")valid=link;}catch{}
     const text=document.createElement(valid?"a":"span");
     text.textContent=entry.title;
     if(valid){text.href=valid.href;text.target="_blank";text.rel="noopener noreferrer";}
     li.append(text);frag.append(li);
   }
   if(frag.childNodes.length){list.replaceChildren(frag);}
   else if(category==="all"?(failed.notice&&failed.letter):failed[category])message("게시물을 불러올 수 없습니다.");
   else message("표시할 게시물이 없습니다.");
 }
 function select(next){
   category=next;
   for(const button of buttons)button.setAttribute("aria-pressed",String(button.dataset.category===category));
   render();
 }
 for(const button of buttons)button.addEventListener("click",()=>select(button.dataset.category));
 async function refresh(){
   const categories=["notice","letter"];
   await Promise.all(categories.map(async kind=>{
     try{
       const response=await fetch(kind==="notice"?"/api/notices?limit=100":"/api/letters?limit=100",{cache:"no-store"});
       if(!response.ok)throw Error("RSS_NOT_AVAILABLE");
       const result=await response.json();
       feeds[kind]=Array.isArray(result.items)?result.items:[];
       failed[kind]=false;
     }catch{feeds[kind]=[];failed[kind]=true;}
     render();
   }));
   list.setAttribute("aria-busy","false");
 }
 refresh();
})();
</script>
</body>
</html>`;

export default{async fetch(request,env,ctx){
 const url=new URL(request.url),path=url.pathname;
 if(request.method==="OPTIONS"&&(path==="/mcp"||path.startsWith("/api/")))return new Response(null,{status:204,headers:HEADERS});
 if(path==="/mcp")return mcp(request,ctx);
 if(["/api/notices","/api/letters","/api/posts","/api/feed","/api/search","/api/status"].includes(path)){
   if(request.method!=="GET")return json({error:"Method not allowed"},405);
   const fromQuery=url.searchParams.get("category"),category=path==="/api/notices"?"notice":path==="/api/letters"?"letter":(fromQuery||(path==="/api/posts"||path==="/api/feed"?"all":"notice"));
   if(!["notice","letter","all"].includes(category))return json({error:"Invalid category",allowed:["notice","letter","all"]},400);
   try{
     const data=await getData(ctx,category);
     if(path==="/api/status")return json({category:data.category,source:data.source,source_url:data.source_url??null,sources:data.sources??null,feed_title:data.feed_title??null,fetched_at:data.fetched_at,count:data.count,cached:data.cached??null,partial:data.partial??false,failed_feeds:data.failed_feeds??[]});
     const limit=Number(url.searchParams.get("limit")||20);
     return json(filtered(data,url.searchParams.get("q"),Number.isInteger(limit)?Math.min(100,Math.max(1,limit)):20));
   }catch(e){return json({error:"RSS unavailable",code:String(e.message||"ERROR"),category},502);}
 }
 if(path==="/api/meta")return json({name:"HANBOM DATA",version:VERSION,sources:FEEDS,endpoints:["/api/notices","/api/letters","/api/posts","/api/feed?category=all","/api/search?q=...&category=all","/api/status?category=all","/mcp"],categories:["all","notice","letter"],authentication:{dashboard:"public",api:"public",mcp:"public — OAuth planned, not enabled"},auth:{dashboard:"public (Access rules archived for restoration)",api:"public",mcp:"public — OAuth planned, not enabled"}});
 if(path.startsWith("/api/"))return json({error:"Not found"},404);
 if(path==="/health")return json({status:"ok",version:VERSION});
 if(path!=="/"&&path!=="/index.html")return json({error:"Not found"},404);
 if(!["GET","HEAD"].includes(request.method))return json({error:"Method not allowed"},405);
 // Cloudflare Access paused. Restore by first reattaching the archived Access app to this hostname.
 // if(!request.headers.get("cf-access-jwt-assertion"))return json({error:"Dashboard requires Cloudflare Access"},401);
 return new Response(request.method==="HEAD"?null:page,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","content-security-policy":"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src https://cdn.jsdelivr.net; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"}});
}};
