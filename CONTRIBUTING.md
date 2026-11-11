# Contributing to HANBOM DATA

Bug reports, documentation, accessibility improvements, unit tests and
new data-source modules are welcome.

## Workflow

1. Discuss substantial new providers or schema changes in a GitHub issue.
2. Work on a descriptive branch based on `main`.
3. Install dependencies with `npm install` and run `npm run check`.
4. Add regression tests for changed REST/MCP routes and input validation.
5. Keep the RSS 82-board catalog and all existing behavior compatible.
6. Document changes to the provider API, cache, UI, README and CHANGELOG.
7. Use `main` → Cloudflare Workers Builds for automatic deployment.
   Do not add GitHub Actions workflows to this project.

## Rules for public contributions

- NEVER include production credentials, tokens or private application
  screenshots. Use synthetic test credentials and mock upstream responses.
- Use official, fixed HTTPS endpoints; disallow arbitrary upstream hosts.
- Preserve sensitive-content masking for school complaint/counseling RSS.
- Respect provider request limits and original data rights.
- Do not infer university indicator measurement units or rankings without
  official definitions from the data source.

## Architecture

Write small native ES modules, SSR HTML and accessible CSS Grid/Flex components.
Keep provider parsing and UI independent. New MCP tools must be read-only.

## Licensing

Contributions to this project's source-code modules are licensed under
Apache License 2.0 (LICENSE). Third-party trademarks, images, fonts and
original published datasets retain their respective terms.
