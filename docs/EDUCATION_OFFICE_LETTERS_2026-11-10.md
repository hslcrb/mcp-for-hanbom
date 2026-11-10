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
