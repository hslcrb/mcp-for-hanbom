## Summary

What changed, and why?

## Verification

- [ ] I ran `npm run check` with passing results.
- [ ] I tested changed REST/MCP endpoints or mocked upstream responses.
- [ ] I checked the new UI in light/dark mode and small screens if relevant.
- [ ] I updated docs and the changelog.

## Security and data provenance

- [ ] No API key, private screenshot, personal information or secret URL is included.
- [ ] Official upstream host, parameters and cache limits are validated.
- [ ] Original dataset ownership and source attribution remain accurate.
- [ ] Existing school RSS redaction remains intact.

## Deployment

No GitHub Actions. Main branch is deployed through Cloudflare Workers Builds.
Do not expose new provider credentials in PR logs.
