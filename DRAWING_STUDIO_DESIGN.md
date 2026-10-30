# Drawing Studio & Care Delivery — Design Plan

## 1. Purpose

This document describes how Azalea’s drawing pad should mature from a local prototype into a cohesive create-and-send experience, how drawings and notes reach caretakers in Taiwan, and how **caretakers** and **Azalea volunteers** receive role-based admin access to complete moderation and delivery work safely.

It complements `DESIGN.md` (site brief) and `COMMUNITY_PLATFORM_DESIGN.md` (public art community). This file focuses on:

1. Drawing pad product cohesion
2. Submission → review → delivery to Taiwan partner facilities
3. Admin access for caretakers and Azalea volunteers

---



## 2. Product principles

1. **Kindness is moderated before it is delivered.** No drawing or note reaches a facility without human review.
2. **Consent and privacy travel with the art.** Optional names, notes, and display choices are collected separately from contact data. Minors need guardian-aware flows.
3. **Caretakers are partners, not generic admins.** They get tools for their facility’s inbox and updates—not org-wide settings or other facilities’ data.
4. **Volunteers operate within clear task queues.** Azalea volunteers translate, tag, package, and hand off—they do not invent policy on the fly.
5. **The studio should feel like one craft surface.** Tools, paper, and send flow should share the same paper / floral visual language as the rest of the site.

---



## 3. Drawing pad — current prototype vs next cohesion



### Already in the prototype

- Pure white canvas so eraser matches the paper  
- Colors, eraser, clear, local download  
- Brush size control with live size preview  
- Undo (toolbar + Ctrl/Cmd+Z)  
- Optional sender name and short accompanying note  
- Dedicated Draw page under “Send a Picture!”



### Cohesion goals (visual & UX)


| Area            | Direction                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Frame           | Soft paper grain border, subtle azalea corner marks, same cream page chrome as home                  |
| Tools           | Group as a “pencil case”: colors, brush size, eraser, undo—one horizontal strip with clear labels    |
| Guidance        | Short prompts (“Draw a sunny day,” “Say hello in color”) that rotate; Traditional Chinese + English  |
| Accessibility   | Keyboard undo, large hit targets, high-contrast swatches, reduced-motion option for tool transitions |
| Save / send     | “Save for myself” vs “Send with love” as two equal, clearly named actions                            |
| Empty / success | Handwritten success line that mirrors the sticky-note tone on Current Mission                        |




### Studio feature roadmap

**Phase A — craft quality**

- Layers: sketch under color (optional)  
- Redo (Ctrl/Cmd+Shift+Z)  
- Shape / stamp pack designed with partner artists (flowers, sun, hearts)—never emoji clutter  
- Pressure support on tablets where available  
- Autosave draft to local storage (device-only until submit)

**Phase B — send readiness**

- Required light review checklist before submit (no personal addresses, no medical details, kind intent)  
- Optional first name + note already collected; add age band if under 18 and guardian email for approval  
- Preview card: drawing + name + note as caretakers will see it  
- Language toggle for UI (EN / 繁體中文)

**Phase C — continuity**

- “Your kindness is on its way” status page with anonymized stage: received → reviewed → translated → delivered  
- Option to allow gallery display later (separate consent), linking to the community platform plan

---



## 4. Sending drawings & messages to caretakers in Taiwan



### End-to-end flow

```text
Visitor draws + optional name/note
        ↓
Submit (encrypted upload)
        ↓
Azalea volunteer queue — safety & kindness review
        ↓
Optional translation (EN ↔ 繁體中文)
        ↓
Facility inbox for assigned partner caretakers
        ↓
Caretaker acknowledges / prints / shares with residents (per local practice)
        ↓
Optional thank-you or activity update posted (consent-approved) back to Updates
```



### What gets sent


| Field               | Required | Notes                                   |
| ------------------- | -------- | --------------------------------------- |
| Drawing image (PNG) | Yes      | Stored privately; not public by default |
| Short note          | No       | Max ~280–500 chars; moderated           |
| Display name        | No       | First name / nickname only              |
| Locale / language   | Auto     | From browser or user choice             |
| Consent flags       | Yes      | Delivery only; gallery optional later   |
| Age band / guardian | If minor | Blocks delivery until approved          |




