/**
 * Client controller for server-rendered <hanbom-pill> Web Components.
 * Uses a single delegated click listener for all 129 pills.
 */
export const SITE_CLIENT=String.raw`
(function(){
 const list=document.getElementById("notices");
 const navigation=document.getElementById("board-navigation");
 const buttons=[...navigation.querySelectorAll("nav.filters button")];
 const groups=__GROUPS__;
 const ids=__IDS__;
 const shardCount=__SHARD_COUNT__;

 // Progressive enhancement: SSR <button> elements work without a custom-element
 // upgrade. The host keeps its state and the nested native button accessible.
 class HanbomPill extends HTMLElement {
  static get observedAttributes(){return ["selected"];}
  connectedCallback(){this.syncPressed();}
  attributeChangedCallback(){this.syncPressed();}
  get selected(){return this.hasAttribute("selected");}
  set selected(value){this.toggleAttribute("selected",!!value);}
  syncPressed(){
   const button=this.querySelector("button");
   if(button)button.setAttribute("aria-pressed",String(this.selected));
  }
 }
 if(!customElements.get("hanbom-pill"))customElements.define("hanbom-pill",HanbomPill);

 let active="all",data=[],errors=new Set(),loaded=false;
 const message=text=>{const li=document.createElement("li");li.textContent=text;list.replaceChildren(li);};
 const compare=(a,b)=>(Date.parse(b.published_at||"")||0)-(Date.parse(a.published_at||"")||0);
 const parentOf=category=>groups[category]?category:Object.keys(groups).find(key=>groups[key].includes(category))||null;
 function render(){
  if(!loaded){message("불러오는 중입니다.");return;}
  const selected=active==="all"?null:(groups[active]||[active]);
  const rows=selected?data.filter(x=>selected.includes(x.category)):data;
  const fragment=document.createDocumentFragment();
  for(const entry of rows){
   if(typeof entry.title!=="string"||!entry.title.trim())continue;
   const li=document.createElement("li");
   let url=null;
   if(typeof entry.url==="string")try{
    const candidate=new URL(entry.url);
    if(candidate.protocol==="https:"&&candidate.hostname==="hanbom-h.goesw.kr")url=candidate;
   }catch{}
   const link=document.createElement(url?"a":"span");link.textContent=entry.title;
   if(url){link.href=url.href;link.target="_blank";link.rel="noopener noreferrer";}
   li.append(link);fragment.append(li);
  }
  if(fragment.childNodes.length)list.replaceChildren(fragment);
  else if(active==="all"?(errors.size===ids.length):(selected?selected.every(k=>errors.has(k)):errors.has(active)))message("게시물을 불러올 수 없습니다.");
  else message("표시할 게시물이 없습니다.");
 }
 function select(category){
  active=category;
  const parent=parentOf(category);
  for(const nav of navigation.querySelectorAll("nav.subfilters"))nav.hidden=nav.dataset.group!==parent;
  for(const button of buttons){
   const inPrimary=!!button.closest("nav.primary");
   const pressed=inPrimary?(button.dataset.category===(parent||"all")):(button.dataset.category===category);
   const component=button.closest("hanbom-pill");
   if(component)component.selected=pressed;
   else button.setAttribute("aria-pressed",String(pressed));
  }
  render();
 }
 navigation.addEventListener("click",event=>{
  const button=event.target.closest("button[data-category]");
  if(button&&navigation.contains(button))select(button.dataset.category);
 });
 async function load(){
  message("불러오는 중입니다.");
  const result=await Promise.allSettled(Array.from({length:shardCount},(_,shard)=>
   fetch("/api/posts?limit=all&shard="+shard,{cache:"no-store"}).then(response=>{
    if(!response.ok)throw new Error("RSS_UNAVAILABLE");
    return response.json();
   })
  ));
  const posts=[];const failures=new Set();
  for(let i=0;i<result.length;i++){
   const current=result[i];
   if(current.status==="fulfilled"){
    posts.push(...(Array.isArray(current.value.items)?current.value.items:[]));
    for(const entry of current.value.failed_feeds||[])failures.add(entry.category);
   }else{
    for(const id of ids.slice(i*28,(i+1)*28))failures.add(id);
   }
  }
  data=posts.sort(compare);errors=failures;loaded=true;render();
  list.setAttribute("aria-busy","false");
 }
 load().catch(()=>{loaded=true;errors=new Set(ids);render();list.setAttribute("aria-busy","false");});
})();
`;
