/**
 * Accessible three-way color appearance preference, independent of RSS pills.
 * Initial "자동" mirrors system color preference until JS restores a saved choice.
 */
const OPTIONS=Object.freeze([
 {value:"system",label:"자동"},
 {value:"light",label:"라이트"},
 {value:"dark",label:"다크"}
]);
export function ThemeSwitch(){
 return '<div class="theme-toolbar"><div class="theme-options" role="group" aria-label="화면 테마">'+
  OPTIONS.map(({value,label})=>'<button type="button" class="theme-option" data-theme-choice="'+value+
   '" aria-pressed="'+String(value==="system")+'">'+label+'</button>').join("")+
  '</div></div>';
}
