# HANBOM DATA — 31개 RSS 게시판 통합 개발기

2026-11-10 · GitHub `hslcrb/mcp-for-hanbom` / Cloudflare Workers

## 프로젝트 범위

기존 **8개 RSS**에 이번 요청의 **23개 RSS**를 추가해 **총 31개 공식 한봄고 게시판**을 지원한다. 학교특색활동 산하 6개 학과와 교과자료실 산하 보통교과·6개 학과는 **같은 학과명이라도 반드시 다른 RSS**로 유지한다. 예컨대 `feature_bigdata`와 `curriculum_bigdata`는 다른 원본이다.

개발 원칙: 기존 메인 도메인·GitHub Actions 미사용·화이트 미니멀 UI·Juache H1·공개 읽기 전용 REST/MCP와 복구 가능한 Cloudflare Access 설정을 유지.

## RSS 입력값 원본

| # | 카테고리 ID | 게시판명 및 상위 분류 | mi | bbsId | REST 직접 경로 | 공식 원본 RSS |
|---:|---|---|---:|---:|---|---|
| 1 | `notice` | 공지 사항 | `17249` | `10062` | `/api/notices` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062) |
| 2 | `letter` | 가정통신문 | `17252` | `10063` | `/api/letters` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17252&bbsId=10063) |
| 3 | `news` | 한봄 NEWS | `17187` | `10022` | `/api/news` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17187&bbsId=10022) |
| 4 | `awards` | 학생작품 및 수상내역 | `17172` | `10010` | `/api/awards` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17172&bbsId=10010) |
| 5 | `office_letter` | 가정통신문(교육청) | `17254` | `10064` | `/api/education-letters` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17254&bbsId=10064&bbsTy=HCNOTIE) |
| 6 | `opportunities` | 공모전 및 모집공고 | `17255` | `10065` | `/api/opportunities` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17255&bbsId=10065) |
| 7 | `health` | 보건알림 | `17256` | `10066` | `/api/health-notices` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17256&bbsId=10066) |
| 8 | `student_rules` | 학생생활규정게시판 | `17273` | `10074` | `/api/student-rules` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17273&bbsId=10074) |
| 9 | `volunteer` | 봉사활동 | `17276` | `10075` | `/api/volunteer` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17276&bbsId=10075) |
| 10 | `after_school` | 방과후학교 | `17288` | `10081` | `/api/after-school` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17288&bbsId=10081) |
| 11 | `feature_main` | 학교특색활동 / 학교특색활동 | `17292` | `10082` | `/api/featured-activities` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17292&bbsId=10082) |
| 12 | `feature_beauty` | 학교특색활동 / 뷰티아트과 | `17298` | `10085` | `/api/featured-activities/beauty` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17298&bbsId=10085) |
| 13 | `feature_character` | 학교특색활동 / 캐릭터창작과 | `17300` | `10087` | `/api/featured-activities/character` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17300&bbsId=10087) |
| 14 | `feature_visual` | 학교특색활동 / 시각디자인과 | `17303` | `10089` | `/api/featured-activities/visual` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17303&bbsId=10089) |
| 15 | `feature_bigdata` | 학교특색활동 / 빅데이터정보과 | `17305` | `10091` | `/api/featured-activities/bigdata` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17305&bbsId=10091) |
| 16 | `feature_smart` | 학교특색활동 / 스마트제어과 | `17307` | `10092` | `/api/featured-activities/smart` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17307&bbsId=10092) |
| 17 | `feature_sound` | 학교특색활동 / 사운드디자인과 | `17310` | `10094` | `/api/featured-activities/sound` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17310&bbsId=10094) |
| 18 | `meals` | 급식게시판 | `17364` | `10112` | `/api/meals` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17364&bbsId=10112) |
| 19 | `nutrition` | 영양상담 | `17371` | `10115` | `/api/nutrition` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17371&bbsId=10115) |
| 20 | `livestock` | 축산물이력표시 | `17378` | `10118` | `/api/livestock` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17378&bbsId=10118) |
| 21 | `teacher_protection` | 교육활동침해 예방교육계획 | `17381` | `10120` | `/api/education-protection` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17381&bbsId=10120) |
| 22 | `employment_status` | 취업현황 | `17400` | `10131` | `/api/employment-status` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17400&bbsId=10131) |
| 23 | `employment_resources` | 취업자료 | `17404` | `10133` | `/api/employment-resources` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17404&bbsId=10133) |
| 24 | `career_resources` | 진로진학자료 | `17413` | `10136` | `/api/career-resources` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17413&bbsId=10136) |
| 25 | `curriculum_general` | 교과자료실 / 보통교과 | `17438` | `10155` | `/api/curriculum/general` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17438&bbsId=10155) |
| 26 | `curriculum_beauty` | 교과자료실 / 뷰티아트과 | `17441` | `10158` | `/api/curriculum/beauty` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17441&bbsId=10158) |
| 27 | `curriculum_character` | 교과자료실 / 캐릭터창작과 | `17446` | `10160` | `/api/curriculum/character` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17446&bbsId=10160) |
| 28 | `curriculum_visual` | 교과자료실 / 시각디자인과 | `17450` | `10163` | `/api/curriculum/visual` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17450&bbsId=10163) |
| 29 | `curriculum_bigdata` | 교과자료실 / 빅데이터정보과 | `17457` | `10169` | `/api/curriculum/bigdata` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17457&bbsId=10169) |
| 30 | `curriculum_smart` | 교과자료실 / 스마트제어과 | `17465` | `10176` | `/api/curriculum/smart` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17465&bbsId=10176) |
| 31 | `curriculum_sound` | 교과자료실 / 사운드디자인과 | `17470` | `10179` | `/api/curriculum/sound` | [RSS](https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17470&bbsId=10179) |

