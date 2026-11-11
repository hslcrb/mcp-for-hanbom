import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.mjs";
import {ThemeSwitch} from "../ui/theme-components.mjs";
import {THEME_BOOT,THEME_CLIENT,THEME_KEY} from "../ui/theme-client.mjs";
import {SITE_STYLES} from "../ui/site-styles.mjs";

const fakeRoot=()=>({
 attributes:new Map(),
 setAttribute(name,value){this.attributes.set(name,value);},
 getAttribute(name){return this.attributes.get(name)||null;},
 removeAttribute(name){this.attributes.delete(name);}
});

test("theme switch is an accessible exclusive three-choice group",()=>{
 const html=ThemeSwitch();
 assert.match(html,/class="theme-toolbar"/);
 assert.match(html,/role="group" aria-label="화면 테마"/);
 assert.equal((html.match(/class="theme-option"/g)||[]).length,3);
 assert.match(html,/data-theme-choice="system" aria-pressed="true">자동/);
 assert.match(html,/data-theme-choice="light" aria-pressed="false">라이트/);
 assert.match(html,/data-theme-choice="dark" aria-pressed="false">다크/);
 assert.doesNotMatch(html,/onclick=|href=|data-category=/);
});

test("theme bootstrap restores manual dark mode before CSS and browser toolbar paints",()=>{
 const root=fakeRoot();
 const meta={content:"",setAttribute(k,v){if(k==="content")this.content=v;}};
 let matchCalls=0;
 new Function("document","localStorage","window",THEME_BOOT)(
  {documentElement:root,querySelector:()=>meta},
  {getItem(key){assert.equal(key,THEME_KEY);return "dark";}},
  {matchMedia(){matchCalls++;return{matches:false};}}
 );
 assert.equal(root.getAttribute("data-theme"),"dark");
 assert.equal(meta.content,"#13161b");
 assert.equal(matchCalls,0);
});

test("theme bootstrap supports light override and system dark preference without persistence",()=>{
 const root=fakeRoot(),meta={content:null,setAttribute(k,v){this.content=v;}};
 const run=(saved,dark)=>{
  root.attributes.clear();
  new Function("document","localStorage","window",THEME_BOOT)(
   {documentElement:root,querySelector:()=>meta},
   {getItem(){return saved;}},
   {matchMedia(){return{matches:dark};}}
  );
  return{theme:root.getAttribute("data-theme"),color:meta.content};
 };
 assert.deepEqual(run("light",true),{theme:"light",color:"#ffffff"});
 assert.deepEqual(run(null,true),{theme:null,color:"#13161b"});
 assert.deepEqual(run(null,false),{theme:null,color:"#ffffff"});
 assert.deepEqual(run("nonsense",true),{theme:null,color:"#13161b"});
 assert.doesNotThrow(()=>new Function("document","localStorage","window",THEME_BOOT)(
  {documentElement:root,querySelector:()=>meta},
  {getItem(){throw new Error("private mode");}},
  {matchMedia(){return{matches:false};}}
 ));
});

