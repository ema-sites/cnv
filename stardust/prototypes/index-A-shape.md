<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-11-16T21:12:00Z
  page:             index
  variant:          A
  pageUrl:          https://www.cnv.org/
  againstDirection: stardust/direction.md (Active 2026-11-16T21:02:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/pages/index.html
    - stardust/current/_brand-extraction.json
    - DESIGN-A.md
    - DESIGN-A.json
    - stardust/direction.md
    - stardust/uplift-improvements.md
  stardustVersion:  0.10.0
-->
---
slug: index
variant: A
url: https://www.cnv.org/
register: product (civic)
surprise: low
fidelity: quick
dominantDimension: fidelity-with-fixes (captured IA order, accessibility and type repaired)
---

# Page shape: index — Variant A (faithful + improvements)

## Shared copy set (all variants; voice classification)

| Copy | Classification | Source |
|---|---|---|
| Utility: Online Services · Careers · Contact Us (sentence-cased) | captured-verbatim (case changed) | pages/index.json § ctas[0..2] |
| Nav: Home & Property · Parks, Recreation & Culture · Business & Development · Community & Environment · Streets & Transportation · Government & City Hall | captured-verbatim | pages/index.json § body[0..5] |
| h1 "City of North Vancouver" | captured-verbatim | title / logo alt |
| Hero lede "Services, news and Council business for the people of North Vancouver." | direction-authorized rewrite | direction.md improvement 4 (hero copy as live text) |
| Hero feature "Culture Makes the City programming grants — application deadline Dec 13, 2026" + "Apply now" | captured-verbatim | text in banner image, media.imgs[3] |
| Service tiles: Pay property taxes · Pay a utility bill · Report an issue (CityFix) · Garbage & recycling schedule (CityCollect) · Permits, licences & tickets (CityServe) · Property search (iCity) | direction-authorized rewrite | improvement 1; services and targets from the migrated Online Services page |
| Search label "Search the City website" / placeholder "Search for a service, bylaw or topic" | direction-authorized rewrite | improvement 1 |
| Feature cards: The Shipyards / Find out what's happening at The Shipyards! · Community Events Calendar / Check out local community events. Don't see your event? Submit it. · Garbage & Recycling / Get the details on everything waste-related. · Roadwork & Construction / Get info about current roadwork and construction happening in the City. | captured-verbatim | pages/index.html .featureTitle/.featureDescription |
| News: 4 items with dates (Nov 5, Nov 3, Oct 26, Oct 21 2026), titles and abstracts | captured-verbatim | pages/index.html .eventTitle/.eventDate/.eventAbstract |
| "All news" → /city-hall/news-room · "Events calendar" → /parks-recreation/events | captured-verbatim (labels "News Room", "Community Events") | ctas |
| Quick links (8): Apply for Business Licence · Permits & Inspections · Garbage & Recycling · Parks in the City · Community Events · News Room · Careers at the City · Get the CityFix App | captured-verbatim | ctas |
| Council (4): Council Meetings · Council Schedule · Meeting Live Streaming · Contact Mayor & Council | captured-verbatim | ctas |
| Footer: 141 West 14th Street, North Vancouver, BC V7M 1H9 · Reception: 604-985-7761 · Hours: Monday to Friday 8:30am to 5:00pm · Site Map · Contact Us · Privacy Policy · "© 2026 City of North Vancouver. All rights reserved." | captured-verbatim (year updated per improvement 9) | body[9..18] |
| CityConnect: "Sign up for CityConnect" + "News and updates from the City, by email." | direction-authorized rewrite | footer CityConnect logo, improvement 9 |
| Social: Facebook, X, Instagram, YouTube, LinkedIn, RSS (named) | captured-verbatim (names from icon files) | media.imgs[14..19] |
| Section titles: "What do you need today?" · "Around the City" · "City News & Events" · "Quick Links & Resources" · "Council Meetings" | captured-verbatim except "What do you need today?" and "Around the City" (direction-authorized rewrite) | — |

## Sections (in render order)

0. **skip link** "Skip to main content" — direction-authorized new (improvement 3).
1. **header** (system-component role: `header`; lineage: `_brand-extraction.json#systemComponents[kind=header]`).
   White top row: logo left (assets/logo.png, alt "City of North Vancouver"), search (desktop),
   utility links right. Navy `#00467f` nav bar, 6 sections, 15px/600 white labels, CNV-blue 3px
   underline on hover/focus. Phone: hamburger + search icon button.
2. **hero** (lineage: captured carousel `#banners`, slide 3 aerial photo; consolidated to one slide per
   improvement 4). Full-bleed 1440×480 aerial photograph (eager, fetchpriority high), left-anchored
   ink-navy scrim (linear-gradient to 85% at left) under h1 + lede, then a white "featured" card on
   the photo: the grants call-out with an "Apply now" navy button.
3. **service router** (lineage: direction-authorized new — improvement 1; IA priority
   `audience-routing`). h2 "What do you need today?", a 56px search field with navy button, then 6
   tiles (3×2 desktop, 2×3 tablet, 1-col list on phones). Tiles: white, 1px `#d8d8d8` border, 8px
   radius, CNV-blue line icon (inline SVG), 17px/600 navy label, whole tile linked; "All online
   services" text link.
4. **around the city** (lineage: captured 4-up feature cards `#phcontent_0_ctl01_rptFeatures`).
   h2 "Around the City". 4-up cards, 3:2 photos (the captured 344×198 images, object-fit cover), h3
   link + description. Whole card is the link; no LEARN MORE (improvement 7).
5. **news & events** (lineage: captured "City News & Events" list). h2 "City News & Events". Two
   columns: news list (2/3) — 4 items each with date (14px muted `<time>`), h3 link, abstract; and an
   events panel (1/3) on mist `#f4f4f4`: h3 "Community events", the captured calendar description,
   navy button "Events calendar", secondary link "Submit an event". Links "All news".
6. **links** (lineage: captured Quick Links & Resources + Council Meetings). Two columns on mist:
   h2 "Quick Links & Resources" (2×4 list) and h2 "Council Meetings" (4 list). Navy 17px links, CNV
   blue chevrons.
7. **footer** (system-component role: `footer`; lineage: `_brand-extraction.json#systemComponents[kind=footer]`).
   Navy band: logo (white treatment via the captured footer logo is unavailable → render the CNV logo
   on a white rounded plate), address/phone/hours in `<address>`, CityConnect sign-up call-out
   (button "Sign up"), social links with visible names, "Translate this page" link. Grey legal band.

## Layout strategy

- Container 1200px, gutter clamp(16px, 4vw, 40px); section padding 64/48/40.
- Single substrate: white, with one mist band (links) and the events panel. Navy for header bar and
  footer (system chrome, not substrate transitions).
- Breakpoints: ≤599 (phone), 600–899 (tablet), ≥900 desktop nav.

## Anti-template pass (_provenance.antiTemplatePass)

- hero: reflex = centred stack + two buttons; alternatives = left-anchored headline on scrim with one
  featured card | split photo/text (B's move) | type-only; picked left-anchored on scrim (closest to
  captured photo banner, keeps the photo as hero).
- service tiles: reflex = generic icon grid; alternatives = icon tiles | plain list | search-only;
  picked labelled tiles with search — municipal task routing is the brand job (GOV.UK/vancouver.ca).
- feature cards: reflex = 4-up card grid; kept, because the captured 4-up IS the current IA (A's role
  is faithful); fixed photo ratio and links.

## Substrate transitions

default: paper `#ffffff`; exceptions: [links band on mist — groups secondary navigation].

## Key states / interaction

- Static page; no carousel. Nav items link to section landing pages (no mega menu in the
  prototype; desktop shows the bar only). Hamburger toggles a stacked menu (≤10-line script for
  aria-expanded + Escape).
- Focus: 3px CNV-blue outline, 2px offset, on every interactive element.

## Data attributes

- `header[data-section="header"][data-intent="navigate"][data-layout="full-width"]`
- `section[data-section="hero"][data-intent="orient"][data-layout="full-bleed"]`
- `section[data-section="service-router"][data-intent="primary-action"][data-layout="grid"][data-items="6"]`
- `section[data-section="around-the-city"][data-intent="discovery"][data-layout="grid"][data-items="4"]`
- `section[data-section="news-events"][data-intent="inform"][data-layout="split-2-1"][data-items="5"]`
- `section[data-section="links"][data-intent="cross-link"][data-layout="two-column"][data-items="12"]`
- `footer[data-section="footer"][data-intent="contact"][data-layout="full-width"]`

## Unsourced content (placeholder list)

None. No statistics, events with dates, quotes or people are rendered. Service icons are generic
glyphs (direction-authorized chrome).

## Open questions for craft

- Footer logo on navy: white plate vs. navy-on-white inset — craft decides (no reverse logo captured,
  T-logo-variants).
