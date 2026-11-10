# 한봄고 보건알림 RSS 추가 개발 기록 — 2026-11-10

## 목적과 원본

- 공식 학교 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17256&bbsId=10066`.
- 표시명 `보건알림`, 내부 category `health`.
- 기존 6개 RSS를 유지하면서 새 게시판을 일곱 번째 피드로 추가. 전체 보기와 연결.

## 웹 인터페이스

- 기존 H1 `한봄고 홈페이지 공지사항 MCP`, 주아체 웹폰트, 순백색, 가운데 정렬 제목 리스트 및 버튼 무호버 효과 유지.
- 여덟 개 pill: `전체 보기`, `공지 사항`, `가정통신문`, `한봄 NEWS`, `학생작품 및 수상내역`, `가정통신문(교육청)`, `공모전 및 모집공고`, `보건알림`.
- `보건알림`을 누르면 보건 게시물만 표시. 전체 보기는 7개 피드의 게시물을 최신순 병합.
- HTML 렌더링 시 제목은 DOM `textContent`로 안전하게 출력하고 출처 링크는 학교 HTTPS 호스트만 허용.

## API

- `GET /api/health-notices?limit=20&q=` 신규.
- `/api/feed?category=health`, `/api/search?q=...&category=health`, `/api/status?category=health` 신규 지원.
- `/api/posts` 7개 게시판 합산, 7개 중 일부 장애 시 `partial`과 `failed_feeds` 표기. 이전 전용 경로 유지.
- RSS별 180초 edge cache·고정 원천 URL·12초 timeout·700KB 응답 제한, 원본 외부 리다이렉트 차단 정책 유지.

## MCP

- `get_health_notices({limit?})`, `search_health_notices({query,limit?})` 추가.
- 기존 15개 보존, 총 17개 읽기 전용 도구. 기존 전체 조회·전체 검색에 보건알림 자동 포함.
- 등록 URL `https://data.hanbom.rhee.life/mcp`, 인증 None, OAuth 미구현.

## 배포

- GitHub `hslcrb/mcp-for-hanbom` main → Cloudflare Workers Builds. GitHub Actions 없음.
- Worker `mcp-for-hanbom`, custom domain `data.hanbom.rhee.life` 유지.
- 공개 운영. 기존 보관된 Access 앱과 정책은 전혀 변경하지 않음.

## 검증 계획

- RSS parser의 category/원문 검증, 전용 REST/전체 REST/검색/상태 확인, 새 MCP 2개 도구와 기존 도구 registry, 8개 pill 노출, 인수 오류 검증.
- Cloudflare 자동 빌드 후 실제 `/api/health-notices`와 `/api/posts` 조회 및 브라우저 화면 확인. 실측 결과는 후속 기록.
