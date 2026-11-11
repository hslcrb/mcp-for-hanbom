import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import worker from "../worker.mjs";
import {PillButton} from "../ui/pill-components.mjs";
import {LOGO_ASSETS} from "../ui/logo-assets.mjs";
import {renderMcpSetupPage,MCP_ENDPOINT,MCP_DISPLAY_NAME} from "../ui/mcp-setup-page.mjs";
import {SETUP_STYLES} from "../ui/mcp-setup-styles.mjs";
import {SETUP_CLIENT} from "../ui/mcp-setup-client.mjs";
import {SITE_STYLES} from "../ui/site-styles.mjs";

const base="https://data.hanbom.rhee.life";

test("reusable pill component supports an accessible internal link with exact 1em ChatGPT and Claude logo icons",()=>{
 const html=PillButton({href:"/mcp-setup",label:"MCP 설정하기",icons:["chatgpt","claude"]});
 assert.match(html,/<hanbom-pill><a class="pill-button pill-link" href="\/mcp-setup">/);
 assert.match(html,/<img class="pill-icon pill-icon-chatgpt" src="\/assets\/logos\/chatgpt.svg"/);
 assert.match(html,/<img class="pill-icon pill-icon-claude" src="\/assets\/logos\/claude.svg"/);
 assert.match(html,/<span class="pill-link-label">MCP 설정하기<\/span><\/a><\/hanbom-pill>/);
 assert.equal((html.match(/<img /g)||[]).length,2);
 assert.match(SITE_STYLES,/\.pill-icon\{[^}]*width:1em;height:1em/);
 assert.match(SITE_STYLES,/:root\[data-theme="dark"\] \.pill-icon-chatgpt\{filter:invert\(1\)\}/);
 assert.throws(()=>PillButton({href:"//evil.test",label:"test"}),/INVALID_PILL_HREF/);
 assert.throws(()=>PillButton({href:"javascript:alert(1)",label:"test"}),/INVALID_PILL_HREF/);
 assert.throws(()=>PillButton({href:"/mcp-setup",label:"test",icons:["unknown"]}),/INVALID_PILL_ICON/);
 // Existing navigation buttons still use native button semantics.
 assert.equal(PillButton({id:"notice",label:"공지사항",selected:true}),
  '<hanbom-pill selected><button class="pill-button" type="button" data-category="notice" aria-controls="notices" aria-pressed="true">공지사항</button></hanbom-pill>');
});

test("two service-owned SVG assets precisely match the original imported sources",()=>{
 for(const logo of ["chatgpt","claude"]){
  const content=readFileSync(new URL("../assets/logos/"+logo+".svg",import.meta.url),"utf8");
  assert.equal(LOGO_ASSETS[logo+".svg"],content);
  assert.match(content,/^<svg\b/);
  assert.doesNotMatch(content,/<script\b|<foreignObject\b|onload=|<iframe\b/i);
 }
 assert.match(LOGO_ASSETS["claude.svg"],/fill="#d97757"/);
});

