# Personal Site

Static site served via GitHub Pages at https://lukasklostermair.com/.

## Customize
- Update navigation content in `index.html`.
- Update theme tokens in `styles.css` under the `:root[data-theme="*"]` blocks.
- Replace `assets/portrait-960.jpg` and `assets/portrait-960.webp` and social SVGs in `assets/social/`.

CV entries are loaded from `assets/cv.json`. Projects and publications are loaded from `assets/projects.json` and `assets/publications.json`.

## Visual design

The site uses warm ivory, ink-blue, and burnt-orange theme tokens with system
sans-serif typography and small monospace labels. `assets/favicon.svg` is the
shared LK linkage mark. Keep layout changes responsive at 320px and above.
Tabs support arrow keys, Home/End, and URL hashes; galleries are manually
controlled and support keyboard activation and Escape to close. Respect reduced
motion preferences.

## Development
Start a local server (e.g., `npx serve` or `python -m http.server`) and open the page through it. Direct `file://` viewing blocks the JSON fetch used for the CV section.
Run linters before committing:

```bash
npm run lint
```

## GitHub Pages
Pushes to `main` deploy the site through `.github/workflows/pages.yml`.
The custom domain is configured in repository Settings > Pages; the Actions
deployment does not require a `CNAME` file. Keep Enforce HTTPS enabled once the
certificate is available. Cloudflare manages DNS; the GitHub Pages records use DNS-only mode. The domain is registered with Namecheap.

When adding a public page, give it a canonical URL on
`https://lukasklostermair.com` and add it to `sitemap.xml`. Keep `robots.txt`
pointing to that sitemap. The old GitHub Pages address redirects through GitHub.

## Cookie-free analytics

The homepage and research page load the shared `analytics.js` integration for
[Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/).
It replaces the previous MapMyVisitors widget. Cloudflare Web Analytics is free
and does not use analytics cookies or browser storage. Hosting and DNS remain
on GitHub Pages and Cloudflare respectively.

Activation (required before any data is collected):

1. In the Cloudflare dashboard, open **Web Analytics > Add a site** and enter
   `lukasklostermair.com`. Use the manual JavaScript snippet installation.
2. Copy the public `token` value from the generated `data-cf-beacon` snippet
   into `siteToken` in `analytics.js`. This is a public site identifier, not an
   account API key. Do not add the snippet separately to avoid double counting.
3. Deploy, visit the site, and check the Web Analytics dashboard after a few
   minutes for page views, referrers, countries, devices, and performance metrics.

Until a token is supplied, analytics is disabled and makes no requests. The
loader also skips localhost, preview hosts, Do Not Track, and Global Privacy
Control. Browser blockers may prevent collection. This measures page loads;
switching homepage tabs is not counted as another page view. The existing
theme preference uses localStorage independently of analytics. Embedded videos
and other third-party content have their own data practices.

## Lighthouse
Install [Lighthouse](https://developers.google.com/web/tools/lighthouse) and run:

```bash
lighthouse http://localhost:8000 --view
```

## Troubleshooting
If the page looks unstyled, check that `styles.css` loaded and that JS is enabled.
