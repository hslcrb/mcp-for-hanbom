# 2026-11-10 — 주아체 H1 추가

## 변경 요구

- 순백색 공지 제목 리스트 상단에 H1 **한봄고 공지사항 MCP** 삽입.
- 폰트: 배달의민족 주아체, `@font-face`의 `font-family: 'Juache'`.
- CDN: `https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.woff`.

## 구현

- `worker.mjs`: HTML `<main>`의 `<ol id="notices">` 이전에 제목을 직접 넣고 가운데 정렬.
- H1 CSS는 `Juache` 전용이며 공지 목록 본문 서체를 변경하지 않음. 모바일을 포함한 반응형 크기 32~46px 적용.
- 폰트가 느리거나 실패하더라도 표시하도록 `font-display: swap`과 sans-serif 폴백 사용.
- CSP가 CDN 폰트를 막지 않도록 `font-src https://cdn.jsdelivr.net`만 추가 허용. REST/MCP JSON/인증 경로는 변경하지 않음.
- 기존 화이트/중앙 목록/링크 호버 스타일 미변경, 별도 요소 추가하지 않음.

## 검증

- `node --check worker.mjs` + `node --test` (주아체 H1/웹폰트 CDN/CSP를 점검하는 테스트 포함).
- 운영 검증: GitHub main 푸시를 인지한 Cloudflare Workers Builds의 검사·배포 완료 여부를 확인. 폰트가 브라우저에서 실제 그려졌는지는 브라우저 시각 검사로 별도 검증.

## 재배포 구조

GitHub `hslcrb/mcp-for-hanbom`의 main → Cloudflare Workers Builds. GitHub Actions 사용하지 않음. `data.hanbom.rhee.life` 유지.
