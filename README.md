# HANBOM DATA — 학교 RSS 데이터 허브

> **비공식 학생 개발 프로젝트** · 한봄고등학교 공식 공지사항 RSS를 REST API, 원격 MCP, 개인 대시보드로 제공하는 Cloudflare Workers 서비스.

## 서비스 주소 (Canonical)

| 항목 | URL | 접근 정책 |
| --- | --- | --- |
| 개인 대시보드 | https://data.hanbom.rhee.life/ | 지정 이메일 1명만 Cloudflare Access 허용 |
| REST 공지 | https://data.hanbom.rhee.life/api/notices | 모두 공개, 읽기 전용 |
| REST 검색 | https://data.hanbom.rhee.life/api/search?q=입학 | 모두 공개, 읽기 전용 |
| REST 상태 | https://data.hanbom.rhee.life/api/status | 모두 공개, 읽기 전용 |
| API 메타데이터 | https://data.hanbom.rhee.life/api/meta | 모두 공개, 읽기 전용 |
| MCP endpoint | **https://data.hanbom.rhee.life/mcp** | 모두 공개, 읽기 전용 |

**2026-11-10 도메인 변경:** 예전 `hanbom.rhee.life`는 폐기 대상으로, 신규 정식 주소 `data.hanbom.rhee.life`만 사용합니다. 기존 주소로 플러그인을 등록하지 마세요.

## 데이터 출처

- 공식 RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062
- 학교 홈페이지: https://hanbom-h.goesw.kr/
- RSS에 노출된 공지 일부만 조회할 수 있습니다. 전체 공지 및 첨부파일은 반드시 공식 원문에서 확인해야 합니다.

## 기능 및 MCP

- Worker 하나로 RSS·REST·Stateless MCP(Streamable HTTP JSON-RPC)·반응형 개인 대시보드 운영.
- GET `/api/notices?limit=20&q=`, GET `/api/search?q=...`, GET `/api/status`, GET `/api/meta`.
- POST `/mcp`: `initialize`, `ping`, `tools/list`, `tools/call`.
- MCP 도구: `get_school_notices`, `search_school_notices`, `get_school_feed_status`.
- 상류 URL 고정, 3분 단위 Cloudflare edge 캐시, 700KB 응답 상한, 요청 타임아웃, 실패 시 오류 표시.
- 공개 쓰기 기능·학생 개인정보 취득·학교 홈페이지 변경 기능 없음.

## 보안과 인증

- 대시보드 `/`는 Cloudflare Access로 `dlghtp581@naver.com`만 허용합니다.
- `/mcp` 와 `/api/*`는 각각 독립된 Cloudflare Access **Bypass Everyone** 규칙으로 공개합니다.
- Worker의 대시보드 인증 헤더 확인은 보조 수단이며, **실제 인증 강제는 Cloudflare Access 정책**이 담당합니다.
- `workers.dev` 비활성화, Preview URLs 비활성화, Preview builds 비활성화.
- 현재 MCP는 **인증 없는 공개 접근**입니다. OAuth 2.1/PKCE는 아직 구현되지 않았으며, 등록 화면에서 OAuth를 선택하면 안 됩니다.

## GitHub Actions 없는 main 자동 배포

- GitHub 저장소: https://github.com/hslcrb/mcp-for-hanbom
- Production branch: `main` / Root directory: `/`.
- Build command: `npm run check`; Deploy command: `npm run deploy`.
- Provider: GitHub → Cloudflare Workers Builds (**GitHub Actions, .github/workflows 미사용**).
- Worker name: `mcp-for-hanbom` / Custom domain: `data.hanbom.rhee.life`.

## 로컬 작업

```bash
npm install
npm run check
npm run dev
```

## 프로젝트 운영 문서

- [ChatGPT Plugins 등록 입력값 및 테스트](docs/CHATGPT_PLUGINS_REGISTRATION.md)
- [Cloudflare Workers Builds 배포·운영 매뉴얼](docs/DEPLOYMENT.md)
- [대시보드·REST·MCP 접근 제어](docs/ACCESS_SECURITY.md)
- [도메인 이전 기록 — 2026-11-10](docs/DOMAIN_MIGRATION_2026-11-10.md)
- [개발·구축·검증 기술기 — 2026-11-10](docs/BUILD_HISTORY_2026-11-10.md)

## 책임 고지

이 프로젝트는 학교 공식 서비스가 아닙니다. 데이터·이미지·문서의 권리는 원저작자와 제공 기관에 있으며 출처를 명시합니다. 소스의 공개 여부는 학교 데이터 재배포 허가를 뜻하지 않습니다.

## 2026-11-10 — Pure white list redesign

- 루트 대시보드는 백색 배경과 중앙 정렬된 공지 제목 목록만 표시합니다.
- 헤더, 로고, 통계, 검색 입력, 버튼, 게시물 날짜·요약, 푸터, 카드, 구분선을 제거했습니다.
- 호버와 방문 상태에서 색·밑줄·크기·투명도가 바뀌지 않으며 키보드 포커스 외곽선만 유지합니다.
- 공개 API, MCP, 개인용 Access, data.hanbom.rhee.life, GitHub main 자동 배포는 유지합니다.
- 자세한 사항: docs/UI_MINIMAL_2026-11-10.md

## 2026-11-10 · 주아체 제목 추가

- 루트의 공지 리스트 **위에** `<h1>한봄고 공지사항 MCP</h1>` 한 줄만 추가했습니다.
- 글꼴: 배달의민족 주아체, `Juache` — [jsDelivr Noonnu WOFF](https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.woff).
- H1만 주아체로, 아래 공지 목록은 기존 기본 서체로 유지. 기존 백색 배경/중앙 목록/링크 호버 무효 유지.
- 외부 웹폰트 로딩을 위해 HTML 응답 CSP의 `font-src https://cdn.jsdelivr.net`를 허용했습니다.
- 단일 이메일 Cloudflare Access, 공개 REST, MCP 서버, GitHub `main` 자동배포는 변경하지 않았습니다.
