# Cloudflare Workers Builds 자동 배포 및 운영

## 목표와 실제 연결

**GitHub Actions 없음.** Cloudflare GitHub 통합이 `hslcrb/mcp-for-hanbom` 저장소 `main` 브랜치의 변경을 감지해 빌드·배포합니다.

| 설정 항목 | 값 |
| --- | --- |
| Git provider | `GitHub` |
| Provider account | `hslcrb` |
| Repository | `mcp-for-hanbom` |
| Production branch | **`main`** |
| Root directory | `/` |
| Build command | **`npm run check`** |
| Deploy command | **`npm run deploy`** |
| Node version (Build 환경변수) | `24.22.1` |
| Preview builds | `off` |
| Worker name | `mcp-for-hanbom` |
| Custom Domain | **`data.hanbom.rhee.life`** |
| workers.dev | `false` |
| Preview URLs | `false` |
| Cloudflare account | 소유자의 Cloudflare 계정 |

설정 원본: 저장소 루트 `wrangler.jsonc`, `package.json`. `wrangler.jsonc`의 `routes`에서 `custom_domain: true`와 새 FQDN을 사용합니다.

## 빌드 흐름

```text
git push origin main
  → GitHub / Cloudflare repository connection
  → Cloudflare Workers Builds
  → npm run check (Node 구문 + RSS parser 테스트)
  → npm run deploy (wrangler deploy)
  → Cloudflare Worker: mcp-for-hanbom
  → https://data.hanbom.rhee.life
```

Cloudflare Build token은 Cloudflare 계정의 Workers Builds에만 저장하고 값 자체는 GitHub·문서·로그에 복사하지 않습니다. 이전 설정에서 기존 Build token을 재사용했으므로 최소 권한·전용 token 교체를 추후 권장합니다.

## 실제 배포 시 주의사항

- Root dashboard는 Access 허용자만 접근할 수 있으므로 비로그인 검증은 로그인 요구/거부가 정상입니다.
- `/mcp`와 `/api/*`는 각각 더 구체적인 Access Bypass 앱이 지정돼야 공개 호출이 가능합니다.
- 운영 도메인은 `data.hanbom.rhee.life`입니다. 더 이상 `hanbom.rhee.life`에 서비스를 게시하지 않습니다.
- 학교 RSS 원본의 데이터가 정상 응답하는지는 별도 시험해야 합니다. 배포 성공만으로 RSS 본문까지 검증되지는 않습니다.
- `Cloudflare Worker -> Workers Builds`의 실제 빌드 commit SHA, 테스트 통과, 배포 버전을 확인합니다.

## 검증용 명령

```bash
npm install
npm run check
curl -i https://data.hanbom.rhee.life/api/meta
curl -i https://data.hanbom.rhee.life/api/status
```

Cloudflare Access 소유자 이메일 이외 계정에서 `/` 접근이 불가능한지, 공개 REST와 MCP에 불필요한 Access 로그인 리다이렉트가 없는지 확인합니다.

## 장애 대응/롤백

1. 빌드가 실패하면 Workers Builds 로그의 설치·검사·배포 단계 및 브랜치/빌드 토큰 권한을 확인합니다.
2. 배포 성공 후 5xx이면 Worker 오류와 학교 RSS 상류 상태를 구분합니다.
3. Access 로그인 우회/오작동이면 Access 앱 도메인·경로별 정책의 우선순위를 확인합니다. 보호 경로가 열린 상태는 방치하지 않습니다.
4. 롤백은 GitHub `main`의 이전 정상 커밋으로 변경해 자동 재배포하거나 Cloudflare Worker 이전 버전으로 되돌립니다.

## 관련

- [Plugins 등록값](CHATGPT_PLUGINS_REGISTRATION.md)
- [보안 정책](ACCESS_SECURITY.md)
- [도메인 이전 기록](DOMAIN_MIGRATION_2026-11-10.md)
- [구축 개발기](BUILD_HISTORY_2026-11-10.md)
