# HANBOM DATA · NEIS 공식 교육정보 통합 개발기

작성일: **2026-11-11** · GitHub `hslcrb/mcp-for-hanbom` · Cloudflare Worker `mcp-for-hanbom`

## 기준 자료 및 인증키 선정

이번 연동은 사용자 GitHub의 **비공개** 자료 폴더 `hslcrb/ALL-API-KEYS/sea35652/neis.go.kr 나이스 오픈데이터/`의 2026년 11월 11일에 저장된 NEIS 공식 페이지 캡처를 기준으로 한다.

- 인증키 발급 내역 캡처(2026-11-11 오전 10:06:02)에서 **2026-11-11 발급·정상 상태** 레코드만 추출.
- **2026-10-16**, **2025-08-31** 발급 인증키는 사용하거나 재등록하지 않는다.
- 확인된 2026-11-11 인증키는 **Cloudflare Worker Secret `NEIS_API_KEY`** 로 직접 등록. GitHub 저장소·URL 문서·응답·테스트·로그·프론트엔드에 실값 미포함.
- GitHub의 인증키 원본 HTML은 **비공개 저장소에만 보관**하도록 유지. 향후 해당 저장소를 공개하지 말 것.
- Cloudflare `wrangler.jsonc`의 `secrets.required: ["NEIS_API_KEY"]` 선언으로 필요한 환경변수가 빠진 배포를 차단하도록 설정.

이 인증키는 발급받은 본인 소유이며, Worker에서 교육정보 공식 Open API 요청에만 사용한다.

## 학교 식별 정보

| 항목 | 값 |
|---|---|
| 학교명 | 한봄고등학교 |
| 시도교육청 | 경기도교육청 |
| `ATPT_OFCDC_SC_CODE` | `J10` |
| `SD_SCHUL_CODE` | `7531327` |
| 조회 엔드포인트 | `https://open.neis.go.kr/hub/schoolInfo` |
| 본 서비스 | `https://data.hanbom.rhee.life/` |

학교 코드는 별도로 NEIS 공식 학교정보 API `schoolInfo`에서 직접 조회하여 확인.

## 제공하는 NEIS 데이터

사용자가 저장한 공식 API 스펙 HTML 3개와 나이스 공식 학교정보 API를 바탕으로 아래 네 데이터셋을 연동한다.

| 데이터 | NEIS 원본 경로 | 주요 필드 | REST 경로 |
|---|---|---|---|
| 학교 기본정보 | `schoolInfo` | 학교명, 교육청, 주소, 학교 유형 등 | `/api/neis/school` |
| 급식식단정보 | `mealServiceDietInfo` | `MLSV_YMD`, `MMEAL_SC_NM`, `DDISH_NM`, `CAL_INFO`, `NTR_INFO`, `ORPLC_INFO` | `/api/neis/meals` |
| 학사일정 | `SchoolSchedule` | `AA_YMD`, `EVENT_NM`, `EVENT_CNTNT`, 학년별 행사 여부 | `/api/neis/calendar` |
| 고등학교시간표 | `hisTimetable` | `ALL_TI_YMD`, `DDDEP_NM`, `GRADE`, `CLASS_NM`, `PERIO`, `ITRT_CNTNT` | `/api/neis/timetable` |

추가로 `/api/neis/today`는 급식과 학사일정, 학년 선택 시 시간표를 합친 통합 응답을 제공한다. `/api/neis/meta`와 `/api/neis/status`는 데이터셋·연결 설정만 반환하며 인증키 값은 절대 반환하지 않는다.

