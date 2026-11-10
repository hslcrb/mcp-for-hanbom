# ChatGPT Plugins 등록 입력값 — HANBOM DATA MCP

> 2026-11-10 기준. **새 정식 주소만 사용**. 이전 `hanbom.rhee.life/mcp`는 등록하거나 계속 사용하지 않습니다.

## 등록 화면의 각 항목별 입력값

| 항목 / UI 명칭 | 입력값 | 비고 |
| --- | --- | --- |
| Name / 표시명 | `HANBOM Data MCP` | 사용자에게 표시할 이름 |
| Description / 설명 | `한봄고등학교의 공개 공지사항 RSS를 검색하고 확인하는 비공식 읽기 전용 도구` | 선택 사항 |
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
한봄고등학교의 공개 공지사항 RSS를 검색하고 확인하는 비공식 읽기 전용 MCP 서버
```

## MCP 서버가 제공하는 도구

| 도구명 | 입력값 | 응답 |
| --- | --- | --- |
| `get_school_notices` | `limit` (정수 1~100, 선택) | RSS 내 최근 공지 |
| `search_school_notices` | `query` (필수), `limit` (선택) | RSS에 포함된 제목·요약 검색 |
| `get_school_feed_status` | 없음 | 수집 시각·건수·원천 |

## HTTP 연결 점검 예시

```bash
curl -i 'https://data.hanbom.rhee.life/api/meta'
curl -i 'https://data.hanbom.rhee.life/api/notices?limit=3'
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
