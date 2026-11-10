# 공모전 및 모집공고 RSS 통합 개발기 — 2026-11-10

## 새 RSS

- 원본: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17255&bbsId=10065`
- 카테고리: `opportunities`, 화면 표시: `공모전 및 모집공고`.
- 원본 공개 RSS 확인 시 `<rss>`와 `<channel>`이 존재하지만 `<item>` 항목이 **0건**. 빈 피드와 장애를 구별해야 함.

## 홈페이지·API·MCP

- 기존 다섯 피드 유지, 여섯 번째 RSS로 공모전 및 모집공고 추가. 총 **7개 pill**(전체 포함).
- H1 `한봄고 홈페이지 공지사항 MCP`, 주아체·순백색·중앙 정렬·무채색 pill 및 호버 효과 없음 유지.
- 해당 탭에 게시물이 없다면 `표시할 게시물이 없습니다.`만 출력. 전체 보기에는 이전 5개 피드의 게시물이 그대로 날짜순 표시.
- API: `GET /api/opportunities?limit=20&q=`; `/api/feed?category=opportunities`, `/api/search?q=...&category=opportunities`, `/api/status?category=opportunities`.
- 정상 빈 RSS는 `count:0`, `items:[]`이며 HTTP 200. 통합 결과의 `sources`에도 `count:0`으로 포함하고 `partial:false` 유지.
- MCP: `get_school_opportunities`, `search_school_opportunities` 추가, 기존 도구 13개 유지 → 총 15개.
- 원본 공식 학교 HTTPS URL 고정, CDN/HTML 제목 주입 방지, RSS별 180초 캐시·700KB 상한·12초 타임아웃 유지.

## 운영 불변사항

- GitHub `hslcrb/mcp-for-hanbom` main → Cloudflare Workers Builds 자동 배포. GitHub Actions 없음.
- 도메인 `data.hanbom.rhee.life`, Worker `mcp-for-hanbom`.
- 모든 경로 공개 읽기 전용, 이전 Cloudflare Access 앱·정책은 복구용 보관 상태 유지.
- MCP 서버 URL `https://data.hanbom.rhee.life/mcp`, OAuth 미구현, 인증 `None`.

## 시험

- Node 테스트: item 없는 유효 RSS 파싱, 빈 API/검색/상태 응답, 통합 비오류, MCP 두 도구의 0건 정상 반환, 잘못된 인수 거부, 7개 pill 노출.
- Cloudflare 배포 후 실제 GET `/api/opportunities` 및 `/api/posts` 수집 결과 확인. 라이브 검증 결과는 추가로 기록.

## 프로덕션 실측 검증 (2026-11-10 KST)

- 기능 구현 커밋: `27e72cd1d52e0cc6189bc74c563e5ac9a3c72427`. 첫 빌드는 이전 통합 테스트의 모의 RSS가 새 피드에 가짜 1건을 추가하는 바람에 검사 1건이 실패하여 배포되지 않음.
- 테스트 데이터 수정 커밋: `02fb8da4e6a69cf45986f47764d28697eeb12e61`. 공모전 모의 RSS도 실제와 동일하게 item 없는 유효 RSS로 수정함.
- 수정 후 Cloudflare Workers Builds: `42cf21c1-f2a0-4288-9a6a-05940e96fe9b`, **success**, Node 테스트 **25/25 pass**, 실패 0.
- Wrangler 배포 로그: `data.hanbom.rhee.life (custom domain)`, `Success: Deploy command completed`.
- 배포 버전 `be4ebc9d-1b0a-417e-a37d-e6913058e8e2`, 트래픽 100% (검증 당시).
- 공개 RSS 원본을 Cloudflare Browser Rendering으로 확인: `<rss>`/`<channel>`이 있는 유효 문서이며 게시물 `item` 없음.
- 실서비스 HTTP GET `https://data.hanbom.rhee.life/api/opportunities?limit=5` 실제 성공: `category=opportunities`, `count=0`, `items=[]`, `feed_title=게시판 RSS`, 오류 없음.
- 실서비스 HTTP GET `https://data.hanbom.rhee.life/api/posts?limit=5` 실제 성공: `count=300`, `partial=false`, `failed_feeds=[]`. `sources`는 notice=53, letter=100, news=26, awards=21, office_letter=100, opportunities=0의 **6개 소스**.
- 따라서 빈 공모전 피드가 기존 300건을 소실시키거나 오류로 만들지 않음. 값은 해당 시점 RSS 수집 범위이며 학교 전체 누적 게시물 수는 아님.
- 7개 pill 텍스트·카테고리별 렌더링 데이터 경로, 빈 피드 메시지, MCP 새 도구 2개 및 기존 도구 유지 등은 Node 테스트로 확인함.
- 개별 pill 클릭을 포함한 실서비스 브라우저 상호작용 시각 검증은 별도 미실시. Cloudflare Browser Rendering을 통한 홈페이지 조회가 일시적인 **HTTP 429 rate limit**에 걸려 추가 확인은 제한됨.
- 새 MCP 도구는 서버 코드와 단위 테스트에서 확인했으나, 이미 연결한 ChatGPT 앱의 도구 스키마 재발견은 앱 연결 상태에 따라 별도 갱신이 필요할 수 있음.

## 운영 정책 유지

- Cloudflare Access 예전 정책은 보관용 호스트로 분리된 상태이며 공개 운영 유지.
- GitHub Actions 미사용. `main` → Cloudflare Workers Builds 자동 배포 유지.
- 등록 Server URL `https://data.hanbom.rhee.life/mcp`, Authentication `None` 변경 없음.
