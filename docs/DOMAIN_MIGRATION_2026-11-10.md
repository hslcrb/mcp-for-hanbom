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
5. 기존 호스트/Access 앱은 새 도메인 배포 확인 후 정리합니다.

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
