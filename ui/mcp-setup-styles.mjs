/** Additional styles used only by /mcp-setup; inherits light/dark tokens from SITE_STYLES. */
export const SETUP_STYLES=String.raw`
.setup-page{display:grid;grid-template-columns:minmax(0,1fr);width:min(1100px,calc(100% - 40px));padding-top:112px}
.setup-return{position:absolute;top:22px;left:0}
.setup-hero{text-align:center;display:grid;justify-items:center;gap:13px;margin-bottom:42px}
.setup-eyebrow{font:600 12px/1.4 "Pretendard Variable","Pretendard",sans-serif;letter-spacing:.18em;color:var(--ink);opacity:.6;margin:0}
.setup-page h1{font-size:clamp(38px,5vw,54px);margin:0}
.setup-lede{max-width:650px;color:var(--ink);opacity:.72;font-size:16px;line-height:1.8;margin:0;word-break:keep-all}
.setup-facts{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:4px}
.setup-fact{display:inline-flex;align-items:center;padding:6px 12px;border:1px solid var(--border);border-radius:12px;color:var(--ink);font-size:12px}
.setup-connection{border:1px solid var(--border);border-radius:26px;background:var(--pill-surface);padding:26px;margin-bottom:24px}
.setup-section-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}
.setup-section-head h2{font-size:19px;line-height:1.4;letter-spacing:-.035em;margin:0;font-weight:650}
.setup-field-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.75fr);gap:12px}
.setup-field{min-width:0;display:grid;gap:7px}
.setup-field-label{color:var(--ink);opacity:.7;font-size:12px;font-weight:550}
.setup-field-box{display:flex;align-items:center;gap:10px;min-width:0;min-height:48px;border:1px solid var(--border);border-radius:14px;background:var(--paper);padding:5px 6px 5px 14px}
.setup-field-value{min-width:0;flex:1;overflow-wrap:anywhere;color:var(--ink);font:500 14px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}
.copy-button{border:1px solid var(--border);background:var(--pill-surface);color:var(--ink);border-radius:10px;padding:9px 12px;min-height:36px;cursor:pointer;font:600 13px/1.2 "Pretendard Variable","Pretendard",sans-serif;white-space:nowrap}
.copy-button:hover{filter:none;transform:none}
.copy-button:focus-visible,.guide-link:focus-visible{outline:2px solid var(--focus-color);outline-offset:3px}
.setup-secondary{display:flex;align-items:center;gap:12px;margin-top:14px;font-size:13px;color:var(--ink);opacity:.72}
.setup-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:stretch}
.guide-card{display:flex;flex-direction:column;gap:20px;min-width:0;border:1px solid var(--border);background:var(--pill-surface);border-radius:28px;padding:clamp(22px,3.2vw,34px)}
.guide-heading{display:flex;align-items:center;gap:12px}
.guide-mark{display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;flex:0 0 54px;border:1px solid var(--border);border-radius:17px;background:var(--paper)}
.guide-mark .brand-icon{width:1em;height:1em;display:block;font-size:28px}
.guide-overline{font-size:12px;opacity:.64;margin:0 0 3px}
.guide-title{margin:0;font-size:23px;line-height:1.25;letter-spacing:-.035em;font-weight:700}
.guide-description{font-size:14px;line-height:1.7;color:var(--ink);opacity:.76;margin:0;word-break:keep-all}
.guide-steps{list-style:none!important;display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin:0;padding:0;max-width:none}
.guide-steps li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:13px;align-items:start;text-align:left;letter-spacing:normal;font-size:14px;line-height:1.75;word-break:keep-all}
.step-number{display:grid;place-items:center;width:28px;height:28px;flex:0 0 28px;border-radius:10px;border:1px solid var(--border);font:600 12px/1 "Pretendard Variable","Pretendard",sans-serif;color:var(--ink)}
.step-body{min-width:0}
.guide-card strong{font-weight:700;color:var(--ink)}
.guide-actions{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin-top:auto;padding-top:5px}
.guide-link{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:13px;min-height:44px;padding:10px 15px;background:var(--paper);color:var(--ink)!important;font-weight:600;text-decoration:none;font-size:13px}
.guide-link.primary{background:var(--active-bg);color:var(--active-ink)!important;border-color:var(--active-bg)}
.setup-footnote{margin:24px auto 0;text-align:center;max-width:700px;font-size:13px;line-height:1.8;color:var(--ink);opacity:.7;word-break:keep-all}
.setup-copy-status{min-height:20px;text-align:center;margin:10px 0 0;font-size:13px;color:var(--ink)}
@media(max-width:820px){.setup-grid{grid-template-columns:minmax(0,1fr)}.setup-field-grid{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.setup-page{width:calc(100% - 32px);padding-top:116px}.setup-hero{margin-bottom:30px}.setup-connection{padding:19px;border-radius:22px}.guide-card{padding:22px;border-radius:23px}.setup-lede{font-size:14px}.setup-facts{gap:6px}}
@media(max-width:360px){.setup-page{width:calc(100% - 28px)}.setup-return{top:14px}.setup-return .pill-link{padding:9px 12px;font-size:13px}.setup-field-box{flex-wrap:wrap}.copy-button{margin-left:auto}}
`;
