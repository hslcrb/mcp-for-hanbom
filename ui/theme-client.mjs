/**
 * System appearance by default, manual override stored per browser.
 * THEME_BOOT runs before CSS to avoid a light flash for saved dark preference.
 */
export const THEME_KEY="hanbom-color-theme-v1";

export const THEME_BOOT=String.raw`(function(){
 try{
  const value=localStorage.getItem("hanbom-color-theme-v1");
  if(value==="light"||value==="dark")document.documentElement.setAttribute("data-theme",value);
  const dark=value==="dark"||(value!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute("content",dark?"#13161b":"#ffffff");
 }catch{}
})();`;

export const THEME_CLIENT=String.raw`(function(){
 const root=document.documentElement;
 const control=document.querySelector(".theme-options");
 if(!control)return;
 const choices=[...control.querySelectorAll("button[data-theme-choice]")];
 const system=window.matchMedia("(prefers-color-scheme: dark)");
 const stored=root.getAttribute("data-theme");
 let mode=stored==="light"||stored==="dark"?stored:"system";

 function effectiveDark(){return mode==="dark"||(mode==="system"&&system.matches);}
 function paint(){
  for(const choice of choices)choice.setAttribute("aria-pressed",String(choice.dataset.themeChoice===mode));
  const dark=effectiveDark();
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute("content",dark?"#13161b":"#ffffff");
  control.dataset.themeEffective=dark?"dark":"light";
 }
 function setTheme(next){
  if(next!=="light"&&next!=="dark"&&next!=="system")return;
  mode=next;
  if(next==="system")root.removeAttribute("data-theme");
  else root.setAttribute("data-theme",next);
  try{
   if(next==="system")localStorage.removeItem("hanbom-color-theme-v1");
   else localStorage.setItem("hanbom-color-theme-v1",next);
  }catch{}
  paint();
 }
 control.addEventListener("click",event=>{
  const clicked=event.target.closest("button[data-theme-choice]");
  if(clicked&&control.contains(clicked))setTheme(clicked.dataset.themeChoice);
 });
 if(system.addEventListener)system.addEventListener("change",()=>{if(mode==="system")paint();});
 else if(system.addListener)system.addListener(()=>{if(mode==="system")paint();});
 paint();
})();`;
