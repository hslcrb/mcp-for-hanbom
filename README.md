# HANBOM DATA — 학교 RSS 데이터 허브

## 2026-11-11 · 다크모드 추가 (v2.1.0)

- **자동(시스템 설정) / 라이트 / 다크** 3가지 테마 선택. 자동이 기본값이며 선택값을 저장할 수 있습니다.
- 본문·pill·테두리·선택 상태·포커스 링을 CSS 변수로 관리하며 기존 화이트 디자인도 유지.
- 새 컴포넌트 `ui/theme-components.mjs`, 초기 테마 및 브라우저 선택 처리 `ui/theme-client.mjs`.
- **82개 RSS·68개 MCP 도구·129개 pill·3 shard·메인 브랜치 Cloudflare 자동 배포** 구조는 그대로.
- [다크모드 구현·배포·테스트 기록](docs/DARK_MODE_2026-11-11.md).


## 2026-11-11 · Pill 컴포넌트 리팩터링

- `PillButton`, `PillGroup`, `PillNavigation`으로 기존 **129개 버튼을 재사용 가능한 컴포넌트**에서 생성.
- `<hanbom-pill>` Custom Element + native `button` 선택 상태, 단일 위임 이벤트 처리.
- Flex-wrap pill 레이아웃 + Grid 콘텐츠 레이아웃, 작은 화면에서 텍스트 줄바꿈 지원.
- 기존 82개 게시판·23개 메뉴·RSS·REST·MCP·Cloudflare 자동 배포와 디자인은 유지.
- [컴포넌트 설계·검증 기록](docs/PILL_COMPONENT_REFACTOR_2026-11-11.md).


> **현재 운영 상태 (2026-11-11): RSS 82종 · 23개 메뉴 · 3개 무료 플랜 호환 분할 조회 · MCP 68개 도구 · 전체 공개.** 기존 31개 및 GitHub main 자동배포·Cloudflare Access 복구용 설정은 유지됩니다. 전체 RSS 등록값은 [RSS 82종 개발기](docs/RSS_82_IMPLEMENTATION_2026-11-11.md)와 [원본 카탈로그](config/rss-catalog-82.json)를 참고하세요.

## 현재 버전 v2.1.0

