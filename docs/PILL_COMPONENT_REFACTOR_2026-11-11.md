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

## 최종 운영 배포·실제 브라우저 검증

- 최종 UI 구현 커밋: `f7e1deff21a6960dc44a87d93ee0ab2535da59b0` (GitHub `main`, v2.0.1).
- Cloudflare Workers Builds: `eefbec10-2006-408f-ab4b-fb7cca5f6876`; 빌드 결과 `success`, Node 테스트 **59개 통과 / 실패 0**, Worker 배포 명령 성공.
- Cloudflare 프로덕션 Worker 버전: `1115efa5-4938-46b5-89ad-e0e31d769fc5`, 트래픽 100%. 도메인 `data.hanbom.rhee.life` 유지.
- Cloudflare Browser Rendering을 통해 실제 프로덕션 HTML에서 `<hanbom-pill>` **129개**, 원래의 `<button>` 129개, 브라우저 Custom Element 클래스 `HanbomPill` 등록 확인.
- 실제 조회에서는 82개 RSS 범위의 **528건** 게시물 원문 링크를 모두 렌더링. 빈 피드·상담 게시물 보호 처리와 기존 API/MCP 경로 변경 없음.

### 360px 모바일 스모크 테스트

- 뷰포트 `width=360`, `document.documentElement.scrollWidth=360`, 가로 넘침 없음.
- 계산된 CSS: `main.display=grid`, 첫 `.pill-layout.display=flex`.
- Web Component 호스트 129개, 실제 native button 129개, 데이터 로딩 완료, 원문 링크 528개.
- `커뮤니티` 클릭: 상위 버튼 `aria-pressed=true`, 호스트 `selected=true`; `각종양식[서식]` 클릭: 11건.
- `법인 > 임원 인적사항` 선택: 3건. 표시된 pill 요소가 화면 경계를 넘는 경우 **0개**.
- `전체 보기` 복귀: 528건 복원.

### 320px 초소형 모바일

- 뷰포트 `width=320`, 문서 가로 scrollWidth도 320, 스크롤 넘침 0.
- `법인 > 임원 인적사항`을 실제 클릭한 뒤 선택 버튼 `aria-pressed=true` 유지.
- 현재 표시된 pill 31개(상위 24 + 법인 하위 7), 화면 경계 바깥으로 넘친 pill **0개**, 가장 긴 버튼의 실제 폭 292px.
- 긴 법인 게시판 이름이 내용 컨테이너 안에서 줄바꿈되며 원문 게시물은 정상 표시됨.

### 1440px 데스크톱

- 뷰포트 `width=1440`, 문서 scrollWidth 1440으로 수평 넘침 없음.
- 상위 메뉴 24개 pill이 **4개 행으로 자동 줄바꿈**. Grid와 Flex 계산 스타일 확인.
- 초기 전체 보기 528건 렌더링, 첫 번째 전체 보기 pill의 `selected=true` 확인.

## 결론

변경은 UI 컴포넌트·반응형 내부 마크업 구조에 한정했다. REST/MCP·RSS 82종·Cloudflare Access 복구용 설정 및 GitHub Actions를 사용하지 않는 `main` 자동 배포 체계는 유지했다.
