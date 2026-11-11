# Changelog

All notable changes to HANBOM DATA are documented here. The latest
release is a **feature build-up milestone**, not an end to maintenance.

## [3.0.0] — 2026-11-11 · Feature build-up milestone

- Integrated the Korean Council for University Education education
  conditions API (data.go.kr dataset 15158679).
- Supported six indicators and twelve read-only university/regional
  comparison operations, with exact original API names.
- Added `/universities` and the university REST API.
- Added four read-only MCP university tools.
- Registered `UNIVERSITY_INFO_API_KEY` as a Cloudflare Secret, separately
  from `NEIS_API_KEY`.
- Added provider-specific input validation, XML/JSON parsing,
  two-hour edge caching and safe error responses.
- Formalized an Apache-2.0 public OSS project with licensing, security
  and contribution guidance, API documentation and development logs.
- Existing RSS 82 boards and NEIS six-tool integration remain intact.

## [2.3.0] — 2026-11-11 · NEIS official open data

- Added school information, meal and nutrition data, academic calendar,
  high-school timetable and daily summary APIs.
- Added six read-only NEIS MCP tools.
- Cloudflare Secret for NEIS developer key; official J10 / 7531327
  Hanbom school identification.

## [2.2.x] — 2026-11-11 · MCP setup experience

- Published a ChatGPT/Claude MCP configuration guide, reusable logo
  pills and locally served SVG assets.
- Improved logo sizing and prevented unwanted control-label selection.

## [2.1.0] — 2026-11-11 · Accessibility and dark mode

- Added system/light/dark appearance settings and preference persistence.
- Componentized 129 RSS navigation pills and improved responsive layout.

## [2.0.0] — 2026-11-11 · Complete school RSS coverage

- Expanded to 82 official RSS boards from 23 school menu sections.
- Split large RSS aggregates into free-tier-safe 28/28/26 shards.
- Redacted potentially sensitive reporting and counseling titles.

See `docs/` for historical, date-stamped implementation records.
