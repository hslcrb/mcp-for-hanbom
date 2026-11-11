# HANBOM DATA — ChatGPT·Claude 원격 MCP 설정 페이지

2026-11-11 · 홈페이지에서 /mcp-setup으로 연결 · v2.2.0

## 사용자가 요청한 작업

기존 HTML 메뉴 pill 컴포넌트 `PillButton`을 그대로 재사용해 별도 **MCP 설정하기** 내비게이션 pill을 추가. 해당 pill에는 사용자가 지정한 [GitHub SVG 폴더](https://github.com/hslcrb/chatgptweb-transbank/tree/main/frontier-llms-logos)의 ChatGPT·Claude 두 원본 심볼을 가로로 배치하고, 아이콘 크기를 **폰트 크기 `1em`**로 맞춘다.

새 pill을 클릭하면 `https://data.hanbom.rhee.life/mcp-setup`으로 이동한다. 기존 129개 RSS 필터 pill과 이벤트 핸들러의 범위는 변경하지 않는다.

## 원본 SVG 수집

| 자산 | 원본 경로 | 프로젝트에 저장한 파일 | 제공 URL |
|---|---|---|---|
| ChatGPT | `frontier-llms-logos/chatgpt-symbolAsset 1.svg` | `assets/logos/chatgpt.svg` | `/assets/logos/chatgpt.svg` |
| Claude | `frontier-llms-logos/claude-symbolAsset 1.svg` | `assets/logos/claude.svg` | `/assets/logos/claude.svg` |

원본 파일은 형상 변경 없이 줄바꿈만 정규화해 저장. Worker에서 직접 응답하는 `ui/logo-assets.mjs`에도 동일한 SVG 데이터를 포함한다. 외부 GitHub CDN과 연결하지 않아도 로고가 표시되도록 **같은 출처**에서 `image/svg+xml`과 `nosniff` 헤더로 제공한다. 이미지엔 자바스크립트나 외부 리소스를 허용하지 않는다.

## SSR 컴포넌트

- 기존 `PillButton({id,label,selected})`는 원래 그대로인 native 버튼 분기 유지.
- 새 `PillButton({href:"/mcp-setup",label:"MCP 설정하기",icons:["chatgpt","claude"]})`는 동일 `<hanbom-pill>` 내부에 **원래의 native 링크 `<a>`**를 렌더링한다. `href`는 로컬 절대 경로만 허용하고, `icons`는 `chatgpt`, `claude`로 제한한다.
- 메인 버튼의 이미지 `width:1em;height:1em;flex:0 0 1em`으로 문자 높이와 정확히 동일하게 표시.
- ChatGPT 원본은 검정 심볼이므로 다크 배경에서는 `filter:invert(1)` 적용. Claude의 주황색 벡터는 보존.
- 페이지 상단의 **홈으로**도 같은 `PillButton`을 이용한 링크 컴포넌트.
- 홈페이지 RSS 필터 129개와 설정 링크 1개로 총 130개 pill 호스트. 카테고리 버튼은 기존 129개로 변화 없음.

## MCP 설정 페이지 설계

- 경로 `GET /mcp-setup`와 `GET /mcp-setup/`, HEAD 요청 지원. POST 등 수정 요청은 405.
- `ui/mcp-setup-page.mjs`: 전체 SSR 페이지 및 ChatGPT·Claude 두 안내 카드.
- `ui/mcp-setup-styles.mjs`: 기존 테마 변수·Juache H1과 연동한 28px 둥근 카드, 데스크톱 Grid 2열·820px 이하 Grid 1열.
- `ui/mcp-setup-client.mjs`: 표시 이름과 URL 복사 버튼 2개, 클립보드 API/기본 복사 대체 및 `aria-live` 상태 메시지.
- 기존 자동/라이트/다크 테마 선택 UI는 설정 페이지에도 재사용.
- 320px까지 깨지지 않는 모바일 CSS와 긴 서버 URL의 줄바꿈 처리.

## 등록값

| 입력항목 | 값 |
|---|---|
| 이름 | `HANBOM Data MCP` |
| 서버 주소 | `https://data.hanbom.rhee.life/mcp` |
| 통신 방식 | `Streamable HTTP` |
| 인증 | `None` / Claude는 `No sign in` |
| API 키 / OAuth | 입력하지 않음 |
| 서버 종류 | 공개·읽기 전용 비공식 한봄고 RSS MCP |

**설정 페이지 자체는 연결을 대신 승인하지 않으며**, 각 이용자가 ChatGPT·Claude UI에서 명시적으로 연결해야 한다.

## ChatGPT MCP 연결 순서 (공식 문서 기준)

1. ChatGPT 웹 → **Plugins**.
2. **+** → **Add custom MCP server**.
3. Name과 Connection URL에 위 등록값 입력.
4. Authentication은 **None**. 위험 경고 확인 및 동의.
5. **Create as a plugin**을 선택하고 표시되는 도구 목록을 검토. 계정/워크스페이스 권한에 따라 이용 가능 메뉴가 다를 수 있음.
6. 채팅에서 설치한 플러그인을 사용하여 `list_school_boards`, `get_board_posts`를 호출.

공식 안내: https://help.openai.com/ko-kr/articles/12584461-connecting-custom-mcp-servers-in-chatgpt

## Claude 원격 MCP 연결 순서 (공식 문서 기준)

1. Claude 웹 → **Customize > Connectors**.
2. **Add > Custom > Web** 또는 표시되는 **Add custom connector**.
3. Name, URL을 입력하고 **Continue**.
4. **Authentication → No sign in**. 토큰·헤더·OAuth client 정보 불필요.
5. **Add** 후 채팅 입력창의 **+ → Connectors**에서 연결 활성화.

공식 안내: https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp

메뉴 이름·위치는 양사 UI 업데이트 및 계정 권한에 따라 달라질 수 있으므로 공식 안내 링크도 함께 제공한다.

## 배포 불변조건

- 기존 RSS **82개**, 메뉴 **23개**, MCP 도구 **68개**, REST 경로·3 shard·개인정보 보호·Cloudflare Access 아카이브 상태 유지.
- 외부 CDN으로 SVG를 직접 로드하지 않고 `img-src 'self'` CSP만 추가.
- GitHub Actions는 추가하지 않음. `main` 커밋 시 **Cloudflare Workers Builds**가 테스트 후 자동 배포.
- 새 로고는 고정 원본만 서비스하며 외부 사용자 입력으로 임의 SVG를 가져오지 않는다.

## 테스트

- 신규 `test/mcp-setup.test.mjs`: 등록 pill SSR/링크 유효성, 로고 SVG 원본 일치, 1em 크기, 안내·복사 버튼, 두 SVG MIME/HEAD 처리, API 회귀.
- 기존 `test/pills.test.mjs`, `test/theme.test.mjs`의 메인 페이지 pill 호스트 개수만 129 → 130으로 변경.
- 전체 Node 테스트 및 Cloudflare 배포, 320/360/1440px 라이브 브라우저 검증 결과는 배포 후 기록한다.

---

## 프로덕션 배포 및 실제 브라우저 검증 — 2026-11-11

### GitHub·Cloudflare

- 최초 기능·설명서 구현 커밋: `fdaf69304ae8be30a39c7c62f993994465726cd9` (`main`).
- Cloudflare Workers Builds 빌드 ID: `1c0e136d-8fe6-4565-80b5-5c99cbbe0455`.
- **테스트 73/73 통과, 실패 0, 빌드와 자동 배포 모두 success**.
- Worker 프로덕션 버전 `185cb0f9-1142-4709-b6b4-c36df76f7138`, 트래픽 100% 확인.
- GitHub Actions 사용하지 않고 기존 `main` → Cloudflare Workers Builds 파이프라인만 이용함.

### 메인 페이지에서 확인한 신규 pill

- 운영 주소: https://data.hanbom.rhee.life/.
- `href=/mcp-setup`, 레이블 `MCP 설정하기`, 부모 `<hanbom-pill>` 컴포넌트 정상.
- 원본 ChatGPT SVG, Claude SVG가 각각 같은 출처 `/assets/logos/chatgpt.svg`, `/assets/logos/claude.svg`로 성공적으로 로드됨.
- 360px 모바일에서 CSS 폰트 `15px`, **두 아이콘 계산 너비 각각 `15px`** → 요청한 글자 크기와 같음.
- RSS 메뉴의 기존 pill 129개와 실제 RSS 원문 링크 528개 로딩을 확인. 신규 안내 링크는 RSS 필터 이벤트와 분리됨.
- 320px 모바일: 문서 너비 320px, 제목 하단 y=155, 설정 pill 상단 y=164, 하단 y=207, 메뉴 시작 y=249로 **겹침 없음**.
- 다크모드에서 페이지 배경 `rgb(19,22,27)` 및 검정 ChatGPT SVG `filter:invert(1)` 적용 확인. 이 경우도 아이콘 15px, 두 이미지 정상 로드.

### 안내 페이지 모바일/데스크톱

- 운영 주소: https://data.hanbom.rhee.life/mcp-setup.
- 320px 모바일: 문서 전체 너비 320px, 안내 카드 2개가 **1열 292px 너비**로 정렬되며 수평 넘침 없음.
- ChatGPT/Claude 카드 이미지 둘 다 로드됨, 계산 크기 각각 28×28px(각 카드 제목 주변의 가독성을 위한 `1em` 크기).
- `/assets/logos/chatgpt.svg`와 `/assets/logos/claude.svg` 직접 GET 요청 각각 HTTP **200**, MIME `image/svg+xml; charset=utf-8`, 본문은 원본 SVG 형식.
- 안내 페이지는 다크모드 버튼 클릭 시 `rgb(19,22,27)` 배경과 `rgb(32,38,47)` 카드 배경으로 변함.
- 상단 홈으로 링크와 테마 선택 버튼은 320px에서도 겹치지 않음(홈 버튼 오른쪽 x=76, 테마 왼쪽 x=157).
- 1440px 데스크톱: 각 안내 카드 폭 **541px**, 두 카드가 Grid 2열로 나란히 배치됨. 수평 오버플로 없음.
- ChatGPT와 Claude 각각 5단계 절차, 공식 안내 링크 노출 확인.
- 실제 DOM에서 **서버 URL 복사 버튼 클릭** 후 `복사했어요. 해당 서비스의 설정 화면에 붙여넣으세요.` 상태 메시지를 확인.

### 등록 절차·의존 관계

- ChatGPT 절차는 OpenAI 공식 [맞춤형 MCP 서버 연결 안내](https://help.openai.com/ko-kr/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)를 참고.
- Claude 절차는 Anthropic 공식 [원격 MCP 사용자 정의 커넥터 안내](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)를 참고.
- 두 외부 서비스에 **실제 계정 연결 자체를 실행하지는 않았음**. 이 페이지는 설정법과 복사를 제공하며, 연결은 각 이용자가 별도로 승인해야 한다.
- 기존 등록 주소·인증 값(`https://data.hanbom.rhee.life/mcp`, `None`) 유지. 기존 82개 RSS·68개 MCP 도구 그대로.

## 2026-11-11 · ChatGPT·Claude SVG 크기 개선 (v2.2.1)

- **메인 설정 pill**의 아이콘 CSS 크기를 기존 1em/15px에서 **1.6em/24px**으로 확대. `--setup-brand-icon-size` 변수 하나로 두 SVG를 동일하게 제어.
- 두 아이콘과 레이블 사이 간격은 12px. 원본 SVG 형상·색·경로는 변경하지 않고 다크모드 ChatGPT 반전도 유지.
- **MCP 안내 카드**의 두 로고는 기존 **28px → 36px**, 아이콘 주변 둥근 프레임은 **54px → 66px**로 확대.
- `test/mcp-setup.test.mjs`에서 두 로고가 동일하게 확대됐는지 검증. 실제 Cloudflare 배포/브라우저 실측 결과는 아래에 추록.

### v2.2.1 로고 확대 배포·실측 기록

- GitHub `main` 코드·문서 반영 커밋: `39777ca40f589b1646f683cb319176ec6ed51dff`.
- Cloudflare Workers Builds `03df0e8c-465b-485c-a926-894d736ee3d9`: **success**, 테스트 **74/74 통과**, 새 Worker `c5979e8b-ca33-4e99-a9d7-c3e5db0bf497` 프로덕션 100% 적용.
- Cloudflare Browser Rendering으로 실제 `https://data.hanbom.rhee.life/`을 360px 폭에서 렌더링하고 아이콘 크기를 확인. ChatGPT와 Claude 각각 **24×24px**, 두 이미지 모두 로드 완료.
- 기본 글씨는 **15px**, 이미지 사이 `gap=12px`, 링크 `href=/mcp-setup`, 문서 너비 360px로 수평 넘침 없음.
- 다크모드 배경 `rgb(19,22,27)`과 ChatGPT 심볼 `filter:invert(1)`도 그대로 정상.
- 안내 페이지 카드 로고는 코드·자동 테스트에서 모두 **36×36px**, 프레임 **66×66px**인 것을 확인. 추가 브라우저 렌더링은 Cloudflare HTTP 429 rate limit에 걸려 해당 화면의 실측 픽셀은 확인하지 못함.
- 원본 SVG 데이터·MCP 기능 및 RSS 수집·등록 경로와 다크모드/모바일 레이아웃은 변경하지 않음.
