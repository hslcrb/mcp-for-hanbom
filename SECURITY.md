# Security policy

## Reporting

Please report vulnerabilities through GitHub's private vulnerability reporting
feature when available, or privately to the maintainer. Do not create public
issues containing live credentials, personal information or exploit payloads.

## Credential policy

- Never commit real secrets into Git, logs, screenshots or test fixtures.
- Production Cloudflare Worker Secrets: `NEIS_API_KEY` and
  `UNIVERSITY_INFO_API_KEY`.
- Keep the original credentials repository private.
- Upstream API hosts and operation names must be fixed and validated.
- Do not return an API key or credential-bearing URL in errors or caches.
- Maintain privacy redaction for school counseling, student reporting and
  complaint board feeds.
- University data calls have a provider quota. Edge caching reduces usage
  but is not a guarantee of a global hard call cap.

In case of a leak, revoke and rotate the key with the issuer and update
the Cloudflare Secret immediately. Removing a GitHub file does not revoke
the credential.

## Scope

Cloudflare Workers, public REST/MCP endpoints, data source validation,
client-side rendering and caching are all in scope.