- 학교 공식 공개 RSS **82개(기존 31 + 신규 51)**를 파일 원문에 적힌 **23개 상위 메뉴**로 분류.
- 홈은 기존 흰 배경·주아체·본문 중앙 정렬을 유지하고, 23개 상위 pill 아래에서 각 소속 게시판을 하위 pill로 선택.
- [전체 게시판 카탈로그](https://data.hanbom.rhee.life/api/catalog), [전체 첫 페이지](https://data.hanbom.rhee.life/api/posts?shard=0&limit=all), 나머지 `shard=1,2`까지 합쳐 전체 82개 조회.
- **한 요청에서 82개를 모두 가져오지 않습니다.** Cloudflare Workers Free 외부 subrequest 50개 제한을 피해 28/28/26개의 3개 shard로 나누고, 브라우저가 이 데이터를 합쳐 보여줍니다.
- REST 직접 경로 82개, MCP 기존 67개 + 카탈로그 조회 1개 = **68개 도구**. 새로운 51개도 기존 `get_board_posts`/`search_board_posts`의 category 선택으로 검색 가능.
- 공개 상담·민원 게시물은 개인정보 최소 노출을 위해 제목·요약을 보호 처리합니다.
- Worker 인증은 현재 None; GitHub Actions 없이 `main` 커밋 → Cloudflare Workers Builds 자동 배포.


> **현재 운영 상태 (2026-11-10): 전체 공개 · Cloudflare Access 비적용.** 대시보드, REST, MCP 모두 로그인 없이 접근할 수 있습니다. 예전 소유자 전용 정책과 공개 Bypass 정책은 삭제하지 않고 별도 Access 앱에 연결해 보존했습니다. 재보호 방법: [Access 일시 해제·복구 문서](docs/ACCESS_SUSPENSION_2026-11-10.md).

> **비공식 학생 개발 프로젝트** · 한봄고등학교의 공개 RSS 게시판 **82종**을 REST API, 원격 MCP, 공개 대시보드로 연결하는 Cloudflare Workers 서비스.

## 현행 31개 RSS 데이터 허브 — 2026-11-10 (이전 버전 기록)

**기존 8개 + 신규 23개 = 총 31개 공식 RSS 게시판**을 지원한다. 학과별로 이름이 중복되는 학교특색활동과 교과자료실은 상위 그룹/하위 필터로 구분한다. 초기 UI에는 20개의 최상위 pill이 나타나며 그룹을 선택하면 8개 하위 필터가 열린다. 화면은 기존 순백색·Juache 제목·중앙 정렬 텍스트 목록 그대로다.

- [31개 RSS 원본 주소·입력값·경로·도구 목록](docs/RSS_31_IMPLEMENTATION_2026-11-10.md)
- [23개 신규 RSS 카탈로그 JSON](config/rss-catalog-31.json)
- [API 메타데이터](https://data.hanbom.rhee.life/api/catalog) · [모든 게시물](https://data.hanbom.rhee.life/api/posts?limit=all)
- **REST:** 신규 23개 직접 경로, 기존 8개 API 하위호환, `/api/feed?category=<id>`와 집계 `category=features|curriculum|all`.
- **MCP:** 기존 19개 + 신규 전용 46개 + 범용 2개 = **67개 도구**. 기존 `/mcp` URL 및 `None` 인증 유지.
- **무료 플랜 안정화:** 전체 조회는 31개 개별 캐시가 아닌 단일 집계 캐시를 사용해 호출 한도를 피하도록 설계.
- Cloudflare Access 정책은 보관 상태, 서비스는 여전히 공개 읽기 전용. **GitHub Actions 미사용**, `main` → Cloudflare Workers Builds 자동 배포.

## 서비스 주소 (Canonical)

| 항목 | URL | 접근 정책 |
| --- | --- | --- |
| 공개 대시보드 | https://data.hanbom.rhee.life/ | **누구나 (Access 일시 해제)** |
| REST 공지 | https://data.hanbom.rhee.life/api/notices | 모두 공개, 읽기 전용 |
| 가정통신문 | https://data.hanbom.rhee.life/api/letters | 모두 공개, 읽기 전용 |
| 가정통신문(교육청) | https://data.hanbom.rhee.life/api/education-letters | 모두 공개, 읽기 전용 |
| 공모전 및 모집공고 | https://data.hanbom.rhee.life/api/opportunities | 모두 공개, 읽기 전용 |
| 보건알림 | https://data.hanbom.rhee.life/api/health-notices | 모두 공개, 읽기 전용 |
| 학생생활규정게시판 | https://data.hanbom.rhee.life/api/student-rules | 모두 공개, 읽기 전용 |
| 한봄 NEWS | https://data.hanbom.rhee.life/api/news | 모두 공개, 읽기 전용 |
| 통합 보기 | https://data.hanbom.rhee.life/api/posts | 모두 공개, 읽기 전용 |
| REST 검색 | https://data.hanbom.rhee.life/api/search?q=입학 | 모두 공개, 읽기 전용 |
| REST 상태 | https://data.hanbom.rhee.life/api/status | 모두 공개, 읽기 전용 |
| API 메타데이터 | https://data.hanbom.rhee.life/api/meta | 모두 공개, 읽기 전용 |
| MCP endpoint | **https://data.hanbom.rhee.life/mcp** | 모두 공개, 읽기 전용 |

**2026-11-10 도메인 변경:** 예전 `hanbom.rhee.life`는 폐기 대상으로, 신규 정식 주소 `data.hanbom.rhee.life`만 사용합니다. 기존 주소로 플러그인을 등록하지 마세요.

## 데이터 출처

- 공지 사항 RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062
- 가정통신문 RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17252&bbsId=10063
- 가정통신문(교육청) RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17254&bbsId=10064&bbsTy=HCNOTIE
- 공모전 및 모집공고 RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17255&bbsId=10065
- 보건알림 RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17256&bbsId=10066
- 학생생활규정게시판 RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17273&bbsId=10074
- 한봄 NEWS RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17187&bbsId=10022
- 학교 홈페이지: https://hanbom-h.goesw.kr/
- RSS에 노출된 공지 일부만 조회할 수 있습니다. 전체 공지 및 첨부파일은 반드시 공식 원문에서 확인해야 합니다.

## 기능 및 MCP

- Worker 하나로 RSS·REST·Stateless MCP(Streamable HTTP JSON-RPC)·반응형 개인 대시보드 운영.
- REST: GET `/api/notices`, `/api/letters`, `/api/education-letters`, `/api/news`, `/api/awards`, `/api/posts`, `/api/feed?category=all|notice|letter|news|awards|office_letter`, `/api/search?q=...&category=all`, `/api/status?category=all`, `/api/meta`.
- MCP: POST `/mcp` (`initialize`, `ping`, `tools/list`, `tools/call`). **31개 게시판용 읽기 전용 도구 67개** 제공. [전체 카탈로그](docs/RSS_31_IMPLEMENTATION_2026-11-10.md)
- 상류 URL 고정, 3분 단위 Cloudflare edge 캐시, 700KB 응답 상한, 요청 타임아웃, 실패 시 오류 표시.
- 공개 쓰기 기능·학생 개인정보 취득·학교 홈페이지 변경 기능 없음.

## 보안과 인증

**2026-11-10 이후 현재 상태: 전체 공개.** 아래의 기존 제한사항은 일시 해제됐으며, 복구를 위한 정책 템플릿으로만 유지됩니다. [복구 가이드](docs/ACCESS_SUSPENSION_2026-11-10.md)를 참고하세요.

- [일시 해제] 대시보드 `/`를 보호하던 Cloudflare Access 단일 이메일 정책. 현재 로그인 불필요.
- [일시 해제] `/mcp`와 `/api/*`의 Cloudflare Access Bypass 정책. 현재 Access 자체를 적용하지 않으며 두 서비스는 공개 유지.
- 대시보드의 이전 인증 헤더 검사는 **현재 주석 처리**해 실행되지 않습니다. 재보호 시 Cloudflare Access 앱을 복원한 뒤 필요하면 보조 검사도 활성화합니다.
- `workers.dev` 비활성화, Preview URLs 비활성화, Preview builds 비활성화.
- 현재 MCP는 **인증 없는 공개 접근**입니다. OAuth 2.1/PKCE는 아직 구현되지 않았으며, 등록 화면에서 OAuth를 선택하면 안 됩니다.

## GitHub Actions 없는 main 자동 배포

- GitHub 저장소: https://github.com/hslcrb/mcp-for-hanbom
- Production branch: `main` / Root directory: `/`.
- Build command: `npm run check`; Deploy command: `npm run deploy`.
- Provider: GitHub → Cloudflare Workers Builds (**GitHub Actions, .github/workflows 미사용**).
- Worker name: `mcp-for-hanbom` / Custom domain: `data.hanbom.rhee.life`.

## 로컬 작업

```bash
npm install
npm run check
npm run dev
```

## 프로젝트 운영 문서

- [ChatGPT Plugins 등록 입력값 및 테스트](docs/CHATGPT_PLUGINS_REGISTRATION.md)
- [Cloudflare Workers Builds 배포·운영 매뉴얼](docs/DEPLOYMENT.md)
- [대시보드·REST·MCP 접근 제어](docs/ACCESS_SECURITY.md)
- [도메인 이전 기록 — 2026-11-10](docs/DOMAIN_MIGRATION_2026-11-10.md)
- [개발·구축·검증 기술기 — 2026-11-10](docs/BUILD_HISTORY_2026-11-10.md)

## 책임 고지

이 프로젝트는 학교 공식 서비스가 아닙니다. 데이터·이미지·문서의 권리는 원저작자와 제공 기관에 있으며 출처를 명시합니다. 소스의 공개 여부는 학교 데이터 재배포 허가를 뜻하지 않습니다.

## 2026-11-10 — Pure white list redesign

- 루트 대시보드는 백색 배경과 중앙 정렬된 공지 제목 목록만 표시합니다.
- 헤더, 로고, 통계, 검색 입력, 버튼, 게시물 날짜·요약, 푸터, 카드, 구분선을 제거했습니다.
- 호버와 방문 상태에서 색·밑줄·크기·투명도가 바뀌지 않으며 키보드 포커스 외곽선만 유지합니다.
- 공개 API, MCP, 개인용 Access, data.hanbom.rhee.life, GitHub main 자동 배포는 유지합니다.
- 자세한 사항: docs/UI_MINIMAL_2026-11-10.md

## 2026-11-10 · 주아체 제목 추가

- 루트의 공지 리스트 **위에** `<h1>한봄고 공지사항 MCP</h1>` 한 줄만 추가했습니다.
- 글꼴: 배달의민족 주아체, `Juache` — [jsDelivr Noonnu WOFF](https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.woff).
- H1만 주아체로, 아래 공지 목록은 기존 기본 서체로 유지. 기존 백색 배경/중앙 목록/링크 호버 무효 유지.
- 외부 웹폰트 로딩을 위해 HTML 응답 CSP의 `font-src https://cdn.jsdelivr.net`를 허용했습니다.
- 단일 이메일 Cloudflare Access, 공개 REST, MCP 서버, GitHub `main` 자동배포는 변경하지 않았습니다.

## 2026-11-10 · 대시보드 전면 공개 / H1 변경

- 화면 제목: **한봄고 홈페이지 공지사항 MCP** (Juache / 주아체 CDN 유지).
- Worker의 Access Assertion 인증 검사 구문은 코드 주석으로 보존하되 현재 실행하지 않습니다.
- 모든 HANBOM 전용 Access 앱 3개는 라이브 서비스 주소에서 분리하여 비활성화 상태로 보관합니다. 재사용 정책 2개도 보존합니다.
- 복구 방법 및 정책 ID: [docs/ACCESS_SUSPENSION_2026-11-10.md](docs/ACCESS_SUSPENSION_2026-11-10.md).

**실행 결과 검증 (2026-11-10):** Cloudflare Workers Builds 성공(9/9 테스트), 현재 도메인 Access 앱 0개, 보관 앱 3개·재사용 정책 2개 유지. ChatGPT MCP 호출 및 RSS 53건 확인. [복구용 머신리더블 정책 파일](config/cloudflare-access-standby.json).

## 2026-11-10 · 가정통신문 지원 및 카테고리 필터

기존 순백색·Juache H1·중앙 정렬 제목 목록을 유지하고 H1 아래에 **전체 보기 / 공지 사항 / 가정통신문** pill 버튼 3개를 추가했습니다. 기본값은 전체 보기, 클릭 즉시 목록 필터 전환. Hover 색상 변화 없음.

- 공지 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062`
- 가정통신문 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17252&bbsId=10063`
- 새 REST API: `GET /api/letters`, `GET /api/posts?limit=100`, `GET /api/feed?category=all|notice|letter`.
- `GET /api/search?q=...&category=all`, `GET /api/status?category=all` 지원. 기존 `/api/notices`는 공지 전용으로 유지.
- 새 MCP: `get_family_letters`, `search_family_letters`, `get_all_school_posts`, `search_all_school_posts`. 기존 3개 도구 유지.
- 캐시 3분, 두 RSS 개별 캐시. 전체 보기에서 날짜 기준으로 병합. 두 피드 중 하나가 장애면 정상 피드만 반환하되 `partial` 및 `failed_feeds`로 실패 사실 표기.
- 보안: 공개 읽기 전용, 기존 Cloudflare Access 보존·비활성 상태 유지. GitHub `main` → Workers Builds 자동 배포, GitHub Actions 없음.

개발기: [docs/FAMILY_LETTERS_2026-11-10.md](docs/FAMILY_LETTERS_2026-11-10.md).

## 2026-11-10 · 한봄 NEWS RSS 통합

- 공식 한봄 NEWS RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17187&bbsId=10022`.
- 필터 4개: **전체 보기 / 공지 사항 / 가정통신문 / 한봄 NEWS**. 기존 하얀 배경·주아체 제목·중앙 정렬 목록 및 호버 무효 유지.
- `전체 보기`는 공지·가정통신문·NEWS 최신 게시물을 게시일 기준 내림차순 합산.
- REST 신규: `GET /api/news?limit=20&q=`. 기존 `/api/notices`, `/api/letters`, `/api/posts` 유지.
- `/api/feed`, `/api/search`, `/api/status`에서 `category=news` 지원.
- MCP 신규 도구: `get_school_news`, `search_school_news` (기존 7개 유지, 총 9개). `get_school_feed_status`의 `category=news`도 지원.
- 원본 RSS는 학교 홈페이지에 귀속. 전체 공개 읽기 전용·Access 보관·GitHub `main` 자동배포 유지, GitHub Actions 없음.
- [통합 개발 및 검증 기록](docs/HANBOM_NEWS_2026-11-10.md).

## 2026-11-10 · 학생작품 및 수상내역 RSS 추가

- 새 공식 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17172&bbsId=10010`.
- 화면 pill 5개: **전체 보기 / 공지 사항 / 가정통신문 / 한봄 NEWS / 학생작품 및 수상내역**.
- 새 REST API: `GET /api/awards?limit=20&q=`. 기존 `/api/notices`, `/api/letters`, `/api/news`, `/api/posts` 모두 유지.
- `/api/feed?category=awards`, `/api/search?q=...&category=awards`, `/api/status?category=awards` 지원.
- 전체 보기에서는 네 피드를 날짜순으로 병합하며 어느 하나가 실패해도 가능한 나머지 결과를 반환하고 실패 내역을 명시.
- 새 MCP 도구: `get_student_works_awards`, `search_student_works_awards`. 이전 9개 유지 → 총 11개.
- 순백색 바탕·주아체 H1·모노톤 pill 및 호버효과 제거 유지. 현재 인증 없는 공개 서비스 및 복구용 Cloudflare Access 백업 유지.
- GitHub Actions 없이 `main` → Cloudflare Workers Builds 자동 배포.
- [학생작품·수상 RSS 개발 기록](docs/STUDENT_WORKS_AWARDS_2026-11-10.md).

## 2026-11-10 · 가정통신문(교육청) 지원

- 추가 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17254&bbsId=10064&bbsTy=HCNOTIE`.
- UI pill 여섯 개: `전체 보기`, `공지 사항`, `가정통신문`, `한봄 NEWS`, `학생작품 및 수상내역`, `가정통신문(교육청)`.
- 새 REST `GET /api/education-letters?limit=20&q=`, 기존 REST 경로 그대로 유지.
- 카테고리 `office_letter`를 `GET /api/feed`, `/api/search`, `/api/status`에 추가. `/api/posts`는 5개 피드를 날짜순으로 합침.
- 새 MCP `get_education_office_letters`, `search_education_office_letters`. 기존 11개는 삭제하지 않아 **총 13개**.
- 180초 개별 RSS 캐시·읽기 전용·전체 공개·기존 Access 앱 백업 유지·GitHub Actions 없이 Cloudflare Workers Builds 배포.
- [통합 개발기 및 실측 검증 기록](docs/EDUCATION_OFFICE_LETTERS_2026-11-10.md).

## 2026-11-10 · 공모전 및 모집공고 RSS

- 공식 원본: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17255&bbsId=10065`.
- 7개 pill: `전체 보기`, `공지 사항`, `가정통신문`, `한봄 NEWS`, `학생작품 및 수상내역`, `가정통신문(교육청)`, `공모전 및 모집공고`.
- 새 API `GET /api/opportunities?limit=20&q=`, `category=opportunities` 지원. 이전 API 유지.
- MCP 신규 `get_school_opportunities`, `search_school_opportunities`; 전체 15개.
- **게시물이 없으면 정상 0건·빈 배열로 반환하며 에러나 가짜 공지를 만들지 않음.** 탭에는 `표시할 게시물이 없습니다.` 한 줄만 노출.
- 기존 순백색·주아체·공개 접근·3분 캐시·GitHub main 자동 배포 및 Access 복구 설정 그대로.
- [개발·검증 기록](docs/CONTESTS_RECRUITMENT_2026-11-10.md).

## 2026-11-10 · 보건알림 RSS 추가

- 원본 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17256&bbsId=10066`.
- 화면 pill 총 **8개**(전체 보기 + 게시판 7개). 새 `보건알림`은 선택 즉시 해당 게시물 제목만 표시.
- 새 REST API `GET /api/health-notices?limit=20&q=`. 기존 API 전체 하위호환 유지.
- `GET /api/feed?category=health`, `/api/search?q=...&category=health`, `/api/status?category=health` 지원.
- MCP 신규 `get_health_notices`, `search_health_notices` 포함 총 **17개**. `get_all_school_posts` 및 `search_all_school_posts`에도 자동 포함.
- 순백색 화면·주아체 H1·무채색 pill, 180초 RSS별 캐시·RSS 오류 격리, 공개 접근·Access 보관 설정은 그대로.
- [보건알림 통합 개발기](docs/HEALTH_NOTICES_2026-11-10.md).

## 2026-11-10 · 학생생활규정게시판 RSS 추가

- 공식 원본: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17273&bbsId=10074`.
- 화면 **9개 pill**(전체 보기 + 8개 게시판). 새 `학생생활규정게시판`은 별도 필터로 최신 생활규정 개정 게시물 조회.
- REST 신규 `GET /api/student-rules?limit=20&q=`, 카테고리 `student_rules`. 통합 조회 `/api/posts` 및 선택형 검색·상태 `/api/feed`, `/api/search`, `/api/status`에서도 지원.
- MCP `get_student_rules`, `search_student_rules` 추가 → **19개 도구**, 이전 17개 그대로 유지.
- H1 주아체·화이트·중앙 정렬 및 pill 무채색 유지, Cloudflare Access 공개 모드와 복구용 보관 설정 유지.
- GitHub Actions 없이 GitHub main → Cloudflare Workers Builds 자동 배포.
- [학생생활규정게시판 통합 개발기](docs/STUDENT_RULES_2026-11-10.md).
