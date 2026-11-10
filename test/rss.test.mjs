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
  assert.match(html,/<main aria-label="한봄고등학교 공지사항 목록"><h1>한봄고 공지사항 MCP<\/h1><ol id="notices"/);
  assert.match(html,/text-align:center/);
  assert.match(html,/li a:visited,li a:hover,li a:active/);
  assert.doesNotMatch(html,/<(?:header|footer|aside|button|input|h2|time)\b/i);
  assert.doesNotMatch(html,/(?:새로고침|개인 대시보드|최근 공지|수집 게시물|검색창)/);
});
test("dashboard still requires Cloudflare Access assertion",async()=>{
  const response=await worker.fetch(new Request("https://data.hanbom.rhee.life/"),{},{});
  assert.equal(response.status,401);
});
test("public REST and MCP tool registry remain intact",async()=>{
  const rest=await worker.fetch(new Request("https://data.hanbom.rhee.life/api/meta"),{},{});
  assert.equal(rest.status,200);
  assert.equal((await rest.json()).name,"HANBOM DATA");
  const rpc=await worker.fetch(new Request("https://data.hanbom.rhee.life/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json, text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"tools/list",params:{}})}),{},{});
  assert.equal(rpc.status,200);
  assert.deepEqual((await rpc.json()).result.tools.map(x=>x.name),["get_school_notices","search_school_notices","get_school_feed_status"]);
});

test("Juache heading loads CDN font while preserving the white list and CSP", async()=>{
  const response=await worker.fetch(new Request("https://data.hanbom.rhee.life/",{
    headers:{"cf-access-jwt-assertion":"test-access-header"}
  }),{},{});
  assert.equal(response.status,200);
  const html=await response.text();
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.match(html,/<h1>한봄고 공지사항 MCP<\/h1>/);
  assert.match(html,/@font-face\s*\{/);
  assert.match(html,/font-family: 'Juache'/);
  assert.match(html,/https:\/\/cdn\.jsdelivr\.net\/gh\/projectnoonnu\/noonfonts_one@1\.0\/BMJUA\.woff/);
  assert.match(html,/h1\{[^}]*font-family:'Juache',sans-serif;[^}]*text-align:center/);
  assert.match(html,/font-display: swap;/);
  assert.match(html,/html,body\{min-height:100%;background:#fff\}/);
  assert.match(response.headers.get("content-security-policy"),/font-src https:\/\/cdn\.jsdelivr\.net/);
});
