
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
const page=String.raw\`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HANBOM DATA</title><meta name="theme-color" content="#0d1b34"><style>
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 90% 10%,#1b4267,transparent 40%),#09182d;color:#f0f6ff;font:16px system-ui,-apple-system,sans-serif}.shell{max-width:1250px;margin:auto;padding:clamp(18px,4vw,50px)}header{display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:1px solid #345073;padding-bottom:25px}header strong{font-size:21px;letter-spacing:2px}.kicker{color:#8ab8e2;font-size:13px;letter-spacing:1.5px;text-transform:uppercase}h1{font-size:clamp(34px,5vw,60px);line-height:1.15;margin:18px 0;letter-spacing:-1.5px}p{color:#b5c6df;line-height:1.6}.hero{display:flex;align-items:end;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:45px 0 20px}input,button{font:inherit;border:1px solid #42648a;border-radius:12px;padding:14px 16px;background:#102c4d;color:#fff;min-height:48px}button{background:#4487dc;cursor:pointer;font-weight:700}.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;margin:30px 0}.stat,.section{background:#10233ebf;border:1px solid #2e4b6c;border-radius:18px;padding:24px}.stat small{color:#9db8d8}.stat b{display:block;font-size:28px;margin-top:15px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:20px}.section h2{margin:0 0 14px;font-size:23px}.notice{padding:19px 0;border-top:1px solid #2c4867}.notice:first-child{border:0}.notice a{color:#f0f6ff;text-decoration:none;font-weight:650;font-size:17px}.notice a:hover{text-decoration:underline}.notice time{display:block;color:#9cb4d4;font-size:13px;margin-top:7px}.notice p{font-size:14px;margin:6px 0}.link{display:block;margin:16px 0;color:#85c4ff;text-decoration:none;overflow-wrap:anywhere}footer{padding-top:35px;font-size:13px;color:#94a9c6}@media(max-width:850px){.layout{grid-template-columns:1fr}}@media(max-width:540px){.stats{grid-template-columns:1fr}input{width:100%}}
</style></head><body><div class="shell"><header><div><div class="kicker">Independent school data project</div><strong>HANBOM DATA</strong></div><div class="kicker">PERSONAL CONSOLE</div></header><div class="hero"><div><div class="kicker">한봄고등학교 · 공지사항 관제</div><h1>학교의 오늘을<br>데이터로 연결하다.</h1><p>학교 공식 RSS를 연결한 비공식 실시간 데이터 허브</p></div><div><input id="q" aria-label="공지 검색" type="search" maxlength="100" placeholder="공지사항 검색"><button id="reload">새로고침</button></div></div><div class="stats"><div class="stat"><small>수집된 게시물</small><b id="count">—</b></div><div class="stat"><small>RSS 수집 시각</small><b id="time">—</b></div><div class="stat"><small>서비스 상태</small><b id="state">연결 중</b></div></div><div class="layout"><section class="section"><h2>최신 공지</h2><div id="notices">RSS 조회 중</div></section><aside class="section"><h2>데이터 서비스</h2><p>REST API와 원격 MCP는 공개 읽기 전용입니다.</p><a class="link" href="/api/notices">REST API · 공지사항</a><a class="link" href="/api/status">RSS 상태</a><a class="link" href="/api/meta">API 문서</a><a class="link" href="/mcp">MCP endpoint</a><p>출처: 한봄고등학교. 학교 공식 서비스가 아닙니다.</p><a class="link" href="https://hanbom-h.goesw.kr" target="_blank" rel="noopener noreferrer">공식 홈페이지</a></aside></div><footer>HANBOM DATA · Source attribution · Public read-only feeds</footer></div><script>
let items=[];const el=id=>document.getElementById(id),fmt=v=>v?new Date(v).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'미제공';function render(){const q=el('q').value.toLocaleLowerCase('ko'),root=el('notices');root.replaceChildren();for(const n of items.filter(x=>(x.title+' '+x.summary).toLocaleLowerCase('ko').includes(q))){const wrap=document.createElement('div');wrap.className='notice';const a=document.createElement(n.url?'a':'span');a.textContent=n.title;if(n.url){a.href=n.url;a.target='_blank';a.rel='noopener noreferrer';}wrap.append(a);const t=document.createElement('time');t.textContent=fmt(n.published_at);wrap.append(t);if(n.summary){const p=document.createElement('p');p.textContent=n.summary.slice(0,220);wrap.append(p)}root.append(wrap)}if(!root.children.length)root.textContent='표시할 게시물이 없습니다.';}async function load(){el('state').textContent='조회 중';try{const r=await fetch('/api/notices?limit=100',{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.code||'요청 오류');items=d.items||[];el('count').textContent=d.count+'건';el('time').textContent=fmt(d.fetched_at);el('state').textContent=d.cached?'캐시 정상':'연결 정상';render()}catch(e){el('state').textContent='연결 실패';el('notices').textContent='데이터 조회 실패: '+e.message}}el('q').addEventListener('input',render);el('reload').addEventListener('click',load);load();
</script></body></html>\`;
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
