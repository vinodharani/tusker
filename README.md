# 🐘 Tusker — Home Cleaning Log

Tusker is a simple, single-page web app for tracking when things around the
house were last cleaned. No frameworks, no build step — just open it in a
browser.

## Features

- **Areas** — organize your home into areas (kitchen, bathroom, etc.) with
  items and recurring tasks.
- **Log cleanings** — record what you did, when, and an optional note. The
  date is editable if you're logging something from yesterday.
- **Needs Cleaning** — see at a glance which tasks are overdue or stale.
- **Appliances** — track maintenance for things like filters and vacuums.
- **Search** — quickly find any area, item, or task.
- **Backup** — export/import your data as JSON.

## Optional: Sync across devices

By default, all data lives locally in your browser's localStorage. To keep a
household's devices in sync, Tusker can use Firebase (free Spark plan) with
anonymous sign-in + Firestore:

1. Follow the one-time setup in [FIREBASE_SETUP.md](FIREBASE_SETUP.md).
2. Menu (`⋯`) → **☁️ Sync across devices…** → create a household and share
   the code with other devices.

Each device keeps a local copy, so the app still opens instantly and works
offline; changes sync automatically when back online.

## Running it

No install or build required — either open `index.html` directly, or serve
the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Tech

Plain HTML, CSS, and JavaScript (`app.js`). Firebase compat builds are
loaded from a CDN and are only used if `firebase-config.js` is filled in —
otherwise they're simply unused.
