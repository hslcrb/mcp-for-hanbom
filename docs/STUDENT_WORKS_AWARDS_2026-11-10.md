# 한봄고 — 학생작품 및 수상내역 RSS 통합 개발 기록

2026-11-10

## 요청 및 원본

- 요청: 기존 HANBOM DATA에 학교 홈페이지 '학생작품 및 수상내역' RSS 지원 추가.
- 피드: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17172&bbsId=10010`.
- 이전 `notice`, `letter`, `news` 자료 출처는 모두 유지.

## UI

- H1 `한봄고 홈페이지 공지사항 MCP`와 주아체 유지.
- 카테고리 pill: `전체 보기`, `공지 사항`, `가정통신문`, `한봄 NEWS`, `학생작품 및 수상내역` — 총 다섯 개.
- 기존 배경 순백색, 중앙 목록 정렬, 무채색 pill/호버 무효 유지.
- 초기 네 피드를 병렬로 조회하며 각 피드를 개별 cache.
- '전체 보기'는 네 피드 게시물을 `published_at` 기준 최신순 병합. 뉴스/수상 유형별 원본 URL은 `hanbom-h.goesw.kr`만 허용.
- 외부 게시물 제목은 HTML 삽입 없이 DOM `textContent`로 삽입.

## REST

- 새 경로: `GET /api/awards?limit=20&q=`.
- 기존 경로: `/api/notices`, `/api/letters`, `/api/news`, `/api/posts`, `/api/feed`, `/api/search`, `/api/status`, `/api/meta` 모두 유지.
- 새 `category=awards`, 현재 지원 유형: `notice`, `letter`, `news`, `awards`, `all`.
- `/api/posts`에서 네 RSS 통합 조회. 한 소스가 실패해도 부분 결과와 `partial`, `failed_feeds` 표기; 네 소스 모두 실패 시 오류.
- 상류 도메인 하드코딩·리다이렉트 거부·12초 제한·700KB 사이즈 상한·3분 POP별 캐시 유지.

## MCP

- 기존 9개 MCP 도구 유지.
- 추가: `get_student_works_awards({limit?})` 및 `search_student_works_awards({query,limit?})`.
- `get_school_feed_status({category:'awards'})` 지원. 통합 도구가 자동으로 네 유형 모두 반환.
- MCP 서버: `https://data.hanbom.rhee.life/mcp` (공개 무인증, OAuth 미구현).

## Cloudflare 및 배포

- Worker `mcp-for-hanbom`, 도메인 `data.hanbom.rhee.life` 유지.
- GitHub `hslcrb/mcp-for-hanbom` 기본 `main`에서 Cloudflare Workers Builds가 빌드·배포. GitHub Actions 없음.
- 전체 공개 운영. Cloudflare Access 보호 앱·정책은 별도 보관 중이며 이번 작업에서 변경하지 않음.

## 시험 시나리오

- Node 테스트: RSS parser가 `awards` 카테고리와 정확한 학교 원문 URL·출처를 반환.
- 4개의 다른 날짜를 가진 피드를 통합하면 날짜순으로 정렬.
- REST `/api/awards`, `/api/posts`, `/api/feed?category=awards`, 검색·상태 경로가 작동하며 기존 3개 전용 경로 유지.
- MCP `tools/list`에 새 도구와 기존 도구가 모두 존재하고, `tools/call`에서 실제 `awards` category가 반환되며 잘못된 인수 거부.
- Cloudflare 빌드 로그와 실제 RSS 응답은 배포 이후 별도 확인.
