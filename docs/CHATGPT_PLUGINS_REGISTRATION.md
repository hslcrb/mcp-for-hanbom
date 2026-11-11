
## 2026-11-11 · 연결 안내 페이지

- **웹 안내:** https://data.hanbom.rhee.life/mcp-setup
- ChatGPT와 Claude 각각의 최신 웹 등록 절차, `HANBOM Data MCP` 이름/서버 URL 복사 버튼, 공식 링크를 제공합니다.
- SVG 원본은 `hslcrb/chatgptweb-transbank/frontier-llms-logos`의 ChatGPT/Claude 2개를 복사해 자체 호스팅합니다.
- 관련 문서: [MCP_SETUP_GUIDE_2026-11-11.md](MCP_SETUP_GUIDE_2026-11-11.md).

# ChatGPT Plugins 등록 입력값 — HANBOM DATA MCP

## 2026-11-11 현행 등록값 (v2.0.0)

| 항목 | 값 |
|---|---|
| Name | `HANBOM Data MCP` |
| Server URL | `https://data.hanbom.rhee.life/mcp` |
| Transport | `Streamable HTTP` |
| Authentication | `None` |
| OAuth / Client ID / Secret | 모두 사용하지 않음 |
| 공개 RSS | **82개** |
| 상위 메뉴 | **23개** |
| MCP 도구 | **68개**, 기존 67개 + `list_school_boards` 1개 |

**신규 51개 RSS는 모두 등록**돼 있고 `list_school_boards`에서 category ID를 확인한 뒤 `get_board_posts` 또는 `search_board_posts`로 사용합니다. 별도의 102개 중복 MCP 도구를 추가하지 않은 것은 ChatGPT 플러그인 탐색 복잡성과 호출 효율을 고려한 결정입니다.

`category="all"`은 82개 RSS를 한 번에 수집하지 않으며, Cloudflare 무료 플랜 제약 때문에 **`shard=0`, `shard=1`, `shard=2`** 순서로 조회해야 전체를 볼 수 있습니다. `get_all_school_posts`와 `search_all_school_posts`, `get_school_feed_status`의 입력에도 `shard`를 사용합니다. 응답에 `has_more`, `next_shard`, `shard_count`가 포함됩니다.

[82개 RSS와 전체 입력값·개발기](RSS_82_IMPLEMENTATION_2026-11-11.md)


**2026-11-10 변경:** 대시보드까지 전면 공개로 전환했습니다. MCP 주소와 인증값은 기존대로 `https://data.hanbom.rhee.life/mcp` / `None`을 유지합니다. ([Access 복구 가이드](ACCESS_SUSPENSION_2026-11-10.md))


> 2026-11-10 기준. **새 정식 주소만 사용**. 이전 `hanbom.rhee.life/mcp`는 등록하거나 계속 사용하지 않습니다.

## 2026-11-10 최신 31개 피드 서버 등록값

- 표시 이름: `HANBOM Data MCP`
- 서버 URL: `https://data.hanbom.rhee.life/mcp`
- 전송: `Streamable HTTP`
- 인증: `None` (OAuth 미구현)
- 신규 피드 23개, 신규 MCP 조회·검색 도구 46개, 범용 도구 2개. 기존 도구 19개 유지 → **총 67개**.
- `get_board_posts({category:"curriculum_bigdata"})`와 `search_board_posts({category:"features",query:"빅데이터"})` 등으로 게시판/그룹 단위로도 사용 가능.
- [31개 피드별 URL과 46개 신규 도구의 전체 목록](RSS_31_IMPLEMENTATION_2026-11-10.md).
- 연결된 ChatGPT 앱은 도구 목록 캐시가 갱신되어야 새 도구가 표시될 수 있다.

## 등록 화면의 각 항목별 입력값

| 항목 / UI 명칭 | 입력값 | 비고 |
| --- | --- | --- |
| Name / 표시명 | `HANBOM Data MCP` | 사용자에게 표시할 이름 |
| Description / 설명 | `한봄고 공개 RSS 82종을 23개 상위 메뉴로 탐색하고 게시판별 조회·검색하는 읽기 전용 MCP` | 선택 사항 |
| Server URL / URL | **`https://data.hanbom.rhee.life/mcp`** | 끝에 `/mcp` 필수 |
| Transport / Connection | `Remote MCP server` / `Streamable HTTP` | 지원 UI에서 선택 |
| Authentication / 인증 | **`None` / `No authentication`** | 현재 무인증 서비스 |
| Client ID | **비워 둠** | OAuth 미구현 |
| Client Secret | **비워 둠** | OAuth 미구현 |
| API Key / Bearer Token | **비워 둠** | 필요 없음 |
| Custom headers | 별도 입력 없음 | 기본 HTTP 헤더 사용 |

