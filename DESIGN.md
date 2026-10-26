# Azalea Initiative — Product & Design Brief

## 1. Purpose

Azalea Initiative is a student-led bridge between Bay Area communities and people with disabilities, older adults, and caregivers in Taiwan. The website should make participation simple, dignified, and joyful while helping fund a winter service trip to Christian Mountain Children’s Home in Kaohsiung.

### Mission statement

Build understanding and genuine human connection across age, ability, and distance through art, messages, education, volunteering, and responsible fundraising.

### Audience

- Bay Area high school and future college volunteers
- Families, teachers, clubs, and local community members arriving via QR codes
- Facility residents, caregivers, and partner staff in Taiwan
- Potential donors, sponsors, and nonprofit/fiscal-sponsor partners

## 2. Product principles

1. **Dignity over pity.** Describe people as people, avoid “inspiration” framing, and obtain permission before sharing names, stories, or artwork.
2. **Exchange over charity.** Both communities create, receive, and learn.
3. **Safe by default.** Moderate public submissions, collect minimal personal data, and design for minors and vulnerable adults.
4. **Accessible by design.** Target WCAG 2.2 AA, plain language, keyboard support, reduced motion, good contrast, and mobile-first QR traffic.
5. **Transparent impact.** Clearly explain where messages, artwork, and funds go.

## 3. First release

### Included in this prototype

- Responsive story-led landing page
- Mission and values sections
- Browser-based drawing studio with colors, eraser, clear, and local download
- Caregiver thank-you message form interaction
- Consent-first gallery concept with clearly marked sample artwork
- Caretaker updates area with a visible community-rules summary
- Volunteer field-note templates and prototype application form
- Winter service-trip campaign section
- Separate year-round donation section
- Mobile navigation and accessibility foundations

### Needed before public launch

- Confirm the organization’s official name, logo, contact details, and social links
- Written partnership approval and preferred terminology from the Taiwan facility
- English and Traditional Chinese review by a fluent human translator
- Real submission API, database, spam protection, and moderation queue
- Parent/guardian consent flow where contributors are minors
- Participant or legal-representative consent before publishing resident artwork
- Verified donation provider and clear fiscal/tax language
- Privacy policy, terms, safeguarding policy, and content-removal process
- Analytics configured without behavioral advertising

## 4. Core journeys

### Draw and share

1. Visitor scans a QR code and chooses “Draw a picture.”
2. They create on the canvas or upload a scanned physical drawing.
3. They add an optional first name and broad age group—not a full birth date.
4. They approve content rules and, if required, guardian consent.
5. The submission enters moderation.
6. Approved work is printed/shared privately or published only with explicit permission.

### Thank a caregiver

1. Visitor writes a short message in English.
2. The system blocks personal contact details and harmful content.
3. A bilingual volunteer reviews the Traditional Chinese translation.
4. Partner staff receive a printable or digital message bundle.

### Receive and collect art

Use a **shared garden**, not a gambling-style gacha. Each approved artwork can become a digital flower or postcard in the visitor’s garden. Contributions and repeat visits grow the garden, but artwork should not have rarity tiers or monetary resale value.

Good incentives:

- Seasonal community garden that grows as a collective goal is reached
- Monthly art exchange with an optional notification
- Printable postcard sets and phone wallpapers, with creator permission
- Local QR-code trail: visit community partners to unlock educational flower badges
- School or club milestones based on participation, never donation amount

Avoid:

- Random paid rewards, loot-box language, or pay-to-enter drawings
- Ranking participants’ artwork
- Artificial scarcity around artwork made by vulnerable people
- Public profiles, direct messaging, or precise location collection

## 5. Fundraising approach

The website separates giving into two clear paths:

- **Current Mission:** a scrapbook-style campaign board for the active winter service trip, including its destination, purpose, costs, progress, and updates.
- **Donate to the Cause:** year-round general support for aligned charities, disability-visibility events, volunteer programs, art materials, translation, and outreach.

### Recommended first step

