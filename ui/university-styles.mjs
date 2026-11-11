export const UNIVERSITY_STYLES=String.raw`
.university-page{width:min(1120px,calc(100% - 36px));padding-top:113px;display:grid;grid-template-columns:minmax(0,1fr)}
.university-back{position:absolute;top:23px;left:0}
.university-hero{text-align:center;display:grid;justify-items:center;gap:14px;margin-bottom:36px}
.university-eyebrow{font:650 12px/1.4 "Pretendard Variable","Pretendard",sans-serif;letter-spacing:.16em;opacity:.57;margin:0}
.university-page h1{font-size:clamp(32px,4.4vw,51px);margin:0}
.university-intro{font-size:15px;line-height:1.85;max-width:660px;margin:0;opacity:.76;word-break:keep-all}
.university-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.university-chip{border:1px solid var(--border);border-radius:999px;padding:7px 13px;background:var(--pill-surface);font-size:12px}
.university-console{display:grid;grid-template-columns:minmax(0,1fr);border:1px solid var(--border);border-radius:28px;background:var(--pill-surface);padding:clamp(18px,3vw,28px);gap:23px}
.university-subtitle{font-size:18px;font-weight:650;letter-spacing:-.025em;margin:0}
.university-scopes{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:9px}
.university-scopes button{appearance:none;border:1px solid var(--border);border-radius:999px;background:var(--paper);color:var(--ink);padding:10px 19px;min-height:43px;font:600 14px/1.3 "Pretendard Variable","Pretendard",sans-serif;cursor:pointer}
.university-scopes button[aria-pressed="true"]{background:var(--active-bg);color:var(--active-ink);border-color:var(--active-bg)}
.university-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.university-field{display:grid;gap:8px;min-width:0}
.university-field[hidden]{display:none!important}
.university-field label{font-size:13px;font-weight:650}
.university-field input,.university-field select{background:var(--paper);color:var(--ink);border:1px solid var(--border);border-radius:13px;padding:12px 13px;width:100%;min-width:0;min-height:45px;font:500 14px/1.4 "Pretendard Variable","Pretendard",sans-serif}
.university-field small{font-size:12px;opacity:.65;line-height:1.6}
.university-actions{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.university-run{appearance:none;background:var(--active-bg);color:var(--active-ink);border:1px solid var(--active-bg);border-radius:13px;min-height:46px;padding:10px 26px;font:650 14px/1.4 "Pretendard Variable","Pretendard",sans-serif;cursor:pointer}
.university-control-note{max-width:520px;font-size:12px;opacity:.7;line-height:1.7;margin:0}
.university-status{text-align:center;min-height:24px;margin:27px auto 19px;font-size:14px;line-height:1.65;opacity:.8}
.university-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.university-results[aria-busy="true"]{opacity:.75}
.university-card{min-width:0;padding:23px;border:1px solid var(--border);background:var(--pill-surface);border-radius:24px;display:grid;align-content:start;gap:13px}
.university-card h2{margin:0;font-size:18px;font-weight:650;line-height:1.55;letter-spacing:-.025em;overflow-wrap:anywhere}
.university-record-metadata{font-size:12px;opacity:.66;display:flex;flex-wrap:wrap;gap:8px}
.university-record-fields{display:grid;grid-template-columns:minmax(90px,1fr) minmax(0,2fr);gap:9px 16px;font-size:13px;line-height:1.6;min-width:0}
.university-record-fields dt{opacity:.68;overflow-wrap:anywhere}
.university-record-fields dd{margin:0;overflow-wrap:anywhere}
.university-empty{grid-column:1/-1;border:1px dashed var(--border);border-radius:23px;padding:48px 22px;text-align:center;font-size:14px;line-height:1.8;opacity:.68;word-break:keep-all}
.university-footnote{font-size:12px;line-height:1.85;opacity:.68;max-width:800px;text-align:center;margin:27px auto 0;word-break:keep-all}
.university-footnote a,.university-field a{color:inherit;text-decoration:underline;text-underline-offset:3px}
.university-page button:hover{filter:none;transform:none;box-shadow:none}
.university-page button:focus-visible,.university-page input:focus-visible,.university-page select:focus-visible{outline:2px solid var(--focus-color);outline-offset:2px}
@media(max-width:760px){.university-results{grid-template-columns:minmax(0,1fr)}}
@media(max-width:600px){.university-page{width:calc(100% - 32px);padding-top:118px}.university-console{padding:19px}.university-fields{grid-template-columns:minmax(0,1fr)}.university-actions{flex-direction:column;align-items:stretch}.university-run{width:100%}.university-intro{font-size:14px}.university-card{padding:19px}}
@media(max-width:360px){.university-page{width:calc(100% - 28px)}.university-back{top:13px}.university-back .pill-link{padding:9px 11px;font-size:13px}.university-record-fields{grid-template-columns:minmax(0,1fr)}.university-record-fields dt{margin-bottom:-9px}}
`;
