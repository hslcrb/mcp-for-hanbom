export const UNIVERSITY_CLIENT=String.raw`(function(){
 const form=document.getElementById("university-form"),result=document.getElementById("university-results");
 const status=document.getElementById("university-status"),scopeButtons=[...document.querySelectorAll("[data-uni-scope]")];
 const schoolField=document.getElementById("university-school-field"),yearField=document.getElementById("university-year-field");
 const divisionField=document.getElementById("university-division-field"),indicatorField=document.getElementById("university-indicator-field");
 const metricSelect=document.getElementById("university-metric");
 let scope="comparison",requestNumber=0;
 const make=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined&&value!==null)el.textContent=String(value);return el;};
 const empty=message=>{result.replaceChildren(make("div","university-empty",message));};
 function sync(){
  for(const b of scopeButtons)b.setAttribute("aria-pressed",String(b.dataset.uniScope===scope));
  schoolField.hidden=scope!=="comparison";yearField.hidden=scope!=="comparison";divisionField.hidden=scope!=="regional";
  indicatorField.hidden=metricSelect.value!=="campus";
  document.getElementById("university-school").required=scope==="comparison";
  document.getElementById("university-year").required=scope==="comparison";
  document.getElementById("university-division").required=scope==="regional";
 }
 for(const b of scopeButtons)b.addEventListener("click",()=>{scope=b.dataset.uniScope;sync();empty("조회 유형과 조건을 선택한 뒤 조회하기를 누르세요.");status.textContent="";});
 metricSelect.addEventListener("change",sync);
 const aliases={schlKrnNm:"대학교",schlId:"학교 ID",schlDivNm:"학교구분",schlEstbNm:"설립유형",svyYr:"공시년도",indctId:"지표 ID",indctYr:"기준년도",indctVal1:"지표 값",znNm:"지역명",schlDivCd:"학교구분 코드"};
 function render(data){
  result.replaceChildren();
  if(!data.items?.length){empty("선택한 조건에 해당하는 공개 자료가 없습니다. 학교 ID·공시년도·학교구분 코드를 확인해 주세요.");return;}
  const fragment=document.createDocumentFragment();
  for(const entry of data.items){
   const card=make("article","university-card");
   card.append(make("h2","",entry.school_name||entry.region||data.metric_label));
   const row=make("div","university-record-metadata");
   row.append(make("span","",data.metric_label));
   if(entry.year)row.append(make("span","","공시 "+entry.year));
   card.append(row);
   const dl=make("dl","university-record-fields");
   const fields=entry.fields||{};
   for(const [key,val] of Object.entries(fields)){
    if(val===""||val===null||val===undefined)continue;
    const dt=make("dt","",aliases[key]||key),dd=make("dd","",val);
    dl.append(dt,dd);
   }
   card.append(dl);fragment.append(card);
  }
  result.append(fragment);
 }
 form.addEventListener("submit",async ev=>{
  ev.preventDefault();
  const metric=metricSelect.value,page=document.getElementById("university-page").value;
  const size=document.getElementById("university-size").value;
  const args=new URLSearchParams({scope,metric,page,size});
  if(scope==="comparison"){
   args.set("schoolId",document.getElementById("university-school").value.trim());
   args.set("year",document.getElementById("university-year").value.trim());
  }else args.set("schoolDivisionCode",document.getElementById("university-division").value.trim());
  if(metric==="campus"&&document.getElementById("university-indicator").value.trim())args.set("indicatorId",document.getElementById("university-indicator").value.trim());
  const turn=++requestNumber;
  status.textContent="대학알리미 자료를 조회하고 있어요.";
  empty("잠시만요. 공식 공공데이터에 연결 중입니다.");
  result.setAttribute("aria-busy","true");
  try{
   const response=await fetch("/api/university/query?"+args.toString(),{cache:"no-store",headers:{accept:"application/json"}});
   const payload=await response.json();
   if(!response.ok)throw new Error(payload.error||"API_UNAVAILABLE");
   if(turn!==requestNumber)return;
   render(payload);
   status.textContent=payload.count+"건 조회 · "+(payload.cached?"캐시 적용 · ":"")+"공공데이터포털 한국대학교육협의회";
   if(payload.has_more)status.textContent+=" · 다음 페이지를 조회할 수 있어요";
  }catch(e){
   if(turn!==requestNumber)return;
   const errors={INVALID_ARGUMENT:"입력한 학교 ID, 공시년도 또는 학교구분 코드를 확인해 주세요.",UNIVERSITY_KEY_NOT_CONFIGURED:"API 연결이 설정되지 않았습니다.",UNIVERSITY_UPSTREAM_REJECTED:"공식 API가 요청을 거절했습니다. 코드·연도를 확인해 주세요.",UNIVERSITY_NETWORK_ERROR:"공공데이터포털 연결에 문제가 있습니다."};
   status.textContent="조회 실패";empty(errors[e.message]||"자료를 불러오지 못했어요. 조건을 확인하거나 나중에 다시 조회해 주세요.");
  }finally{if(turn===requestNumber)result.setAttribute("aria-busy","false");}
 });
 sync();
})();
`;
