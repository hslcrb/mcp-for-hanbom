import test from "node:test";
import assert from "node:assert/strict";
import {PillButton,PillGroup,PillNavigation} from "../ui/pill-components.mjs";
import {SITE_STYLES} from "../ui/site-styles.mjs";
import {SITE_CLIENT} from "../ui/site-client.mjs";
import {BOARD_CATALOG,MENU_CATALOG} from "../catalog.mjs";
import worker from "../worker.mjs";

test("PillButton renders accessible native button within a reusable custom element",()=>{
 const html=PillButton({id:"notice",label:"공지사항",selected:true});
 assert.equal(html,'<hanbom-pill selected><button class="pill-button" type="button" data-category="notice" aria-controls="notices" aria-pressed="true">공지사항</button></hanbom-pill>');
 const other=PillButton({id:"news",label:"한봄 NEWS"});
 assert.match(other,/<hanbom-pill><button /);
 assert.match(other,/aria-pressed="false"/);
 assert.doesNotMatch(other,/<hanbom-pill selected>/);
});

test("PillButton escapes untrusted labels and rejects malformed component category keys",()=>{
 const text=PillButton({id:"sample_id",label:'안내 <script>alert("x")</script> & 자료'});
 assert.match(text,/&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
 assert.match(text,/&amp; 자료/);
 assert.doesNotMatch(text,/<script>/);
 assert.throws(()=>PillButton({id:'x" onclick="evil()',label:"x"}),/INVALID_PILL_CATEGORY/);
});

test("PillGroup composes primary and hidden secondary nav structures",()=>{
 const primary=PillGroup({label:"상위 메뉴",pills:[{id:"all",label:"전체 보기",selected:true}]});
 assert.match(primary,/<nav class="filters primary" aria-label="상위 메뉴">/);
 assert.match(primary,/<div class="pill-layout">/);
 assert.doesNotMatch(primary,/ data-group=/);
 const secondary=PillGroup({level:"secondary",id:"curriculum",label:"교과자료실 하위 게시판",
  pills:[{id:"curriculum",label:"전체 보기"},{id:"curriculum_bigdata",label:"빅데이터정보과"}]});
 assert.match(secondary,/<nav class="filters subfilters" aria-label="교과자료실 하위 게시판" data-group="curriculum" hidden>/);
 assert.equal((secondary.match(/<hanbom-pill/g)||[]).length,2);
 assert.throws(()=>PillGroup({level:"unknown",label:"x",pills:[]}),/INVALID_PILL_GROUP/);
});

test("PillNavigation composes all 23 groups, 82 board pills, and 24 primary pills from source catalog",()=>{
 const markup=PillNavigation({menus:MENU_CATALOG,boards:BOARD_CATALOG});
 assert.match(markup,/id="board-navigation"/);
 assert.equal((markup.match(/<hanbom-pill/g)||[]).length,129);
 assert.equal((markup.match(/<button /g)||[]).length,129);
 assert.equal((markup.match(/<nav class="filters subfilters"/g)||[]).length,23);
 assert.equal((markup.match(/<nav class="filters primary"/g)||[]).length,1);
 assert.equal((markup.match(/ data-group=/g)||[]).length,23);
 assert.equal((markup.match(/aria-pressed="true"/g)||[]).length,1);
 assert.equal((markup.match(/aria-pressed="false"/g)||[]).length,128);
 assert.match(markup,/data-category="feature_bigdata"/);
 assert.match(markup,/data-category="curriculum_bigdata"/);
 assert.match(markup,/data-category="counseling_sexual_violence_report"/);
 assert.match(markup,/data-category="administrative_disclosure"/);
 assert.match(markup,/Q&amp;A/);
 const stripped=markup.replace(/<[^>]*>/g," ");
 for(const menu of MENU_CATALOG)assert.ok(stripped.includes(menu.label),menu.label);
});

test("PillNavigation validates missing or duplicate source catalog records",()=>{
 assert.throws(()=>PillNavigation({menus:[{id:"group",label:"그룹",ids:["missing"]}],boards:[]}),/UNKNOWN_BOARD_ID/);
 assert.throws(()=>PillNavigation({menus:[],boards:[{id:"a"},{id:"a"}]}),/DUPLICATE_BOARD_ID/);
});

test("responsive CSS applies Flex wrapping for pills and Grid for page/list without overflow",()=>{
 assert.match(SITE_STYLES,/\.pill-layout\{display:flex;[^}]*flex-wrap:wrap/);
 assert.match(SITE_STYLES,/main\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
 assert.match(SITE_STYLES,/ol\{[^}]*display:grid;grid-template-columns:minmax\(0,1fr\)/);
 assert.match(SITE_STYLES,/hanbom-pill\{[^}]*max-width:100%/);
 assert.match(SITE_STYLES,/nav\.filters button\{[^}]*overflow-wrap:anywhere/);
 assert.match(SITE_STYLES,/@media\(max-width:600px\)/);
 assert.match(SITE_STYLES,/@media\(max-width:360px\)/);
 assert.match(SITE_STYLES,/nav\.filters button:hover\{filter:none/);
 assert.match(SITE_STYLES,/button:focus-visible\{outline:/);
});

test("Web Component client controller uses native pressed state and a single delegated listener",()=>{
 assert.match(SITE_CLIENT,/class HanbomPill extends HTMLElement/);
 assert.match(SITE_CLIENT,/static get observedAttributes\(\)\{return \["selected"\];\}/);
 assert.match(SITE_CLIENT,/button\.setAttribute\("aria-pressed",String\(this\.selected\)\)/);
 assert.match(SITE_CLIENT,/navigation\.addEventListener\("click"/);
 assert.match(SITE_CLIENT,/component\.selected=pressed/);
 assert.match(SITE_CLIENT,/document\.createDocumentFragment/);
 assert.match(SITE_CLIENT,/fetch\("\/api\/posts\?limit=all&shard="\+shard/);
 assert.doesNotThrow(()=>new Function(SITE_CLIENT.replace("__GROUPS__","{}").replace("__IDS__","[]").replace("__SHARD_COUNT__","3")));
});

test("Worker composes independent UI modules but retains 82-source API and original semantic HTML",async()=>{
 const response=await worker.fetch(new Request("https://data.hanbom.rhee.life/"),{},{});
 assert.equal(response.status,200);
 const html=await response.text();
 assert.equal((html.match(/<hanbom-pill/g)||[]).length,131);
 assert.equal((html.match(/data-category="/g)||[]).length,129);
 assert.equal((html.match(/data-group="/g)||[]).length,23);
 assert.equal((html.match(/<h1>/g)||[]).length,1);
 assert.match(html,/<ol id="notices" aria-live="polite" aria-busy="true"><\/ol>/);
 assert.match(html,/<hanbom-pill selected><button[^>]*data-category="all"[^>]*aria-pressed="true"/);
 assert.match(html,/nav\.filters button:focus-visible/);
 assert.match(html,/customElements\.define\("hanbom-pill",HanbomPill\)/);
 const api=await worker.fetch(new Request("https://data.hanbom.rhee.life/api/catalog"),{},{});
 const info=await api.json();
 assert.equal(info.source_count,82);
 assert.equal(info.menu_count,23);
});
