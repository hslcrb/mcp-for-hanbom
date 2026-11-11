import {PillButton} from "./pill-components.mjs";
import {ThemeSwitch} from "./theme-components.mjs";
import {THEME_BOOT,THEME_CLIENT} from "./theme-client.mjs";
import {SITE_STYLES} from "./site-styles.mjs";
import {UNIVERSITY_STYLES} from "./university-styles.mjs";
import {UNIVERSITY_CLIENT} from "./university-client.mjs";
import {UNIVERSITY_METRICS,UNIVERSITY_SOURCE} from "../university.mjs";

export function renderUniversityPage(){
 const back=PillButton({href:"/",label:"홈으로"});
 const opts=UNIVERSITY_METRICS.map(m=>'<option value="'+m.id+'">'+m.label+'</option>').join("");
 return '<!doctype html><html lang="ko"><head>'+
 '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="color-scheme" content="light dark"><meta name="theme-color" content="#ffffff">'+
 '<meta name="description" content="대학알리미 교육여건: 기숙사, 도서관 예산, 교지·교사 확보율 등 6가지 지표의 대학별·지역별 공시 통계">'+
 '<title>대학알리미 교육여건 — HANBOM DATA</title><script>'+THEME_BOOT+'</script><style>'+SITE_STYLES+UNIVERSITY_STYLES+'</style></head>'+
 '<body><main class="university-page" aria-label="대학알리미 교육여건 조회"><div class="university-back">'+back+'</div>'+
 ThemeSwitch()+
 '<header class="university-hero"><p class="university-eyebrow">HANBOM DATA / UNIVERSITY</p>'+
 '<h1>대학알리미 교육여건</h1>'+
 '<p class="university-intro">한국대학교육협의회 공공데이터를 통해 대학 교육환경의 현황을 살펴보세요. 대학별·지역별 통계 12개 항목을 지원합니다.</p>'+
 '<div class="university-chips"><span class="university-chip">6개 교육여건 지표</span>'+
 '<span class="university-chip">대학별 · 지역별</span><span class="university-chip">공식 공공데이터</span></div></header>'+
 '<section class="university-console" aria-label="교육여건 검색">'+
 '<h2 class="university-subtitle">조회 조건</h2>'+
 '<div class="university-scopes" role="group" aria-label="통계 유형">'+
 '<button type="button" data-uni-scope="comparison" aria-pressed="true">대학별 비교통계</button>'+
 '<button type="button" data-uni-scope="regional" aria-pressed="false">지역별 통계</button></div>'+
 '<form id="university-form"><div class="university-fields">'+
 '<div class="university-field"><label for="university-metric">교육여건 지표</label>'+
 '<select id="university-metric" name="metric">'+opts+'</select></div>'+
 '<div class="university-field" id="university-school-field"><label for="university-school">대학 학교 ID (schlId)</label>'+
 '<input id="university-school" name="schoolId" type="text" minlength="1" maxlength="30" placeholder="대학알리미 공식 학교 ID" autocomplete="off" required>'+
 '<small>학교 이름과 다른 고유 코드예요. 원본 대학알리미의 코드를 확인해 입력하세요.</small></div>'+
 '<div class="university-field" id="university-year-field"><label for="university-year">공시년도</label>'+
 '<input id="university-year" name="year" type="number" value="2026" min="2010" max="2035" required></div>'+
 '<div class="university-field" id="university-division-field" hidden><label for="university-division">학교구분 코드 (schlDivCd)</label>'+
 '<input id="university-division" name="schoolDivisionCode" maxlength="12" placeholder="공식 학교구분 코드" autocomplete="off">'+
 '<small>대학·전문대학 등의 유형을 구분하는 공식 코드입니다. 값을 추정하지 않습니다.</small></div>'+
 '<div class="university-field" id="university-indicator-field" hidden><label for="university-indicator">지표 ID (선택)</label>'+
 '<input id="university-indicator" name="indicatorId" maxlength="20" placeholder="교지·교사 지표 코드" autocomplete="off"></div>'+
 '<div class="university-field"><label for="university-page">페이지</label>'+
 '<input id="university-page" type="number" min="1" max="10" value="1"></div>'+
 '<div class="university-field"><label for="university-size">페이지당 결과</label>'+
 '<select id="university-size"><option value="10">10건</option><option value="20" selected>20건</option><option value="50">50건</option></select></div>'+
 '</div><div class="university-actions" style="margin-top:20px">'+
 '<p class="university-control-note">개발계정 호출 한도를 보호하기 위해 자동 조회하지 않습니다. 값이 준비되면 조회하기를 눌러주세요.</p>'+
 '<button class="university-run" type="submit">조회하기</button></div></form></section>'+
 '<p id="university-status" class="university-status" role="status" aria-live="polite">조회 유형과 조건을 선택해 주세요.</p>'+
 '<section id="university-results" class="university-results" aria-live="polite" aria-busy="false" aria-label="공식 대학 교육여건 조회 결과">'+
 '<div class="university-empty">대학별 조회에는 공식 학교 ID와 공시년도, 지역별 조회에는 학교구분 코드가 필요합니다.</div></section>'+
 '<p class="university-footnote">출처: <a href="'+UNIVERSITY_SOURCE.url+'" target="_blank" rel="noopener noreferrer">'+UNIVERSITY_SOURCE.name+'</a>. '+
 '자료의 단위와 해석은 공시 원본을 확인하세요. 이 서비스는 비공식 조회 도구이며 자체적인 대학 순위를 만들지 않습니다. '+
 '<a href="/api/university/meta">API 카탈로그</a> · <a href="/mcp-setup">MCP 설정</a></p>'+
 '</main><script>'+UNIVERSITY_CLIENT+'</script><script>'+THEME_CLIENT+'</script></body></html>';
}
