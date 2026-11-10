import test from "node:test";import assert from "node:assert/strict";import {parseFeed} from "../worker.mjs";
test("RSS Korean item",()=>{const d=parseFeed('<rss><channel><title>공지</title><item><title>A &amp; B</title><link>https://hanbom-h.goesw.kr/test</link><description><![CDATA[<b>내용</b>]]></description></item></channel></rss>');assert.equal(d.count,1);assert.equal(d.items[0].title,"A & B");assert.equal(d.items[0].summary,"내용");});
test("non rss rejected",()=>assert.throws(()=>parseFeed("<html></html>"),/INVALID_RSS/));
test("unsafe links removed",()=>assert.equal(parseFeed('<rss><item><title>x</title><link>https://evil.example</link></item></rss>').items[0].url,null));

import worker from "../worker.mjs";
test("dashboard is white centered plain notices list only",async()=>{
  const response=await worker.fetch(new Request("https://data.hanbom.rhee.life/",{headers:{"cf-access-jwt-assertion":"unit-test-only"}}),{},{});
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/html,body\{min-height:100%;background:#fff\}/);
  assert.match(html,/<h1>한봄고 홈페이지 공지사항 MCP<\/h1>/);
  assert.match(html,/<ol id="notices"/);
  assert.match(html,/data-category="all"/);
  assert.match(html,/text-align:center/);
  assert.match(html,/li a:visited,li a:hover,li a:active/);
  assert.doesNotMatch(html,/<(?:header|footer|aside|input|h2|time)\b/i);
  assert.doesNotMatch(html,/(?:새로고침|개인 대시보드|최근 공지|수집 게시물|검색창)/);
});
test("dashboard is publicly accessible without any Cloudflare Access assertion",async()=>{
  const response=await worker.fetch(new Request("https://data.hanbom.rhee.life/"),{},{});
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/<h1>한봄고 홈페이지 공지사항 MCP<\/h1>/);
  assert.doesNotMatch(html,/(?:Cf-Access-Jwt-Assertion|Cloudflare Access login)/i);
});
test("HEAD request does not require login and contains no body",async()=>{
  const response=await worker.fetch(new Request("https://data.hanbom.rhee.life/",{method:"HEAD"}),{},{});
  assert.equal(response.status,200);
  assert.equal(await response.text(),"");
});
test("public REST and MCP tool registry remain intact",async()=>{
  const rest=await worker.fetch(new Request("https://data.hanbom.rhee.life/api/meta"),{},{});
  assert.equal(rest.status,200);
  assert.equal((await rest.json()).name,"HANBOM DATA");
  const rpc=await worker.fetch(new Request("https://data.hanbom.rhee.life/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json, text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"tools/list",params:{}})}),{},{});
  assert.equal(rpc.status,200);
  assert.deepEqual((await rpc.json()).result.tools.map(x=>x.name),["get_school_notices","search_school_notices","get_school_feed_status","get_family_letters","search_family_letters","get_school_news","search_school_news","get_student_works_awards","search_student_works_awards","get_education_office_letters","search_education_office_letters","get_school_opportunities","search_school_opportunities","get_health_notices","search_health_notices","get_all_school_posts","search_all_school_posts"]);
});

test("Juache heading loads CDN font while preserving the white list and CSP", async()=>{
  const response=await worker.fetch(new Request("https://data.hanbom.rhee.life/",{
    headers:{"cf-access-jwt-assertion":"test-access-header"}
  }),{},{});
  assert.equal(response.status,200);
  const html=await response.text();
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.match(html,/<h1>한봄고 홈페이지 공지사항 MCP<\/h1>/);
  assert.match(html,/@font-face\s*\{/);
  assert.match(html,/font-family: 'Juache'/);
  assert.match(html,/https:\/\/cdn\.jsdelivr\.net\/gh\/projectnoonnu\/noonfonts_one@1\.0\/BMJUA\.woff/);
  assert.match(html,/h1\{[^}]*font-family:'Juache',sans-serif;[^}]*text-align:center/);
  assert.match(html,/font-display: swap;/);
  assert.match(html,/html,body\{min-height:100%;background:#fff\}/);
  assert.match(response.headers.get("content-security-policy"),/font-src https:\/\/cdn\.jsdelivr\.net/);
});

test("public API metadata reflects disabled Access enforcement", async()=>{
  const r=await worker.fetch(new Request("https://data.hanbom.rhee.life/api/meta"),{},{});
  assert.equal(r.status,200);
  const payload=await r.json();
  assert.match(payload.auth.dashboard,/^public/);
});

import {FEEDS,mergeFeeds} from "../worker.mjs";
test("family-letter feed parser retains category and official URL",()=>{
 const xml='<rss><channel><title>가정통신문</title><item><title>건강 소식</title><link>https://hanbom-h.goesw.kr/letter</link><pubDate>Tue, 10 Nov 2026 11:00:00 GMT</pubDate></item></channel></rss>';
 const result=parseFeed(xml,"letter");
 assert.equal(result.count,1);
 assert.equal(result.items[0].category,"letter");
 assert.equal(result.items[0].category_label,"가정통신문");
 assert.equal(result.source_url,FEEDS.letter.url);
});
test("combined feed merges newest first",()=>{
 const first=parseFeed('<rss><item><title>어제 공지</title><pubDate>Mon, 09 Nov 2026 01:00:00 GMT</pubDate></item></rss>','notice');
 const second=parseFeed('<rss><item><title>오늘 가정통신문</title><pubDate>Tue, 10 Nov 2026 01:00:00 GMT</pubDate></item></rss>','letter');
 const merged=mergeFeeds([first,second]);
 assert.equal(merged.count,2);
 assert.equal(merged.items[0].category,"letter");
 assert.equal(merged.items[1].category,"notice");
});
test("pill navigation shows all eight filters and keeps white aesthetic",async()=>{
 const res=await worker.fetch(new Request("https://data.hanbom.rhee.life/"),{},{});
 const html=await res.text();
 for(const s of ["전체 보기","공지 사항","가정통신문","한봄 NEWS","학생작품 및 수상내역","가정통신문(교육청)","공모전 및 모집공고","보건알림"])assert.ok(html.includes(">"+s+"</button>"));
 assert.equal((html.match(/class="filters"/g)||[]).length,1);
 assert.match(html,/border-radius:999px/);
 assert.match(html,/button\[aria-pressed="true"\]/);
 assert.match(html,/background:#fff/);
 assert.match(html,/nav\.filters button:hover\{filter:none/);
});
test("legacy office-letter routes still work with empty health and opportunities fixtures",async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>{
  const target=String(url);
  const office=target.includes("bbsId=10064"),awards=target.includes("bbsId=10010"),news=target.includes("bbsId=10022"),letter=target.includes("bbsId=10063"),opportunities=target.includes("bbsId=10065"),health=target.includes("bbsId=10066");
  const xml=(opportunities||health)?'<rss version="2.0"><channel><title>게시판 RSS</title></channel></rss>':office?'<rss><item><title>교육청의 새 통신문</title><pubDate>Fri, 13 Nov 2026 12:00:00 GMT</pubDate></item></rss>'
  :awards?'<rss><item><title>학생 작품 수상</title><pubDate>Thu, 12 Nov 2026 12:00:00 GMT</pubDate></item></rss>'
  :news?'<rss><item><title>한봄 NEWS 소식</title><pubDate>Wed, 11 Nov 2026 12:00:00 GMT</pubDate></item></rss>'
  :letter?'<rss><item><title>가정통신문 소식</title><pubDate>Tue, 10 Nov 2026 12:00:00 GMT</pubDate></item></rss>'
  :'<rss><item><title>공지 소식</title><pubDate>Mon, 09 Nov 2026 12:00:00 GMT</pubDate></item></rss>';
  return new Response(xml,{status:200});
 };
 try{
  const api=async path=>(await worker.fetch(new Request("https://data.hanbom.rhee.life"+path),{},{})).json();
  const all=await api("/api/posts?limit=100");
  assert.equal(all.count,5);
  assert.deepEqual(all.items.map(x=>x.category),["office_letter","awards","news","letter","notice"]);
  for(const [path,expected] of [["/api/notices","notice"],["/api/letters","letter"],["/api/news","news"],["/api/awards","awards"],["/api/education-letters","office_letter"]]){
    const value=await api(path);
    assert.equal(value.category,expected);assert.equal(value.count,1);
  }
  const special=await api("/api/feed?category=office_letter");
  assert.equal(special.count,1);
  const status=await api("/api/status?category=all");assert.equal(status.count,5);
  const search=await api("/api/search?q=%EA%B5%90%EC%9C%A1%EC%B2%AD&category=all");assert.equal(search.count,1);
  const meta=await api("/api/meta");
  assert.ok(meta.categories.includes("office_letter"));assert.equal(meta.sources.office_letter.url,FEEDS.office_letter.url);
  for(const name of ["get_education_office_letters","search_education_office_letters"]){
   const rpc=await worker.fetch(new Request("https://data.hanbom.rhee.life/mcp",{
    method:"POST",headers:{"content-type":"application/json","accept":"application/json, text/event-stream"},
    body:JSON.stringify({jsonrpc:"2.0",id:77,method:"tools/call",params:{name,arguments:name.startsWith("search")?{query:"교육청"}:{limit:5}}})
   }),{},{});
   assert.equal((await rpc.json()).result.structuredContent.items[0].category,"office_letter");
  }
 }finally{globalThis.fetch=original;}
});
test("office letters RSS parses category and retains complete official source query",()=>{
 const xml='<rss><item><title>교육청 안전 안내</title><link>https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectNttInfo.do?nttSn=42&amp;mi=17254</link></item></rss>';
 const data=parseFeed(xml,"office_letter");
 assert.equal(data.count,1);
 assert.equal(data.items[0].category_label,"가정통신문(교육청)");
 assert.equal(data.category,"office_letter");
 assert.equal(data.source_url,FEEDS.office_letter.url);
 assert.match(data.source_url,/bbsId=10064&bbsTy=HCNOTIE$/);
});
test("five RSS categories stay ordered and show source status",()=>{
 const names=["notice","letter","news","awards","office_letter"];
 const parsed=names.map((name,i)=>parseFeed('<rss><item><title>'+name+'</title><pubDate>'+new Date(Date.UTC(2026,10,9+i)).toUTCString()+'</pubDate></item></rss>',name));
 const merged=mergeFeeds(parsed);
 assert.equal(merged.count,5);
 assert.deepEqual(merged.items.map(x=>x.category),names.slice().reverse());
 assert.equal(merged.sources.length,5);
});
test("MCP rejects unexpected parameters for education-office-letter tool",async()=>{
 const rpc=await worker.fetch(new Request("https://data.hanbom.rhee.life/mcp",{
  method:"POST",headers:{"content-type":"application/json","accept":"application/json"},
  body:JSON.stringify({jsonrpc:"2.0",id:21,method:"tools/call",params:{name:"search_education_office_letters",arguments:{nonsense:3}}})
 }),{},{});
 assert.equal((await rpc.json()).error.code,-32602);
});
test("student works and awards RSS has correct category label, source and safe URL",()=>{
 const xml='<rss><item><title>전공대회 수상</title><link>https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectNttInfo.do?nttSn=99&amp;mi=17172</link></item></rss>';
 const parsed=parseFeed(xml,"awards");
 assert.equal(parsed.count,1);
 assert.equal(parsed.items[0].category,"awards");
 assert.equal(parsed.items[0].category_label,"학생작품 및 수상내역");
 assert.equal(parsed.source_url,FEEDS.awards.url);
 assert.match(parsed.items[0].url,/nttSn=99/);
});
test("four RSS categories combine chronologically and preserve metadata",()=>{
 const samples=["notice","letter","news","awards"].map((category,i)=>{
   const date=new Date(Date.UTC(2026,10,9+i)).toUTCString();
   return parseFeed('<rss><item><title>'+category+'</title><pubDate>'+date+'</pubDate></item></rss>',category);
 });
 const merged=mergeFeeds(samples);
 assert.equal(merged.count,4);
 assert.deepEqual(merged.items.map(x=>x.category),["awards","news","letter","notice"]);
 assert.equal(merged.sources.length,4);
});
test("MCP validates unsupported awards arguments without invoking RSS",async()=>{
 const rpc=await worker.fetch(new Request("https://data.hanbom.rhee.life/mcp",{
  method:"POST",headers:{"content-type":"application/json","accept":"application/json"},
  body:JSON.stringify({jsonrpc:"2.0",id:21,method:"tools/call",params:{name:"search_student_works_awards",arguments:{wrong:"key"}}})
 }),{},{});
 const payload=await rpc.json();
 assert.equal(payload.error.code,-32602);
});
test("news RSS source has stable category labeling",()=>{
 const sample='<rss><channel><title>한봄 NEWS</title><item><title>학교 축제</title><link>https://hanbom-h.goesw.kr/hanbom-h/example</link></item></channel></rss>';
 const parsed=parseFeed(sample,"news");
 assert.equal(parsed.count,1);assert.equal(parsed.items[0].category,"news");
 assert.equal(parsed.items[0].category_label,"한봄 NEWS");
 assert.equal(parsed.source_url,FEEDS.news.url);
});
test("three-feed merge remains chronological",()=>{
 const samples=[
  parseFeed('<rss><item><title>A</title><pubDate>Mon, 09 Nov 2026 00:00:00 GMT</pubDate></item></rss>',"notice"),
  parseFeed('<rss><item><title>B</title><pubDate>Tue, 10 Nov 2026 00:00:00 GMT</pubDate></item></rss>',"letter"),
  parseFeed('<rss><item><title>C</title><pubDate>Wed, 11 Nov 2026 00:00:00 GMT</pubDate></item></rss>',"news")
 ];
 const merged=mergeFeeds(samples);
 assert.deepEqual(merged.items.map(x=>x.category),["news","letter","notice"]);
});
test("bad category fails safely",async()=>{
 const res=await worker.fetch(new Request("https://data.hanbom.rhee.life/api/feed?category=alien"),{},{});
 assert.equal(res.status,400);
});

test("valid RSS without items returns zero not an error",()=>{
 const feed=parseFeed('<rss version="2.0"><channel><title>게시판 RSS</title><description>공모전 및 모집공고</description></channel></rss>',"opportunities");
 assert.equal(feed.category,"opportunities");assert.equal(feed.source_url,FEEDS.opportunities.url);
 assert.equal(feed.count,0);assert.deepEqual(feed.items,[]);
});
test("empty competitions stay healthy in REST, MCP and seven-feed combined results",async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>new Response(String(url).includes("bbsId=10065")
 ?'<rss version="2.0"><channel><title>게시판 RSS</title></channel></rss>'
 :'<rss><item><title>기존 소식</title></item></rss>',{status:200});
 try{
  const api=async path=>{const r=await worker.fetch(new Request("https://data.hanbom.rhee.life"+path),{},{});assert.equal(r.status,200);return r.json();};
  const single=await api("/api/opportunities");assert.equal(single.count,0);assert.deepEqual(single.items,[]);
  assert.equal((await api("/api/status?category=opportunities")).count,0);
  assert.equal((await api("/api/search?category=opportunities&q=%EA%B3%B5%EB%AA%A8")).count,0);
  const all=await api("/api/posts?limit=100");
  assert.equal(all.count,6);assert.equal(all.partial,false);assert.equal(all.sources.length,7);
  assert.equal(all.sources.find(x=>x.category==="opportunities").count,0);
  assert.equal((await api("/api/meta")).sources.opportunities.url,FEEDS.opportunities.url);
  for(const [name,args] of [["get_school_opportunities",{}],["search_school_opportunities",{query:"공모전"}]]){
   const req=new Request("https://data.hanbom.rhee.life/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:2,method:"tools/call",params:{name,arguments:args}})});
   const response=await worker.fetch(req,{},{});
   const result=await response.json();
   assert.equal(result.result.structuredContent.count,0);
   assert.deepEqual(result.result.structuredContent.items,[]);
   assert.notEqual(result.result.isError,true);
  }
 }finally{globalThis.fetch=original;}
});
test("MCP rejects unsupported opportunity search parameters",async()=>{
 const req=new Request("https://data.hanbom.rhee.life/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:3,method:"tools/call",params:{name:"search_school_opportunities",arguments:{wrong:true}}})});
 const res=await worker.fetch(req,{},{});assert.equal((await res.json()).error.code,-32602);
});

test("health RSS parser labels and validates only school links",()=>{
 const xml='<rss><channel><title>보건알림</title><item><title>감염병 예방 안내</title><link>https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectNttInfo.do?nttSn=42&amp;mi=17256</link><pubDate>Tue, 10 Nov 2026 09:00:00 GMT</pubDate></item></channel></rss>';
 const feed=parseFeed(xml,"health");
 assert.equal(feed.count,1);assert.equal(feed.category,"health");
 assert.equal(feed.source_url,FEEDS.health.url);
 assert.equal(feed.items[0].category_label,"보건알림");
 assert.match(feed.items[0].url,/nttSn=42/);
});
test("health REST and new MCP tools return health entries, old endpoints remain",async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>{
  const health=String(url).includes("bbsId=10066"),opp=String(url).includes("bbsId=10065");
  return new Response(opp?'<rss><channel><title>게시판 RSS</title></channel></rss>':
   health?'<rss><item><title>보건알림 감염병 예방</title><pubDate>Wed, 11 Nov 2026 01:00:00 GMT</pubDate></item></rss>':
   '<rss><item><title>기존 게시물</title><pubDate>Mon, 09 Nov 2026 01:00:00 GMT</pubDate></item></rss>',{status:200});
 };
 try{
  const get=async path=>{const res=await worker.fetch(new Request("https://data.hanbom.rhee.life"+path),{},{});assert.equal(res.status,200);return res.json();};
  const h=await get("/api/health-notices?limit=100");
  assert.equal(h.count,1);assert.equal(h.items[0].category,"health");
  const searched=await get("/api/search?category=health&q=%EA%B0%90%EC%97%BC%EB%B3%91");
  assert.equal(searched.count,1);
  assert.equal((await get("/api/status?category=health")).count,1);
  const all=await get("/api/posts?limit=100");
  assert.equal(all.count,6);assert.equal(all.sources.length,7);assert.equal(all.partial,false);
  assert.equal(all.items[0].category,"health");
  assert.equal((await get("/api/notices")).category,"notice");
  assert.equal((await get("/api/meta")).sources.health.url,FEEDS.health.url);
  for(const [name,args] of [["get_health_notices",{}],["search_health_notices",{query:"감염병"}]]){
   const rpc=await worker.fetch(new Request("https://data.hanbom.rhee.life/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:9,method:"tools/call",params:{name,arguments:args}})}),{},{});
   assert.equal(rpc.status,200);
   const data=await rpc.json();
   assert.equal(data.result.structuredContent.items[0].category,"health");
  }
 }finally{globalThis.fetch=original;}
});
test("new health MCP tools reject invalid arguments before fetching",async()=>{
 const rpc=await worker.fetch(new Request("https://data.hanbom.rhee.life/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:5,method:"tools/call",params:{name:"search_health_notices",arguments:{unexpected:"x"}}})}),{},{});
 assert.equal((await rpc.json()).error.code,-32602);
});
