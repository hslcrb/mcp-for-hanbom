
export const VERSION="0.1.0";
const FEED="https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062";
const SOURCE="한봄고등학교 공식 공지사항 RSS";
const VERSIONS=["2025-03-26","2025-06-18","2025-11-25"];
const HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,accept,mcp-protocol-version"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
const decode=s=>String(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'");
const plain=s=>decode(s).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
function tag(s,name){const m=s.match(new RegExp("<(?:[\\w-]+:)?"+name+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w-]+:)?"+name+"\\s*>","i"));return m?plain(m[1]):"";}
function safeLink(s){const m=s.match(/<link\b[^>]*href=["']([^"']+)["']/i);const val=m?decode(m[1]):tag(s,"link");if(!val)return null;try{const u=new URL(val,"https://hanbom-h.goesw.kr");return u.protocol==="https:"&&u.hostname==="hanbom-h.goesw.kr"?u.href:null;}catch{return null;}}
export function parseFeed(xml){
 if(!/<(?:rss|feed|rdf:RDF)\b/i.test(xml))throw Error("INVALID_RSS");
 const matches=[...xml.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)].slice(0,100);
 const items=matches.map(m=>{const x=m[1],d=tag(x,"pubDate")||tag(x,"published")||tag(x,"updated"),url=safeLink(x);return{id:tag(x,"guid")||tag(x,"id")||url,title:tag(x,"title").slice(0,300),url,published_at:d&&!isNaN(Date.parse(d))?new Date(d).toISOString():null,summary:(tag(x,"description")||tag(x,"summary")||tag(x,"content")).slice(0,500)};}).filter(x=>x.title);
 return{source:SOURCE,source_url:FEED,feed_title:tag(xml,"title"),fetched_at:new Date().toISOString(),count:items.length,items};
}
async function load(ctx){
 const cache=globalThis.caches?.default,key=new Request("https://hanbom-cache.invalid/feed-v1");
 if(cache)try{const r=await cache.match(key);if(r)return{...await r.json(),cached:true};}catch{}
 let r;try{r=await fetch(FEED,{redirect:"manual",headers:{accept:"application/rss+xml,application/atom+xml,application/xml,text/xml"},signal:AbortSignal.timeout(12000)});}catch{throw Error("UPSTREAM_NETWORK_ERROR");}
 if(!r.ok)throw Error(r.status>=300&&r.status<400?"UPSTREAM_REDIRECT":"UPSTREAM_HTTP_"+r.status);
 if(+(r.headers.get("content-length")||0)>700000)throw Error("UPSTREAM_TOO_LARGE");
 const buffer=await r.arrayBuffer();if(buffer.byteLength>700000)throw Error("UPSTREAM_TOO_LARGE");
 const data=parseFeed(new TextDecoder().decode(buffer));
 if(cache){const task=cache.put(key,new Response(JSON.stringify(data),{headers:{"cache-control":"public,max-age=180","content-type":"application/json"}})).catch(()=>{});if(ctx?.waitUntil)ctx.waitUntil(task);}
 return{...data,cached:false};
}
function filtered(d,q,limit){const term=String(q||"").trim().toLocaleLowerCase("ko").slice(0,100);const rows=term?d.items.filter(x=>(x.title+" "+x.summary).toLocaleLowerCase("ko").includes(term)):d.items;return{...d,count:rows.length,items:rows.slice(0,limit)};}
const TOOL=[
{name:"get_school_notices",description:"한봄고등학교 공식 RSS의 최신 공지사항을 조회합니다.",inputSchema:{type:"object",properties:{limit:{type:"integer",minimum:1,maximum:100}},additionalProperties:false}},
{name:"search_school_notices",description:"RSS에 현재 포함된 한봄고등학교 공지를 검색합니다. 전체 과거 기록 검색은 아닙니다.",inputSchema:{type:"object",properties:{query:{type:"string",minLength:1,maxLength:100},limit:{type:"integer",minimum:1,maximum:100}},required:["query"],additionalProperties:false}},
{name:"get_school_feed_status",description:"학교 RSS의 수집 상태, 게시물 수, 출처를 확인합니다.",inputSchema:{type:"object",properties:{},additionalProperties:false}}
].map(t=>({...t,annotations:{readOnlyHint:true,destructiveHint:false}}));
async function mcp(request,ctx){
 if(request.method!=="POST")return json({error:"Use stateless MCP POST JSON-RPC"},405);
 const accept=request.headers.get("accept")||"";if(accept&&!accept.includes("application/json")&&!accept.includes("*/*"))return json({error:"Accept application/json required"},406);
 const raw=await request.text();if(raw.length>16000)return json({error:"Payload too large"},413);
 let p;try{p=JSON.parse(raw);}catch{return json({jsonrpc:"2.0",id:null,error:{code:-32700,message:"Parse error"}},400);}
 if(!p||Array.isArray(p)||p.jsonrpc!=="2.0"||typeof p.method!=="string")return json({jsonrpc:"2.0",id:p?.id??null,error:{code:-32600,message:"Invalid Request"}},400);
 if(!Object.hasOwn(p,"id"))return new Response(null,{status:202});
 const ok=result=>json({jsonrpc:"2.0",id:p.id,result}),err=(code,message)=>json({jsonrpc:"2.0",id:p.id,error:{code,message}});
 if(p.method==="initialize")return ok({protocolVersion:VERSIONS.includes(p.params?.protocolVersion)?p.params.protocolVersion:"2025-11-25",capabilities:{tools:{listChanged:false}},serverInfo:{name:"hanbom-rss-mcp",version:VERSION},instructions:"비공식 한봄고 공개자료 RSS MCP. 데이터 출처를 밝히세요."});
 if(request.headers.get("mcp-protocol-version")&&!VERSIONS.includes(request.headers.get("mcp-protocol-version")))return err(-32600,"Unsupported protocol version");
 if(p.method==="ping")return ok({});
 if(p.method==="tools/list")return ok({tools:TOOL});
 if(p.method==="tools/call"){
 const name=p.params?.name,args=p.params?.arguments??{};if(!TOOL.some(x=>x.name===name))return err(-32602,"Unknown tool");
 if(!args||Array.isArray(args)||typeof args!=="object")return err(-32602,"Invalid arguments");
 const allowed=name==="search_school_notices"?["query","limit"]:name==="get_school_notices"?["limit"]:[];
 if(Object.keys(args).some(x=>!allowed.includes(x)))return err(-32602,"Unexpected argument");
 if(name==="search_school_notices"&&(typeof args.query!=="string"||!args.query.trim()||args.query.length>100))return err(-32602,"Invalid query");
 if(args.limit!==undefined&&(!Number.isInteger(args.limit)||args.limit<1||args.limit>100))return err(-32602,"Invalid limit");
 try{const d=await load(ctx);const result=name==="get_school_feed_status"?{source:d.source,source_url:d.source_url,feed_title:d.feed_title,fetched_at:d.fetched_at,count:d.count,cached:d.cached}:filtered(d,name==="search_school_notices"?args.query:"",args.limit??10);return ok({content:[{type:"text",text:JSON.stringify(result)}],structuredContent:result});}
 catch(e){return ok({isError:true,content:[{type:"text",text:"RSS unavailable: "+e.message}]});}
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
:root{color-scheme:light}
*{box-sizing:border-box}
html,body{min-height:100%;background:#fff}
body{margin:0;color:#111;font-family:"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;-webkit-font-smoothing:antialiased}
main{width:min(760px,calc(100% - 40px));margin-inline:auto;padding:clamp(72px,11vh,136px) 0 96px}
ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;align-items:stretch;gap:28px}
li{text-align:center;font-size:clamp(17px,1.65vw,20px);font-weight:400;line-height:1.65;letter-spacing:-.025em;word-break:keep-all;overflow-wrap:anywhere}
li a,li a:link,li a:visited,li a:hover,li a:active{color:inherit;text-decoration:none;background:transparent;opacity:1;transition:none}
li a:focus-visible{outline:2px solid #111;outline-offset:5px}
@media(max-width:600px){main{width:calc(100% - 36px);padding:72px 0}ol{gap:24px}li{font-size:17px}}
</style>
</head>
<body>
<main aria-label="한봄고등학교 공지사항 목록"><ol id="notices" aria-live="polite" aria-busy="true"></ol></main>
<script>
(function(){
  const list=document.getElementById("notices");
  const oneLine=text=>{
    const li=document.createElement("li");
    li.textContent=text;
    list.replaceChildren(li);
  };
  fetch("/api/notices?limit=100",{cache:"no-store"})
    .then(response=>{
      if(!response.ok)throw new Error("RSS_UNAVAILABLE");
      return response.json();
    })
    .then(data=>{
      const items=Array.isArray(data.items)?data.items:[];
      const fragment=document.createDocumentFragment();
      for(const item of items){
        if(!item || typeof item.title!=="string" || !item.title.trim())continue;
        const li=document.createElement("li");
        let url=null;
        if(typeof item.url==="string"){
          try{
            const candidate=new URL(item.url);
            if(candidate.protocol==="https:" && candidate.hostname==="hanbom-h.goesw.kr")url=candidate;
          }catch{}
        }
        const title=document.createElement(url?"a":"span");
        title.textContent=item.title;
        if(url){
          title.href=url.href;
          title.target="_blank";
          title.rel="noopener noreferrer";
        }
        li.append(title);
        fragment.append(li);
      }
      if(fragment.childNodes.length===0)oneLine("표시할 공지사항이 없습니다.");
      else list.replaceChildren(fragment);
    })
    .catch(()=>oneLine("공지사항을 불러올 수 없습니다."))
    .finally(()=>list.setAttribute("aria-busy","false"));
})();
</script>
</body>
</html>`;

export default{async fetch(request,env,ctx){const u=new URL(request.url),p=u.pathname;if(request.method==="OPTIONS"&&(p==="/mcp"||p.startsWith("/api/")))return new Response(null,{status:204,headers:HEADERS});
if(p==="/mcp")return mcp(request,ctx);
if(p==="/api/notices"||p==="/api/search"||p==="/api/status"){if(request.method!=="GET")return json({error:"Method not allowed"},405);try{const data=await load(ctx);if(p==="/api/status")return json({source:data.source,source_url:data.source_url,feed_title:data.feed_title,fetched_at:data.fetched_at,count:data.count,cached:data.cached});const limit=Number(u.searchParams.get("limit")||20);return json(filtered(data,u.searchParams.get("q"),Number.isInteger(limit)?Math.min(100,Math.max(1,limit)):20));}catch(e){return json({error:"RSS unavailable",code:e.message},502)}}
if(p==="/api/meta")return json({name:"HANBOM DATA",version:VERSION,source:SOURCE,source_url:FEED,endpoints:["/api/notices","/api/search?q=...","/api/status","/mcp"],auth:{dashboard:"Cloudflare Access single email",api:"public",mcp:"public — OAuth planned, not enabled"}});
if(p.startsWith("/api/"))return json({error:"Not found"},404);
if(p==="/health")return json({status:"ok",version:VERSION});
if(p!=="/"&&p!=="/index.html")return json({error:"Not found"},404);
if(!["GET","HEAD"].includes(request.method))return json({error:"Method not allowed"},405);
if(!request.headers.get("cf-access-jwt-assertion"))return json({error:"Dashboard requires Cloudflare Access"},401);
return new Response(request.method==="HEAD"?null:page,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","content-security-policy":"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"}});}};
