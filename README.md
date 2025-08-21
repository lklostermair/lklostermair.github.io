# Personal Site

Static site served via GitHub Pages.

## Customize
- Update navigation content in `index.html`.
- Update theme tokens in `styles.css` under the `:root[data-theme="*"]` blocks.
- Replace `assets/portrait.jpg` and social SVGs in `assets/social/`.

CV entries are loaded from `assets/cv.json`. Project entries can be added in `script.js` under the `projectData` array.

## Development
Open `index.html` locally in a browser. Run linters before committing:

```bash
npm run lint
```

## GitHub Pages
The site is deployed from the `main` branch. For a custom domain add a `CNAME` file and configure DNS.

## Lighthouse
Install [Lighthouse](https://developers.google.com/web/tools/lighthouse) and run:

```bash
lighthouse http://localhost:8000 --view
```

## Troubleshooting
If the page looks unstyled, check that `styles.css` loaded and that JS is enabled.
