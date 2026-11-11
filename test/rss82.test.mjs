import test from "node:test";
import assert from "node:assert/strict";
import worker,{BOARD_CATALOG,MENU_CATALOG,NEW_BOARD_CATALOG,LEGACY_IDS,GROUPS,FEEDS,ALL_API_ROUTES,categories,parseFeed,mergeFeeds,SHARD_SIZE,SHARD_COUNT} from "../worker.mjs";

const BASE="https://data.hanbom.rhee.life";
const item=(title,id)=>'<rss><channel><title>게시판 RSS</title><item><title><![CDATA['+title+']]></title><link>https://hanbom-h.goesw.kr/test/'+id+'</link><pubDate>Tue, 10 Nov 2026 11:00:00 GMT</pubDate></item></channel></rss>';
const empty='<rss version="2.0"><channel><title>게시판 RSS</title></channel></rss>';
const json=async path=>{const response=await worker.fetch(new Request(BASE+path),{},{});return{status:response.status,data:await response.json()};};
const rpc=async(name,args={})=>{
 const req=new Request(BASE+"/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:3,method:"tools/call",params:{name,arguments:args}})});
 return(await worker.fetch(req,{},{})).json();
};
const mock=async (fn,{emptyIds=[],fails=[]}={})=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>{
  const board=BOARD_CATALOG.find(b=>b.url===String(url));
  if(!board)return new Response("Unexpected outbound URL",{status:400});
  if(fails.includes(board.id))return new Response("unavailable",{status:502});
  return new Response(emptyIds.includes(board.id)?empty:item(board.label,board.id),{status:200});
 };
 try{return await fn();}finally{globalThis.fetch=original;}
};

test("uploaded 82-source catalog has 31 previous, 51 new and 23 exact parent menus",()=>{
 assert.equal(BOARD_CATALOG.length,82);assert.equal(NEW_BOARD_CATALOG.length,51);assert.equal(LEGACY_IDS.length,31);
 assert.equal(MENU_CATALOG.length,23);assert.equal(Object.keys(FEEDS).length,82);
 assert.equal(Object.keys(ALL_API_ROUTES).length,82);
 assert.equal(new Set(BOARD_CATALOG.map(b=>b.id)).size,82);
 assert.equal(new Set(BOARD_CATALOG.map(b=>b.url)).size,82);
 assert.equal(SHARD_SIZE,28);assert.equal(SHARD_COUNT,3);
 assert.equal(categories.length,107);
 assert.equal(GROUPS.legacy.length,31);
 assert.equal(BOARD_CATALOG[0].label,"진로적성 특별전형");
 assert.equal(BOARD_CATALOG[81].label,"행정정보공개");
 assert.equal(BOARD_CATALOG.find(b=>b.id==="foundation_officers").label,"임원 인적사항(임원과 친족관게에 있는 교직원 현황)");
 for(const m of MENU_CATALOG){
  assert.deepEqual(GROUPS[m.id],m.ids);
  assert.ok(m.ids.length>0);
 }
});

test("every additional 51-board feed is fixed to a precise official RSS URL with distinct paths",()=>{
 for(const b of NEW_BOARD_CATALOG){
  assert.equal(FEEDS[b.id].url,b.url);
  assert.match(b.url,/^https:\/\/hanbom-h\.goesw\.kr\/hanbom-h\/na\/ntt\/selectRssFeed\.do\?mi=\d+&bbsId=\d+$/);
  assert.equal(ALL_API_ROUTES[b.route],b.id);
  assert.equal(FEEDS[b.id].parent,b.parent);
  assert.ok(b.label);
  assert.equal(parseFeed(empty,b.id).count,0);
 }
 assert.notEqual(FEEDS.community_students.url,FEEDS.community_parents.url);
 assert.equal(FEEDS.community_grades_complaints.sensitive,true);
 assert.equal(FEEDS.counseling_sexual_violence_report.sensitive,true);
});

test("privacy-sensitive publicly listed reporting feeds do not re-publish original private story text",()=>{
 const original='<rss><item><title>학생 개인 실명 및 신고 내용</title><description>민감한 상담 세부사항</description><link>https://hanbom-h.goesw.kr/test/1</link></item></rss>';
 const redacted=parseFeed(original,"counseling_sexual_violence_report");
 assert.equal(redacted.count,1);assert.equal(redacted.items[0].privacy_redacted,true);
 assert.equal(redacted.items[0].title,"상담·민원 게시물 (원문 확인)");
 assert.equal(redacted.items[0].summary,"");
 assert.equal(redacted.items[0].url,"https://hanbom-h.goesw.kr/test/1");
 const publicPost=parseFeed(original,"admission_special");
 assert.match(publicPost.items[0].title,/학생 개인 실명/);
});

test("three independent free-tier HTTP shards cover all 82 without missing a source",async()=>{
 await mock(async()=>{
  const result=[];
  for(let i=0;i<3;i++){
   const r=await json("/api/posts?shard="+i+"&limit=all");
   assert.equal(r.status,200);
   result.push(r.data);
  }
  assert.deepEqual(result.map(x=>x.sources.length),[28,28,26]);
  assert.deepEqual(result.map(x=>x.shard_count),[3,3,3]);
  assert.deepEqual(result.map(x=>x.has_more),[true,true,false]);
  assert.deepEqual(result.map(x=>x.next_shard),[1,2,null]);
  assert.deepEqual(result.map(x=>x.total_source_count),[82,82,82]);
  assert.deepEqual(result.map(x=>x.partial),[false,false,false]);
  assert.equal(result.reduce((n,x)=>n+x.count,0),82);
  assert.equal(result.reduce((n,x)=>n+x.items.length,0),82);
  assert.equal(new Set(result.flatMap(x=>x.items.map(y=>y.category))).size,82);
  const limited=await json("/api/posts?shard=0");
  assert.equal(limited.data.items.length,20);
  assert.equal(limited.data.count,28);
  assert.equal(limited.data.complete,false);
 });
});