### What must never be collected in this flow

- Home address, school name, phone number, social handles  
- Medical or diagnostic detail  
- Photos of faces unless a future consent-specific program is designed  
- Free-form “reply to me at…” contact channels



### Delivery formats for facilities

Caretakers choose per facility:

1. **Digital inbox** — secure web gallery for staff devices
2. **Print packet** — PDF sheet (drawing + note + Azalea footer) for printing on site
3. **Slideshow** — weekly curated set for group viewing

Azalea volunteers prepare packets; caretakers confirm receipt and local sharing rules.

### Moderation criteria (volunteer checklist)

- Kind and person-first language  
- No hate, sexual content, or exploitation  
- No private data or attempts to contact residents directly  
- Artwork is appropriate for a shared care setting  
- Note matches drawing intent (no coded harassment)

Reject with a short, kind explanation to the sender when possible; never expose caretaker identity in rejection mail.

---



## 5. Admin access — roles & permissions



### Roles


| Role                   | Who                                              | Primary job                                                         |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| **Super admin**        | Azalea core organizers (few people)              | Org settings, facilities, role grants, retention policy             |
| **Azalea volunteer**   | Trained students / adults                        | Review queue, translation, packet prep, status updates              |
| **Facility caretaker** | Partner staff at Hysiang Yuan (and future sites) | Facility inbox, acknowledge delivery, post consent-approved Updates |
| **Sender**             | Public visitor                                   | Create and submit; view own submission status                       |




### Permission matrix (summary)


| Capability                    | Super admin | Azalea volunteer   | Facility caretaker                   | Sender    |
| ----------------------------- | ----------- | ------------------ | ------------------------------------ | --------- |
| Draw / submit                 | ✓           | ✓                  | ✓                                    | ✓         |
| Review any submission         | ✓           | ✓ (assigned queue) | —                                    | —         |
| Translate notes               | ✓           | ✓                  | view only                            | —         |
| Mark delivered                | ✓           | ✓                  | ✓ (own facility)                     | —         |
| View facility inbox           | ✓           | if assigned        | own facility only                    | —         |
| Post Updates / bulletin       | ✓           | draft + request    | publish for own facility             | —         |
| Manage users / roles          | ✓           | —                  | invite co-caretakers (same facility) | —         |
| Billing / legal / data export | ✓           | —                  | —                                    | —         |
| Delete org-wide content       | ✓           | soft-flag only     | own facility posts                   | own draft |




### Auth model (login ↔ role)

Staff access is **account-based login**, not a shared “admin” username.

**How it works**

1. A person signs in with **their own email** (magic link preferred; password optional later).  
2. That account is stored as a **user record**.  
3. The user record is linked to one **role**: Super admin, Azalea volunteer, or Facility caretaker.  
4. Caretakers are also linked to a **facility** (e.g., Hysiang Yuan). Permissions are scoped to that facility.  
5. The app checks **role + facility**, never “if username === admin.”

```text
Email login  →  User account  →  Role (+ facility)  →  Allowed tasks
```

**Senders (public drawers)**

- May submit **without** an account, or with a light optional account only to track their own submission status.  
- Public accounts never gain staff powers through a username string or client-side flag.

**Do use**

- One person → one account → one role (or explicit multi-role grant by super admin)  
- MFA for all staff roles (volunteer, caretaker, super admin)  
- Invite-only onboarding for staff (no self-serve “become admin”)  
- Immediate revoke when a school-year volunteer leaves  

**Do not use**

- Shared logins (`admin` / `caretaker` passwords passed around)  
- Granting admin rights from a secret username alone  
- Putting real privileges only in the frontend without server-side auth  

**Why this model**

- Audit trail: every approve / translate / deliver is tied to a real person  
- Safer for minors and care-facility content  
- Easy to rotate volunteers without changing a shared password  
- Facility isolation: caretakers cannot open another site’s inbox  

### How access is granted

