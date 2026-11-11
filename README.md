# HANBOM DATA

**한국 교육 공공데이터를 하나의 웹·REST·MCP로 연결하는 오픈소스 프로젝트.**

[Live Website](https://data.hanbom.rhee.life/) ·
[NEIS Dashboard](https://data.hanbom.rhee.life/neis) ·
[University Education](https://data.hanbom.rhee.life/universities) ·
[MCP Setup Guide](https://data.hanbom.rhee.life/mcp-setup) ·
[API Metadata](https://data.hanbom.rhee.life/api/catalog)

> **v3.0.0 — 2026-11-11 feature build-up milestone**
> 82 school RSS sources · 4 NEIS datasets · 12 university education
> functions · 78 read-only MCP tools. Ongoing bug fixes and maintenance
> remain welcome.

HANBOM DATA is an **unofficial, student-built** service and is not
operated by Hanbom High School, the Ministry of Education,
the Korean Council for University Education or the AI vendors.

## Features

| Module | Website | Official data |
|---|---|---|
| 한봄고등학교 RSS | [School dashboard](https://data.hanbom.rhee.life/) | 82 RSS boards in 23 menu categories |
| 나이스(NEIS) | [School data dashboard](https://data.hanbom.rhee.life/neis) | Meals, school calendar, high-school timetable and school information |
| 대학알리미 교육여건 | [University dashboard](https://data.hanbom.rhee.life/universities) | Six indicators, university-by-university and regional statistics (12 operations) |
| MCP connection | [ChatGPT / Claude guide](https://data.hanbom.rhee.life/mcp-setup) | Public, stateless, read-only remote MCP |

The web interface is responsive and supports system/light/dark themes,
accessible native buttons, reusable pill components and keyboard navigation.

### New: University education conditions

The official [한국대학교육협의회_대학알리미 교육여건 현황_GW](https://www.data.go.kr/data/15158679/openapi.do)
service provides university comparisons and regional summaries for:

- Library budgets and campus library investments
- Dormitory admission capacity
- Income-producing basic-property burden ratio
- Income-producing basic-property holdings
- Student per-capita academic material purchases
- School grounds and buildings securing rates

The official documentation requires `schlId` and `svyYr` for university
comparison and `schlDivCd` for regional statistics. These are **provider
codes, not names**. Do not guess them. Every response provides the
original field keys and provider attribution; this project does not
invent indicator units or generate university rankings.

The developer key is stored **only as a Cloudflare Worker Secret**. A
two-hour edge cache reduces public call volume but does not impose a
global, account-wide request cap. The provider advertises a limited
development quota, so do not use this service for uncontrolled bulk
data harvesting.

## Remote MCP setup

| Setting | Value |
|---|---|
| Server name | `HANBOM Data MCP` |
| Server URL | `https://data.hanbom.rhee.life/mcp` |
| Transport | Streamable HTTP |
| Authentication | None (current public, read-only service) |
| Tools | **78** total |

Follow the [ChatGPT and Claude connection guide](https://data.hanbom.rhee.life/mcp-setup)
for user-facing setup. Installed clients may need to refresh tool
discovery after adding new tools.

New university MCP tools:

- `get_university_education_catalog`
- `get_university_education_comparison`
- `get_university_education_region`
- `get_university_education_status`

The previous 74 RSS/NEIS tools and their names are preserved.

## Public REST API

`GET /api/university/meta` — university data dictionary, 6 metrics, 12 operations

`GET /api/university/status` — connection status without disclosing the key

`GET /api/university/query?scope=comparison&metric=library&schoolId=OFFICIAL_ID&year=2026`

`GET /api/university/query?scope=regional&metric=dormitory&schoolDivisionCode=OFFICIAL_CODE`

`GET /api/neis/meals`, `GET /api/neis/calendar`, `GET /api/neis/timetable`,
`GET /api/neis/school`, `GET /api/neis/today`

`GET /api/feed?category=...`, `GET /api/search?q=...&category=...`,
`GET /api/posts?shard=0&limit=all` (plus shard 1 and 2).

See [complete API documentation](docs/API_REFERENCE.md) for all parameters
and the original provider operation names.

## Architecture

`worker.mjs` is the Cloudflare Workers entrypoint and stateless MCP router.
The implementation is separated into:

- `catalog.mjs` and `config/rss-catalog-82.json` — 82 school RSS sources.
- `neis.mjs` — school-level NEIS Open Data proxy.
- `university.mjs` — university data proxy, 12 fixed operations, XML/JSON parsing.
- `ui/` — browser pages, responsive CSS, theme and pill components.
- `test/` — synthetic credentials and regression tests.
- `docs/` — API docs, architecture, milestones and original source catalogs.

See [Architecture](docs/ARCHITECTURE.md).

### Run locally

Requires Node.js 20 or newer and npm.

```sh
npm install
cp .dev.vars.example .dev.vars
# Replace placeholder values in .dev.vars with your own development keys.
npm run check
npm run dev
```

Windows PowerShell: `Copy-Item .dev.vars.example .dev.vars`.

The local credentials file is ignored by Git. Do not copy another
person's key; obtain developer keys directly from the relevant
official API portals.

### Deploy

The production deployment uses **Cloudflare Workers Builds** connected
to the GitHub `main` branch. It runs `npm run check` and then
`wrangler deploy`. **No GitHub Actions are used.**

Before deployment, set two secrets on the target Worker:

- `NEIS_API_KEY`
- `UNIVERSITY_INFO_API_KEY`

The committed `wrangler.jsonc` contains only the binding names and
never their values.

## Reliability, security and data rights

The data sources are independently operated and can change, return no
data or become unavailable. Public RSS from school complaints or
counseling boards is redacted to limit unnecessary exposure of students'
personal details. Source-authenticated, official hostnames are pinned.

**Apache License 2.0 applies to this project's source code.**
Original education records, third-party logos, names and the Juache
font are governed by their respective publishers' rights; see
[NOTICE](NOTICE) and [LICENSE](LICENSE).

Read [SECURITY.md](SECURITY.md), [CONTRIBUTING.md](CONTRIBUTING.md),
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [CHANGELOG.md](CHANGELOG.md).

## Development history

The 2026-11-11 milestone completes the initial major feature build-up.
From here, the intended scope is **maintenance, bug fixes, accessibility
and security**, with further modules reviewed individually rather than
added by default.

- [University integration and build-up closure](docs/UNIVERSITY_MILESTONE_2026-11-11.md)
- [NEIS implementation log](docs/NEIS_INTEGRATION_2026-11-11.md)
- [82-feed school RSS milestone](docs/RSS_82_IMPLEMENTATION_2026-11-11.md)
- [UI component refactor](docs/PILL_COMPONENT_REFACTOR_2026-11-11.md)
- [Historical README (preserved)](docs/archive/README_PRE_V3.md)

**Maintainer:** Rheehose.
