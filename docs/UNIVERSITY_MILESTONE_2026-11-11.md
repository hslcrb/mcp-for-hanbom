# University Education Conditions · Development & Build-up Milestone

**Date:** 2026-11-11 (Asia/Seoul)
**Project:** HANBOM DATA — `hslcrb/mcp-for-hanbom`
**Scope:** Implement the Korean Council for University Education's 12 official
education-conditions statistics operations, then prepare a maintainable,
public open-source baseline.

## 1. Primary source material

The user supplied an account-specific 2026-11-11 capture from the
Public Data Portal for
**한국대학교육협의회_대학알리미 교육여건 현황_GW**
([public catalog dataset 15158679](https://www.data.go.kr/data/15158679/openapi.do)).

The stored capture establishes:

- `REST` API, `XML` data format, fixed endpoint root
  `https://apis.data.go.kr/B340014/EducationConditionService`.
- Developer account status **approved** on **2026-11-11**.
- Account validity **2026-11-11 to 2028-11-11**.
- Detail-function allowance listed as **1,000 requests per day**.
- Required `serviceKey` (server-only).
- University comparison requires `schlId` and `svyYr`.
- Regional statistics require `schlDivCd`.
- Page number and row count are supported, plus optional indicator code
  for grounds/buildings statistics.
- Six indicators × two scopes = twelve operations, all recorded in
  [API_REFERENCE.md](API_REFERENCE.md).

The user's private account HTML and API key were not copied into this
public repository. The university-specific key was registered as a
**Cloudflare Worker Secret** named `UNIVERSITY_INFO_API_KEY`. This
is separate from `NEIS_API_KEY`. The private key value must never be
printed into a developer log or disclosed via REST/MCP.

## 2. Software implementation

- `university.mjs`: source metadata, 12 fixed allowlisted operations,
  input validation, university/region query normalization, XML/JSON
  parsing, error classification, safe 2-hour Cache API storage.
- `ui/university-page.mjs`: a distinct, server-rendered university
  education page; same theme and reusable navigation pills.
- `ui/university-styles.mjs`: responsive cards and form with Grid/Flex.
- `ui/university-client.mjs`: authenticated server proxy only;
  no key in browser, no automatic mass fetching.
- `worker.mjs`: `/universities`, three public REST routes and four
  additional MCP read-only tools.
- `test/university.test.mjs`: simulated key, all 12 routes, XML/JSON
  normalization, error handling, input security and UI regression.
- `wrangler.jsonc`: both required Secret binding names, not values.

### Why no automatic university-name lookup?

The source's documented education-conditions API requires a **provider
school ID**, not a university name, and does not provide a verified
name-to-ID dictionary within this approved dataset. A fake hard-coded
mapping would be misleading. The UI requires official codes, and the
API returns the underlying public fields as documented. A separate
code-directory API would require a separately scoped integration.

### Why no university ranking?

The supplied interface defines fields such as `indctVal1` and
regional `fieldType*` / `fieldVal*`. Their units and detailed
interpretation vary across indicators. HANBOM DATA preserves names and
values and links the source instead of inventing units or rankings.

### Provider quota and caching

Provider requests are capped per query (page 1–10, 1–50 records),
validated against six metrics and two supported scopes, and stored
for two hours in Cloudflare's edge cache. Cache keys are free of
credentials. This mitigates quota use but **is not a distributed
global quota enforcer** across all Cloudflare locations.

## 3. Open-source governance

The public repository now has:

- `LICENSE` (Apache-2.0 for project source code).
- `NOTICE` for original data providers, logos, trademarks and font rights.
- `SECURITY.md` and `CONTRIBUTING.md`.
- `CODE_OF_CONDUCT.md`, `CHANGELOG.md`.
- `docs/ARCHITECTURE.md` and `docs/API_REFERENCE.md`.
- `.github/CODEOWNERS`, bug-report and PR templates.
- `.dev.vars.example` with placeholders, never real credentials.
- The original, historical README preserved in
  `docs/archive/README_PRE_V3.md` and the root README rewritten
  as the coherent v3.0 entry point.

Existing 82 school RSS feeds, 23 menus, NEIS data, dark mode, privacy
redaction, MCP configuration guide, local SVG assets and mobile UI are
retained. GitHub Actions remain absent; `main` triggers Cloudflare
Workers Builds.

## 4. Verification

### Confirmed production deployment (2026-11-11)

- University integration, OSS organization and v3.0.0 code commit:
  `5e4af59a18d73646593ae1080c30e7c0ca440083`.
- Cloudflare Workers Builds `0e5382b5-c647-4dbe-84e1-5389659a6523`:
  **success**, **98/98 tests passed**, failed 0, deployed to
  `data.hanbom.rhee.life` at 100% traffic.
- Final MCP registration documentation commit:
  `1a48f30d03b42564b4a7f3d0ac567735ae7dd792`.
  Cloudflare build `56a34c9a-90e7-4846-9be1-5a4693c0c746` also
  **success**, **98/98 tests passed**, 100% production traffic.
- Live Cloudflare Worker Secrets list confirms both
  `NEIS_API_KEY` and `UNIVERSITY_INFO_API_KEY` bindings exist.
  Neither secret value is included in this report.
- Live `GET /api/university/meta` returned:
  `key_configured=true`, `metrics.length=6`,
  `operations.length=12`, issued `2026-11-11`,
  valid through `2028-11-11`.
- Live `POST /mcp` verified **78 unique read-only tools**, including
  all four new university education tools and the existing RSS/NEIS tools.
- Live `/universities` test at 360px rendered six metric choices,
  both comparison/regional tabs, and a functioning form without
  horizontal scroll. Dark mode changed body color to
  `rgb(19, 22, 27)`, and the query panel to `rgb(32, 38, 47)`.
- Actual upstream regional test
  `/api/university/query?scope=regional&metric=library&schoolDivisionCode=1&page=1&size=10`
  returned HTTP success and `count=0`, `total=0`; MCP gave
  the same `count=0`. **The sample code `1` was not independently
  verified against an official `schlDivCd` mapping**.
  Therefore no substantive university statistic for that input was
  validated. Successful mocked tests of all 12 operations do not
  imply that all 12 returned populated real-world datasets.
- The provider's development quota remains subject to its own daily
  limits; the 7,200-second Cloudflare edge cache is not a globally
  enforced request quota.

### Milestone conclusion

The requested implementation, deployment and public-source
project organization are complete. **Initial major feature build-up
is paused after v3.0.0**; maintenance and issue fixes remain welcome,
with new feature proposals requiring explicit prioritization.

## 5. Feature build-up closure

This v3.0.0 checkpoint marks a **temporary end to major feature
expansion**. Subsequent planned work is maintenance, correctness,
accessibility, security, documentation and support; new data providers
are considered separately rather than implied to be under development.
