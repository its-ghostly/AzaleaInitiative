# Azalea Initiative

Student-led community connecting Bay Area neighbors with people with disabilities and their caregivers in Taiwan—through art, messages, volunteering, and shared care.

**Live site (after Pages is turned on):** [https://ghost-sht.github.io/AzaleaInitiative/](https://ghost-sht.github.io/AzaleaInitiative/)

### Turn on GitHub Pages (one-time)

1. Open [Pages settings](https://github.com/ghost-sht/AzaleaInitiative/settings/pages) while signed in as **ghost-sht**
2. Under **Build and deployment → Source**, choose **Deploy from a branch**
3. Branch: **gh-pages** / folder: **/ (root)** → Save

The public site will appear at the link above within a minute or two.

> Note: GitHub Pages hosts the website front-end. Saving drawings, sign-in, and staff tools still need the API server (`npm start` locally, or a host like Railway later).

## What’s here

- Public website (mission, gallery, volunteer journal, updates, fundraising info)
- Drawing studio and message flows
- Community accounts + staff workspace (requires the API server)
- English / 繁體中文 / 简体中文

## Browse the site

The GitHub Pages site is the public front door. Interactive features that save drawings or sign you in need the Azalea API running (locally or on a hosted server).

## Run locally

```bash
npm install
cp .env.example .env   # set AZALEA_STAFF_PASSWORD
npm run dev
```

- Site (Vite): [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- API + production build: [http://127.0.0.1:8787/](http://127.0.0.1:8787/)

```bash
npm run build
npm start
```

Drawings are stored under `data/media/` with metadata in `data/db.json` (gitignored).

## Staff access

Staff tools are limited to the authorized organizer email configured in the server. Set `AZALEA_STAFF_PASSWORD` in your environment—never commit real passwords.

Open `/?page=staff` (or sign in from the header with the staff email) when the API is running.

## Project layout

```
src/                 React website
server/              Express API (auth, drawings, volunteer apps)
public/              Static images and brand assets
docs/                Product and design notes
.github/workflows/   GitHub Pages deploy
```

## Checks

```bash
npm run lint
npm run build
```

Donation sections are marked as not open yet and do not accept payments.