test("homepage adds exactly one setup pill without altering 129 existing category pills",async()=>{
 const res=await worker.fetch(new Request(base+"/"),{},{});
 assert.equal(res.status,200);
 const html=await res.text();
 assert.equal((html.match(/<hanbom-pill/g)||[]).length,130);
 assert.equal((html.match(/data-category="/g)||[]).length,129);
 assert.equal((html.match(/class="pill-icon/g)||[]).length,2);
 assert.match(html,/<div class="setup-launch"><hanbom-pill><a class="pill-button pill-link" href="\/mcp-setup">/);
 assert.match(html,/MCP 설정하기/);
 assert.match(res.headers.get("content-security-policy"),/img-src 'self'/);
 assert.match(html,/<h1>한봄고 홈페이지 공지사항 MCP<\/h1>/);
});

test("MCP setup route displays rounded responsive ChatGPT/Claude guides and verified connection metadata",async()=>{
 const res=await worker.fetch(new Request(base+"/mcp-setup"),{},{});
 assert.equal(res.status,200);
 assert.match(res.headers.get("content-type"),/text\/html/);
 assert.match(res.headers.get("content-security-policy"),/img-src 'self'/);
 const html=await res.text();
 assert.equal(html,renderMcpSetupPage());
 assert.match(html,/MCP 설정하기 — HANBOM DATA/);
 assert.match(html,/<h1>MCP 설정하기<\/h1>/);
 assert.match(html,/class="guide-card"/);
 assert.match(html,/class="setup-grid"/);
 assert.match(html,/data-theme-choice="dark"/);
 assert.match(html,/id="chatgpt"/);
 assert.match(html,/id="claude"/);
 assert.match(html,/Plugins\(플러그인\)/);
 assert.match(html,/Create as a plugin/);
 assert.match(html,/Customize → Connectors/);
 assert.match(html,/No sign in/);
 assert.match(html,/name="description"/);
 assert.match(html,/role="status" aria-live="polite"/);
 assert.equal((html.match(/class="guide-card"/g)||[]).length,2);
 assert.equal((html.match(/class="step-number"/g)||[]).length,10);
 assert.equal((html.match(/class="copy-button"/g)||[]).length,2);
 assert.equal((html.match(/class="brand-icon/g)||[]).length,2);
 assert.match(html,/https:\/\/help.openai.com\/ko-kr\/articles\/12584461-/);
 assert.match(html,/https:\/\/support.claude.com\/en\/articles\/11175166-/);
 assert.equal(MCP_ENDPOINT,"https://data.hanbom.rhee.life/mcp");
 assert.equal(MCP_DISPLAY_NAME,"HANBOM Data MCP");
 assert.match(html,/https:\/\/data.hanbom.rhee.life\/mcp/);
});

test("MCP setup page serves both light and dark modes with responsive cards and no external logo host",()=>{
 assert.match(SETUP_STYLES,/\.setup-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(SETUP_STYLES,/@media\(max-width:820px\)/);
 assert.match(SETUP_STYLES,/@media\(max-width:360px\)/);
 assert.match(SETUP_STYLES,/border-radius:28px/);
 assert.match(SETUP_STYLES,/var\(--pill-surface\)/);
 assert.match(SETUP_STYLES,/\.guide-mark \.brand-icon\{width:1em;height:1em/);
 const html=renderMcpSetupPage();
 assert.match(html,/data-theme="dark"/);
 assert.match(html,/hanbom-color-theme-v1/);
 assert.match(html,/src="\/assets\/logos\/chatgpt.svg"/);
 assert.match(html,/src="\/assets\/logos\/claude.svg"/);
 assert.doesNotMatch(html,/raw\.githubusercontent\.com\/hslcrb/);
 assert.match(html,/img-src 'self'|src="\/assets\/logos\/chatgpt.svg"/);
});

test("MCP copy controls use user click, clipboard fallback and accessible status",()=>{
 assert.match(SETUP_CLIENT,/button\[data-copy-value\]/);
 assert.match(SETUP_CLIENT,/navigator\.clipboard\.writeText/);
 assert.match(SETUP_CLIENT,/document\.execCommand\("copy"\)/);
 assert.match(SETUP_CLIENT,/id="setup-copy-status"|getElementById\("setup-copy-status"\)/);
 assert.doesNotThrow(()=>new Function(SETUP_CLIENT));
 assert.match(SETUP_CLIENT,/https:\/\/data.hanbom.rhee.life\/mcp/);
});

test("local SVG assets have correct MIME type, are restricted, and accept HEAD",async()=>{
 for(const logo of ["chatgpt","claude"]){
  const path="/assets/logos/"+logo+".svg";
  const res=await worker.fetch(new Request(base+path),{},{});
  assert.equal(res.status,200);
  assert.match(res.headers.get("content-type"),/image\/svg\+xml/);
  assert.equal(await res.text(),LOGO_ASSETS[logo+".svg"]);
  assert.equal(res.headers.get("x-content-type-options"),"nosniff");
  const head=await worker.fetch(new Request(base+path,{method:"HEAD"}),{},{});
  assert.equal(head.status,200);
  assert.equal(await head.text(),"");
 }
 assert.equal((await worker.fetch(new Request(base+"/assets/logos/unknown.svg"),{},{})).status,404);
 assert.equal((await worker.fetch(new Request(base+"/assets/logos/chatgpt.svg",{method:"POST"}),{},{})).status,405);
});

test("guide page is available by GET/HEAD but never mutates MCP or APIs",async()=>{
 assert.equal((await worker.fetch(new Request(base+"/mcp-setup/"),{},{})).status,200);
 const head=await worker.fetch(new Request(base+"/mcp-setup",{method:"HEAD"}),{},{});
 assert.equal(head.status,200);assert.equal(await head.text(),"");
 const post=await worker.fetch(new Request(base+"/mcp-setup",{method:"POST"}),{},{});
 assert.equal(post.status,405);
 const health=await worker.fetch(new Request(base+"/health"),{},{});
 assert.equal((await health.json()).status,"ok");
 const meta=await worker.fetch(new Request(base+"/api/catalog"),{},{});
 const d=await meta.json();
 assert.equal(d.source_count,82);
 assert.equal(d.menu_count,23);
});
