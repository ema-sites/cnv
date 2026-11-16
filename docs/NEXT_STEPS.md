# CNV website: RFP section 5 assessment and 24-hour plan

Context: proposal demo for the City of North Vancouver (CNV) website RFP, section 5 "Project Description".
The demo site is the automated migration of www.cnv.org to AEM Edge Delivery Services with Document
Authoring (DA). Preview: https://main--cnv--ema-sites.aem.page/ · Live: https://main--cnv--ema-sites.aem.live/

Decisions (agreed):
- Audience: proposal demo, judged by RFP evaluators. Shortcuts are fine where noted.
- Scope for the next 24 hours: items 1–5 below plus a visual refresh.
- Publishing: all pages are already uploaded to DA. Publish to aem.live as needed for each item; the site
  index (and so search and every automated listing) only includes **published** pages.

---

## 1. Where the migrated site stands today

### Already demonstrable

| RFP | Requirement | Status on the demo site |
|---|---|---|
| 5.20 | Automated content migration | 778 pages migrated automatically from Sitecore (763 content, 12 forms, homepage, search, iCity portal page); 16 broken-link pages left out |
| 5.12 | Pre-defined templates and design components | 5 templates; 15 blocks (cards, columns, gallery, notice, table, embed, form, filters…) authored as tables in DA, no code needed |
| 5.1 | Mobile-friendly and responsive | Header (mega menu on desktop, accordion on phones), footer and all blocks are mobile-first |
| 5.1 | Site load time | Edge Delivery architecture (pre-rendered HTML, lazy blocks, CDN) |
| 5.14 | Automated news listings sorted by date | Homepage "City News & Events" is driven by `/query-index.json`: publish a page under `/city-hall/news-room/whats-new/` or `/news-releases/` and it appears, newest first |
| 5.16 | ArcGIS map embeds | `embed-iframe` block renders the city's ArcGIS / GIS maps responsively |
| 5.19 | MailChimp CityConnect | Subscription forms import as `form (dark)` blocks |
| 5.17 | iSi council videos | `council-video-picker` block (date dropdown → iSi video) on 44 council video pages |
| 5.13 | Clean URLs | All internal links rewritten to lowercase site paths |

### Gaps on the site

| RFP | Gap | Notes |
|---|---|---|
| 5.10 | No site search; no news-only or events-only search | Query index exists (title, description, image, publication-date, template, lastModified) |
| 5.4 | Accessibility not yet audited | Header menu, gallery, forms and colour contrast need checking against WCAG 2.1 AA |
| 5.13 | No redirects from old Sitecore URLs | Old URLs are mixed-case (`/City-Hall/Bylaws`), plus legacy paths (`/your-government/...`) and vanity URLs (`/publichearings`) |
| 5.1 | Design copies the current site | RFP goal 1 asks for a modern, engaging design that keeps the CNV brand. **Rev 2:** three homepage designs proposed, see § 2a |
| 5.14 | News: no archive by year, no news template with date, no news search | 16 news pages migrated; more were never crawled (see "Known content gaps") |
| 5.15 | No development-applications listing | 144 active application pages exist under `/business-development/building/land-use-approvals/active-applications/` |
| 5.1 | FAQ accordions flattened | 203 pages show FAQ answers always open (catalog decision) |
| 5.11 | Forms don't submit; no CAPTCHA | Each form needs a submission target |
| 5.14 | Events still via Trumba embed | No native event content type |
| 5.13 | No Google Tag Manager / GA4 | Needs CNV's container ID |
| 5.9 | Files and images still served from www.cnv.org | ~2,400 documents and 3,600 file links |
| 5.1 | No left section menu on interior pages | Source shows a section sub-menu beside the content |

### Platform and proposal answers (not site work)

These are answered by the platform and the proposal narrative, not by changes to the demo site. Some can be
shown live in DA.

