# 도메인 이전 작업기 — 2026-11-10

## 변경 요청

서비스의 정식 호스트 이름을 이전 `hanbom.rhee.life`에서 정확히 **`data.hanbom.rhee.life`**로 변경합니다. 철자는 `hanbom`이며, 학교 RSS 원본 주소 및 GitHub 저장소 이름은 그대로 유지합니다.

| 대상 | 이전 호스트 | 새 정식 호스트 |
| --- | --- | --- |
| 대시보드 | `https://hanbom.rhee.life/` | **`https://data.hanbom.rhee.life/`** |
| REST API | `https://hanbom.rhee.life/api/notices` | **`https://data.hanbom.rhee.life/api/notices`** |
| MCP | `https://hanbom.rhee.life/mcp` | **`https://data.hanbom.rhee.life/mcp`** |

## Cloudflare에서 실제 수행한 단계

1. `rhee.life` Zone에서 새 호스트와 충돌하는 DNS 레코드가 없음을 확인했습니다.
2. 새 Access 앱 3개를 먼저 생성해 개인/공개 접근 경계를 구성했습니다.
3. 새 호스트 `data.hanbom.rhee.life`를 기존 Worker `mcp-for-hanbom`의 Custom Domain으로 등록했습니다.
4. GitHub `main`에 `wrangler.jsonc`의 custom domain 변경을 반영하여 Workers Builds가 다음 배포부터 새 도메인으로 게시하도록 합니다.
5. **완료:** 새 도메인 `main` 자동 빌드와 100% 배포를 확인한 다음, 예전 `hanbom.rhee.life` Worker Custom Domain을 제거하고 예전 Access 앱 3개도 모두 삭제했습니다. 새 도메인 Access 앱 3개만 남았습니다.

## 변경하지 않은 항목

- GitHub repo: `hslcrb/mcp-for-hanbom`
- Worker name: `mcp-for-hanbom`
- 원본 RSS: `https://hanbom-h.goesw.kr/hanbom-h/na/ntt/selectRssFeed.do?mi=17249&bbsId=10062`
- 배포 브랜치: `main`
- 빌드 명령: `npm run check`
- 배포 명령: `npm run deploy`
- Preview builds: off, workers.dev: false, preview_urls: false
- MCP 인증 상태: 공개 무인증, OAuth는 후속 계획

## 관련 Cloudflare Access 입력값

| 앱 구분 | 도메인·경로 | 정책 |
| --- | --- | --- |
| 개인 대시보드 | `data.hanbom.rhee.life` | Allow `dlghtp581@naver.com` |
| 공개 REST | `data.hanbom.rhee.life/api/*` | Bypass Everyone |
| 공개 MCP | `data.hanbom.rhee.life/mcp` | Bypass Everyone |

## 등록값 및 검증

등록 서버 URL은 **`https://data.hanbom.rhee.life/mcp`**이고 인증은 **None**입니다. OAuth Client ID와 Secret은 입력하지 않습니다. [상세 등록 가이드](CHATGPT_PLUGINS_REGISTRATION.md), [자동 배포 운영 문서](DEPLOYMENT.md), [보안 문서](ACCESS_SECURITY.md)를 참조하세요.

**검증 구분:** Cloudflare 설정 API 결과가 성공하더라도 최종 외부 HTTPS·MCP·학교 RSS 실데이터의 성공을 곧바로 의미하지 않습니다. 배포 빌드/접속 테스트 결과를 별도 확인하여 기록합니다.

## 최종 마이그레이션 확인 결과

- GitHub `main` commit: `b20563ebc00c8342f6392b2d4b8e6e267d4df9eb`
- Cloudflare Workers Builds UUID: `f8097809-26d4-4eb4-8731-7c1078f8eb35`
- 빌드 상태: `stopped`, 빌드 결과: `success`, source: `main` push 이벤트.
- 프로덕션 Worker 배포 버전: `7daee9be-e805-4f3e-bbbb-d9245abcb281`, 트래픽 100% (도메인 이전 커밋 직후).
- Custom Domain 조회: **`data.hanbom.rhee.life`만 존재**, enabled `true`.
- DNS 확인: `data.hanbom.rhee.life`에 Cloudflare Proxy가 적용된 `AAAA` 레코드가 자동 생성됨.
- 예전 `hanbom.rhee.life`에는 별개로 사용되는 `MX`·`TXT` 레코드가 존재하므로 **건드리지 않았음**. 제거한 것은 이 Worker의 Custom Domain 및 이전 HANBOM Access 앱 3개.
- 신규 Access 개인용 앱 1개와 공개 앱 2개 모두 정상 생성, 정책 결합 확인. 재사용 가능 정책 2개 유지.
- `workers.dev` 및 preview URLs 모두 disabled 확인.
- 기존 GitHub Actions 생성 없이 `main`에 의한 Workers Builds 빌드·배포 완료.
- **외부 직접 HTTP 확인 한계:** 이 작업 환경에서는 새 호스트에 대한 직접 외부 GET/POST 및 비로그인·OTP 브라우저 인증 실측을 완료하지 못했습니다. Cloudflare 제어면 설정과 배포 결과가 확인됐다는 의미이지 HTTP·상류 RSS·MCP 호출 성공을 보장하는 뜻은 아닙니다.

## 새 경로 상태

| 항목 | 상태 |
| --- | --- |
| `data.hanbom.rhee.life` Worker 도메인 | Cloudflare 등록·배포 성공 |
| `data.hanbom.rhee.life` Owner Access | `dlghtp581@naver.com` 단일 이메일 Allow 설정 확인 |
| `data.hanbom.rhee.life/mcp` Access Bypass | Everyone 정책 설정 확인 |
| `data.hanbom.rhee.life/api/*` Access Bypass | Everyone 정책 설정 확인 |
| `hanbom.rhee.life` Worker 도메인 | 이전 연결 제거 |
| `hanbom.rhee.life` HANBOM Access 앱 3개 | 삭제 성공 |
| GitHub `main` 자동 배포 | 실제 빌드·배포 성공 |
| MCP OAuth 2.1 / PKCE | 미구현, 현재 공개 읽기 전용 |

최종 사용자·플러그인 등록에는 **`https://data.hanbom.rhee.life/mcp`**만 사용합니다.
