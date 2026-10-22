# Personal Site

Static site served via GitHub Pages at https://lukasklostermair.com/.

## Customize
- Update navigation content in `index.html`.
- Update theme tokens in `styles.css` under the `:root[data-theme="*"]` blocks.
- Replace `assets/portrait.jpg` and social SVGs in `assets/social/`.

CV entries are loaded from `assets/cv.json`. Project entries can be added in `script.js` under the `projectData` array.

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
certificate is available. Namecheap BasicDNS points the domain to GitHub Pages.

When adding a public page, give it a canonical URL on
`https://lukasklostermair.com` and add it to `sitemap.xml`. Keep `robots.txt`
pointing to that sitemap. The old GitHub Pages address redirects through GitHub.

## Cookie-free analytics

The homepage and research page load the shared `analytics.js` integration for
[Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/).
It replaces the previous MapMyVisitors widget. Cloudflare Web Analytics is free
and does not use analytics cookies or browser storage. Hosting and DNS remain
on GitHub Pages and Namecheap respectively.

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