test("client controller switches light/dark/system, persists and resets, and reacts to OS theme",()=>{
 const root=fakeRoot();
 const store=new Map();
 const saved={
  getItem:key=>store.get(key)||null,
  setItem:(key,v)=>store.set(key,v),
  removeItem:key=>store.delete(key)
 };
 const buttons=["system","light","dark"].map(mode=>({
  dataset:{themeChoice:mode}, pressed:null,
  setAttribute(k,v){if(k==="aria-pressed")this.pressed=v;}
 }));
 let onClick, onSystemChange;
 const group={
  dataset:{},
  querySelectorAll:()=>buttons,
  addEventListener(name,fn){if(name==="click")onClick=fn;},
  contains:b=>buttons.includes(b)
 };
 const meta={color:null,setAttribute(k,v){if(k==="content")this.color=v;}};
 const document={
  documentElement:root,
  querySelector:selector=>selector===".theme-options"?group:selector==='meta[name="theme-color"]'?meta:null
 };
 const query={matches:false,addEventListener(name,fn){if(name==="change")onSystemChange=fn;}};
 new Function("document","window","localStorage",THEME_CLIENT)(document,{matchMedia:()=>query},saved);
 assert.deepEqual(buttons.map(x=>x.pressed),["true","false","false"]);
 assert.equal(group.dataset.themeEffective,"light");

 const click=choice=>onClick({target:{closest:()=>buttons.find(x=>x.dataset.themeChoice===choice)}});
 click("dark");
 assert.equal(root.getAttribute("data-theme"),"dark");
 assert.equal(store.get(THEME_KEY),"dark");
 assert.equal(meta.color,"#13161b");
 assert.deepEqual(buttons.map(x=>x.pressed),["false","false","true"]);

 click("light");
 assert.equal(root.getAttribute("data-theme"),"light");
 assert.equal(store.get(THEME_KEY),"light");
 assert.equal(meta.color,"#ffffff");
 assert.deepEqual(buttons.map(x=>x.pressed),["false","true","false"]);

 click("system");
 assert.equal(root.getAttribute("data-theme"),null);
 assert.equal(store.has(THEME_KEY),false);
 assert.deepEqual(buttons.map(x=>x.pressed),["true","false","false"]);
 query.matches=true;onSystemChange();
 assert.equal(meta.color,"#13161b");
 assert.equal(group.dataset.themeEffective,"dark");
 click("dark");query.matches=false;onSystemChange();
 assert.equal(meta.color,"#13161b"); // Manual override takes precedence over OS changes.
});

test("CSS uses robust theme tokens, system fallback and monochrome dark contrast",()=>{
 assert.match(SITE_STYLES,/:root\{color-scheme:light;/);
 assert.match(SITE_STYLES,/:root\[data-theme="dark"\]\{color-scheme:dark;/);
 assert.match(SITE_STYLES,/@media\(prefers-color-scheme:dark\)/);
 assert.match(SITE_STYLES,/:root:not\(\[data-theme="light"\]\):not\(\[data-theme="dark"\]\)/);
 assert.match(SITE_STYLES,/--paper:#13161b/);
 assert.match(SITE_STYLES,/--pill-surface:#20262f/);
 assert.match(SITE_STYLES,/--active-bg:#e6ebf2/);
 assert.match(SITE_STYLES,/html,body\{background:var\(--paper\)\}/);
 assert.match(SITE_STYLES,/nav\.filters button\{[^}]*background:var\(--pill-surface\)/);
 assert.match(SITE_STYLES,/hanbom-pill\[selected\] button\{[^}]*background:var\(--active-bg\)/);
 assert.match(SITE_STYLES,/\.theme-option:focus-visible\{outline:2px solid var\(--focus-color\)/);
 assert.match(SITE_STYLES,/\.theme-option:hover\{filter:none/);
});

test("worker page bootstraps theme before CSS without changing RSS pills or API",async()=>{
 const res=await worker.fetch(new Request("https://data.hanbom.rhee.life/"),{},{});
 assert.equal(res.status,200);
 const html=await res.text();
 assert.match(html,/<meta name="color-scheme" content="light dark">/);
 assert.match(html,/<meta name="theme-color" content="#ffffff">/);
 assert.ok(html.indexOf('localStorage.getItem("hanbom-color-theme-v1")')<html.indexOf("<style>"));
 assert.match(html,/class="theme-options" role="group"/);
 assert.match(html,/window\.matchMedia\("\(prefers-color-scheme: dark\)"\)/);
 assert.equal((html.match(/<hanbom-pill/g)||[]).length,130);
 assert.equal((html.match(/data-category="/g)||[]).length,129);
 assert.equal((html.match(/data-theme-choice="/g)||[]).length,3);
 assert.match(html,/<h1>한봄고 홈페이지 공지사항 MCP<\/h1>/);
 assert.match(html,/nav\.filters button:hover\{filter:none/);
 const status=await worker.fetch(new Request("https://data.hanbom.rhee.life/api/catalog"),{},{});
 const catalog=await status.json();
 assert.equal(catalog.source_count,82);
 assert.equal(catalog.menu_count,23);
});
