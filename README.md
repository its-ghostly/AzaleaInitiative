# Azalea Initiative

A student-led community connecting Bay Area volunteers with people with disabilities and caregivers in Taiwan through art, messages, service, and fundraising.

Read [DESIGN.md](./DESIGN.md), [DRAWING_STUDIO_DESIGN.md](./DRAWING_STUDIO_DESIGN.md), and [COMMUNITY_PLATFORM_DESIGN.md](./COMMUNITY_PLATFORM_DESIGN.md) for product and platform plans.

## Run locally

```bash
npm install
npm run dev
```

This starts:

- the Vite site at [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- the Azalea API at [http://127.0.0.1:8787/](http://127.0.0.1:8787/)

Drawings are saved as image files under `data/media/` with metadata in `data/db.json`.

## Accounts

**Staff (organizer / volunteer / caretaker tools)**  
Only this account can open the Staff workspace:

- Email: `celine.zhang@aloft9.com`
- Password: `AzaleaCare2026` (override with `AZALEA_STAFF_PASSWORD`)

**Community members**  
Use **Save progress** in the header to create a username + password account. Signed-in members keep drafts on the server across visits.

## Checks

```bash
npm run lint
npm run build
```

Donation sections are marked Coming soon and do not accept payments yet.
