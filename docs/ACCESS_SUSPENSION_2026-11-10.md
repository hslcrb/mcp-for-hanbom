# Cloudflare Access 일시 해제 · 복구 매뉴얼

날짜: 2026-11-10

## 현재 목표 및 실효 상태

- 서비스 정식 도메인: **`data.hanbom.rhee.life`**.
- 요구: 루트 대시보드, 공개 REST, 공개 MCP **전부 로그인 없이 누구나 접근**.
- Cloudflare Access 앱 및 재사용 정책은 향후 즉시 원복할 수 있도록 **삭제하지 않고 보존**.
- 기존 Access 앱의 호스트를 라우팅하지 않는 보관용 호스트 **`access-paused-hanbom.rhee.life`** 로 이동해 실제 서비스와 분리. 이는 Cloudflare 계정의 다른 Access 앱에는 영향을 미치지 않음.
- Worker 인증 헤더 검사도 소스 내 주석으로 보존하되 실행하지 않음.

## 보존된 정책 (그대로 사용)

| 이름 | Policy ID | 결정 및 조건 |
| --- | --- | --- |
| HANBOM owner only | `4037d853-56f2-432c-acbc-748d1f1c91e0` | Allow, `dlghtp581@naver.com`만 |
| HANBOM public read-only MCP and REST | `79c1c411-b483-4f69-a255-2313843b80b0` | Bypass Everyone |

## 기존 Access 앱 3개 — 운영 보존 계획

| 앱 | Access App ID | 기존 서비스 도메인 | 보존용 도메인 |
| --- | --- | --- | --- |
| Owner Dashboard | `c2a9c08b-1911-4cfa-bbea-fdec13132efe` | `data.hanbom.rhee.life` | `access-paused-hanbom.rhee.life` |
| Public MCP | `c09098d0-5abb-48e6-bcf9-1c5b78ce7fdb` | `data.hanbom.rhee.life/mcp` | `access-paused-hanbom.rhee.life/mcp` |
| Public REST | `b466fe61-543f-4b6a-a02f-7a47bd67dcc7` | `data.hanbom.rhee.life/api/*` | `access-paused-hanbom.rhee.life/api/*` |

보관용 호스트는 실제 서비스의 DNS/Worker Custom Domain에 연결하지 않습니다. 이 방식은 Active/Inactive 토글 자체는 아니지만, 정책 정의·앱 ID·앱의 정책 참조를 유지하며 실제 서비스 호스트에서만 Access를 제외하는 '주석화' 방식입니다.

## 코드 보존

GitHub 파일 `worker.mjs`에 다음 구문을 주석으로 남깁니다:

```js
// RESTORE ONLY after moving the suspended Access applications back to data.hanbom.rhee.life:
// if(!request.headers.get("cf-access-jwt-assertion"))return json({error:"Dashboard requires Cloudflare Access"},401);
```

**주의:** HTTP 헤더 존재 여부는 암호학적 인증이 아닙니다. 재보호의 핵심은 Cloudflare Access의 Owner Allow 앱을 원래 서비스 호스트로 돌리는 것입니다. 주석 복원은 보조 방어 수단이고, Cloudflare Access 정책 자체를 대체하지 않습니다.

## 나중에 다시 보호하는 절차

1. Cloudflare Zero Trust → Access controls → Applications에서 보관 중인 `HANBOM DATA` 앱 세 개를 찾습니다.
2. Owner 앱의 도메인을 **`data.hanbom.rhee.life`** 로 복원하고, 기존 정책 `HANBOM owner only` (Allow, 지정 이메일 1명)가 그대로 연결돼 있는지 확인합니다.
3. 공개 MCP 앱의 도메인을 **`data.hanbom.rhee.life/mcp`** 로, REST 앱을 **`data.hanbom.rhee.life/api/*`** 로 복원하고 Bypass Everyone이 유지됐는지 확인합니다.
4. 필요 시 `worker.mjs`의 주석을 해제해 Access Assertion 검사도 부활시킨 뒤 GitHub `main`에 커밋합니다. 실제 앱을 우선 보호하고, 코드 보조검사는 그 후 적용합니다.
5. 미인증 루트 페이지는 차단되고 지정 이메일 로그인 시 열리는지, 공개 API/MCP는 계속 정상 동작하는지 확인합니다.

## 전체 공개 유지 범위

- 대시보드 `/`와 `/index.html`: 공개.
- 일반 API `/api/*`: 공개 읽기 전용.
- 원격 MCP `/mcp`: 공개 무인증(서버의 OAuth 2.1/PKCE는 아직 미구현).
- API 및 MCP 구현·Cache/원천 URL은 변경하지 않음.
- `workers.dev`, Preview URLs: 여전히 비활성화. GitHub Actions: 없음.
- Cloudflare 계정의 다른 사이트·Access 앱은 전혀 변경하지 않습니다.

## 확인 구분

- 이 문서는 변경 **계획 및 실행 후 상태를 기록하는 운영 문서**입니다. 변경 커밋만으로 Cloudflare 적용/브라우저의 실제 비인증 HTTP 성공을 보장하지 않습니다.
