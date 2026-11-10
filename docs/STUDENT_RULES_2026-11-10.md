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