| RFP | Topic | Answer source |
|---|---|---|
| 5.3 | Easy editing without code, broad ecosystem | DA (document-style editor), AEM ecosystem |
| 5.5 | Canadian data residency, FIPPA, security questionnaire | Hosting/CDN and Adobe compliance documentation |
| 5.6 | Role-based permissions, self-service password reset, restricted content | Adobe IMS / DA permissions; authenticated content needs a server-side solution, not hidden URLs |
| 5.7 / 5.8 | Review workflow, scheduled publishing, revision history | DA versions + preview/publish separation; scheduling and approval workflow to be described |
| 5.9 | File management, alt text, upload limits | DA media library; alt text authored in DA |
| 5.19 | APIs and single sign-on | Admin API, Adobe IMS |
| 5.21 | Maintenance and support | Proposal |

---

## 2. Plan for the next 24 hours

Order is chosen so that work builds on itself and the accessibility pass runs last, on the final design.
**Update (rev 2):** the visual refresh (item 5) was moved first at the client's request; see § 2a.

| Order | Item | RFP | What we build | Publishing needed | Estimate |
|---|---|---|---|---|---|
| 1 | **Redirects** | 5.1, 5.13 | A redirects sheet generated from the crawl data: every old URL (mixed case, `http://`, legacy `/your-government/...`, vanity URLs found as redirects on cnv.org) → its new lowercase page. Verify a sample of old URLs on aem.page | Publish the redirects sheet | 2–3h |
| 2 | **Site search** | 5.10 | A `search` block on `/search`: reads `/query-index.json`, matches title and description, results grouped or filterable by type (pages / news). Header search box submits to it | Pages must be published to be found; publish the content pages | 3–4h |
| 3 | **News archive + news search** | 5.14, 5.10 | A news listing on `/city-hall/news-room/news-releases` (and What's New): newest first, filter by year, news-only search box; a consistent news article layout showing the date | Publish the news pages and listing pages | 3–4h |
| 4 | **Development applications listing** | 5.15, 5.16 | A dynamic listing of the 144 active applications from the index, sortable and filterable by category/type, with the existing ArcGIS map. Category from the page path or a new metadata field | Publish the 144 application pages and the listing page | 3–4h |
| 5 | **Visual refresh** | 5.1 (goal 1) | Modernise within the CNV brand (blue #438ece / navy #00467f, Open Sans): larger type scale, more white space, refreshed homepage hero, cards and news section, cleaner interior page header. Done in global styles and block CSS, so content is untouched | Code only | 5–8h |
| 6 | **Accessibility pass** | 5.1, 5.4 | Automated checks (axe-core, Lighthouse) on one page per template on desktop and phone; fix heading order, alt text, colour contrast, focus styles, skip link, keyboard and screen-reader support in the mega menu, accessible names on icon buttons, gallery and form labels. Report scores before and after | Code only | 5–6h |

**Total:** about 21–29 hours. Items 1–4 and 6 are safe; the visual refresh is sized to fit what's left (a
homepage-first refresh if time is short).

### Shortcuts accepted for the demo
- Search and listings run in the browser against the published index (fine at this scale; a production build
  might add a dedicated search service, spelling tolerance and PDF search).
- Development-application categories come from the page path or a simple metadata field, not from CNV's
  application system.
- News archive "by year" uses the date in the URL or `publication-date` metadata.
- Accessibility is checked automatically plus a keyboard walk-through, not a full manual audit.

### Definition of done for each item
- Works on aem.page on desktop and phone.
- Lint clean; code pushed to `main`; any content change made locally first, then uploaded to DA, previewed and
  (where the index needs it) published.
- A short note in this file with what was built and how to demo it.

---

## 2a. Rev 2 (2026-11-16): visual refresh, homepage first

The order changed at the client's request: the visual refresh (item 5) ran first, starting with the
homepage, so the design is settled before search, listings and the accessibility pass build on it.
This rev proposes designs only. Nothing is wired into the site's blocks yet; main, Document
Authoring and aem.live are unchanged.

### What we did

1. **Captured the current homepage design** from www.cnv.org with a live browser render: colours,
   type, spacing, photography, voice and page structure, plus a full-page screenshot
   (`stardust/current/`: `brand-review.html`, `_brand-extraction.json`, `PRODUCT.md`, `DESIGN.md`).
2. **Measured the problems** (`stardust/uplift-improvements.md`, 9 items, each with evidence and a fix):
   - CNV blue `#438ece` is **3.5:1** on white. It carries every link, every news headline and the white
     menu labels, so all of them fail WCAG AA (4.5:1). CNV navy `#00467f` (9.6:1) already exists in
     the brand.
   - **No headings at all** (0 h1–h6) on the homepage.
   - 75% of images have empty alt text, including a campaign banner whose headline and deadline exist
     only as pixels, and six social icons with no accessible name.
   - An autoplay carousel with no pause control (WCAG 2.2.2).
   - The City's online services (CityServe, CityFix, CityCollect, iCity, utility bills, property taxes)
     don't appear on the homepage. There's only a small "ONLINE SERVICES" link.
   - 14px body text, 10px uppercase "LEARN MORE / READ MORE" labels, and a type scale with no
     consistent ratio.
   - News has no visible dates, and there is no events list.
   - The City's own photography is shown as a 368px strip and 344×198 thumbnails.
   - The footer copyright reads 2021.
3. **Set a brand-faithful direction** (`stardust/direction.md`, `PRODUCT.md`, `DESIGN-A/B/C.md`):
   - Palette and Open Sans are pinned to what CNV already uses; no new colours or fonts.
   - CNV blue moves from text colour to accent (rules, icons, focus ring), and text and the menu bar
     move to CNV navy.
   - Type uses a 1.25 scale from a 17px body.
   - The client confirmed Open Sans is the CNV typeface to keep, and the design checker now accepts it.
4. **Built three homepage designs.** Each is a self-contained page with its own brief
   (`stardust/prototypes/index-*-shape.md`):
   - **A: today's layout, fixed.** Same page order residents know. Adds a "What do you need today?"
     service panel with search and six named services, one photo hero with live text, larger photo
     cards, dated news beside an events panel, and a tidied footer.
   - **B: the City's photography at full size.** Split hero: the aerial photo, plus a navy panel holding
     search and popular services. Below it, a photo mosaic (the Shipyards, events, garbage, roadwork),
     then a lead news story with a photo.
   - **C: A plus arrival motion.** Same layout as A. The aerial photo settles in, then the services
     panel slides up over it as you scroll. All motion switches off with "reduce motion", and the
     page works without JavaScript. Present C as "A with motion", not as a third layout.
5. **Checked the work:**
   - Desktop, tablet and phone (1440 / 390 / 360) with no sideways scrolling.
   - A motion probe at five scroll positions, plus reduced-motion and no-JavaScript runs.
   - Automated design checks.
   - An independent design and accessibility review. Two fix rounds closed every blocking finding.
     They fixed:
     - C's services panel covering the "Apply now" button
     - C's hero being too tall to show services in the first screen
     - B's caption contrast over photos
     - a duplicate search box
     - phone order: services now come before the grants card
6. **Published the three designs for review** on their own branches. Each branch is main plus a
   `/prototypes/` folder; links on the page go to the real migrated pages:
   - A: https://homepage-a--cnv--ema-sites.aem.page/prototypes/homepage.html
   - B: https://homepage-b--cnv--ema-sites.aem.page/prototypes/homepage.html
   - C: https://homepage-c--cnv--ema-sites.aem.page/prototypes/homepage.html

   Validated on aem.page on desktop and phone (and C with reduced motion): no script errors, no failed
   requests, no missing images, Open Sans loads, and all 32 internal links resolve. Two links 404'd at
   first and were fixed:
   - The "Culture Makes the City" grants page was never migrated, so "Apply now" now goes to
     Grants & Funding.
   - The election-results news item had a slightly wrong address.

### How this answers the RFP

| RFP | Requirement | What this rev shows |
|---|---|---|
| 5.1 (goal 1) | Modern, engaging design that keeps the CNV brand | Three directions built only from CNV's own colours, Open Sans, logo and photography; from "today's layout, fixed" to "photography-led" to "with motion" |
| 5.1 | Mobile-friendly, responsive | Phone-first layouts checked at 360/390px. On phones the services come before campaigns; there's a 44px+ tap target menu and no sideways scrolling |
| 5.1 | Site load time | One hero image loaded first, everything else lazy-loaded, no carousel, a single font family already on the site |
| 5.4 | WCAG 2.1 AA | Text contrast moved to navy (9.6:1) and ink (12.9:1); one h1 and a real heading outline; descriptive alt text; named social links; visible focus ring; skip link; no autoplay; motion off under reduced motion |
| 5.1 / 5.10 | Find services and information quickly; search | "What do you need today?" search plus CityServe, CityFix, CityCollect, iCity, property taxes and utility bills in the first screen |
| 5.14 | News and events prominent, sorted by date | News shows dates, newest first; an events panel sits beside news (a dated events list needs the Trumba feed, see below) |
| 5.12 | Templates and design components | Each design is made of the parts that become blocks: hero, service panel, photo cards or mosaic, news list, link lists, footer |
| 5.3 | Easy editing without code | When built, the service panel, cards and links become Document Authoring tables; the news list already comes from the index |

### Open items from this rev

- **Pick a direction** (A, B, C, or a mix such as "B with C's motion"). Then build it into the real
  homepage: blocks and global styles on a branch, content changes made locally first and uploaded to
  DA, previewed on aem.page.
- **Dated events list:** the events data lives in Trumba. Showing dated events needs that feed, or the
  native events tool in § 3.
- **Missing pages:** import the "Culture Makes the City" grants page (missed by the original crawl).
- **Small items:** C's reveal timing has only been measured at rest, not watched while animating.
  C's motion script carries some unused shared code; strip it before production.

---

## 3. Deferred (beyond 24 hours, or needs CNV input)

| Item | RFP | Why deferred |
|---|---|---|
| FAQ accordions (Accordion block + re-import of 203 pages) | 5.1 | Stretch goal; 3–4h |
| SEO basics: sitemap, social-sharing images, canonical URLs; GTM / GA4 hook | 5.13 | Stretch goal; needs CNV's GTM container ID |
| Native events tool (upcoming order, recurrence with skipped dates, archive, events-only search, public submissions) | 5.14 | Needs an event content model and sample events; replaces Trumba |
| Forms with submissions, routing, file uploads, CAPTCHA | 5.11 | Needs a decision on the submission service |
| Council agendas/minutes/video archive search (2019+, minutes back to 1907) | 5.17 | Archive content is not on the site; videos are hosted by iSi |
| Move documents and images off www.cnv.org into DA | 5.9 | ~2,400 files; automatable but large |
| Left section menu on interior pages | 5.1 | Auto-generated from the nav or index |
| Authenticated / restricted content | 5.5, 5.6 | Needs an access-control design |

## 4. Known content gaps from the migration

- About 30 news releases and some recent pages were never crawled: the crawl stopped at 3,200 of 4,000
  URLs, older news is only reachable through the News Room's server-side filters, and some pages were created
  after the crawl. 124 internal links (73 targets) point to pages that weren't imported.
- Some old URLs are legacy addresses that redirect on cnv.org (`/your-government/council-meetings`,
  `/publichearings`); the redirects work in item 1 covers them.
- Forms: some field help texts are dropped; reCAPTCHA isn't migrated.
- The live site (aem.live) still serves the template's placeholder menu and footer until `/nav` and
  `/footer` are published.