test("all 23 hierarchical menu groups remain separately filterable by REST",async()=>{
 await mock(async()=>{
  for(const m of MENU_CATALOG){
   const r=await json("/api/feed?category="+m.id+"&limit=all");
   assert.equal(r.status,200);
   assert.equal(r.data.count,m.ids.length);
   assert.equal(r.data.sources.length,m.ids.length);
   assert.ok(r.data.items.every(p=>m.ids.includes(p.category)));
   assert.equal(r.data.shard_count,1);
   assert.equal(r.data.partial,false);
  }
 });
});

test("new direct REST routes and previous routes all serve the proper category",async()=>{
 await mock(async()=>{
  for(const b of BOARD_CATALOG){
   const r=await json(b.route);
   assert.equal(r.status,200,b.route);
   assert.equal(r.data.category,b.id);
   assert.equal(r.data.count,1);
  }
  const catalog=await json("/api/catalog");
  assert.equal(catalog.status,200);assert.equal(catalog.data.source_count,82);
  assert.equal(catalog.data.menu_count,23);
  assert.equal(catalog.data.shard_count,3);
  assert.equal(catalog.data.new_board_catalog.length,51);
 });
});

test("existing 31 source users can fetch the full legacy set in one request",async()=>{
 await mock(async()=>{
  const r=await json("/api/feed?category=legacy&limit=all");
  assert.equal(r.status,200);
  assert.equal(r.data.count,31);
  assert.equal(r.data.sources.length,31);
  assert.equal(r.data.shard_count,1);
  assert.equal(r.data.has_more,false);
 });
});

test("MCP remains 68 tools with 67 originals and 1 catalog tool; all three shards accessible",async()=>{
 await mock(async()=>{
  const list=await worker.fetch(new Request(BASE+"/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"tools/list",params:{}})}),{},{});
  const named=(await list.json()).result.tools.map(x=>x.name);
  assert.equal(named.length,78);assert.equal(new Set(named).size,78);
  assert.ok(named.includes("list_school_boards"));
  const catalog=await rpc("list_school_boards");
  assert.equal(catalog.result.structuredContent.count,82);
  assert.equal(catalog.result.structuredContent.menus.length,23);
  const one=await rpc("get_board_posts",{category:"foundation_board_minutes"});
  assert.equal(one.result.structuredContent.category,"foundation_board_minutes");
  const search=await rpc("search_board_posts",{category:"community",query:"각종양식"});
  assert.ok(search.result.structuredContent.count>=1);
  for(let shard=0;shard<3;shard++){
   const page=await rpc("get_all_school_posts",{shard,limit:100});
   assert.equal(page.result.structuredContent.shard,shard);
   assert.equal(page.result.structuredContent.shard_count,3);
  }
 });
});

test("invalid shard selection and unknown categories fail without arbitrary remote requests",async()=>{
 assert.equal((await json("/api/posts?shard=3")).status,400);
 assert.equal((await json("/api/posts?shard=-1")).status,400);
 assert.equal((await json("/api/feed?category=not_a_board")).status,400);
 const bad=await rpc("get_board_posts",{category:"https://malicious.invalid"});
 assert.equal(bad.error.code,-32602);
});

test("one failed source and one empty source do not erase other entries within its shard",async()=>{
 await mock(async()=>{
  const b=BOARD_CATALOG[0],e=BOARD_CATALOG[1];
  const r=await json("/api/posts?shard=0&limit=all");
  assert.equal(r.data.count,26);
  assert.equal(r.data.partial,true);
  assert.equal(r.data.failed_feeds.length,1);
  assert.equal(r.data.failed_feeds[0].category,b.id);
  assert.equal(r.data.sources.length,27);
  assert.equal(r.data.sources.find(x=>x.category===e.id).count,0);
 },{fails:[BOARD_CATALOG[0].id],emptyIds:[BOARD_CATALOG[1].id]});
});

test("homepage keeps minimal Juache design with all 23 menus and 82 sub-board controls",async()=>{
 const r=await worker.fetch(new Request(BASE+"/"),{},{});
 assert.equal(r.status,200);
 const html=await r.text();
 assert.match(html,/<h1>한봄고 홈페이지 공지사항 MCP<\/h1>/);
 assert.match(html,/font-family: 'Juache'/);
 assert.match(html,/html,body\{min-height:100%;background:#fff\}/);
 assert.equal((html.match(/data-group="/g)||[]).length,23);
 assert.equal((html.match(/data-category="/g)||[]).length,129);
 assert.match(html,/data-category="counseling_sexual_violence_report"/);
 assert.match(html,/data-category="administrative_disclosure"/);
 assert.match(html,/data-category="feature_bigdata"/);
 assert.match(html,/data-category="curriculum_bigdata"/);
 assert.match(html,/shardCount=3/);
 assert.match(html,/fetch\("\/api\/posts\?limit=all&shard="\+shard/);
 assert.match(html,/link.textContent=entry.title/);
 assert.doesNotMatch(html,/<(?:header|footer|aside|input|h2|time)\b/i);
});
