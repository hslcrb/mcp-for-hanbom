import {PillButton} from "./pill-components.mjs";
import {ThemeSwitch} from "./theme-components.mjs";
import {THEME_BOOT,THEME_CLIENT} from "./theme-client.mjs";
import {SITE_STYLES} from "./site-styles.mjs";
import {NEIS_STYLES} from "./neis-styles.mjs";
import {NEIS_CLIENT} from "./neis-client.mjs";
import {NEIS_DEPARTMENTS,NEIS_SCHOOL} from "../neis.mjs";

export function renderNeisPage(){
 const back=PillButton({href:"/",label:"홈으로"});
 const departments=NEIS_DEPARTMENTS.map(name=>'<option value="'+name+'">'+name+'</option>').join("");
 return `<!doctype html>
<html lang="ko">
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width,initial-scale=1">
 <meta name="color-scheme" content="light dark">
 <meta name="theme-color" content="#ffffff">
 <meta name="description" content="한봄고등학교 나이스 오픈데이터. 급식식단·학사일정·고등학교시간표·학교정보를 날짜와 학급별로 조회합니다.">
 <title>나이스 교육정보 — HANBOM DATA</title>
 <script>${THEME_BOOT}</script>
 <style>${SITE_STYLES}${NEIS_STYLES}</style>
</head>
<body>
 <main class="neis-page" aria-label="한봄고등학교 나이스 교육정보">
  <div class="neis-return">${back}</div>
  ${ThemeSwitch()}
  <header class="neis-hero">
   <p class="neis-kicker">HANBOM DATA / NEIS</p>
   <h1>한봄고 나이스 데이터</h1>
   <p class="neis-intro">교육부 공식 나이스 오픈데이터로 한봄고등학교의 급식, 학사일정, 학과·학년·학급별 시간표를 확인할 수 있어요.</p>
   <div class="neis-tags">
    <span class="neis-tag">학교 코드 ${NEIS_SCHOOL.educationOffice} / ${NEIS_SCHOOL.schoolCode}</span>
    <span class="neis-tag">공식 교육정보</span>
    <span class="neis-tag">읽기 전용</span>
   </div>
  </header>
  <nav class="neis-tabs" id="neis-tabs" aria-label="나이스 데이터 유형">
   <button type="button" data-neis-tab="today" aria-controls="neis-results" aria-pressed="true">오늘 요약</button>
   <button type="button" data-neis-tab="meals" aria-controls="neis-results" aria-pressed="false">급식</button>
   <button type="button" data-neis-tab="calendar" aria-controls="neis-results" aria-pressed="false">학사일정</button>
   <button type="button" data-neis-tab="timetable" aria-controls="neis-results" aria-pressed="false">시간표</button>
   <button type="button" data-neis-tab="school" aria-controls="neis-results" aria-pressed="false">학교정보</button>
  </nav>
  <section class="neis-controls" id="neis-controls" aria-label="나이스 조회 조건">
   <div class="neis-field" data-neis-field="date">
    <label for="neis-date">조회 날짜</label>
    <input id="neis-date" type="date" min="2019-01-01" max="2035-12-31">
   </div>
   <div class="neis-field" data-neis-field="range" hidden>
    <label for="neis-range">조회 기간</label>
    <select id="neis-range">
     <option value="day">선택 날짜</option><option value="week">일주일</option><option value="month">이번 달</option>
    </select>
   </div>
   <div class="neis-field" data-neis-field="grade">
    <label for="neis-grade">학년</label>
    <select id="neis-grade">
     <option value="">전체 학년</option>
     <option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option>
    </select>
   </div>
   <div class="neis-field" data-neis-field="class">
    <label for="neis-class">학급</label>
    <input id="neis-class" type="text" placeholder="예: 1" maxlength="20" autocomplete="off">
   </div>
   <div class="neis-field" data-neis-field="department" hidden>
    <label for="neis-department">학과</label>
    <select id="neis-department">
     <option value="">전체 학과</option>
     ${departments}
    </select>
   </div>
   <div class="neis-field" data-neis-field="meal" hidden>
    <label for="neis-meal">급식 구분</label>
    <select id="neis-meal">
     <option value="">전체 급식</option><option value="1">조식</option><option value="2">중식</option><option value="3">석식</option>
    </select>
   </div>
   <button type="button" class="neis-go" id="neis-go">조회하기</button>
  </section>
  <p id="neis-status" class="neis-status" aria-live="polite">공식 나이스 교육정보를 불러오고 있습니다.</p>
  <section id="neis-results" class="neis-results" aria-label="조회 결과" aria-live="polite" aria-busy="true">
   <div class="neis-empty">불러오는 중입니다.</div>
  </section>
  <p class="neis-source">정보 출처: <a href="https://open.neis.go.kr/portal/mainPage.do" target="_blank" rel="noopener noreferrer">교육부 나이스 교육정보 개방 포털</a>.
   학교 등록·갱신 일정에 따라 공백이나 변경이 있을 수 있으며, 일정·식단은 학교 공지와 함께 확인하세요.
   <a href="/mcp-setup">MCP 연결하기</a> · <a href="/api/neis/meta">API 명세</a>
  </p>
 </main>
 <script>${NEIS_CLIENT}</script>
 <script>${THEME_CLIENT}</script>
</body>
</html>`;
}
