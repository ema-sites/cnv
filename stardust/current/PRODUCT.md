<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-11-16T20:50:00Z
againstInput: https://www.cnv.org/
readArtifacts: [stardust/current/pages/index.json, stardust/current/_brand-extraction.json, stardust/current/_computed-styles.json]
mode: descriptive (current state, not target)
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Residents, property owners, businesses and visitors of the City of North Vancouver, BC (pop. ~60,000), plus
developers and applicants dealing with permits, and people following Council. Most arrive with a task
(pay a bill, check garbage day, apply for a licence, report an issue) rather than to browse.
_provenance: inferred — from the homepage link inventory (Online Services, Apply for Business Licence,
Permits & Inspections, Garbage & Recycling, Council Meetings) and the RFP's stated audiences.

## Product Purpose

The City's official site: route people to services and information across six departments (Home &
Property, Parks Recreation & Culture, Business & Development, Community & Environment, Streets &
Transportation, Government & City Hall), and publish civic news, events and Council business.

## Positioning

"Official website of the City of North Vancouver, British Columbia, Canada." (meta description). A
public-service portal, not a marketing site: no tagline, no hero copy, no promotional voice. Campaigns
(grants, the Shipyards, elections) rotate through the homepage carousel.

## Capabilities and Constraints

- Six-section mega menu; utility links Online Services / Careers / Contact Us; site search.
- Homepage modules: 4-slide autoplay banner carousel, four feature cards, City News & Events (latest
  4), Quick Links & Resources (8), Council Meetings (4), footer with address, phone, hours, CityConnect
  newsletter, six social channels, Google Translate.
- Constraint (RFP 5.1/5.4): must meet WCAG 2.1 AA, be mobile-first, load fast, be editable by
  non-technical staff.

## Brand Commitments

- Register: `product` (civic service portal; task routing first). Note: municipal sites sit between
  `brand` and `product`; the homepage behaves as a router, so `product` with civic warmth.
- Colours: CNV blue `#438ece` (nav bar, links), CNV navy `#00467f` (footer), ink navy `#1f3349`
  (titles). Typeface: Open Sans 300/400/600/700.
- Logo: the CNV "city of north vancouver" mark (stacked lowercase wordmark with a blue swash).
- Observed personality: approachable, plain-spoken, community-proud (the Shipyards, events, grants),
  dependable. Not corporate, not playful.
- Observed anti-references: nothing glossy or commercial; no stock imagery (all photography is the
  City's own).

## Evidence on Hand

- `stardust/current/pages/index.json` + `index.html` (live render, 1440, medium wait)
- `stardust/current/assets/screenshots/index.png` (full page)
- `stardust/current/_computed-styles.json` (census at 1440 and 360)
- `stardust/current/_brand-extraction.json` (palette, type specimens, motifs, photography, voice)
- `stardust/current/assets/logo.png`, `logo.svg`, `favicon.png`, `media/` (8 photos/banners)
- RFP section 5 Project Description (shared by the user; see `docs/NEXT_STEPS.md`)

## Product Principles

_provenance: inferred — from the IA order and the RFP goals.

1. Tasks first: the most common services must be one click from the homepage.
2. Keep residents informed: news, events and Council business are always visible.
3. Belong to North Vancouver: real places and people, not generic municipal imagery.
4. Everyone can use it: accessible, readable on any phone, plain language.

## Accessibility & Inclusion

Observed gaps on the homepage: zero semantic headings (h1–h6); brand blue `#438ece` at 3.5:1 used for
all link text and as the fill under 13px white nav labels (AA requires 4.5:1); 75% of images have empty
alt, including a text-in-image campaign banner and six icon-only social links; autoplay carousel;
10px uppercase CTA labels. Google Translate widget offered for multilingual residents.
