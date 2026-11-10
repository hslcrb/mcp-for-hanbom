# 한봄고 가정통신문(교육청) RSS 통합

날짜: 2026-11-10

## 공식 원천

```text
https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17254&bbsId=10064&bbsTy=HCNOTIE
```

학교 공식 한봄고등학교 RSS에서 제공되는 가정통신문(교육청) 게시판. 기존 가정통신문과 **서로 다른 피드**로 유지한다.

## 구현 내용

- 데이터 카테고리 ID `office_letter`, UI 표기 `가정통신문(교육청)`.
- 기존 `notice`, `letter`, `news`, `awards` 유지. 전체 보기 `all`은 다섯 유형을 날짜 최신순 병합.
- H1 `한봄고 홈페이지 공지사항 MCP`, 주아체, 흰색 레이아웃, 중앙 정렬 제목, 기존 pill과 마우스 호버 무효 유지.
- 각 카테고리 고정된 공식 HTTPS RSS 주소 사용. 개별 Cloudflare POP 캐시 180초, 리다이렉트 차단, 응답 700KB 제한, 상류 12초 요청 타임아웃.
- 장애 격리: 다섯 피드 중 일부 실패하면 통합 API는 정상 피드만 반환, `partial` 및 `failed_feeds`로 실패 기록. 모두 실패 시 502.
- 공개 읽기 전용. Cloudflare Access 정책은 비실서비스 호스트에 보존된 상태를 유지하고 변경하지 않음.

## API

새 API: `GET https://data.hanbom.rhee.life/api/education-letters?limit=20&q=`.

확장 API: `GET /api/feed?category=office_letter`, `/api/status?category=office_letter`, `/api/search?q=...&category=office_letter`.

하위호환: `/api/notices`, `/api/letters`, `/api/news`, `/api/awards`, `/api/posts`, `/api/meta` 모두 유지. 기본값 `notice` 유지.

## MCP

- 새 `get_education_office_letters({limit?})`.
- 새 `search_education_office_letters({query,limit?})`.
- 기존 `get_school_feed_status({category:'office_letter'})` 지원 및 통합 조회 도구에 피드 포함.
- 기존 11개 도구 유지 → **13개**.
- URL `https://data.hanbom.rhee.life/mcp`, Streamable HTTP, 현재 인증 `None` (OAuth 미구현).

## 배포

- GitHub `hslcrb/mcp-for-hanbom`, production branch `main`.
- Cloudflare Workers Builds가 자동 테스트 `npm run check`, 자동 배포 `npm run deploy` 실행. GitHub Actions 사용하지 않음.
- Worker `mcp-for-hanbom`, 도메인 `data.hanbom.rhee.life` 유지.

## 검증

프로덕션 Build 성공 및 실제 피드 응답은 배포 후 후속 절에 기록한다. RSS가 반환하는 항목 수는 서비스가 수집한 일부 게시물 수이며 게시판 전체 누적 건수가 아님.

## 2026-11-10 프로덕션 실측 검증

- 구현 커밋: `69e90731899814523a4df55f828fde7952823b63`.
- Cloudflare Workers Builds ID: `80f5553e-d48c-41e6-bd6e-29eeae291af9`.
- 빌드 결과: `success`, 테스트 **22개 통과 / 실패 0**, Worker 자동 배포 로그 `data.hanbom.rhee.life (custom domain)` 및 `Success: Deploy command completed` 확인.
- Worker 버전: `ecc4fa30-cd4c-45f3-b06f-400326b7de82`, 당시 프로덕션 트래픽 100%.
- Cloudflare Browser Rendering으로 실제 HTTP 요청 `https://data.hanbom.rhee.life/api/education-letters?limit=5` 실행하여 **category=office_letter**, source URL 및 `count=100` 확인.
- 실제 RSS 최신 원문 예시: `기간연장_[중등](가칭) 경기성장이음플랫폼 설문조사`, `수원특례시 2027학년도 대학입시박람회 개최(정시전형) 알림`, `경기건강ON스쿨 온라인 교육 안내 '사춘기 뇌는 왜 쉽게 빠져들까'` 등 공식 학교 게시물.
- 통합 `https://data.hanbom.rhee.life/api/posts?limit=5` 직접 호출: **count=300, partial=false, failed_feeds=[]**.
- 5개 원천별: notice=53, letter=100, news=26, awards=21, office_letter=100. 합계 300건은 이번 RSS 응답 수집 범위로, `letter` 및 `office_letter`는 각각 최대 100건 처리 제한이 있어 학교 게시판의 전체 누적 게시물 수와 다를 수 있음.
- Cloudflare Browser Rendering으로 실제 공개 홈페이지를 렌더링해 H1 `한봄고 홈페이지 공지사항 MCP`와 6개 필터 텍스트 모두 노출 확인.
- 홈페이지 전체 목록에 새 교육청 통신문이 날짜순으로 포함된 점도 실제 렌더링에서 확인.
- 각 pill을 클릭해 탭별로 목록이 갱신되는 브라우저 조작 실측은 별도 진행하지 않았으나 해당 기능에 대한 Node 단위 테스트와 API 테스트는 통과.
- 로그인 비적용 공개 상태 유지. 운영 Worker 도메인·Cloudflare Access 복구용 앱은 이번 변경에서 수정하지 않음.
- 신규 MCP 도구 2개는 서버 코드 및 Node 테스트로 검증. 이미 설치된 ChatGPT 앱에서 새 도구가 즉시 보이는지는 앱 측 도구 목록 새로고침 여부에 따라 달라질 수 있음.
