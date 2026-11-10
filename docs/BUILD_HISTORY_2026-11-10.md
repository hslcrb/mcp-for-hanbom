# HANBOM DATA — 구축·배포 기록 (2026-11-10)

## 범위

한봄고등학교 공식 공지 RSS를 읽는 학생 개발 프로젝트를 만들었다. 선례로 [multiples-mcps-gatehighway](https://github.com/hslcrb/multiples-mcps-gatehighway)의 경로별 Access 격리와 [data.seoulmetto.rhee.life](https://github.com/hslcrb/data.seoulmetto.rhee.life)의 GitHub main→Workers Builds·원격 MCP 구조를 조사했다.

## 원천

- RSS: https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062
- 학교: https://hanbom-h.goesw.kr/
- RSS 상류의 실제 HTTP 본문과 게시물 결과는 이 작업에서 직접 확인하지 못했다. Worker는 운영 시 고정 URL로 fetch하고, 오류 또는 HTML을 받으면 명시적 오류를 반환하도록 제작했다.
- 콘텐츠는 원본에 귀속. 비공식 프로젝트임을 명시.

## 실제 구현

- `worker.mjs`: RSS/Atom 파싱, 3분 POP별 캐시, 결과 정규화, 700KB 응답 상한, 요청 제한시간, SSRF 예방을 위한 고정 원천 주소, 서버 오류 표시
- REST: `GET /api/notices`, `GET /api/search?q=`, `GET /api/status`, `GET /api/meta`
- MCP: `POST /mcp` Stateless Streamable HTTP JSON-RPC, `initialize`, `ping`, `tools/list`, `tools/call` 지원. `get_school_notices`, `search_school_notices`, `get_school_feed_status` 제공
- `/`: HTML/CSS/JS 반응형 개인 대시보드. 검색, 상태, 최신 게시물, 출처. 안전한 DOM `textContent` 삽입 사용
- JSON 응답 `no-store`, read-only 도구, 서버 사이드 원천 URL 고정
- `package.json`, `wrangler.jsonc`, `.gitignore`, Node RSS 파서 테스트 3개

## Cloudflare 운영 배포 — 실제 확인 사항

- Cloudflare Account: 소유자 계정
- Worker: `mcp-for-hanbom`
- Worker custom domain: **hanbom.rhee.life**
- Workers.dev: disabled
- Preview URLs: disabled
- Cloudflare Access 개인 앱: `hanbom.rhee.life` · 이메일 `dlghtp581@naver.com`만 Allow
- Cloudflare Access 공개 앱: `hanbom.rhee.life/mcp` · Bypass Everyone
- Cloudflare Access 공개 앱: `hanbom.rhee.life/api` · Bypass Everyone
- Access 정책은 신규 reusable 정책 2개(소유자 Allow, 공개 Bypass)를 별도로 생성했다.
- `/`의 Worker 응답은 Access assertion header가 없을 때 401. 단 이 검사는 JWT 서명 검증을 대체하지 않으며, 실제 권한 통제는 Cloudflare Access가 담당한다.

## GitHub main → Cloudflare Workers Builds

**GitHub Actions 사용 0.** Cloudflare 자체 Git 연결 및 자동 배포를 구성했다.

- GitHub repository: `hslcrb/mcp-for-hanbom`
- 브랜치: `main`
- Build: `npm run check`
- Deploy: `npm run deploy`
- Node: `24.22.1`
- Preview builds: disabled
- Worker tag: `61b1d3a3d958442099b7ba37c1e7df6c`
- Git push 이벤트: `c1a30028d465eaa73efc8487e2ec504df0f31e0f`
- Build UUID: `2f7b5320-f2ed-4e0f-9254-2e1cd417b3e9`
- Build 결과: `build_outcome=success`, test 3/3 pass, Node syntax check pass
- Wrangler deploy 결과: `hanbom.rhee.life (custom domain)`, `Success: Deploy command completed`
- 프로덕션 버전: `06e14d94-c3f6-45da-aff9-7619cc9ce797`, 100% 배포
- 최초 Worker API 업로드 이후 Git 기반 Wrangler 배포로 운영 경로를 전환하였다.
- Build 토큰은 기존 계정의 Workers Builds 토큰을 재사용했다. 보안 강화 시 전용 최소권한 토큰으로 교체할 것을 권장한다.
- Cloudflare 로그: bun install 시 lockfile 부재로 캐시 저장을 생략하였으나 빌드·배포 자체는 성공했다.

## 검증과 한계

1. 확인: GitHub 파일 생성 및 커밋, 빌드 webhook 트리거, Worker 구문 검사, RSS parser 단위시험 3건, Cloudflare 배포, custom domain, Access 앱/정책 및 공개 경로의 설정.
2. 미확인: 실제 외부 HTTP 요청으로 RSS 소스 데이터 정상 조회, 인증되지 않은 사용자의 로그인 리다이렉트, 개인 OTP 로그인 완료, ChatGPT MCP 클라이언트에서 연결·도구 실행.
3. 이 검증 결과를 실서비스 전체 기능 완성이나 외부 인증 성공으로 확대 해석하지 않는다.
4. OAuth 2.1 / PKCE는 **미구현**. 현재 공개 MCP는 무인증. 향후 OAuth 적용 시 보호된 자원 메타데이터와 인증 서버, PKCE, 클라이언트 등록, 토큰 발급·검증, scope 및 오류 응답을 별도 구축해야 한다.

## 운영 점검

- Worker·Custom Domain·Access 3개 앱이 삭제되지 않았는지 확인.
- `main`에 새 commit 후 Workers Builds의 성공 로그 확인.
- `/api/meta`가 JSON인지, `/api/notices`가 학교 RSS와 일치하는지 비교.
- `/mcp`에 POST `initialize`와 `tools/list`를 보내 JSON-RPC 규약 확인.
- 허용되지 않은 계정으로 `/` 접근 시 403·로그인 거부 확인. 공개 `/mcp`에 Access 로그인 요구가 없는지 확인.
- 학교 RSS 장애 시 502로 표시하며 값을 날조하지 않는지 확인.

## 재배포/롤백

- 주 배포 방식: GitHub main push → Cloudflare Workers Builds (GitHub Actions 없음).
- 실패 시 빌드 로그를 먼저 확인하고 마지막 정상 main 커밋으로 복원하거나, Cloudflare Worker 버전 배포 복구를 사용한다.
- Access 정책은 애플리케이션 별도로 유지한다. 빌드가 성공해도 공개 경로·인증 경로의 오작동 여부는 별도 확인 필요.