- 이 표의 **23개 신규 원본**은 [JSON 입력값/계층/경로 설정](../config/rss-catalog-31.json)에 별도로 정규화해 보존했다.
- 각 RSS의 `item`이 없으면 `count: 0`으로 표시한다. 빈 피드는 통합 API 실패로 처리하지 않는다.
- 학교 공개 게시물 원문으로 이동하는 URL은 `https://hanbom-h.goesw.kr`만 허용한다. RSS를 가져오는 URL은 위 표에서 고정하며 사용자 입력을 그대로 fetch하지 않는다.

## 인터페이스와 정보 구조

HTML/CSS/JavaScript는 `worker.mjs`의 서버 응답 템플릿으로 제공한다.

- 기존 `한봄고 홈페이지 공지사항 MCP` H1, 배달의민족 Juache CDN, #fff 배경, 모노톤 pill, 가운데 정렬 제목 목록을 유지.
- 한 화면에 31개 pill을 무분별하게 배치하지 않고 **일반 게시판 18개 + 전체 보기 + 학교특색활동·교과자료실 그룹 = 20개 최상위 pill**.
- **학교특색활동 선택 시** 보조 pill 8개: 전체 보기, 학교특색활동 본 게시판, 뷰티아트과, 캐릭터창작과, 시각디자인과, 빅데이터정보과, 스마트제어과, 사운드디자인과.
- **교과자료실 선택 시** 보조 pill 8개: 전체 보기, 보통교과, 뷰티아트과, 캐릭터창작과, 시각디자인과, 빅데이터정보과, 스마트제어과, 사운드디자인과.
- 보조 pill에서 학과를 선택하면 그 학과의 해당 소속 RSS만 보이며 최상위 그룹 pill 선택 상태는 유지된다.
- hover 스타일과 애니메이션은 없다. 키보드 `focus-visible` 외곽선만 접근성을 위해 유지한다.
- 초기 화면은 `GET /api/posts?limit=all`을 **1회** 호출해 모든 게시물을 받아 클라이언트에서 필터링한다. 기존 방식처럼 RSS마다 브라우저가 31개 HTTP 요청을 날리지 않는다.
- 한 소스가 실패하면 정상 게시물은 그대로 보여주고, 실패한 게시판에서만 오류 문구를 표시한다. 게시물 자체가 0건이면 `표시할 게시물이 없습니다.`.