1. **Super admin** invites an Azalea volunteer via email → accepts → completes short training checklist (guidelines, privacy, dignity language).  
2. **Super admin** links a **facility** record (e.g., Hysiang Yuan Disabled Care Facility) and invites named caretakers.  
3. Caretakers and volunteers sign in with magic link (or SSO-ready email); **MFA required** for all staff roles.  
4. Volunteers are assigned to queues (e.g., “Review,” “Translate,” “Packets”) so work matches capacity.  
5. Access is time-bound for school-year volunteers and revocable immediately by super admin.

### Admin task surfaces (“complete tasks as they see fit”)

Work is organized as **task boards**, not a single overloaded dashboard.

**For Azalea volunteers**

- **Review** — approve, request changes, or decline with reason  
- **Translate** — attach Traditional Chinese / English text  
- **Assemble** — generate print PDF or slideshow set  
- **Follow up** — nudge incomplete guardian approvals

Volunteers pick open tasks they are trained for; WIP limits prevent pile-up.

**For facility caretakers**

- **Inbox** — new drawings ready for their residents  
- **Acknowledge** — mark viewed / shared / printed  
- **Share feedback** — optional short thank-you or activity note for Azalea Updates (consent-gated)  
- **Facility preferences** — preferred delivery format, quiet hours, language

Caretakers should never need to touch other facilities’ queues or Azalea’s internal volunteer roster.

### Audit & safety

- Immutable audit log: who approved, translated, delivered, or deleted  
- Retention: undelivered drafts expire; delivered art retained per partner agreement  
- Incident path: caretaker or volunteer can escalate to super admin in one click  
- No cross-facility search for personal names

---



## 6. Technical sketch

### Prototype implemented in this repo (browser-local)

- Enhanced drawing studio: paper frame, pencil-case tools, stamps, undo/redo, autosave draft, EN/繁 prompts, checklist, age band / guardian, preview, **Save for myself** vs **Send with love**
- Submissions stored in `localStorage` with tracking codes (`src/platform/store.ts`)
- Status page (`?page=status`) for received → reviewed → translated → delivered → acknowledged
- Staff workspace (`?page=staff`) with role-based demo login:
  - `admin@azalea.demo` / `azalea-admin`
  - `volunteer@azalea.demo` / `azalea-help`
  - `caretaker@azalea.demo` / `azalea-care`
- Volunteer queue (approve / reject / translate / deliver), caretaker inbox (acknowledge), super-admin facility prefs + audit log

### Production still required

- **API:** authenticated endpoints for submit, review, translate, deliver  
- **Storage:** private object storage for images; DB for metadata and task state  
- **Auth:** email magic link + MFA for staff roles (replace demo access codes)  
- **Notifications:** email/digest to volunteers on new queue items; caretaker digest for new inbox items  
- **i18n:** full EN / 繁體中文 for studio and admin  

Prototype data stays in the visitor’s browser until a backend is connected.

---



## 7. Success metrics (humane)

- Time from submit → caretaker acknowledgment  
- % of submissions approved on first review  
- Caretaker weekly active use of inbox  
- Volunteer task completion without burnout signals (queue age, WIP)  
- Zero privacy incidents

Avoid vanity metrics (public likes on private deliveries).

---



## 8. Suggested build order

1. Harden studio UX (cohesive chrome, redo, stamps, autosave) — mostly frontend
2. Submission API + private storage + moderation queue for Azalea volunteers
3. Facility records + caretaker invites + inbox / acknowledge
4. Translation task lane + print PDF packets
5. Consent-approved path from delivery → Updates / gallery (link to community platform)
6. MFA, audit log, retention automation

---



## 9. Open decisions

- Exact partner naming and branding on print packets (facility preference)  
- Whether minors may submit without guardian email for “delivery only, never public”  
- Whether caretakers can reply with photos of residents viewing art (likely **no** by default; separate consent program)  
- Fiscal / legal entity owning data processing agreements with Taiwan partners

---



## 10. Related docs

- `DESIGN.md` — overall site product brief  
- `COMMUNITY_PLATFORM_DESIGN.md` — public gallery, remixes, caretaker publishing norms  

