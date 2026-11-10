# 한봄 NEWS RSS 통합 — 2026-11-10

## 변경 요약

학교 홈페이지 한봄 NEWS RSS를 기존 공지사항·가정통신문에 추가하고 UI 필터·REST·MCP를 확장함.

### 원천 RSS 3개

| 유형 | category | 출처 |
| --- | --- | --- |
| 공지 사항 | `notice` | `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062` |
| 가정통신문 | `letter` | `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17252&bbsId=10063` |
| 한봄 NEWS | `news` | `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17187&bbsId=10022` |

## UI

- 기존 제목 `한봄고 홈페이지 공지사항 MCP`와 배달의민족 주아체 유지.
- `전체 보기`(기본), `공지 사항`, `가정통신문`, `한봄 NEWS` pill 4개.
- 선택 상태를 무채색(검정 바탕)으로 표시. 호버 색상·그림자·애니메이션 효과 없음.
- 화이트 배경, 중앙 정렬 제목 목록, 학교 공식 원문 링크 유지.
- 초기 세 종류 RSS를 병렬 호출하며 각 카테고리를 개별 캐시.
- 전체 탭은 모든 유형을 게시일 내림차순으로 합산. 데이터가 들어오는 대로 목록 갱신.

## REST

- 신규: `GET /api/news?limit=20&q=검색어`.
- 기존: `/api/notices` 공지 전용, `/api/letters` 가정통신문 전용, `/api/posts` 전체, `/api/feed?category=...`, `/api/search?q=...&category=...`, `/api/status?category=...`, `/api/meta`.
- category는 `notice`, `letter`, `news`, `all`의 네 값만 허용.
- 기존 기본 category(`notice`)는 하위호환을 위해 유지.
- `all` 조회는 세 소스 각각을 별도 fetch 후 병합하고 하나 또는 두 소스가 실패하면 `partial`과 `failed_feeds`로 실패 사실을 표시. 모두 실패하면 오류.
- 원본 URL 고정, 각 cache 180초, source per-request 700KB 제한, 12초 timeout, redirect 수동 차단.

## MCP

기존 7개 도구를 유지하고 신규 2개 추가:

- `get_school_news({limit?})`: 최신 한봄 NEWS 제목 및 원문 링크 등.
- `search_school_news({query, limit?})`: 한봄 NEWS RSS 검색.
- `get_school_feed_status({category:'news'})` 기존 메서드의 입력 확장.
- 기존 `get_all_school_posts`, `search_all_school_posts`는 이제 NEWS도 포함.

URL `https://data.hanbom.rhee.life/mcp`, Streamable HTTP, 공개 무인증. 기존 ChatGPT 앱의 도구 목록 캐시를 새로 고쳐야 추가한 두 도구가 표시될 수 있음.

## 배포·접근정책

- GitHub `hslcrb/mcp-for-hanbom`의 `main`을 Cloudflare Workers Builds가 자동 배포. GitHub Actions 사용 안 함.
- Worker: `mcp-for-hanbom`, custom domain: `data.hanbom.rhee.life`.
- 사이트/API/MCP 공개 유지. Cloudflare Access 이전 설정은 별도 보관 중이며 이번 변경에서 손대지 않음.

## 검증 상태

로컬 Node 테스트 및 Workers Builds 성공 여부, 프로덕션 `/api/news`, `/api/posts`, MCP `tools/list` 응답을 확인하고 이 파일에 실제 검증 결과를 추가 기록한다.
