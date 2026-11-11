import {PillButton} from "./pill-components.mjs";
import {SITE_STYLES} from "./site-styles.mjs";
import {SETUP_STYLES} from "./mcp-setup-styles.mjs";
import {SETUP_CLIENT} from "./mcp-setup-client.mjs";
import {THEME_BOOT,THEME_CLIENT} from "./theme-client.mjs";
import {ThemeSwitch} from "./theme-components.mjs";

export const MCP_ENDPOINT="https://data.hanbom.rhee.life/mcp";
export const MCP_DISPLAY_NAME="HANBOM Data MCP";

/**
 * A standalone, accessible connection guide. No database or framework needed.
 * The providers' current official help pages are linked in each card.
 */
export function renderMcpSetupPage(){
 const back=PillButton({href:"/",label:"홈으로"});
 const steps=rows=>'<ol class="guide-steps">'+rows.map((row,i)=>
   '<li><span class="step-number" aria-hidden="true">'+(i+1)+'</span><span class="step-body">'+row+'</span></li>'
 ).join("")+'</ol>';
 const chatgpt=steps([
   '<strong>ChatGPT 웹</strong>에서 <strong>Plugins(플러그인)</strong> 메뉴를 여세요.',
   '<strong>+</strong> 버튼에서 <strong>Add custom MCP server(맞춤형 MCP 서버 추가)</strong>를 선택하세요.',
   '이름에는 <strong>HANBOM Data MCP</strong>, 서버 주소에는 위의 <strong>HTTPS MCP 주소</strong>를 입력하세요.',
   '인증은 <strong>None(없음)</strong>으로 설정하세요. 위험 안내를 확인한 뒤 <strong>Create as a plugin</strong>을 선택하세요.',
   '도구 목록을 확인하고 플러그인을 설치하세요. 채팅에서 <strong>@HANBOM Data MCP</strong>로 호출할 수 있습니다.'
 ]);
 const claude=steps([
   '<strong>Claude 웹</strong>에서 <strong>Customize → Connectors</strong>로 이동하세요.',
   '<strong>Add → Custom → Web</strong> 또는 화면에 표시되는 <strong>Add custom connector</strong>를 선택하세요.',
   '이름에는 <strong>HANBOM Data MCP</strong>, 서버 URL에는 위의 <strong>HTTPS MCP 주소</strong>를 붙여넣고 <strong>Continue</strong>를 누르세요.',
   '인증은 <strong>No sign in(로그인 없음)</strong>으로 선택하세요. API 키나 OAuth 정보는 입력하지 않습니다.',
   '<strong>Add</strong>로 저장한 후, 채팅의 <strong>+ → Connectors</strong>에서 연결을 켜고 질문해 보세요.'
 ]);
 const icon=id=>'<img class="brand-icon pill-icon-'+id+'" src="/assets/logos/'+id+'.svg" width="28" height="28" alt="" aria-hidden="true">';
 return `<!doctype html>
<html lang="ko">
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width,initial-scale=1">
 <meta name="color-scheme" content="light dark">
 <meta name="theme-color" content="#ffffff">
 <title>MCP 설정하기 — HANBOM DATA</title>
 <meta name="description" content="한봄고 RSS MCP 서버를 ChatGPT와 Claude에 연결하는 방법. 공개 원격 MCP, 인증 불필요.">
 <script>${THEME_BOOT}</script>
 <style>${SITE_STYLES}${SETUP_STYLES}</style>
</head>
<body>
 <main class="setup-page" aria-label="MCP 연결 가이드">
  <div class="setup-return">${back}</div>
  ${ThemeSwitch()}
  <div class="setup-hero">
   <p class="setup-eyebrow">HANBOM DATA / CONNECT</p>
   <h1>MCP 설정하기</h1>
   <p class="setup-lede">한봄고등학교 공식 RSS 82개를 ChatGPT와 Claude에서 조회할 수 있도록 연결해 보세요. 서버 주소 하나로 시작할 수 있어요.</p>
   <div class="setup-facts" aria-label="연결 정보 요약">
    <span class="setup-fact">원격 MCP</span>
    <span class="setup-fact">읽기 전용</span>
    <span class="setup-fact">인증 불필요</span>
   </div>
  </div>
  <section class="setup-connection" aria-labelledby="connection-title">
   <div class="setup-section-head"><h2 id="connection-title">연결 정보</h2></div>
   <div class="setup-field-grid">
    <div class="setup-field">
     <span class="setup-field-label" id="mcp-name-label">표시 이름</span>
     <div class="setup-field-box" aria-labelledby="mcp-name-label">
      <span class="setup-field-value">HANBOM Data MCP</span>
      <button type="button" class="copy-button" data-copy-value="name" aria-label="MCP 표시 이름 복사">복사</button>
     </div>
    </div>
    <div class="setup-field">
     <span class="setup-field-label" id="mcp-url-label">서버 URL</span>
     <div class="setup-field-box" aria-labelledby="mcp-url-label">
      <span class="setup-field-value">https://data.hanbom.rhee.life/mcp</span>
      <button type="button" class="copy-button" data-copy-value="endpoint" aria-label="MCP 서버 URL 복사">복사</button>
     </div>
    </div>
   </div>
   <div class="setup-secondary"><span><strong>전송</strong> Streamable HTTP</span><span><strong>인증</strong> None</span></div>
   <p class="setup-copy-status" id="setup-copy-status" role="status" aria-live="polite"></p>
  </section>
  <div class="setup-grid">
   <article id="chatgpt" class="guide-card" aria-labelledby="chatgpt-guide-title">
    <div class="guide-heading">
     <span class="guide-mark">${icon("chatgpt")}</span>
     <div><p class="guide-overline">OpenAI</p><h2 class="guide-title" id="chatgpt-guide-title">ChatGPT 연결</h2></div>
    </div>
    <p class="guide-description">웹의 Plugins에서 맞춤형 원격 MCP 서버를 직접 등록해요. 별도의 개발자 모드를 켤 필요 없이 진행할 수 있는 등록 경로예요.</p>
    ${chatgpt}
    <div class="guide-actions">
     <a class="guide-link primary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT 열기</a>
     <a class="guide-link" href="https://help.openai.com/ko-kr/articles/12584461-connecting-custom-mcp-servers-in-chatgpt" target="_blank" rel="noopener noreferrer">공식 연결 안내</a>
    </div>
   </article>
   <article id="claude" class="guide-card" aria-labelledby="claude-guide-title">
    <div class="guide-heading">
     <span class="guide-mark">${icon("claude")}</span>
     <div><p class="guide-overline">Anthropic</p><h2 class="guide-title" id="claude-guide-title">Claude 연결</h2></div>
    </div>
    <p class="guide-description">Claude의 사용자 정의 웹 커넥터로 같은 원격 MCP를 추가할 수 있어요. 서버 자체는 공개 읽기 전용이므로 별도의 로그인 설정이 필요하지 않아요.</p>
    ${claude}
    <div class="guide-actions">
     <a class="guide-link primary" href="https://claude.ai/" target="_blank" rel="noopener noreferrer">Claude 열기</a>
     <a class="guide-link" href="https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp" target="_blank" rel="noopener noreferrer">공식 연결 안내</a>
    </div>
   </article>
  </div>
  <p class="setup-footnote">ChatGPT·Claude에서 제공하는 메뉴는 계정과 워크스페이스 권한 또는 서비스 업데이트에 따라 다를 수 있어요. 이 페이지는 설치 방법을 안내하며, 서비스에 자동으로 연결하거나 계정 권한을 요청하지 않아요.</p>
 </main>
 <script>${THEME_CLIENT}</script>
 <script>${SETUP_CLIENT}</script>
</body>
</html>`;
}
