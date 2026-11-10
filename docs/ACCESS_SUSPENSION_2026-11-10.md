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

## 실제 처리 완료 및 최종 검증 (2026-11-10 KST)

설정이 **실제로 반영된 결과**입니다. 단순 계획이 아닙니다.

- `HANBOM DATA` Access 앱 3개의 `PUT /accounts/{account_id}/access/apps/{app_id}`를 실행하여 `domain`만 보관용 비라우팅 호스트로 전환. 세 앱 모두 HTTP 2xx / API `success:true` 처리.
- 세 앱의 **원래 ID 그대로 유지**, 각각 연결된 재사용 정책 ID 그대로 유지.
- 실제 서비스 호스트 `data.hanbom.rhee.life`에 매칭되는 Access 앱: **0개**.
- 보관 호스트 `access-paused-hanbom.rhee.life`에 Access 앱: **3개**, 해당 호스트에 DNS 레코드 **0개**.
- Cloudflare 계정 조직 설정 `deny_unmatched_requests: false` 확인. 기존 미등록 호스트 기본 차단이 적용되지 않음.
- 다른 클라우드 Access 앱은 전혀 수정하지 않음. Worker Custom Domain은 `data.hanbom.rhee.life` 유지.
- `workers.dev`와 Preview URLs는 계속 비활성화.
- 백엔드 Worker는 **로그인용 Access Assertion 헤더가 없어도 대시보드 HTML 200을 반환하는 테스트** 통과.
- 헤더 검사는 `worker.mjs`에 복구 가능한 주석으로 보존.
- GitHub `main` push `7ff4c294d7cf4d7485677855a45b9d6adcb61b2e` 에 의해 Cloudflare Workers Builds **성공**.
- Cloudflare build UUID `140ce060-593b-417e-bd83-8aedee9c6f9d`: 검사 9개 통과 / 실패 0 / Worker 배포 성공.
- 해당 시점 프로덕션 Worker version `c81e8b86-41b5-48ec-88d3-d2c4aa0a6b1c`, 배포 비율 **100%**.
- ChatGPT의 등록된 HANBOM Data MCP에서 `get_school_feed_status` 및 `get_school_notices` 직접 실행하여 **공식 RSS 53개 항목** 정상 조회.
- 시각 디자인 H1 `한봄고 홈페이지 공지사항 MCP` 적용, 주아체·화이트·목록 레이아웃 유지.

**검증 범위:** Cloudflare 설정·Worker 배포·유닛 테스트·실제 ChatGPT MCP 호출을 확인했습니다. 별도의 익명 외부 브라우저 GET 실측은 이 환경의 DNS 접근 제한으로 수행하지 못했습니다. 다만 Worker의 비인증 요청 테스트와 Cloudflare 설정 상 실제 서비스 도메인은 Access 비적용입니다.

**복구 데이터:** [JSON 정책 백업](../config/cloudflare-access-standby.json)에는 원래 서비스 경로·보관 경로·앱 ID·정책 ID가 보존됩니다. JWT/토큰/비밀키는 저장하지 않습니다.
