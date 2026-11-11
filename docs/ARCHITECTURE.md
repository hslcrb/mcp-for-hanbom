# Architecture — HANBOM DATA v3.0

HANBOM DATA is a read-only Cloudflare Worker that serves an SSR website,
public REST endpoints and a stateless Streamable HTTP MCP server.

## Data flow

    Browser or MCP client
       | https://data.hanbom.rhee.life
       v
    worker.mjs (router, validation, SSR, MCP tools)
       +-- catalog.mjs: 82 school RSS sources in 23 menus
       |      +-- official school HTTPS RSS, 180-sec edge cache
       +-- neis.mjs: official NEIS school, meals, schedule, timetable
       |      +-- NEIS_API_KEY Worker Secret, 5-min edge cache
       +-- university.mjs: college conditions, 12 operations
              +-- UNIVERSITY_INFO_API_KEY Worker Secret
              +-- 2-hour edge cache, maximum one upstream call/request

    ui/ modules: reusable pills, theme switch, provider pages
    test/ modules: provider-specific mocks and regression tests

## Responsibility boundaries

| Module | Responsibility |
|---|---|
| `worker.mjs` | Routing, MCP registry, HTML output, status |
| `catalog.mjs` | Verbatim, immutable school RSS source definitions |
| `neis.mjs` | Restricted NEIS proxy and normalized school data |
| `university.mjs` | Fixed university data routes, XML parsing, input limits, secret isolation |
| `ui/` | Server-rendered accessible HTML/CSS + lightweight event handlers |
| `test/` | Synthetic keys, mocked upstream responses, compatibility assertions |

## API security

- The Worker has two production secret bindings. Neither is in Git.
- The upstream origin and operation are chosen exclusively from hardcoded
  official provider definitions; no arbitrary endpoint or host input.
- HTTP redirection is blocked. Timeouts and input-size caps are applied.
- No raw credential-bearing external URL is returned to public clients.
- The university proxy allows page 1–10 with up to 50 records per page.
- University calls are cached for 7,200 seconds per Cloudflare edge location.
  This is an optimization; it is **not** a global hard quota guarantee.
- The existing 82 RSS sources are fetched in 3 shards (28/28/26).
- Student-report and counseling RSS metadata is redacted in public results.

## Deployment

Cloudflare Workers Builds observes the GitHub `main` branch.
`npm run check` runs JavaScript syntax checks and unit tests, followed
by `wrangler deploy`. GitHub Actions are intentionally **not used**.

The app must have `NEIS_API_KEY` and `UNIVERSITY_INFO_API_KEY` configured
as Cloudflare Secrets (`wrangler.jsonc` contains names, not values).

## MCP client compatibility

All legacy RSS/NEIS tool names remain stable. University integration adds
four new read-only tools to the existing registry. A client that has cached
the earlier tool list may need to reconnect or refresh tool discovery.

## Data provenance

The source code is Apache 2.0, but source data, service logos and font
rights are controlled by their respective providers; see NOTICE.
