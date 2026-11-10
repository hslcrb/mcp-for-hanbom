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

## 프로덕션 실측 결과 (2026-11-10 KST)

- 최초 구현 커밋: `441e901ea244f2281dc539b6c737a56cfb0387ad`. 이 빌드는 이전 교육청 피드 통합 테스트의 mock이 새 health RSS에 1건을 잘못 넣어 **28개 테스트 중 1개 실패**, 따라서 배포되지 않음.
- 통합 테스트 데이터 수정 커밋: `2cbf6f040bd6e3091707aaac3086b112f6373a29` (기존 mock에서는 보건알림 RSS를 item 없는 정상 RSS로 응답시키도록 수정).
- Cloudflare Workers Builds ID: `2e05d195-b012-4a65-b12e-d04c156bcec9`.
- 이후 Cloudflare 자동 빌드 **success**, Node 검사 **28/28 통과**, 실패 0. Wrangler 배포 로그 `data.hanbom.rhee.life (custom domain)` 및 `Success: Deploy command completed` 확인.
- 해당 빌드 Worker 버전: `4cfd821d-82b8-4185-8e29-265b21fe8246`, 당시 트래픽 100%.
- 실제 Cloudflare Browser Rendering HTTP GET `https://data.hanbom.rhee.life/api/health-notices?limit=5`에서 `category=health`, `count=1`, 정확한 source RSS URL 및 공식 게시물 원문 링크 확인.
- 보건알림 게시물: `보건실 이용 및 감염병과 응급환자 관리방안` (공식 학교 원문 `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectNttInfo.do?nttSn=532892&mi=17256`, RSS 발행 시각 `2026-03-02T22:06:28.000Z`).
- 실제 GET `https://data.hanbom.rhee.life/api/posts?limit=5` 응답: `count=301`, `partial=false`, `failed_feeds=[]`.
- source별 count: 공지 notice=53, 가정통신문 letter=100, 한봄 NEWS news=26, 학생작품 awards=21, 교육청 office_letter=100, 공모전 opportunities=0, 보건 health=1. **총 301건**은 RSS 수집 범위의 숫자이며 전체 누적 게시물 총수와 다를 수 있음.
- 실제 운영 홈페이지 `https://data.hanbom.rhee.life/`를 Cloudflare Browser Rendering으로 확인. H1과 여덟 개 pill의 텍스트 및 전체 리스트에 새 보건알림 게시물이 포함된 상태 확인.
- 개별 pill 클릭의 실제 브라우저 시각 테스트는 별도 실시하지 않음. HTML 버튼·JS 필터 로직과 REST/MCP 도구는 빌드의 Node 단위 테스트로 확인.
- MCP 도구 17개 소스 정의와 도구 목록은 테스트로 확인. 이미 설치된 ChatGPT 앱의 신규 MCP 스키마 재발견은 사용자의 연결 캐시 상태에 따라 갱신이 필요할 수 있음.
- 클플 Access 보관 정책·공개 접속 상태 유지. GitHub Actions 사용하지 않고 `main` 기반 Workers Builds 자동배포 유지.