### 복사하기 쉬운 핵심 입력값

**Name**

```text
HANBOM Data MCP
```

**Server URL**

```text
https://data.hanbom.rhee.life/mcp
```

**Authentication**

```text
None
```

**Description**

```text
한봄고등학교 공개 RSS 82종을 23개 상위 메뉴로 탐색하며 게시판별 공지·교과·진로·취업·급식·공개자료를 조회·검색하는 비공식 읽기 전용 MCP 서버
```

## MCP 서버가 제공하는 도구

| 도구명 | 입력값 | 응답 |
| --- | --- | --- |
| `get_school_notices` | `limit` (정수 1~100, 선택) | RSS 내 최근 공지 |
| `search_school_notices` | `query` (필수), `limit` (선택) | RSS에 포함된 제목·요약 검색 |
| `get_school_feed_status` | `category` 선택 (`notice`/`letter`/`office_letter`/`news`/`awards`/`opportunities`/`health`/`student_rules`/`all`, 기본 notice) | 유형별 RSS 수집 시각·건수·원천 |
| `get_family_letters` | `limit` 선택 | 가정통신문 RSS 최신 게시물 |
| `search_family_letters` | `query` 필수, `limit` 선택 | 가정통신문 검색 |
| `get_school_news` | `limit` 선택 | 한봄 NEWS RSS 최신 게시물 |
| `search_school_news` | `query` 필수, `limit` 선택 | 한봄 NEWS 검색 |
| `get_student_works_awards` | `limit` 선택 | 학생작품 및 수상내역 최근 게시물 |
| `search_student_works_awards` | `query` 필수, `limit` 선택 | 학생작품 및 수상내역 RSS 검색 |
| `get_education_office_letters` | `limit` 선택 | 가정통신문(교육청) 최근 게시물 |
| `search_education_office_letters` | `query` 필수, `limit` 선택 | 교육청 가정통신문 RSS 검색 |
| `get_school_opportunities` | `limit` 선택 | 공모전 및 모집공고 최신 게시물(없으면 0건) |
| `search_school_opportunities` | `query` 필수, `limit` 선택 | 공모전 및 모집공고 검색(없으면 0건) |
| `get_health_notices` | `limit` 선택 | 보건알림 최신 게시물 |
| `search_health_notices` | `query` 필수, `limit` 선택 | 보건알림 RSS 검색 |
| `get_student_rules` | `limit` 선택 | 학생생활규정게시판 최신 게시물 |
| `search_student_rules` | `query` 필수, `limit` 선택 | 학생생활규정게시판 검색 |
| `get_all_school_posts` | `limit` 선택 | 8개 게시판 날짜순 통합 |
| `search_all_school_posts` | `query` 필수, `limit` 선택 | 8개 게시판 통합 검색 |

## HTTP 연결 점검 예시

```bash
curl -i 'https://data.hanbom.rhee.life/api/meta'
curl -i 'https://data.hanbom.rhee.life/api/notices?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/letters?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/education-letters?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/opportunities?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/health-notices?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/student-rules?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/news?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/awards?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/posts?limit=5'
curl -sS -X POST 'https://data.hanbom.rhee.life/mcp' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"manual-check","version":"1.0.0"}}}'
curl -sS -X POST 'https://data.hanbom.rhee.life/mcp' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

**주의:** MCP는 `/mcp`에 JSON-RPC POST를 보내야 하므로 주소를 웹 브라우저에서 단순히 열면 405가 정상일 수 있습니다. 연결 성공 여부는 `initialize`·`tools/list`·실제 도구 호출로 확인합니다.

## 향후 OAuth 도입 계획 (미구현)

공개 읽기 전용인 현재 버전은 OAuth가 **없습니다**. 추후 OAuth를 채택할 때는 authorization server/PKCE, 메타데이터 discovery, 동적 클라이언트 등록 지원 여부, 실제 토큰 서명·scope 검증, resource server 401 응답 및 ChatGPT 연결 시험을 구현·확인한 뒤 이 문서의 Authentication 값을 변경합니다. OAuth 설정을 흉내 내기 위해 가짜 Client ID/Secret을 생성하지 않습니다.

## 공식성·정보 범위

학교 공식 웹사이트의 **공개 RSS**가 출처입니다. 프로젝트는 비공식이며 개인정보·비공개 공문·내부 시스템에 접근하지 않습니다. RSS에 존재하지 않는 공지를 추정 생성하지 않습니다.

## 2026-11-10 · 한봄 NEWS 도구 추가

- NEWS RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17187&bbsId=10022`.
- 서버 주소 및 인증 설정은 변함없음: `https://data.hanbom.rhee.life/mcp` / `None`.
- NEWS 도구 2개가 추가되어 당시 **총 9개**. 기존 연결된 ChatGPT 앱에 신규 도구가 나타나지 않으면 앱 도구 목록/연결을 새로 고쳐야 할 수 있음.
- 실서비스 뉴스 조회 결과 및 개발 기록: [HANBOM_NEWS_2026-11-10.md](HANBOM_NEWS_2026-11-10.md).