- 사용자 입력은 날짜, 학년, 학급, 학과, 학기·학년도, 식사유형, 결과 개수만 허용. **원본 호스트·학교코드·API 키를 요청자가 임의로 지정할 수 없음.**
- 입력 날짜 `YYYY-MM-DD`, 급식 최대 31일, 학사일정 최대 63일, 시간표 최대 14일.
- 날짜·유형 등 입력 검증 후 공식 NEIS 고정 URL에 GET, JSON 형식으로 요청.
- 원본에서 정상 `INFO-200`이 오면 데이터 없음(0건), 반대로 인증·서버 오류는 명확한 오류 코드로 응답.
- 최대 3개 upstream 페이지, 응답 1.25MB 제한, 타임아웃 10초, RSS와 별도 캐시 300초(학교정보 24시간).
- API 키가 없으면 **503 `NEIS_KEY_NOT_CONFIGURED`**; 비인증 5건 샘플을 실제 데이터인 척 반환하지 않음.
- 원본 JSON에서 필요한 필드만 정규화하고 HTML 태그 제거. 식단의 알레르기 번호는 유지.
- 학사일정의 학년별 Y/N을 불리언으로 변환. 시간표에 학과·학급·학년·교시 필터 지원.

## 웹 UI

- 홈페이지 `/neis`로 이동하는 **재사용 PillButton 컴포넌트** 추가.
- 나이스 전용 화면 **오늘 요약 / 급식 / 학사일정 / 시간표 / 학교정보** 탭 5개.
- 날짜·기간·학년·학급·학과·식사유형 선택 가능. 결과는 반응형 카드로 표시.
- 원본 학교 RSS와 별개 라우팅. 단순 NEIS 메뉴 선택으로 기존 82 RSS 전체를 불러올 필요 없음.
- 클라이언트에서는 `/api/neis/` 경로만 호출하고 인증키를 전혀 볼 수 없음.
- 기존 라이트·다크·시스템 설정, 폰트, CSS Grid/Flex, 접근성·텍스트 선택 방지 스타일 유지.

## API와 MCP

| REST URL | 역할 |
|---|---|
| `/api/neis/school` | 학교정보 |
| `/api/neis/meals?date=2026-11-11` | 지정일 식단 |
| `/api/neis/meals?from=2026-11-10&to=2026-11-16` | 기간별 급식 |
| `/api/neis/calendar?date=2026-11-11&grade=3` | 3학년 관련 행사 |
| `/api/neis/timetable?date=2026-11-11&grade=3&className=1` | 3학년 1반 시간표 |
| `/api/neis/today?date=2026-11-11` | 당일 요약 |
| `/api/neis/meta`, `/api/neis/status` | 공개 연결 메타데이터 |

MCP URL `https://data.hanbom.rhee.life/mcp`, 인증 `None` 유지.

- `get_neis_school_info`
- `get_neis_meals`
- `get_neis_school_events`
- `get_neis_high_school_timetable`
- `get_neis_daily_briefing`
- `get_neis_connection_status`

기존 RSS 도구 68개 유지, **총 74개**. MCP의 신규 도구는 REST와 동일한 서버측 Secret을 사용한다. ChatGPT와 Claude MCP 클라이언트는 별도 NEIS 인증키가 필요 없음.

## 배포 체계와 회귀 검증

- GitHub `feat/neis-20261111-secret-education-data` 브랜치에서 기능·테스트·문서 작업.
- `main`으로 fast-forward 후 기존 Cloudflare Workers Builds에서 **`npm run check` → `wrangler deploy`** 자동 배포.
- GitHub Actions 사용하지 않음.
- Cloudflare Worker 인증키는 이미 등록됐으며 배포 후 **Secret binding 이름만** 재검증. 실값은 회수·노출하지 않음.
- 기존 RSS 82개, 메뉴 23개, 커스텀 접근 정책 아카이브 상태, 개인정보 보호 등 하위호환 유지.
- `test/neis.test.mjs`에서 실제 키 대신 합성된 가짜 키로 급식·학사일정·시간표·MCP·비공개 키 검증을 자동화.
- 실제 서비스 테스트 결과, 성공·일부 미제공 분야, 배포 커밋은 검증 후 추가 작성.
