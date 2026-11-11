# 한봄고등학교 학교 코드 환경변수 및 MCP 연계 (2026-11-11)

## 공식 학교 식별자

제공된 `hslcrb/ALL-API-KEYS/sea35652/한봄고등학교 메타기본정보/info.txt`에 따라 다음과 같이 설정한다.

| Cloudflare Worker binding | 값 | NEIS 요청 |
| --- | --- | --- |
| `NEIS_EDUCATION_OFFICE_CODE` | `J10` | `ATPT_OFCDC_SC_CODE` |
| `NEIS_SCHOOL_CODE` | `7531327` | `SD_SCHUL_CODE` |
| `NEIS_UNIFIED_SCHOOL_CODE` | `J107531327` | 메타데이터(결합 코드) |

학교 코드는 공개정보이므로 평문 변수로 저장해도 되지만, 2026-11-11 연결된 Cloudflare API에서는 기존 두 개의 인증키를 유지하며 위 세 항목을 `secret_text` 바인딩으로 추가했다. 코드에서는 `env` 인터페이스가 같으므로 동작은 동일하다. 값은 비밀키가 아니며 실제 인증키 `NEIS_API_KEY`와 `UNIVERSITY_INFO_API_KEY`를 공개하지 않는다.

## 런타임 적용

`neis.mjs`의 `schoolConfig(env)`가 공식 코드 3개를 검증하고 NEIS 업스트림 필터 `ATPT_OFCDC_SC_CODE`, `SD_SCHUL_CODE` 및 공개 메타데이터에 사용한다. 환경변수가 없거나 형식이 잘못되면 기존 한봄고 기본값을 사용하며, 통합코드는 교육청 코드와 행정표준학교코드를 합성하여 불일치를 예방한다.

## MCP와 REST의 동일 데이터 경로

- **MCP:** `https://data.hanbom.rhee.life/mcp`; Streamable HTTP, 읽기 전용 도구 78개. 기존 82개 RSS 피드와 NEIS 6개·대학알리미 4개 도구를 유지한다.
- **REST:** `/api/feed`, `/api/search`, `/api/neis/*`, `/api/university/*`. NEIS REST와 MCP는 `queryNeis`를 공유하고, 대학알리미 REST와 MCP도 같은 서비스를 공유한다.
- **UI:** 위 API를 호출하는 공개 대시보드 및 MCP 설정 안내 페이지는 그대로 유지한다. 모든 화면 요소를 개별 MCP 도구로 만들 필요는 없으며, 데이터 조회 기능만 MCP로 제공한다.

## 검증

- GitHub에서 새 코드·테스트·로컬 예시를 `main`에 커밋했다.
- Cloudflare Worker `mcp-for-hanbom`의 5개 바인딩 이름을 확인했다. 기존 API 키 2개는 유지됐다.
- Cloudflare 배포 기록에서 2026-11-11 03:02 UTC에 Wrangler 기반 신규 배포가 생성된 사실을 확인했다.
- `test/neis.test.mjs`에 올바른 코드·잘못된 값의 대체 처리 검증을 추가했다. **이번 작업에서 로컬 Node 테스트 실행 또는 실제 `POST /mcp` 실호출 결과는 확보하지 못했으므로 통과라고 기록하지 않는다.**

로컬 검증: `npm run check`. 운영 검증: `GET /api/neis/meta`의 `office_code`, `school_code`, `unified_school_code`와 `POST /mcp`의 `tools/list` 및 `get_neis_connection_status`를 확인한다.