## 2026-11-10 · 학생작품 및 수상내역 추가 (현행)

- 출처: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17172&bbsId=10010`
- **현행 MCP 도구 11개**: 기존 9개 + `get_student_works_awards`, `search_student_works_awards`.
- 서버 주소·인증은 기존 그대로: **`https://data.hanbom.rhee.life/mcp` / `None`**.
- 기존에 등록된 ChatGPT 앱에서 추가 도구가 표시되지 않으면 앱의 도구 정의 새로고침 또는 연결 재설정을 확인해야 합니다.
- 전체 변경기: [STUDENT_WORKS_AWARDS_2026-11-10.md](STUDENT_WORKS_AWARDS_2026-11-10.md).

## 2026-11-10 · 가정통신문(교육청) 추가 — 현행

- 다섯 번째 RSS `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17254&bbsId=10064&bbsTy=HCNOTIE` 지원.
- **현행 도구 13개**. 신규: `get_education_office_letters`, `search_education_office_letters`.
- 기존 도구·URL 유지, 등록 URL은 `https://data.hanbom.rhee.life/mcp`, 인증 `None`.
- 기존 등록 앱이 이전 도구 목록만 표시하면 도구 재동기화/연결 갱신이 필요할 수 있음.
- 상세 개발기: [EDUCATION_OFFICE_LETTERS_2026-11-10.md](EDUCATION_OFFICE_LETTERS_2026-11-10.md).

## 2026-11-10 · 공모전 및 모집공고 추가 — 현행

- 공식 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17255&bbsId=10065`.
- **MCP 도구 15개** (기존 13개 + `get_school_opportunities`, `search_school_opportunities`).
- 유효하지만 게시물 없는 피드는 오류가 아니라 정상 0건 결과.
- MCP URL `https://data.hanbom.rhee.life/mcp`, Authentication `None` 유지. 설치된 ChatGPT 앱의 도구 목록 갱신이 필요할 수 있음.
- [구현·검증기](CONTESTS_RECRUITMENT_2026-11-10.md).

## 2026-11-10 · 보건알림 추가 — 현행

- RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17256&bbsId=10066`.
- **서버 MCP 17개 도구**: `get_health_notices`, `search_health_notices` 추가. `get_school_feed_status({category:'health'})` 지원.
- 서버 URL `https://data.hanbom.rhee.life/mcp`, Authentication `None`은 그대로. 이미 연결한 ChatGPT 앱에서 새 도구가 표시되지 않으면 도구 목록 재동기화가 필요할 수 있음.
- [보건알림 추가 개발기](HEALTH_NOTICES_2026-11-10.md).

## 2026-11-10 · 학생생활규정게시판 추가 (현행)

- 출처: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17273&bbsId=10074`.
- 총 **19개 MCP 도구**, 추가 도구는 `get_student_rules`, `search_student_rules`.
- `get_school_feed_status({category:'student_rules'})`, 전체 게시판 검색·조회 지원.
- URL `https://data.hanbom.rhee.life/mcp`, 인증 `None` 유지. ChatGPT에 이미 등록된 앱은 새 도구 스키마 재동기화가 필요할 수 있음.
- [통합 개발 기록](STUDENT_RULES_2026-11-10.md).

## 2026-11-10 · 31개 RSS / 67개 MCP 도구 확장 (현행)

- 23개 신규 RSS의 정확한 bbsId·mi·REST 라우트·두 MCP tool 이름은 [전체 개발기](RSS_31_IMPLEMENTATION_2026-11-10.md) 참조.
- 서버 주소·인증값 변경 없음. 범용 조회 도구 `get_board_posts`, 검색 도구 `search_board_posts`를 통한 유연한 카테고리 선택 가능.
- 기존 19개 이름 유지하므로 이미 등록된 기존 도구를 계속 사용할 수 있음. 신규 도구를 사용하려면 클라이언트의 도구 목록 재발견이 필요할 수 있다.
