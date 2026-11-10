# 학생생활규정게시판 RSS 지원 — 2026-11-10

## 요청·실제 원본

- 학교 공식 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17273&bbsId=10074`.
- 새 category: `student_rules`, UI 라벨은 요청에 맞춰 **학생생활규정게시판** 그대로.
- 실제 RSS 원본에는 2026학년도 학생생활규정 개정(2026.11.01), 2026학년도 학생생활규정 개정(2026.08.17) 등 게시물이 존재.

## 소프트웨어 변경

- `worker.mjs`에서 RSS feed 고정 원본 추가, 통합 source 목록 및 날짜순 정렬에 `student_rules` 포함.
- Cloudflare POP별 180초 RSS 캐시, 학교 공식 호스트 링크 검증, 응답 크기 상한 700KB 및 12초 타임아웃 유지.
- RSS parser에서 기존 item의 title·link·published_at 추출, `category=student_rules`, `category_label=학생생활규정게시판` 추가.
- 웹 H1 `한봄고 홈페이지 공지사항 MCP`는 유지하고, pill `학생생활규정게시판`을 새로 추가해 총 9개(전체 + 8 게시판).
- 기존 화이트 미니멀·주아체 제목·중앙 목록·호버 효과 없는 링크·무채색 pill 유지. 전체 보기에서 신규 게시물도 날짜 최신순 노출.

## REST

- 신규 경로: `GET /api/student-rules?limit=20&q=`.
- 기존 `/api/feed?category=student_rules`, `/api/search?q=...&category=student_rules`, `/api/status?category=student_rules` 지원 추가.
- 기존 공지 `/api/notices` 등 7개 유형 전용 주소 모두 그대로 유지. 통합 `/api/posts`는 8개 피드를 합침.
- 빈 피드는 정상 0건이며 실패한 피드는 통합 결과 `partial`과 `failed_feeds`로 표시.

## MCP

- 신규 `get_student_rules({limit?})`, `search_student_rules({query,limit?})`.
- 기존 17개 도구 유지, 총 **19개**.
- 기존 `get_school_feed_status({category:'student_rules'})` 및 통합 도구를 통해 개정 생활규정까지 조회 가능.
- URL `https://data.hanbom.rhee.life/mcp`, 인증 `None`, 읽기 전용.

## 배포·보안

- GitHub repo: `hslcrb/mcp-for-hanbom`, `main` push → Cloudflare Workers Builds.
- Worker: `mcp-for-hanbom`; custom domain: `data.hanbom.rhee.life`.
- GitHub Actions 사용하지 않음. 사이트와 REST/MCP 전체 공개, 이전 Cloudflare Access 앱/정책은 보존 상태 그대로 유지.

## 검증

- Node 테스트에서 공식 상대 경로 URL을 정확한 HTTPS 학교 주소로 정규화하는지 확인.
- RSS 새 category, 단일·통합 API, 검색·상태, MCP 신규 도구 2개, 9개 pill 및 이전 기능 유지 검사.
- 프로덕션 배포 결과와 실제 RSS 수신·브라우저 화면 검증은 다음 섹션에 기록.

## 실제 배포 및 운영 검증 — 2026-11-10 (KST)

- 구현 커밋: `8203ca5b90d444ee6a08c2f616b9bd1fdd2678a2`.
- Cloudflare Workers Builds 빌드 ID: `54cceaf8-29e5-4e9a-95b2-0533c8c4b4f3`; 빌드 결과 `success`.
- `npm run check`의 Node 검사 **31/31 pass**, 실패 0. `npm run deploy`의 `data.hanbom.rhee.life (custom domain)` 및 배포 성공 메시지 확인.
- 배포 당시 프로덕션 Worker version `57021589-0957-423c-9c7e-23bf784c4f23`, 100% 트래픽.
- Cloudflare Browser Rendering을 통해 실제 HTTPS GET `https://data.hanbom.rhee.life/api/student-rules?limit=8` 성공, `category=student_rules`, `count=2` 확인.
- 두 게시물: `2026학년도 학생생활규정 개정(2026.11.01)` (`nttSn=595854`, `mi=17273`) 및 `2026학년도 학생생활규정 개정(2026.08.17)` (`nttSn=579301`, `mi=17273`). 공식 학교 게시물 URL을 반환함.
- 실제 HTTPS GET `https://data.hanbom.rhee.life/api/posts?limit=5`: **`count=303`, `partial=false`, `failed_feeds=[]`**.
- 통합 소스별 개수: `notice=53`, `letter=100`, `news=26`, `awards=21`, `office_letter=100`, `opportunities=0`, `health=1`, `student_rules=2`. 전체 303건은 이 시점 RSS 수집 범위이고 일부 피드는 100건 제한이 있음.
- Cloudflare Browser Rendering으로 운영 홈페이지 `https://data.hanbom.rhee.life/`를 렌더링하고 기존 주아체 H1, **9개 pill의 모든 라벨**, 전체 목록 내 새 생활규정 개정 게시물 노출 확인.
- 단, pill을 마우스로 클릭한 브라우저 상호작용 실측은 별도 수행하지 않았음. 필터 렌더링/백엔드 전용 경로 및 MCP 도구 노출은 Node 테스트로 검증.
- 신규 MCP 도구 `get_student_rules`, `search_student_rules`를 서버에 추가했고 기존 17개 도구와 하위호환 유지(총 19개). 이미 연결된 ChatGPT 앱에는 도구 목록 갱신이 필요할 수 있음.
- 운영 Cloudflare Access 보관 정책 변경 없음. 모든 정보는 비공식 학생 개발 서비스에서 학교 공식 RSS 출처 링크와 함께 제공.