## Cloudflare Workers Free 호출 제한 대응

Cloudflare 공식 [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) 기준 무료 Worker 외부 subrequest 한도는 호출당 50이고 **Cache API match/put도 동일한 quota에 포함**된다.

기존 `readFeed()`를 전체 31개에 그대로 사용하면 콜드캐시에서 **31 Cache match + 31 origin fetch + 31 Cache put = 93회**로 초과할 수 있다.

새 방식:

1. **개별 RSS 요청:** 종전처럼 피드별 cache 조회·원본 fetch·cache 저장, TTL 180초.
2. **`all` 또는 상위 그룹 요청:** 집계 결과에 대한 단일 `caches.default` 키 사용. Cache miss 때 개별 RSS에서는 Cache API를 건너뛰고 origin fetch. 전체 콜드 요청 기준 **1 Cache match + 31 fetch + 1 Cache put = 33회**로 설계.
3. `features`·`curriculum` 그룹은 각 7개 원본만 요청해 더 가볍게 처리.
4. 모든 source request는 `redirect:"manual"`, timeout 12초, source 700KB 제한, 가능한 수집을 유지하는 `Promise.allSettled`를 사용.
5. 모든 소스가 실패하면 502, 일부가 실패하면 `partial:true`와 `failed_feeds` 및 정상 소스 `sources` 메타데이터 반환. 오류를 숨기거나 데이터를 날조하지 않는다.

31개 소스를 매 3분마다 업데이트할 때 학교 서버 부하/반응속도 및 Cloudflare 호출 수가 증가할 수 있으므로, 트래픽이 늘어나면 Cloudflare D1/KV 영구 캐시나 cron 수집으로 이전을 권고한다. 이 커밋에서 D1/KV를 새로 만들지는 않는다.

## REST API

| 기능 | 입력 | 설명 |
|---|---|---|
| 전체 `/api/posts?limit=all` | `limit=all` | 31개 소스 전체 RSS item 반환 (개별 최대 100건) |
| 개별 `/api/feed?category=<id>` | 게시판 ID | 31개 중 한 게시판 선택 |
| 그룹 `/api/feed?category=features` | `features` | 학교특색활동 본 게시판 + 산하 학과 6개 |
| 그룹 `/api/feed?category=curriculum` | `curriculum` | 보통교과 + 학과별 자료실 6개 |
| 개별 REST | 위 입력값 표의 `route` | 게시판별 직접 경로, 기존 8개 경로 유지 |
| 통합 검색 `/api/search?q=...&category=all` | q, category, limit | 전체/그룹/개별 검색 |
| 상태 `/api/status?category=all` | category | count·sources·partial·failed_feeds |
| 카탈로그 `/api/catalog` 또는 `/api/meta` | 없음 | source_count, FEEDS, GROUPS, EXTRA_BOARD_CATALOG, API_ROUTES |
| MCP `POST /mcp` | JSON-RPC 2.0 | Stateless Streamable HTTP 원격 MCP |

기존 `/api/posts`는 기본 20개만 반환하는 동작을 보존했으며, 새로운 `limit=all`로 전체 목록을 요청할 수 있다.

## MCP 총 67개 도구

기존 19개 이름을 변경하지 않았다. **신규 전용 조회·검색 도구 46개(23×2)**와 범용 `get_board_posts({category,limit?})`, `search_board_posts({category,query,limit?})` 2개를 추가해 총 **67개**다.

