# HANBOM DATA — Pill 컴포넌트·반응형 마크업 리팩터링

2026-11-11 · 기능과 디자인 유지, 내부 구조 개선

## 컴포넌트 구조

- `ui/pill-components.mjs`: 재사용 가능한 `PillButton`, `PillGroup`, `PillNavigation` SSR 컴포넌트.
- `PillNavigation`은 공식 `MENU_CATALOG`(23개)와 `BOARD_CATALOG`(82개)만으로 129개 pill을 조립한다.
- 모든 pill은 `<hanbom-pill>` Web Component 호스트 안에 **표준 `<button type="button">`**을 포함하며, `aria-pressed`, `aria-controls`와 선택 상태를 관리한다.
- `ui/site-client.mjs`: 선택 상태를 관리하는 `HanbomPill` Custom Element, 단일 위임 클릭 이벤트, RSS 3개 shard 병합 및 목록 표시.
- `ui/site-styles.mjs`: 레이아웃·디자인 정의를 Worker 본문에서 분리.
- `worker.mjs`: SSR 네비게이션, CSS, 클라이언트 스크립트를 조합하며 기존 RSS·REST·MCP 로직은 그대로.

## 레이아웃

- `main`, `.board-navigation`, `ol`은 **CSS Grid**, 1fr 열에 `minmax(0,1fr)` 사용.
- `.pill-layout`은 **Flexbox**와 `flex-wrap:wrap`, `justify-content:center`로 자연스럽게 여러 줄에 배치.
- `<hanbom-pill>`은 `display:inline-flex;min-width:0;max-width:100%`로 컨테이너 폭 초과 방지.
- 원래 검정/흰색 pill, 주아체 제목, 흰 배경, 중앙 정렬 목록, 호버 스타일 비활성화를 유지.
- 긴 텍스트는 `white-space:normal;overflow-wrap:anywhere`로 줄바꿈하고, 600px·360px에서 간격을 조정.
- 키보드 `focus-visible` 스타일 보존. Native button은 JS 컴포넌트 등록 전에도 나타남.

## 안정성·안전

- 서버 생성 마크업의 제목/속성은 HTML escaping을 적용하고 category ID 형식을 검증.
- 게시판 이름 중복은 서로 다른 ID로 구별. 23개 상위 메뉴와 각 하위 게시판 계층 모두 원문과 동일.
- Cloudflare 무료 플랜용 shard 0·1·2, RSS 캐시·REST·MCP 68개·민감 게시판 비식별 처리 변경 없음.
- GitHub Actions 사용하지 않으며 `main` → Cloudflare Workers Builds 자동 배포 유지.

## 검증

- 기존 51개 RSS·API·MCP 테스트 유지, `test/pills.test.mjs`의 UI 컴포넌트 8개 테스트 추가.
- 점검 범위: SSR 표준 버튼 129개, 선택 초기값, 23개 그룹, 텍스트 escaping, Flex/Grid 스타일, 단일 이벤트 위임, 반응형, 공개 서버/API 하위호환.
- 배포 후 좁은 뷰포트 overflow 및 버튼 필터 클릭의 브라우저 실측 검증을 기록.

## 실제 배포 결과

배포와 브라우저 검사 후 실측 결과 추가.
