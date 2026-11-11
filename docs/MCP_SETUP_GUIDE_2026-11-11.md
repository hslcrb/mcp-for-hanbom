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
