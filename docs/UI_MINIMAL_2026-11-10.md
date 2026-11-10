# HANBOM DATA — Pure White Minimal List UI

Date: 2026-11-10

## Purpose

Request: replace all previous dashboard styling with a modern pure-white page containing only the horizontally centered school notice list, no decorative elements, no extra text, and no visual hover effects.

## Visual specification

- White (#ffffff) background, dark monochrome text (#111), no gradients, cards, colors, borders, iconography or animations.
- Centered list column (maximum 760px) and centered notice titles. Responsive widths on desktop and mobile.
- Typography: Pretendard Variable preferred, operating-system fallback; font sizes from 17px to 20px; substantial vertical spacing.
- Only the official RSS notice titles appear. There are no visible header, subtitle, search box, buttons, dates, summaries, status counters or footer.
- Official school notice links remain functional and open in another tab. Hover, visited and active states do not alter visual styles.
- Keyboard focus-visible outline is retained for accessibility, unlike mouse hover.
- On no records or RSS error, a single text row inside the list communicates the problem without introducing other UI.

## Behavior and security

- DOM insertion uses textContent to prevent rendering RSS content as HTML.
- Outgoing links must be HTTPS on hanbom-h.goesw.kr.
- Dashboard still requires Cloudflare Access single-email protection (dlghtp581@naver.com).
- Existing REST API, MCP JSON-RPC tools, Cloudflare domain and public data routes are unchanged.
- GitHub Actions remain unused; the main branch triggers Cloudflare Workers Builds.

## Files and tests

- worker.mjs: only the embedded HTML/CSS/JS dashboard template was replaced.
- test/rss.test.mjs: added tests for minimalist layout, Access guard and REST/MCP preservation.
- README.md: documented UI decisions.

Validation: Node syntax check and Node test suite in Cloudflare Workers Builds. A successful deploy is not a substitute for visually checking the logged-in browser UI.
