/** NEIS portal visual system: same muted palette as HANBOM DATA, modular and responsive. */
export const NEIS_STYLES=String.raw`
.neis-page{display:grid;grid-template-columns:minmax(0,1fr);width:min(1120px,calc(100% - 36px));padding-top:112px;gap:0}
.neis-return{position:absolute;top:24px;left:0}
.neis-hero{text-align:center;display:grid;justify-items:center;gap:13px;margin:0 0 34px}
.neis-kicker{font-size:12px;letter-spacing:.16em;font-weight:650;opacity:.6;margin:0}
.neis-page h1{margin:0;font-size:clamp(34px,4.5vw,51px)}
.neis-intro{max-width:640px;margin:0;font-size:15px;line-height:1.75;opacity:.72;word-break:keep-all}
.neis-tags{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin-top:3px}
.neis-tag{display:inline-flex;align-items:center;border:1px solid var(--border);background:var(--pill-surface);border-radius:999px;padding:7px 12px;font-size:12px}
.neis-tabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:0 0 26px}
.neis-tabs button{appearance:none;border:1px solid var(--border);background:var(--pill-surface);color:var(--ink);border-radius:999px;padding:11px 19px;font:550 14px/1.3 "Pretendard Variable","Pretendard",sans-serif;cursor:pointer;min-height:44px}
.neis-tabs button[aria-pressed=true]{background:var(--active-bg);color:var(--active-ink);border-color:var(--active-bg)}
.neis-tabs button:hover{filter:none;box-shadow:none;transform:none}
.neis-tabs button:focus-visible,.neis-go:focus-visible,.neis-page input:focus-visible,.neis-page select:focus-visible{outline:2px solid var(--focus-color);outline-offset:3px}
.neis-controls{display:flex;align-items:end;justify-content:center;gap:12px;flex-wrap:wrap;border:1px solid var(--border);border-radius:23px;background:var(--pill-surface);padding:22px;margin:0 0 25px}
.neis-controls[hidden]{display:none!important}
.neis-field{display:grid;gap:7px;min-width:0;flex:0 1 170px}
.neis-field[hidden]{display:none!important}
.neis-field label{font-size:12px;font-weight:650;opacity:.68}
.neis-field input,.neis-field select{width:100%;min-height:43px;min-width:0;border:1px solid var(--border);background:var(--paper);border-radius:12px;color:var(--ink);padding:8px 11px;font:500 14px/1.4 "Pretendard Variable","Pretendard",sans-serif;color-scheme:inherit}
.neis-go{appearance:none;border:1px solid var(--active-bg);border-radius:12px;min-height:43px;padding:9px 23px;background:var(--active-bg);color:var(--active-ink);font:650 14px/1.2 "Pretendard Variable","Pretendard",sans-serif;cursor:pointer}
.neis-status{min-height:24px;text-align:center;font-size:13px;line-height:1.65;opacity:.74;margin:0 0 20px}
.neis-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;margin:0;padding:0}
.neis-card{display:grid;align-content:start;gap:12px;padding:23px;min-width:0;border-radius:24px;background:var(--pill-surface);border:1px solid var(--border);word-break:keep-all}
.neis-card-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
.neis-card-overline{font-size:12px;font-weight:600;opacity:.6;line-height:1.5}
.neis-card-title{font-size:19px;font-weight:680;letter-spacing:-.035em;line-height:1.45;margin:0;overflow-wrap:anywhere}
.neis-card-body{font-size:14px;line-height:1.8;opacity:.83;overflow-wrap:anywhere;margin:0;white-space:pre-line}
.neis-card-list{list-style:none;display:grid;grid-template-columns:minmax(0,1fr);gap:6px;margin:0;padding:0}
.neis-card-list li{font-size:14px;line-height:1.65;text-align:left;letter-spacing:0;overflow-wrap:anywhere}
.neis-card-tag{font-size:12px;border:1px solid var(--border);border-radius:999px;padding:5px 10px;white-space:nowrap}
.neis-card-note{font-size:12px;line-height:1.8;opacity:.65;overflow-wrap:anywhere}
.neis-card.wide{grid-column:1/-1}
.neis-empty{grid-column:1/-1;padding:56px 18px;border:1px dashed var(--border);border-radius:22px;text-align:center;font-size:15px;line-height:1.7;opacity:.65}
.neis-section-title{grid-column:1/-1;margin:20px 0 -4px;font-size:18px;font-weight:650;letter-spacing:-.02em}
.neis-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;grid-column:1/-1}
.neis-summary-card{padding:19px 20px;border-radius:20px;background:var(--pill-surface);border:1px solid var(--border);min-width:0}
.neis-summary-card strong{display:block;font-size:26px;margin:4px 0;font-variant-numeric:tabular-nums}
.neis-summary-card span{font-size:12px;opacity:.68}
.neis-source{margin:28px auto 0;font-size:12px;text-align:center;line-height:1.8;max-width:800px;opacity:.65}
.neis-source a{color:inherit;text-decoration:underline;text-underline-offset:3px}
.neis-source a:focus-visible{outline:2px solid var(--focus-color)}
@media(max-width:800px){.neis-results{grid-template-columns:minmax(0,1fr)}.neis-summary{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:600px){.neis-page{width:calc(100% - 32px);padding-top:115px}.neis-hero{margin-bottom:26px}.neis-intro{font-size:14px}.neis-tabs{gap:7px}.neis-tabs button{padding:10px 13px;font-size:13px}.neis-controls{padding:16px;justify-content:stretch}.neis-field{flex:1 1 125px}.neis-go{flex:1 1 100%;width:100%}.neis-card{padding:19px;border-radius:20px}.neis-card-title{font-size:17px}.neis-summary-card{padding:13px 10px}.neis-summary-card strong{font-size:20px}}
@media(max-width:360px){.neis-page{width:calc(100% - 28px)}.neis-return{top:13px}.neis-return .pill-link{font-size:13px;padding:9px 12px}.neis-summary-card strong{font-size:17px}}
`;
