# HANBOM DATA

비공식 한봄고등학교 RSS → Cloudflare Workers REST API + Streamable HTTP MCP + 개인 대시보드.

RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062

## API

- GET `/api/notices?limit=20&q=`
- GET `/api/search?q=...`
- GET `/api/status`
- GET `/api/meta`
- POST `/mcp`: JSON-RPC 2.0, `initialize`, `tools/list`, `tools/call`, `ping`; tools `get_school_notices`, `search_school_notices`, `get_school_feed_status`.

## 인증

Cloudflare Access 경로별 애플리케이션 구성: `hanbom.rhee.life` 전체는 `dlghtp581@naver.com` 한 계정만 Allow, `/mcp`와 `/api/*`에는 각각 Bypass Everyone 적용. workers.dev/preview URLs 비활성화. Worker도 대시보드에 Access assertion header가 없으면 401. 주의: 헤더 존재 여부 검사는 Access 서명을 자체 검증하는 것이 아니므로 Cloudflare Access 정책이 필수입니다.

MCP는 현재 **공개 무인증**. OAuth 2.1/PKCE 지원은 앞으로 구현 예정이며 아직 OAuth 지원을 주장하지 않습니다.

## 자동 배포

Cloudflare Workers Builds를 GitHub `hslcrb/mcp-for-hanbom`의 `main`에 연결. Build `npm run check`, deploy `npm run deploy`, Node 24, Preview builds off. **GitHub Actions 금지.**

## 로컬 실행

`npm install && npm run check && npm run dev`

## ChatGPT Plugins 등록

Server URL `https://hanbom.rhee.life/mcp` (실제 배포와 HTTPS 동작 검증 후 등록), Authentication None, Name HANBOM Data MCP.

학교 공식 서비스가 아니며 공개 RSS 게시물만 사용. 원문과 출처를 명시하세요. RSS는 전체 과거 기록을 포함하지 않을 수 있습니다. 실제 학교 상류 연결은 운영 환경에서 검증해야 합니다.
