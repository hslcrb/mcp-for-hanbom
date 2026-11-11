/** Client-only NEIS portal. All API requests go to this Worker's public proxy; no API key in browser. */
export const NEIS_CLIENT=String.raw`
(function(){
 const tabs=document.getElementById("neis-tabs");
 const controls=document.getElementById("neis-controls");
 const dateField=document.getElementById("neis-date");
 const rangeField=document.getElementById("neis-range");
 const gradeField=document.getElementById("neis-grade");
 const classField=document.getElementById("neis-class");
 const deptField=document.getElementById("neis-department");
 const mealField=document.getElementById("neis-meal");
 const go=document.getElementById("neis-go");
 const results=document.getElementById("neis-results");
 const status=document.getElementById("neis-status");
 let current="today", requestToken=0;

 const today=()=>{
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const val=k=>parts.find(p=>p.type===k)?.value;
  return val("year")+"-"+val("month")+"-"+val("day");
 };
 dateField.value=today();

 const make=(tag,cls,value)=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(value!==undefined&&value!==null)el.textContent=String(value);
  return el;
 };
 const statusText=value=>{status.textContent=value;};
 const empty=value=>{
  const p=make("div","neis-empty",value);
  results.replaceChildren(p);
 };
 const cleanDate=str=>typeof str==="string"&&str.length===10?str.replaceAll("-",". "):"날짜 정보 없음";
 const displayDate=str=>typeof str==="string"?str.replaceAll("-","."):"";

 function range(date,choice){
  const ms=Date.parse(date+"T00:00:00Z");
  if(!Number.isFinite(ms))return{date};
  if(choice==="day")return{date};
  if(choice==="week"){
   const day=new Date(ms),offset=(day.getUTCDay()+6)%7;
   const first=new Date(ms-offset*86400000).toISOString().slice(0,10);
   const last=new Date(ms+(6-offset)*86400000).toISOString().slice(0,10);
   return{from:first,to:last};
  }
  const year=Number(date.slice(0,4)),month=Number(date.slice(5,7));
  return{from:date.slice(0,7)+"-01",
   to:new Date(Date.UTC(year,month,0)).toISOString().slice(0,10)};
 }
 function controlsFor(kind){
  controls.hidden=kind==="school";
  document.querySelector('[data-neis-field="range"]').hidden=kind==="school"||kind==="today";
  document.querySelector('[data-neis-field="grade"]').hidden=kind==="school"||kind==="meals";
  document.querySelector('[data-neis-field="class"]').hidden=kind!=="timetable"&&kind!=="today";
  document.querySelector('[data-neis-field="department"]').hidden=kind!=="timetable";
  document.querySelector('[data-neis-field="meal"]').hidden=kind!=="meals";
  if(kind==="calendar")rangeField.value="month";
  if(kind==="meals")rangeField.value="week";
  if(kind==="timetable")rangeField.value="day";
  const monthOption=rangeField.querySelector('option[value="month"]');
  if(monthOption)monthOption.disabled=kind==="timetable";
 }
 function setActive(kind){
  current=kind;
  for(const button of tabs.querySelectorAll("button[data-neis-tab]")){
   button.setAttribute("aria-pressed",String(button.dataset.neisTab===kind));
  }
  controlsFor(kind);
  load();
 }
 function infoCard(header,value,note){
  const article=make("article","neis-card neis-summary-card");
  article.append(make("span","neis-card-overline",header));
  article.append(make("strong","",value));
  if(note)article.append(make("span","",note));
  return article;
 }
 function summary(data){
  const panel=make("section","neis-summary");
  const sections=data.sections||{};
  const options=[["오늘 급식","meals"],["오늘 학사일정","calendar"],["시간표","timetable"]];
  for(const [title,key] of options){
   const entry=sections[key];
   panel.append(infoCard(title,entry?String(entry.count)+"건":"–",
    key==="timetable"&&!entry?"학년을 선택하면 조회해요":entry?"NEIS 공식 데이터":"선택한 항목 없음"));
  }
  results.append(panel);
 }
 function listRows(items,kind){
  if(!Array.isArray(items)||!items.length){
   results.append(make("div","neis-empty","선택한 조건에 해당하는 나이스 데이터가 없습니다."));
   return;
  }
  const fragment=document.createDocumentFragment();
  for(const item of items){
   const card=make("article","neis-card");
   if(kind==="meals"){
    card.append(make("span","neis-card-overline",displayDate(item.date)));
    card.append(make("h2","neis-card-title",item.meal_type||"급식"));
    const ul=make("ul","neis-card-list");
    for(const dish of item.dishes||[])ul.append(make("li","",dish));
    if(!ul.childNodes.length)ul.append(make("li","","식단 내용이 없습니다."));
    card.append(ul);
    const notes=[item.calories,item.nutrition?.length?"영양 "+item.nutrition.join(" · "):null].filter(Boolean);
    if(notes.length)card.append(make("div","neis-card-note",notes.join(" · ")));
    if(item.origin?.length)card.append(make("div","neis-card-note","원산지: "+item.origin.join(" / ")));
   }else if(kind==="calendar"){
    card.append(make("span","neis-card-overline",displayDate(item.date)));
    card.append(make("h2","neis-card-title",item.title||"학사행사"));
    if(item.description)card.append(make("p","neis-card-body",item.description));
    const flags=Object.entries(item.grades||{}).filter(x=>x[1]).map(x=>x[0]+"학년");
    if(flags.length)card.append(make("p","neis-card-note","행사 대상: "+flags.join(" · ")));
    if(item.off_day)card.append(make("p","neis-card-note",item.off_day));
   }else if(kind==="timetable"){
    card.append(make("span","neis-card-overline",displayDate(item.date)+
      (item.grade?" · "+item.grade+"학년":"")+(item.class_name?" "+item.class_name+"반":"")));
    card.append(make("h2","neis-card-title",item.period?item.period+"교시 · "+(item.subject||"과목 정보 없음"):(item.subject||"과목 정보 없음")));
    const detail=[item.department,item.room].filter(Boolean).join(" · ");
    if(detail)card.append(make("p","neis-card-note",detail));
   }else if(kind==="school"){
    card.classList.add("wide");
    card.append(make("span","neis-card-overline","공식 학교 기본정보"));
    card.append(make("h2","neis-card-title",item.school_name));
    for(const value of [
     ["교육청",item.office_name],
     ["학교 유형",item.school_type],
     ["주소",item.address],
     ["전화",item.phone],
     ["설립일",displayDate(item.founded_on)],
     ["학교 코드",item.office_code+" / "+item.school_code]
    ]){
     if(value[1])card.append(make("p","neis-card-body",value[0]+" · "+value[1]));
    }
    if(item.homepage){
     const el=make("a","neis-source-link","학교 홈페이지");
     try{
      const link=new URL(item.homepage.startsWith("http")?item.homepage:"https://"+item.homepage);
      if(link.protocol==="https:"&&link.hostname.endsWith("goesw.kr")){
       el.href=link.toString();el.target="_blank";el.rel="noopener noreferrer";card.append(el);
      }
     }catch{}
    }
   }
   fragment.append(card);
  }
  results.append(fragment);
 }
 function render(data,kind){
  results.replaceChildren();
  if(kind==="today"){
   summary(data);
   const kinds=[["meals","급식"],["calendar","학사일정"],["timetable","시간표"]];
   for(const [key,label] of kinds){
    const section=data.sections?.[key];
    if(!section)continue;
    results.append(make("h2","neis-section-title",label));
    listRows(section.items||[],key);
   }
   statusText(displayDate(data.date)+" 나이스 데이터 · "+(data.partial?"일부 자료를 불러오지 못했습니다.":"정상 조회"));
  }else{
   listRows(data.items||[],kind);
   const text=typeof data.count==="number"?data.count+"건":"조회 완료";
   statusText(text+" · "+(data.partial||data.has_more?"데이터 일부만 표시됨 · ":"")+"출처: 나이스 교육정보 개방 포털");
  }
 }
 function buildUrl(){
  if(current==="school")return"/api/neis/school";
  const params=new URLSearchParams();
  const date=dateField.value||today();
  const period=current==="today"?{date}:range(date,rangeField.value);
  for(const [k,v] of Object.entries(period))params.set(k,v);
  if((current==="calendar"||current==="timetable"||current==="today")&&gradeField.value)params.set("grade",gradeField.value);
  if((current==="timetable"||current==="today")&&classField.value.trim())params.set("className",classField.value.trim());
  if(current==="timetable"&&deptField.value)params.set("department",deptField.value);
  if(current==="meals"&&mealField.value)params.set("mealType",mealField.value);
  params.set("limit","100");
  if(current==="today")params.delete("limit");
  return"/api/neis/"+current+"?"+params.toString();
 }
 async function load(){
  const token=++requestToken,kind=current;
  statusText("나이스 데이터를 조회하고 있습니다.");
  empty("조회 중입니다.");
  results.setAttribute("aria-busy","true");
  try{
   const response=await fetch(buildUrl(),{cache:"no-store",headers:{accept:"application/json"}});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"NEIS_DATA_UNAVAILABLE");
   if(token!==requestToken)return;
   render(data,kind);
  }catch(error){
   if(token!==requestToken)return;
   const codes={
    INVALID_ARGUMENT:"날짜나 학급 조건을 다시 확인해 주세요.",
    NEIS_KEY_NOT_CONFIGURED:"나이스 서버 연결 설정을 확인하고 있어요.",
    NEIS_UPSTREAM_REJECTED:"나이스에서 요청을 거절했습니다. 관리자에게 확인해 주세요.",
    NEIS_ALL_SOURCES_UNAVAILABLE:"나이스 자료를 가져오지 못했습니다."
   };
   statusText("조회 실패");
   empty(codes[error.message]||"나이스 데이터에 연결할 수 없습니다. 잠시 후 다시 조회해 주세요.");
  }finally{if(token===requestToken)results.setAttribute("aria-busy","false");}
 }
 tabs.addEventListener("click",event=>{
  const button=event.target.closest("button[data-neis-tab]");
  if(button&&tabs.contains(button))setActive(button.dataset.neisTab);
 });
 go.addEventListener("click",load);
 dateField.addEventListener("change",load);
 controlsFor(current);
 load();
})();
`;
