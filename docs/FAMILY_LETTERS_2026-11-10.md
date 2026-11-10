# 한봄고 RSS 공지사항 + 가정통신문 통합 — 개발기

날짜: 2026-11-10

## 요청

학교 공지사항에 가정통신문 RSS를 추가하고 `전체 보기`, `공지 사항`, `가정통신문` 3개 pill 버튼으로 홈페이지에서 필터링한다. 기존 미니멀 화이트·Juache 서체 유지.

## 데이터 소스

- 공지사항: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062
- 가정통신문: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17252&bbsId=10063

각 데이터는 `notice` / `letter` 유형으로 고정하며 title·url·published_at·summary·category·category_label을 반환한다. URL은 학교 HTTPS 도메인만 허용.

## API

- `GET /api/notices?limit=20&q=`: 기존 공지 전용 API, 하위호환.
- `GET /api/letters?limit=20&q=`: 가정통신문 전용.
- `GET /api/posts?limit=20&q=`: 두 피드 최신 통합.
- `GET /api/feed?category=all|notice|letter&limit=20`: 선택 카테고리 조회.
- `GET /api/search?q=...&category=all|notice|letter`: 검색. 기본 notice로 기존 API 하위호환.
- `GET /api/status?category=all|notice|letter`: 피드 상태. 기본 notice 유지.
- `GET /api/meta`: 소스와 새 API 문서.

`all`은 두 소스를 독립 요청하고 게시시각 최신순으로 합친다. 단일 소스 장애가 있으면 성공한 소스만 제공하고 `partial:true` 및 `failed_feeds`에 실패를 기록한다. 두 소스 모두 실패하면 502. 상류 HTTP 리다이렉트 추적 금지, 최대 크기 700KB, 12초 타임아웃, edge 캐시 각 180초.

## MCP

이전 3개 도구는 유지:
- `get_school_notices`
- `search_school_notices`
- `get_school_feed_status` (새 선택 인수 category 지원, 기본 notice)

추가 4개 도구:
- `get_family_letters`
- `search_family_letters`
- `get_all_school_posts`
- `search_all_school_posts`

MCP는 공개 읽기 전용 Stateless Streamable HTTP JSON-RPC이며 OAuth는 아직 구현되지 않았다. 등록 URL `https://data.hanbom.rhee.life/mcp` 및 Authentication None은 그대로.

## UI

- `한봄고 홈페이지 공지사항 MCP` 제목을 배달의민족 주아체로 유지.
- 제목 아래 중앙 정렬 pill 세 개. 흰 바탕, 무채색 테두리, 선택 pill 검정 바탕·흰 글자.
- Hover 효과 없음. 각 선택은 JS 상태를 바꾸며 React 없이 즉시 필터.
- 제목 목록 외에 날짜·카드·장식·검색창 추가하지 않음.
- 페이지 최초에 공지와 가정통신문을 병렬로 가져오고 각각 최신 100개까지 표시 가능.
- 원본 링크는 동일한 공식 학교 HTTPS 호스트만 허용하고 `textContent`로 XSS 방지.
- RSS 오류 시 목록에 한 줄 안내, 정상 피드가 있으면 그 콘텐츠를 유지.

## 기존 인프라 보존

- Cloudflare Worker: mcp-for-hanbom
- Domain: data.hanbom.rhee.life
- Auth: Cloudflare Access 앱은 보관 중이고 현재 전체 공개.
- workers.dev/preview URLs: off.
- GitHub: hslcrb/mcp-for-hanbom main → Cloudflare Workers Builds 자동 배포. GitHub Actions 사용 없음.

## 검증

테스트는 각 RSS 파서, 날짜순 통합, 기존 도구 하위호환, 신규 MCP 도구 및 REST 경로, 필터 버튼 HTML을 검사한다. 라이브 RSS는 배포 후 별도 확인한다.

## 프로덕션 실제 검증 — 2026-11-10 KST

- GitHub 배포 커밋: `a827489ccc0f045dab143c8dce6b4af01f9a49b5`.
- Cloudflare Workers Builds ID: `413fe937-659b-4b72-b002-709feed68e89`.
- Cloudflare 빌드 결과: `success`, Node 테스트 **14/14 통과**, 실패 0.
- 배포 로그: `data.hanbom.rhee.life (custom domain)`, `Success: Deploy command completed`.
- 배포 Worker 버전: `1a60171b-e39b-44e1-b517-7c1ef29596af`.
- 등록돼 있던 ChatGPT MCP의 기존 `get_school_notices` 호출 성공 (기존 기능 호환).
- Cloudflare Browser Rendering을 통해 신규 `GET /api/status?category=letter`를 **실제 호출 성공**: `category=letter`, `count=100`, `partial=false`. 데이터 항목은 백엔드에 설정한 최대 100건까지만 읽으며 학교 게시판의 전 기간 총게시물 수를 뜻하지 않음.
- 신규 `GET /api/posts?limit=5` **실제 HTTP 조회 성공**: `count=153`, `category=all`, `partial=false`, `failed_feeds=[]`. 공지 RSS 53건 + 가정통신문 RSS 조회 상한 100건을 합친 결과.
- 통합 최신 목록에서 실제 가정통신문 제목·학교 공식 링크·날짜 확인: `약물 오남용 예방 및 안전관리 안내` (2026-11-04), `2026년도 중·고등학생 인플루엔자 예방접종 지원사업 안내` (2026-11-02), `2026학년도 2학기 1차 정기시험 성적 확인 안내` (2026-10-30), `11월 식단표 및 영양소식지` (2026-10-28).
- 프로덕션 API의 RSS 통합 동작을 확인했지만, **브라우저 pill 클릭 시각적 렌더링 및 신규 MCP 도구를 ChatGPT 앱이 재발견했는지**는 별도 확인 필요. 연결된 기존 앱은 이전 tool-schema를 캐시하고 있으므로 신규 도구가 앱에 나타나려면 연결 갱신 또는 재등록이 필요할 수 있음.
- 데이터 반환은 학교 공식 RSS 출처이며 비공식 서비스. 내용 정확성과 첨부 파일은 학교 공식 원문에서 확인.
