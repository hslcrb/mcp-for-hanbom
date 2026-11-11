# API Reference — HANBOM DATA v3.0

Base URL: `https://data.hanbom.rhee.life`
MCP endpoint: `POST /mcp` (Streamable HTTP, stateless, currently no OAuth).

## Public university education API

Metadata: `GET /api/university/meta`
Secret-binding status: `GET /api/university/status`
Data: `GET /api/university/query`

Supported query arguments:

| Parameter | University comparison | Regional statistics | Rule |
|---|---|---|---|
| `scope` | `comparison` | `regional` | Required |
| `metric` | 6 values below | 6 values below | Required |
| `schoolId` | Required | Not supported | Official `schlId` |
| `year` | Required | Not supported | Official `svyYr`, YYYY |
| `schoolDivisionCode` | Not supported | Required | Official `schlDivCd` |
| `page` | Optional | Optional | Integer 1–10, default 1 |
| `size` | Optional | Optional | Integer 1–50, default 20 |
| `indicatorId` | `campus` only | `campus` only | Official indicator code |

Available metric IDs and official upstream path suffixes:

| metric | Name | Comparison operation | Regional operation |
|---|---|---|---|
| `library` | 도서관 예산 | `getComparisonLibraryBudgetCrntSt` | `getRegionalLibraryBudgetCrntSt` |
| `dormitory` | 기숙사 수용 현황 | `getComparisonDormitoryAcceptanceCrntSt` | `getRegionalDormitoryAcceptanceCrntSt` |
| `burden` | 수익용 기본재산 부담률 | `getComparisonBasicPropertiesForProfitBurdenRate` | `getRegionalBasicPropertiesForProfitBurdenRate` |
| `endowment` | 수익용 기본재산 확보 현황 | `getComparisonBasicPropertiesForprofitCrntSt` | `getRegionalBasicPropertiesForprofitCrntSt` |
| `materials` | 학생 1인당 자료 구입비 | `getComparisonStudentForPersonDataPurchasePrice` | `getRegionalStudentForPersonDataPurchasePrice` |
| `campus` | 교지·교사 확보율 | `getComparisonSchoolGroundsAndBdsEnsureRate` | `getRegionalSchoolGroundsAndBdsEnsureRate` |

Example requests (replace placeholder values with **verified official codes**):

`GET /api/university/query?scope=comparison&metric=library&schoolId=OFFICIAL_ID&year=2026`

`GET /api/university/query?scope=regional&metric=dormitory&schoolDivisionCode=OFFICIAL_CODE`

The account's source documentation defines **schlId** and **schlDivCd**
as required but does not furnish a universal human-readable code mapping.
These values must come from the official 대학알리미 data dictionary; the app
does not guess codes or fabricate values.

Response includes `scope`, `metric`, `operation`, `source`, `page`,
`count`, `total`, `items`, `cached`, `updated_at`, and `has_more`.
Every item contains normalized fields plus original public field names;
indicator units are **not inferred**.

Errors use safe machine-readable codes without credentials. Invalid input
returns 400, missing Worker Secret returns 503, and upstream failures
return 502/504.

## MCP tools

New tools:

- `get_university_education_catalog({})`
- `get_university_education_comparison({metric,schoolId,year,page?,size?,indicatorId?})`
- `get_university_education_region({metric,schoolDivisionCode,page?,size?,indicatorId?})`
- `get_university_education_status({})`

All are read-only. Existing RSS 82-board and NEIS six-tool interfaces
remain available.

## Existing APIs

- `GET /api/catalog` — school RSS sources and menus.
- `GET /api/posts?shard=0&limit=all` and shard 1, 2 — all 82 RSS.
- `GET /api/feed?category=...` — board/group RSS.
- `GET /api/search?q=...&category=...` — RSS keyword search.
- `GET /api/neis/meta` — NEIS provider/status.
- `GET /api/neis/school` — school directory info.
- `GET /api/neis/meals` — meal/allergen data.
- `GET /api/neis/calendar` — academic events.
- `GET /api/neis/timetable` — high school timetable.
- `GET /api/neis/today` — daily school briefing.

## Rate limits and terms

The university developer account lists 1,000 calls/day per detailed
function. The Worker uses a two-hour cache and restricts the
query page and size, but edge caches do not enforce a global account
request quota. Confirm official provider policies before high-traffic
deployment or automated bulk querying.

Provider: https://www.data.go.kr/data/15158679/openapi.do
Data rights and source attribution: see NOTICE.
