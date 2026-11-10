# ChatGPT Plugins 등록 입력값 — HANBOM DATA MCP

**2026-11-10 변경:** 대시보드까지 전면 공개로 전환했습니다. MCP 주소와 인증값은 기존대로 `https://data.hanbom.rhee.life/mcp` / `None`을 유지합니다. ([Access 복구 가이드](ACCESS_SUSPENSION_2026-11-10.md))


> 2026-11-10 기준. **새 정식 주소만 사용**. 이전 `hanbom.rhee.life/mcp`는 등록하거나 계속 사용하지 않습니다.

## 등록 화면의 각 항목별 입력값

| 항목 / UI 명칭 | 입력값 | 비고 |
| --- | --- | --- |
| Name / 표시명 | `HANBOM Data MCP` | 사용자에게 표시할 이름 |
| Description / 설명 | `한봄고등학교 공지사항·가정통신문·교육청 가정통신문·한봄 NEWS·학생작품 및 수상내역 RSS 조회·검색용 비공식 읽기 전용 도구` | 선택 사항 |
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
한봄고등학교 공지사항·가정통신문·교육청 가정통신문·한봄 NEWS·학생작품 및 수상내역의 공개 RSS를 조회하고 검색하는 비공식 읽기 전용 MCP 서버
```

## MCP 서버가 제공하는 도구

| 도구명 | 입력값 | 응답 |
| --- | --- | --- |
| `get_school_notices` | `limit` (정수 1~100, 선택) | RSS 내 최근 공지 |
| `search_school_notices` | `query` (필수), `limit` (선택) | RSS에 포함된 제목·요약 검색 |
| `get_school_feed_status` | `category` 선택 (`notice`/`letter`/`news`/`all`, 기본 notice) | 유형별 RSS 수집 시각·건수·원천 |
| `get_family_letters` | `limit` 선택 | 가정통신문 RSS 최신 게시물 |
| `search_family_letters` | `query` 필수, `limit` 선택 | 가정통신문 검색 |
| `get_school_news` | `limit` 선택 | 한봄 NEWS RSS 최신 게시물 |
| `search_school_news` | `query` 필수, `limit` 선택 | 한봄 NEWS 검색 |
| `get_student_works_awards` | `limit` 선택 | 학생작품 및 수상내역 최근 게시물 |
| `search_student_works_awards` | `query` 필수, `limit` 선택 | 학생작품 및 수상내역 RSS 검색 |
| `get_education_office_letters` | `limit` 선택 | 가정통신문(교육청) 최근 게시물 |
| `search_education_office_letters` | `query` 필수, `limit` 선택 | 교육청 가정통신문 RSS 검색 |
| `get_all_school_posts` | `limit` 선택 | 3개 게시판 날짜순 통합 |
| `search_all_school_posts` | `query` 필수, `limit` 선택 | 3개 게시판 통합 검색 |

## HTTP 연결 점검 예시

```bash
curl -i 'https://data.hanbom.rhee.life/api/meta'
curl -i 'https://data.hanbom.rhee.life/api/notices?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/letters?limit=3'
curl -i 'https://data.hanbom.rhee.life/api/education-letters?limit=3'
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
