# Deployment Guide - GitHub Pages

This project is a static web application (no build step, no backend) and can be served directly by GitHub Pages.

## 1. Enable GitHub Pages

1. Go to the repository on GitHub: `https://github.com/PlanetFelipe/PlanetBoardingPassGenerator`
2. Open **Settings** → **Pages**.
3. Under **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` / `(root)`
4. Click **Save**.
5. GitHub will publish the site to:
   `https://planetfelipe.github.io/PlanetBoardingPassGenerator/`
   (the first deployment can take a minute or two - subsequent pushes redeploy automatically).

## 2. Repository settings

- The repository must be **public** (or on a GitHub plan that supports Pages for private repos).
- `index.html` must live at the **repository root** - this is already the case for this project, so no `docs/` folder or custom publish path is required.
- No workflow file is required for the basic "Deploy from a branch" method above. If you later prefer build-based deployment (e.g. via GitHub Actions), that can be added separately, but is not needed for this static site.

## 3. Branch settings

- Pages is configured to deploy from the `main` branch, root directory.
- Any push to `main` automatically triggers a redeploy.
- If you use feature branches, only merges into `main` will update the live site.

## 4. Verifying the deployment

Once enabled, confirm the following load correctly from `https://planetfelipe.github.io/PlanetBoardingPassGenerator/`:

- Page loads with styling (`css/style.css`).
- All scripts load (`js/app.js`, `js/flight-details-api.js`, `js/barcode-generator.js`, `js/theme.js`, `js/vendor/bwip-js-min.js`).
- Clicking **Load Flights** successfully calls the `Test.GetFlightDetails` API (or falls back to the embedded sample response).
- Selecting a flight renders QR Code, Aztec Code and PDF417 barcodes.
- Dark/light mode toggle works and persists on reload.

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| 404 page from GitHub Pages | Pages not enabled yet, or wrong branch/folder selected | Re-check Settings → Pages → Source is `main` / `(root)` |
| Blank/unstyled page | Browser cache serving an old version | Hard-refresh (Ctrl+F5) or wait a minute for the CDN to update |
| CSS/JS files return 404 | A reference uses an absolute path (e.g. `/css/style.css`) instead of a relative one | Ensure all local asset paths in `index.html` are relative (`css/style.css`, `js/app.js`, etc.), not root-absolute |
| "Load Flights" always shows the fallback sample data | The live `Test.GetFlightDetails` API call failed (network/CORS/availability) | Check the browser console for the exact fetch error; this is expected/handled behaviour, not a Pages issue |
| Changes not appearing after push | Pages build/deploy still in progress | Check the **Actions** tab (or repo's Pages deployment history) for build status; it can take 1-2 minutes |
| Site loads over `http://` warnings | N/A | GitHub Pages always serves over HTTPS by default - no action needed |

## Notes

- This app makes client-side `fetch()` calls directly to Planet's `Test.GetFlightDetails` REST API. The API responds with `Access-Control-Allow-Origin: *`, so cross-origin requests from `https://planetfelipe.github.io` are permitted - no proxy or server-side component is required.
- If the live API call fails for any reason (network restrictions, CORS changes, service downtime), the app automatically falls back to an embedded sample response so the UI remains functional for demonstration purposes.
