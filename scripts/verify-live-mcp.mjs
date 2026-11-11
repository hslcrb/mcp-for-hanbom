#!/usr/bin/env node
/**
 * HANBOM DATA remote MCP 78-tool smoke test.
 * Runs from a network permitted to reach data.hanbom.rhee.life.
 * Use: node scripts/verify-live-mcp.mjs
 * Optional: HANBOM_MCP_URL=https://data.hanbom.rhee.life/mcp
 * Optional: HANBOM_UNIVERSITY_SCHOOL_ID=official-schlid
 * Optional: HANBOM_UNIVERSITY_DIVISION_CODE=official-schlDivCd
 * This script is read-only and does not print credentials.
 */
import { writeFile } from "node:fs/promises";
const endpoint=process.env.HANBOM_MCP_URL||"https://data.hanbom.rhee.life/mcp";
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
let seq=1;
async function rpc(method,params){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(endpoint,{method:"POST",
   headers:{"content-type":"application/json","accept":"application/json, text/event-stream","mcp-protocol-version":"2025-11-25"},
   body:JSON.stringify({jsonrpc:"2.0",id:seq++,method,params}),
   signal:controller.signal});
  const raw=await response.text();
  if(!response.ok)throw Error(`HTTP ${response.status}: ${raw.slice(0,180)}`);
  const data=raw.startsWith("event:")||raw.startsWith("data:")?
   JSON.parse(raw.split("\n").find(x=>x.startsWith("data:"))?.slice(5)||"{}"):JSON.parse(raw);
  if(data.error)throw Error(`JSON-RPC ${data.error.code}: ${data.error.message}`);
  return data.result;
 }finally{clearTimeout(timeout);}
}
const results=[];
try{
 const init=await rpc("initialize",{protocolVersion:"2025-11-25",capabilities:{},clientInfo:{name:"hanbom-live-audit",version:"1.0.0"}});
 console.log("initialize:",init.serverInfo);
 const pong=await rpc("ping",{});
 console.log("ping:",JSON.stringify(pong));
 const list=await rpc("tools/list",{});
 const tools=list.tools||[];
 console.log("tools/list count:",tools.length);
 const seen=new Set();
 for(const tool of tools){
  const name=tool.name;
  if(seen.has(name)){results.push({name,status:"FAIL",reason:"duplicate tool name"});continue;}
  seen.add(name);
  let args={limit:1};
  if(name==="list_school_boards"||name==="get_neis_school_info"||name==="get_neis_connection_status"
    ||name==="get_university_education_catalog"||name==="get_university_education_status")args={};
  else if(name==="get_school_feed_status")args={category:"notice"};
  else if(name==="get_board_posts"||name==="search_board_posts")args={category:"notice",limit:1};
  else if(name==="get_neis_meals"||name==="get_neis_school_events")args={date:today,limit:1};
  else if(name==="get_neis_high_school_timetable")args={date:today,grade:3,limit:1};
  else if(name==="get_neis_daily_briefing")args={date:today};
  else if(name==="get_university_education_comparison"){
   if(!process.env.HANBOM_UNIVERSITY_SCHOOL_ID){results.push({name,status:"SKIP",reason:"official university schoolId not supplied"});continue;}
   args={metric:"library",schoolId:process.env.HANBOM_UNIVERSITY_SCHOOL_ID,year:today.slice(0,4),page:1,size:1};
  }else if(name==="get_university_education_region"){
   if(!process.env.HANBOM_UNIVERSITY_DIVISION_CODE){results.push({name,status:"SKIP",reason:"official division code not supplied"});continue;}
   args={metric:"dormitory",schoolDivisionCode:process.env.HANBOM_UNIVERSITY_DIVISION_CODE,page:1,size:1};
  }else if(name.startsWith("search_"))args={...args,query:"학교"};
  try{
   const data=await rpc("tools/call",{name,arguments:args});
   if(data?.isError)throw Error(data.content?.map(x=>x.text).join(" ").slice(0,200)||"MCP tool isError");
   if(!data?.structuredContent&&!data?.content)throw Error("missing MCP tool content");
   results.push({name,status:"PASS"});
  }catch(e){results.push({name,status:"FAIL",reason:String(e.message||e).slice(0,230)});}
  const latest=results.at(-1);
  console.log(latest.status.padEnd(4),name,latest.reason||"");
  await pause(300);
 }
 const summary={url:endpoint,checkedAt:new Date().toISOString(),advertised:tools.length,
  passed:results.filter(x=>x.status==="PASS").length,
  failed:results.filter(x=>x.status==="FAIL").length,
  skipped:results.filter(x=>x.status==="SKIP").length,results};
 await writeFile("hanbom-mcp-live-audit.json",JSON.stringify(summary,null,2));
 console.log("Summary:",JSON.stringify({advertised:summary.advertised,passed:summary.passed,failed:summary.failed,skipped:summary.skipped}));
 if(tools.length!==78||summary.failed)process.exitCode=1;
}catch(e){console.error("Live MCP endpoint unreachable / handshake failed:",String(e));process.exitCode=2;}
