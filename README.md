# Storytime Shelf

Bedtime reading tracker PWA for families. Track books read to your child nightly, see reading stats, and get randomized picks for what to read next.

## Tech Stack
- **Framework**: Next.js 15 (Static Export)
- **Service Worker**: Serwist (CacheFirst for assets, NetworkFirst for API)
- **Database**: Dexie.js (IndexedDB) — survives iOS 7-day storage wipe better than localStorage
- **Styling**: Tailwind CSS + custom crayon-themed CSS
- **Book Lookup**: Open Library API (free, no key required)

## Features
- 📚 **Book shelf** with search, sort, read logging
- 🎲 **Tonight picker** — weighted random based on weekly/total reads
- 🏠 **Customizable dashboard** — toggle widgets on/off
- 🎨 **4 color themes** (Sleepy Meadow, Starry Night, Candy Shop, Ocean Dream)
- 🌙 **Light/dark mode**
- 📥 **Export/import** — JSON backup + CSV spreadsheet
- 📱 **Responsive** — iPhone, iPad Mini, iPad Pro 13"
- ✈️ **Offline** — works without internet (except book search)

## Setup

### One-time install
```bash
npm install
```

### Develop locally
```bash
npm run dev
```
Open http://localhost:3000

### Build for GitHub Pages
```bash
npm run build
```
This creates an `out/` directory with static files.

## Deploy to GitHub Pages

1. Create a new repo on GitHub (e.g. `storytime-shelf`)
2. Push this project to the repo
3. Go to **Settings → Pages → Source → GitHub Actions**
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

5. Push and wait for the action to complete
6. Your app will be at `https://yourusername.github.io/storytime-shelf/`

### Add to iPhone Home Screen
1. Open the URL in Safari
2. Tap Share → Add to Home Screen
3. Done! Works offline after first load.

## iOS Storage Notes
- **IndexedDB** (via Dexie.js) has a more flexible storage quota than the 50MB Service Worker Cache limit
- iOS may still wipe storage after 7 days of non-use; **export backups regularly** via Settings → Export Backup
- Future enhancement: add cloud sync (Supabase/Firebase) for automatic backup on reconnect

## Data Import
Supports importing from both v1 (localStorage/embedded readLog) and v2 (Dexie/separate reads table) backup formats. Merging is non-destructive — existing books are preserved and read logs are combined.
