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
