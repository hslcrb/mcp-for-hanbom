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

---

## 도메인 변경 추가 기록 — 2026-11-10

> 이 문서 상단의 `hanbom.rhee.life` 정보는 **초기 배포 당시의 역사적 기록**입니다. 현재 정식 주소는 아래의 **`data.hanbom.rhee.life`**입니다.

1. 요청에 따라 서비스 FQDN을 `data.hanbom.rhee.life`로 정확하게 교체.
2. 신규 Access 앱 3개와 기존 reusable 정책을 연결한 뒤 Worker Custom Domain 생성.
3. GitHub `main`에 `wrangler.jsonc`의 Custom Domain 변경, README 및 등록·배포·보안 문서 수정.
4. Cloudflare Workers Builds가 commit `b20563ebc00c8342f6392b2d4b8e6e267d4df9eb`를 감지하고 빌드 `f8097809-26d4-4eb4-8731-7c1078f8eb35`를 성공 처리. Worker version `7daee9be-e805-4f3e-bbbb-d9245abcb281`가 100% 프로덕션에 배포됨.
5. Cloudflare Custom Domain 목록에서 기존 `hanbom.rhee.life`가 제거되고 `data.hanbom.rhee.life`만 남은 것을 재확인.
6. 기존 호스트에 한정된 Access 앱 3개를 모두 삭제하고, 신규 호스트 개인/공개 Access 앱 3개를 다시 조회해 정책 일치 확인.
7. 새 DNS에 프록시된 AAAA가 생성됨을 확인. 기존 도메인의 별도 이메일용 MX/TXT는 유지.
8. `workers.dev`/Preview URLs 비활성화 유지, `main` 브랜치 Git 연결 및 자동 배포 유지. GitHub Actions 생성·사용 없음.

### 현재 입력값

- Web: `https://data.hanbom.rhee.life/` (Cloudflare Access 단일 이메일)
- REST: `https://data.hanbom.rhee.life/api/notices` · `https://data.hanbom.rhee.life/api/status`
- MCP: **`https://data.hanbom.rhee.life/mcp`**
- ChatGPT Plugin Name: `HANBOM Data MCP`
- ChatGPT Authentication: `None`
- OAuth Client ID / Client Secret: 빈칸 (MCP OAuth 아직 구현 전)
- GitHub: `hslcrb/mcp-for-hanbom` / `main`
- Worker: `mcp-for-hanbom` / Build: `npm run check` / Deploy: `npm run deploy`

### 검증 주의

운영 배포의 성공과 실제 RSS 수신·MCP 연결 성공·OTP 로그인 성공을 혼동하지 않습니다. 후자 3가지는 이 턴에서 HTTP 브라우저 실측이 되지 않았습니다. 자세한 이전 기록과 Cloudflare 설정은 [도메인 이전 기술기](DOMAIN_MIGRATION_2026-11-10.md), [플러그인스 등록 가이드](CHATGPT_PLUGINS_REGISTRATION.md), [배포 매뉴얼](DEPLOYMENT.md), [Access 보안 매뉴얼](ACCESS_SECURITY.md)를 참조하세요.

---

## 추가 이력 — 2026-11-10 · 공개 전환 및 제목 수정

- 디자인: H1을 `한봄고 홈페이지 공지사항 MCP`로 변경. 주아체 CDN, 순백 배경, 중앙 목록 레이아웃 및 무호버 스타일은 유지.
- 인증: 기존 Worker 루트의 `cf-access-jwt-assertion` 검사를 **주석화**하여 미인증 GET/HEAD도 HTML을 반환하도록 변경.
- REST `/api/meta` 응답에서 대시보드 인증 상태를 `public`로 교정.
- Cloudflare Access 관련 앱과 reusable policy는 삭제하지 않고 **서비스가 연결되지 않은 보관용 호스트**로 이전해 현재 사용자 접속에는 정책이 작동하지 않도록 처리.
- GitHub `main` → Cloudflare Workers Builds 자동 배포 유지. GitHub Actions 없음.
- 세부 복구 절차와 실제 Access 설정 기록: [ACCESS_SUSPENSION_2026-11-10.md](ACCESS_SUSPENSION_2026-11-10.md).
