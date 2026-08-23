# Tusker — Hosting & Update Plan (GitHub Pages)

## Overview
Tusker is a fully static app (index.html + styles.css + app.js, data in localStorage) with no build step and no backend. **GitHub Pages** is the recommended host: free, HTTPS included, and deploys on every `git push`.

- **Live URL:** https://vinodharani.github.io/tusker/
- **Repo:** git@github.com:vinodharani/tusker.git (branch: `main`)

## Steps

### 1. Verify the repo is pushed
Confirm `main` contains `index.html`, `styles.css`, `app.js` and is up to date on GitHub:
```bash
git status
git push
```

### 2. Enable Pages via GitHub Actions (recommended)
Add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: '.' }
      - uses: actions/deploy-pages@v4
        id: deployment
```

*Alternative (zero files added):* GitHub repo → **Settings → Pages → Source: "Deploy from a branch"** → `main` / root.

### 3. Push and verify
After the first deploy, confirm the site loads at the Live URL (HTTPS, mobile-friendly).

### 4. Optional polish
- Custom domain (e.g. `tusker.yourdomain.com`): add a `CNAME` file + DNS record.
- Minimal `404.html` (not really needed for a single-page app).

## How to update the app
Edit locally, then:
```bash
git add -A && git commit -m "update" && git push
```
Live in ~1 minute.

## Known limitation
Data lives in `localStorage`, which is **per-browser/per-device** — it does not sync across devices. Use the app's **Export/Import JSON backup** for manual sync. True cross-device sync would require a backend (separate, larger project).
