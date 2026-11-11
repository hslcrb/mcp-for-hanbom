/** Clipboard actions for MCP setup values. No API keys or credentials are involved. */
export const SETUP_CLIENT=String.raw`(function(){
 const values={
  name:"HANBOM Data MCP",
  endpoint:"https://data.hanbom.rhee.life/mcp"
 };
 const region=document.getElementById("setup-copy-status");
 async function copyValue(value){
  if(navigator.clipboard&&navigator.clipboard.writeText){
   try{await navigator.clipboard.writeText(value);return true;}catch{}
  }
  const field=document.createElement("textarea");
  field.value=value;field.setAttribute("readonly","");field.style.cssText="position:fixed;left:-9999px;top:0";
  document.body.append(field);field.select();
  let copied=false;
  try{copied=document.execCommand("copy");}catch{}
  field.remove();return copied;
 }
 document.querySelectorAll("button[data-copy-value]").forEach(button=>button.addEventListener("click",async()=>{
  const key=button.dataset.copyValue;
  if(!Object.prototype.hasOwnProperty.call(values,key))return;
  const done=await copyValue(values[key]);
  if(region)region.textContent=done?"복사했어요. 해당 서비스의 설정 화면에 붙여넣으세요.":"복사할 수 없어요. 위 값을 직접 선택해 복사해주세요.";
 }));
})();`;
