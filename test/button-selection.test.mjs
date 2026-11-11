import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.mjs";
import {SITE_STYLES} from "../ui/site-styles.mjs";

test("all button captions and button-like link labels opt out of text selection",()=>{
 assert.match(SITE_STYLES,/button,button \*,a\.pill-link,a\.pill-link \*,a\.guide-link,a\.guide-link \*\{-webkit-user-select:none;user-select:none\}/);
 assert.match(SITE_STYLES,/-webkit-user-select:none/);
 assert.match(SITE_STYLES,/user-select:none/);
});

test("selection prevention applies to both pages without disabling RSS text or MCP URL copying",async()=>{
 for(const path of ["/","/mcp-setup"]){
  const response=await worker.fetch(new Request("https://data.hanbom.rhee.life"+path),{},{});
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/button,button \*,a\.pill-link,a\.pill-link \*,a\.guide-link,a\.guide-link \*\{-webkit-user-select:none;user-select:none\}/);
  assert.match(html,/id="notices"|class="setup-field-value"/);
  assert.doesNotMatch(SITE_STYLES,/(?:^|[,{}])(?:body|html|li|\.setup-field-value)\s*\{[^}]*user-select:none/);
 }
});

test("RSS pill components and MCP setup action links remain present",async()=>{
 const home=await (await worker.fetch(new Request("https://data.hanbom.rhee.life/"),{},{})).text();
 const guide=await (await worker.fetch(new Request("https://data.hanbom.rhee.life/mcp-setup"),{},{})).text();
 assert.equal((home.match(/data-category="/g)||[]).length,129);
 assert.match(home,/class="pill-button pill-link" href="\/mcp-setup"/);
 assert.match(home,/class="theme-option"/);
 assert.match(guide,/class="copy-button"/);
 assert.match(guide,/class="guide-link"/);
 assert.match(guide,/class="setup-field-value"/);
});
