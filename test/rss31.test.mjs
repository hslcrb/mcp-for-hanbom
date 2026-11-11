import test from "node:test";
import assert from "node:assert/strict";
import worker,{EXTRA_BOARD_CATALOG,FEEDS,GROUPS,API_ROUTES,categories,parseFeed,mergeFeeds} from "../worker.mjs";

const BASE="https://data.hanbom.rhee.life";
const empty='<rss version="2.0"><channel><title>게시판 RSS</title></channel></rss>';
const rssItem=(title,at)=>'<rss><item><title>'+title+'</title><pubDate>'+new Date(at).toUTCString()+'</pubDate></item></rss>';
const mockRemote=async fn=>{
 const real=globalThis.fetch;
 globalThis.fetch=async url=>{
  const requestUrl=String(url);
  const board=EXTRA_BOARD_CATALOG.find(x=>requestUrl.includes("bbsId="+x.bbs));
  if(board)return new Response(rssItem(board.id,"2026-11-10T10:00:00Z"),{status:200});
  const known=Object.values(FEEDS).find(f=>f.url===requestUrl);
  if(known)return new Response(rssItem(known.label,"2026-11-09T09:00:00Z"),{status:200});
  return new Response("unmatched source",{status:404});
 };
 try{return await fn();}finally{globalThis.fetch=real;}
};
const getJson=async path=>{
 const response=await worker.fetch(new Request(BASE+path),{},{});
 return{status:response.status,data:await response.json()};
};
const rpc=async(method,params)=>{
 const req=new Request(BASE+"/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json,text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id:5,method,params})});
 const response=await worker.fetch(req,{},{});return await response.json();
};

test("catalog matches exactly 23 new sources and 31 existing+new RSS",()=>{
 assert.equal(EXTRA_BOARD_CATALOG.length,23);
 assert.equal(Object.keys(FEEDS).length,82);
 assert.equal(Object.keys(API_ROUTES).length,23);
 assert.equal(new Set(EXTRA_BOARD_CATALOG.map(x=>x.id)).size,23);
 assert.equal(new Set(EXTRA_BOARD_CATALOG.map(x=>x.bbs)).size,23);
 assert.equal(GROUPS.features.length,7);
 assert.equal(GROUPS.curriculum.length,7);
 assert.equal(categories.length,107);
 for(const b of EXTRA_BOARD_CATALOG){
  const actual=FEEDS[b.id];
  assert.equal(actual.url,"https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi="+b.mi+"&bbsId="+b.bbs);
  assert.equal(API_ROUTES[b.route],b.id);
  assert.equal(actual.group,b.group);
  assert.ok(actual.label);
 }
 assert.equal(FEEDS.feature_bigdata.url.includes("mi=17305"),true);
 assert.equal(FEEDS.curriculum_bigdata.url.includes("mi=17457"),true);
});

test("all 23 RSS parsers keep unique categories, parent labels, and valid official URLs",()=>{
 for(const b of EXTRA_BOARD_CATALOG){
  const xml='<rss version="2.0"><channel><title>게시판 RSS</title><item><title>'+b.id+'</title><link>hanbom-h/na/ntt/selectNttInfo.do?nttSn=42&amp;mi='+b.mi+'</link></item></channel></rss>';
  const d=parseFeed(xml,b.id);
  assert.equal(d.count,1);
  assert.equal(d.items[0].category,b.id);
  assert.equal(d.items[0].category_label,b.label);
  assert.equal(d.items[0].url,"https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectNttInfo.do?nttSn=42&mi="+b.mi);
  assert.equal(d.source_url,FEEDS[b.id].url);
  const emptyResult=parseFeed(empty,b.id);
  assert.equal(emptyResult.count,0);
 }
});

test("all existing per-board endpoints and 23 new direct REST routes are stable",async()=>{
 await mockRemote(async()=>{
  for(const b of EXTRA_BOARD_CATALOG){
   const response=await getJson(b.route);
   assert.equal(response.status,200);
   assert.equal(response.data.category,b.id);
   assert.equal(response.data.count,1);
   assert.equal(response.data.items[0].title,b.id);
  }
  for(const [slug,cat] of Object.entries({"/api/notices":"notice","/api/letters":"letter","/api/news":"news","/api/awards":"awards","/api/education-letters":"office_letter","/api/opportunities":"opportunities","/api/health-notices":"health","/api/student-rules":"student_rules"})){
   assert.equal((await getJson(slug)).data.category,cat);
  }
 });
});

test("all 31 feeds aggregate without 20-item truncation when limit=all",async()=>{
 await mockRemote(async()=>{
  const r=await getJson("/api/feed?category=legacy&limit=all");
  assert.equal(r.status,200);assert.equal(r.data.category,"legacy");
  assert.equal(r.data.count,31);assert.equal(r.data.items.length,31);
  assert.equal(r.data.sources.length,31);assert.equal(r.data.partial,false);
  assert.deepEqual(r.data.failed_feeds,[]);
  assert.equal(r.data.items[0].category.startsWith("feature_")||r.data.items[0].category.startsWith("curriculum_")||EXTRA_BOARD_CATALOG.some(b=>b.id===r.data.items[0].category),true);
  const defaultPage=await getJson("/api/feed?category=legacy");
  assert.equal(defaultPage.data.items.length,20);
  assert.equal(defaultPage.data.count,31);
 });
});

test("feature and curriculum group API return distinct 7-source aggregations",async()=>{
 await mockRemote(async()=>{
  const feature=await getJson("/api/feed?category=features&limit=all");
  const curriculum=await getJson("/api/feed?category=curriculum&limit=all");
  assert.equal(feature.data.count,7);assert.equal(curriculum.data.count,7);
  assert.equal(feature.data.sources.length,7);assert.equal(curriculum.data.sources.length,7);
  assert.ok(feature.data.items.every(x=>GROUPS.features.includes(x.category)));
  assert.ok(curriculum.data.items.every(x=>GROUPS.curriculum.includes(x.category)));
  const status=await getJson("/api/status?category=curriculum");
  assert.equal(status.data.count,7);
  const search=await getJson("/api/search?category=features&q=feature_bigdata");
  assert.equal(search.data.count,1);
  const info=await getJson("/api/catalog");
  assert.equal(info.data.source_count,82);
  assert.equal(info.data.extra_board_catalog.length,23);
 });
});

test("all 46 specialized MCP tools plus generic pair work with the original 19",async()=>{
 await mockRemote(async()=>{
  const listed=await rpc("tools/list",{});
  const names=listed.result.tools.map(x=>x.name);
  assert.equal(names.length,78);assert.equal(new Set(names).size,78);
  for(const b of EXTRA_BOARD_CATALOG){
   const getName="get_"+b.id+"_posts",searchName="search_"+b.id+"_posts";
   assert.ok(names.includes(getName));assert.ok(names.includes(searchName));
   const read=await rpc("tools/call",{name:getName,arguments:{limit:2}});
   assert.equal(read.result.structuredContent.items[0].category,b.id);
   const found=await rpc("tools/call",{name:searchName,arguments:{query:b.id}});
   assert.equal(found.result.structuredContent.count,1);
  }
  const general=await rpc("tools/call",{name:"get_board_posts",arguments:{category:"curriculum_bigdata",limit:3}});
  assert.equal(general.result.structuredContent.items[0].category,"curriculum_bigdata");
  const searched=await rpc("tools/call",{name:"search_board_posts",arguments:{category:"features",query:"feature_bigdata",limit:3}});
  assert.equal(searched.result.structuredContent.count,1);
 });
});

test("invalid category and unexpected MCP arguments return validation errors",async()=>{
 const http=await getJson("/api/feed?category=alien");
 assert.equal(http.status,400);
 const a=await rpc("tools/call",{name:"get_board_posts",arguments:{category:"alien"}});
 assert.equal(a.error.code,-32602);
 const b=await rpc("tools/call",{name:"search_feature_visual_posts",arguments:{wrong:1}});
 assert.equal(b.error.code,-32602);
});

test("one upstream RSS error is reported as partial without losing other 30 boards",async()=>{
 const real=globalThis.fetch;
 globalThis.fetch=async url=>{
  if(String(url).includes("bbsId=10176"))return new Response("temporarily unavailable",{status:503});
  return new Response(rssItem("정상 게시물","2026-11-09T09:00:00Z"),{status:200});
 };
 try{
  const aggregate=await getJson("/api/feed?category=legacy&limit=all");
  assert.equal(aggregate.status,200);
  assert.equal(aggregate.data.count,30);
  assert.equal(aggregate.data.partial,true);
  assert.equal(aggregate.data.failed_feeds.length,1);
  assert.equal(aggregate.data.failed_feeds[0].category,"curriculum_smart");
 }finally{globalThis.fetch=real;}
});

test("HTML has grouped department filters, pristine white, and source-safe list rendering",async()=>{
 const res=await worker.fetch(new Request(BASE+"/"),{},{});
 assert.equal(res.status,200);
 const html=await res.text();
 assert.match(html,/<h1>한봄고 홈페이지 공지사항 MCP<\/h1>/);
 assert.match(html,/font-family:'Juache'/);
 assert.match(html,/html,body\{min-height:100%;background:#fff\}/);
 assert.match(html,/data-group="features"/);
 assert.match(html,/data-group="curriculum"/);
 assert.match(html,/data-category="features"/);
 assert.match(html,/data-category="curriculum"/);
 assert.match(html,/data-category="feature_bigdata"/);
 assert.match(html,/data-category="curriculum_bigdata"/);
 assert.match(html,/data-category="livestock"/);
 assert.match(html,/data-category="volunteer"/);
 assert.match(html,/data-category="career_resources"/);
 assert.match(html,/fetch\("\/api\/posts\?limit=all&shard="/);
 assert.match(html,/textContent=entry.title/);
 assert.match(html,/candidate.hostname==="hanbom-h.goesw.kr"/);
 assert.match(html,/button:hover\{filter:none/);
 assert.equal((html.match(/data-category="/g)||[]).length,129);
 const meta=await getJson("/api/meta");
 assert.equal(meta.data.source_count,82);
 assert.equal(meta.data.authentication.dashboard,"public");
});