| 신규 RSS | 조회 도구 | 검색 도구 | category |
|---|---|---|---|
| 봉사활동 | `get_volunteer_posts` | `search_volunteer_posts` | `volunteer` |
| 방과후학교 | `get_after_school_posts` | `search_after_school_posts` | `after_school` |
| 학교특색활동 / 학교특색활동 | `get_feature_main_posts` | `search_feature_main_posts` | `feature_main` |
| 학교특색활동 / 뷰티아트과 | `get_feature_beauty_posts` | `search_feature_beauty_posts` | `feature_beauty` |
| 학교특색활동 / 캐릭터창작과 | `get_feature_character_posts` | `search_feature_character_posts` | `feature_character` |
| 학교특색활동 / 시각디자인과 | `get_feature_visual_posts` | `search_feature_visual_posts` | `feature_visual` |
| 학교특색활동 / 빅데이터정보과 | `get_feature_bigdata_posts` | `search_feature_bigdata_posts` | `feature_bigdata` |
| 학교특색활동 / 스마트제어과 | `get_feature_smart_posts` | `search_feature_smart_posts` | `feature_smart` |
| 학교특색활동 / 사운드디자인과 | `get_feature_sound_posts` | `search_feature_sound_posts` | `feature_sound` |
| 급식게시판 | `get_meals_posts` | `search_meals_posts` | `meals` |
| 영양상담 | `get_nutrition_posts` | `search_nutrition_posts` | `nutrition` |
| 축산물이력표시 | `get_livestock_posts` | `search_livestock_posts` | `livestock` |
| 교육활동침해 예방교육계획 | `get_teacher_protection_posts` | `search_teacher_protection_posts` | `teacher_protection` |
| 취업현황 | `get_employment_status_posts` | `search_employment_status_posts` | `employment_status` |
| 취업자료 | `get_employment_resources_posts` | `search_employment_resources_posts` | `employment_resources` |
| 진로진학자료 | `get_career_resources_posts` | `search_career_resources_posts` | `career_resources` |
| 교과자료실 / 보통교과 | `get_curriculum_general_posts` | `search_curriculum_general_posts` | `curriculum_general` |
| 교과자료실 / 뷰티아트과 | `get_curriculum_beauty_posts` | `search_curriculum_beauty_posts` | `curriculum_beauty` |
| 교과자료실 / 캐릭터창작과 | `get_curriculum_character_posts` | `search_curriculum_character_posts` | `curriculum_character` |
| 교과자료실 / 시각디자인과 | `get_curriculum_visual_posts` | `search_curriculum_visual_posts` | `curriculum_visual` |
| 교과자료실 / 빅데이터정보과 | `get_curriculum_bigdata_posts` | `search_curriculum_bigdata_posts` | `curriculum_bigdata` |
| 교과자료실 / 스마트제어과 | `get_curriculum_smart_posts` | `search_curriculum_smart_posts` | `curriculum_smart` |
| 교과자료실 / 사운드디자인과 | `get_curriculum_sound_posts` | `search_curriculum_sound_posts` | `curriculum_sound` |

기본 연결값은 바뀌지 않는다: `https://data.hanbom.rhee.life/mcp`, `Streamable HTTP`, `Authentication: None`.

## 보안 및 라이선스 유의사항

- 이 서비스는 학교 공식 시스템이 아닌 비공식 학생 제작 오픈 프로젝트다.
- 공개 RSS만 조회하며 로그인·비공개 문서·학교 내부 관리자 권한을 요구하지 않는다.
- H1에 쓰는 Juache CDN만 외부 font-src 허용, 제목은 DOM `textContent`로만 삽입해 XSS를 방지.
- Cloudflare Access의 과거 3개 앱·2개 정책은 보존된 비활성 호스트에 남긴다. 운영 도메인은 공개 상태를 유지.
- 학교 원문에 저작권·개인정보가 포함될 수 있으므로 데이터는 출처 링크를 동반하며 원문을 자동 재배포하는 범위를 확장하지 않는다.

## 검증과 배포

작업 브랜치: `feat/rss-31-board-expansion`. 단위·회귀 검사 후 `main`에 반영하면 Cloudflare Workers Builds가 `npm run check` 및 `npm run deploy`를 자동 실행한다. **GitHub Actions는 사용하지 않는다.**

실제 빌드 결과·소스별 성공/실패·직접 HTTP 검증·최종 커밋은 배포 후 확인된 사실만 추가 기록한다.
