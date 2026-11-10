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
  assert.deepEqual((await rpc.json()).result.tools.map(x=>x.name),["get_school_notices","search_school_notices","get_school_feed_status","get_family_letters","search_family_letters","get_all_school_posts","search_all_school_posts"]);
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
test("pill navigation shows all three categories and keeps white aesthetic",async()=>{
 const res=await worker.fetch(new Request("https://data.hanbom.rhee.life/"),{},{});
 const html=await res.text();
 for(const s of ["전체 보기","공지 사항","가정통신문"])assert.ok(html.includes(">"+s+"</button>"));
 assert.equal((html.match(/class="filters"/g)||[]).length,1);
 assert.match(html,/border-radius:999px/);
 assert.match(html,/button\[aria-pressed="true"\]/);
 assert.match(html,/background:#fff/);
 assert.match(html,/nav\.filters button:hover\{filter:none/);
});
test("API supports all and each category; retains original notices API",async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>{
  const target=String(url),isLetter=target.includes("bbsId=10063");
  const xml=isLetter
   ?'<rss><item><title>가정통신문 A</title><pubDate>Tue, 10 Nov 2026 12:00:00 GMT</pubDate></item></rss>'
   :'<rss><item><title>공지 B</title><pubDate>Mon, 09 Nov 2026 12:00:00 GMT</pubDate></item></rss>';
  return new Response(xml,{status:200});
 };
 try{
  const api=async path=>(await worker.fetch(new Request("https://data.hanbom.rhee.life"+path),{},{})).json();
  const all=await api("/api/posts?limit=100");
  assert.equal(all.count,2);assert.equal(all.items[0].category,"letter");
  const notices=await api("/api/notices");assert.equal(notices.category,"notice");assert.equal(notices.count,1);
  const letters=await api("/api/letters");assert.equal(letters.category,"letter");assert.equal(letters.count,1);
  const status=await api("/api/status?category=all");assert.equal(status.count,2);
  const search=await api("/api/search?q=%EA%B0%80%EC%A0%95&category=all");assert.equal(search.count,1);
 }finally{globalThis.fetch=original;}
});
test("bad category fails safely",async()=>{
 const res=await worker.fetch(new Request("https://data.hanbom.rhee.life/api/feed?category=alien"),{},{});
 assert.equal(res.status,400);
});
