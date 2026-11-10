# 접근 제어 설계 — HANBOM DATA

**기존 섹션은 처음 배포 당시의 Access 보호 구성 기록입니다. 현재는 전체 공개이며, 다음 내용은 복원용 참고로만 보존합니다.**

자세한 내용: [Access 일시 해제·복구 운영기](ACCESS_SUSPENSION_2026-11-10.md).


## 개요

Cloudflare Access의 경로별 self-hosted application을 사용합니다. **브라우저 대시보드는 소유자 전용, 공개 RSS REST·MCP는 누구나 사용 가능**하도록 분리합니다.

| 우선 경로 | Cloudflare Access 앱 | 적용 정책 |
| --- | --- | --- |
| `data.hanbom.rhee.life/mcp` | `HANBOM DATA | Public MCP | data.hanbom.rhee.life` | Bypass Everyone |
| `data.hanbom.rhee.life/api/*` | `HANBOM DATA | Public REST | data.hanbom.rhee.life` | Bypass Everyone |
| `data.hanbom.rhee.life` (나머지 경로) | `HANBOM DATA | Owner | data.hanbom.rhee.life` | Allow email `dlghtp581@naver.com` ONLY |

## 보안 상 주의사항

- Access의 기본 deny 정책과 경로 구분을 유지합니다. 공개 앱의 Bypass 범위가 루트 `/`까지 확장되지 않도록 합니다.
- Worker는 대시보드 HTML 반환 전에 `cf-access-jwt-assertion` 헤더 존재를 확인하지만 **이 코드가 JWT의 서명·발급자·대상·만료를 독자적으로 검증하지는 않습니다.** Cloudflare Access 앞단이 인증·인가의 핵심입니다.
- `workers.dev`/preview URL과 다른 Worker 우회 호스트를 비활성화합니다.
- 공개 REST/MCP는 조회 전용이고 학교 RSS 고정 원본에만 fetch합니다. 게시물 본문에 스크립트를 삽입하지 않도록 대시보드는 DOM `textContent`를 사용합니다.
- API에 CORS `*`을 설정한 것은 조회 전용 공개 엔드포인트에 한정됩니다. 유저 세션이나 비공개 데이터를 API에 반환해서는 안 됩니다.
- RSS 원본은 학교의 공개 자료이지만 재배포 가능 범위·개인정보·저작권은 별도로 확인해야 합니다.
- API/도메인/Access/Cloudflare 관리자 계정의 비밀 값은 저장소에 올리지 않습니다.

## 검증 체크리스트

- 비로그인 또는 다른 이메일로 `https://data.hanbom.rhee.life/` 열기 → OTP/로그인·거부 경로.
- 허용 이메일 로그인 → 대시보드 HTML 접근.
- 비로그인 `GET /api/meta`, `GET /api/status` → Access 로그인 페이지가 아닌 REST JSON.
- 비로그인 `POST /mcp`의 `initialize`, `tools/list` → JSON-RPC 응답.
- Cloudflare Worker의 workers.dev·preview URLs off 확인.
- 요청 제한·SSRF 고정 상류 URL과 공지 원문 링크 도메인 검증.

## OAuth 계획

현재 `/mcp`는 **OAuth 없는 읽기 전용 공개 서버**입니다. 향후 OAuth 2.1과 PKCE를 붙이려면 권한 서버, 토큰 발급·검증 및 resource metadata/authorization metadata, client registration, Bearer 401 challenge 등을 구축한 후 무인증 Bypass 정책을 조정해야 합니다. 현재 OAuth 보호가 활성화됐다고 표기하지 않습니다.
