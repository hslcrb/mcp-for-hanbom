/**
 * HANBOM DATA: monochrome design tokens and responsive layout.
 * Grid owns the page/list geometry; flex-wrap owns pill layout.
 * Hover does not animate or restyle the interface.
 */
export const SITE_STYLES=String.raw`
@font-face{font-family: 'Juache';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.woff') format('woff');font-weight:normal;font-display: swap;}
:root{color-scheme:light;--ink:#111;--border:#dedede;--paper:#fff;--pill-gap:10px;--pill-surface:#fff;--active-bg:#111;--active-ink:#fff;--focus-color:#111}
:root[data-theme="dark"]{color-scheme:dark;--ink:#edf0f4;--border:#3b434e;--paper:#13161b;--pill-surface:#20262f;--active-bg:#e6ebf2;--active-ink:#151a20;--focus-color:#bec9d9}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]):not([data-theme="dark"]){color-scheme:dark;--ink:#edf0f4;--border:#3b434e;--paper:#13161b;--pill-surface:#20262f;--active-bg:#e6ebf2;--active-ink:#151a20;--focus-color:#bec9d9}}
*{box-sizing:border-box}
html,body{min-height:100%;background:#fff}
html,body{background:var(--paper)}
body{margin:0;color:var(--ink);font-family:"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;-webkit-font-smoothing:antialiased}
main{display:grid;grid-template-columns:minmax(0,1fr);width:min(1000px,calc(100% - 40px));min-width:0;margin-inline:auto;padding:clamp(72px,11vh,136px) 0 96px}
main{position:relative}
.theme-toolbar{position:absolute;top:22px;right:0;display:flex;justify-content:flex-end;max-width:100%;z-index:2}
.theme-options{display:inline-flex;align-items:center;justify-content:center;gap:2px;border:1px solid var(--border);background:var(--pill-surface);border-radius:999px;padding:3px;min-width:0;max-width:100%}
.theme-option{appearance:none;border:0;border-radius:999px;background:transparent;color:var(--ink);font:500 13px/1.25 "Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;padding:8px 12px;min-height:35px;white-space:nowrap;cursor:pointer;transition:none}
.theme-option[aria-pressed="true"]{background:var(--active-bg);color:var(--active-ink)}
.theme-option:hover{filter:none;box-shadow:none;transform:none;transition:none}
.theme-option:focus-visible{outline:2px solid var(--focus-color);outline-offset:2px}
h1{margin:0 0 clamp(44px,6vh,70px);font-family:'Juache',sans-serif;font-size:clamp(32px,4.2vw,46px);font-weight:normal;line-height:1.3;text-align:center;letter-spacing:-.025em}
.board-navigation{display:grid;grid-template-columns:minmax(0,1fr);min-width:0;width:100%}
nav.filters{width:100%;min-width:0;margin:0 0 clamp(36px,5vh,62px)}
nav.filters.subfilters{margin-top:-26px;margin-bottom:clamp(36px,5vh,62px)}
nav.filters[hidden]{display:none!important}
nav.filters .pill-layout{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:var(--pill-gap);min-width:0;width:100%}
nav.filters.subfilters .pill-layout{gap:8px}
hanbom-pill{display:inline-flex;flex:0 1 auto;min-width:0;max-width:100%}
nav.filters button{appearance:none;border:1px solid var(--border);border-radius:999px;background:var(--pill-surface);color:var(--ink);font:500 15px/1.25 "Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;padding:11px 20px;min-height:43px;max-width:100%;overflow-wrap:anywhere;white-space:normal;cursor:pointer;transition:none}
nav.filters.subfilters button{font-size:14px;padding:9px 15px}
nav.filters button[aria-pressed="true"],hanbom-pill[selected] button{color:var(--active-ink);background:var(--active-bg);border-color:var(--active-bg)}
nav.filters button:hover{filter:none;box-shadow:none;transform:none;transition:none}
nav.filters button:focus-visible{outline:2px solid var(--focus-color);outline-offset:3px}
.setup-launch{display:flex;justify-content:center;align-items:center;max-width:100%;margin:-36px auto 42px}
.pill-link{display:inline-flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--border);border-radius:999px;background:var(--pill-surface);color:var(--ink);font:500 15px/1.25 "Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;padding:11px 20px;min-height:43px;max-width:100%;overflow-wrap:anywhere;white-space:normal;text-decoration:none;transition:none}
.pill-link:visited,.pill-link:hover,.pill-link:active{color:var(--ink);text-decoration:none;filter:none;box-shadow:none;transform:none;transition:none}
.pill-link:focus-visible{outline:2px solid var(--focus-color);outline-offset:3px}
.pill-link .pill-link-label{display:inline-block;min-width:0}
.pill-icon{display:inline-block;width:1em;height:1em;min-width:1em;flex:0 0 1em;vertical-align:middle}
.setup-launch{--setup-brand-icon-size:1.6em}
.setup-launch .pill-link{gap:12px}
.setup-launch .pill-icon{width:var(--setup-brand-icon-size);height:var(--setup-brand-icon-size);min-width:var(--setup-brand-icon-size);flex:0 0 var(--setup-brand-icon-size)}
:root[data-theme="dark"] .pill-icon-chatgpt{filter:invert(1)}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]):not([data-theme="dark"]) .pill-icon-chatgpt{filter:invert(1)}}

ol{list-style:none;margin:0 auto;padding:0;display:grid;grid-template-columns:minmax(0,1fr);align-items:stretch;gap:28px;width:100%;max-width:760px;min-width:0}
li{text-align:center;font-size:clamp(17px,1.65vw,20px);font-weight:400;line-height:1.65;letter-spacing:-.025em;word-break:keep-all;overflow-wrap:anywhere}
li a,li a:link,li a:visited,li a:hover,li a:active{color:inherit;text-decoration:none;background:transparent;opacity:1;transition:none}
li a:focus-visible{outline:2px solid var(--focus-color);outline-offset:5px}
@media(max-width:600px){main{width:calc(100% - 36px);padding:72px 0}.pill-layout{--pill-gap:8px}nav.filters button{font-size:14px;padding:10px 15px;min-height:42px}ol{gap:24px}li{font-size:17px}}
@media(max-width:360px){main{width:calc(100% - 28px)}.theme-toolbar{top:14px}.theme-option{padding:8px 10px;font-size:12px}nav.filters button{padding:10px 12px}nav.filters.subfilters button{padding:9px 12px}}
`;