Until Azalea Initiative is incorporated or fiscally sponsored, use a reputable hosted campaign platform. The campaign must state whether gifts are tax-deductible. Do not imply nonprofit status before it exists.

Show a simple budget:

- Airfare and local transport
- Lodging and meals
- Volunteer supplies and program materials
- Payment/platform fees
- Contingency

Publish campaign updates and a post-trip impact report. A fiscal sponsor may be more credible than collecting money through a personal payment account.

### Raffle caution

Raffles and donation-linked prize drawings can be regulated gambling, especially online and when minors run or promote them. Do not launch one without California legal review, platform approval, official rules, eligibility restrictions, a no-purchase entry route where required, and clarity on how Taiwan-related activity affects the rules. Community milestones and sponsor-funded thank-you gifts are safer initial incentives.

## 6. Information architecture

- Home
  - Mission
  - Ways to connect
  - Shared gallery
  - Winter journey
  - Support
- About
  - Student team
  - Partner relationship
  - Past service
  - Safeguarding and transparency
- Create
  - Drawing studio
  - Physical art instructions
  - Submission status
- Messages
  - Caregiver thank-you form
  - Translation process
- Gallery
  - Public, permissioned artwork
  - Shared garden
- Updates
  - Separate top-level page accessed from the main navigation
  - Consent-approved caretaker posts
  - Facility activity and artwork updates
  - Community guidelines and reporting
- Volunteer
  - Separate top-level page accessed from the main navigation
  - Previous fundraising and service field notes
  - New volunteer application
  - Parent or guardian approval for minors
- Support
  - Current mission campaign and budget
  - Year-round general fund
  - Sponsor contact

The caretaker workspace, volunteer publishing permissions, community enforcement model, and phased implementation plan are detailed in `COMMUNITY_PLATFORM_DESIGN.md`.

## 7. Visual direction

The design uses a warm editorial style rather than a medical or institutional look.

- Forest green: trust and steadiness
- Coral: human warmth and action
- Marigold: optimism and Taiwan–California sunlight
- Sage and cream: calm, accessible backgrounds
- Display serif italics: handmade, personal voice
- Plain sans serif: clear interfaces and readable body copy
- Postcards, stamps, flowers, and hand-drawn marks: connection across distance

Small homages to the original Azalea Initiative site remain in the new system: blush-pink accents, a short pink headline rule, italic navigation, thin editorial borders, and cropped azalea blossoms at the edge of the hero. These cues preserve continuity without reproducing the original layout.

## 8. Technical plan

### Current foundation

- React + TypeScript + Vite
- CSS design system with responsive layouts
- Canvas API drawing studio
- Lucide icon set

### Suggested production stack

- Frontend: current React application, deployed to Vercel, Netlify, or Cloudflare Pages
- Backend/database: Supabase or Firebase with row-level access rules
- Artwork storage: private object storage; moderated derivatives copied to a public bucket
- Forms/spam: server-side validation, rate limits, Turnstile, and a moderation dashboard
- Translation: machine-generated draft plus mandatory human review
- Email: Resend or Postmark for transactional updates
- Donations: hosted GoFundMe, Zeffy, Givebutter, or fiscal sponsor page; link out instead of handling cards directly
- Monitoring: privacy-friendly analytics and error reporting with personal data removed

## 9. Success measures

- Percentage of QR visitors who complete a drawing or message
- Number of approved exchanges delivered to the partner
- Returning contributors after 30 days
- Volunteer interest submissions
- Campaign conversion and funds allocated by published category
- Moderation turnaround time
- Partner satisfaction and participant opt-out/removal requests

Do not optimize for time-on-site or “engagement” at the expense of safety, consent, or meaningful exchange.

## 10. Next milestones

1. Partner and participant interviews; confirm language, consent, delivery format, and capacity.
2. Finalize identity, bilingual copy, policies, and fiscal arrangement.
3. Build authentication-free submissions with moderation and storage.
4. Pilot with one school club and a small, private artwork exchange.
5. Conduct accessibility, safeguarding, and privacy reviews.
6. Publish campaign, QR materials, public gallery, and impact dashboard.
