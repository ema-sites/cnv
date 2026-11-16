<!-- stardust:provenance
writtenBy: stardust:direct
writtenAt: 2026-11-16T21:06:00Z
againstInput: https://www.cnv.org/
phrase: "uplift presales redesign — three variants per stardust/direction.md"
readArtifacts: [stardust/current/PRODUCT.md, stardust/current/_brand-extraction.json, stardust/uplift-improvements.md, stardust/direction.md, docs/NEXT_STEPS.md]
mode: target (shared by variants A, B, C)
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Residents, property owners, businesses, developers and visitors of the City of North Vancouver.
Most arrive on a phone with one task (pay a bill, check garbage day, report a pothole, find a
permit, see what Council decided). A smaller group comes to follow news, events and civic life.
Includes older residents, people using screen readers or magnification, and residents who read
English as an additional language (Google Translate is offered).

## Product Purpose

Help everyone in North Vancouver get City things done and stay informed — services first, civic
news and events always in view — on a site staff can edit without code.

## Positioning

The City's own front door: the only site that can say "this is your City Hall" — real places (the
Shipyards, Lonsdale, the waterfront), real services (CityServe, CityFix, CityCollect, iCity) and the
official record (Council meetings, news releases).

## Capabilities and Constraints

- Constraints: `a11y-first` (WCAG 2.1 AA, RFP 5.4), mobile-first and fast (RFP 5.1), editable in
  Document Authoring blocks (RFP 5.3/5.12), content and news driven by the published index
  (RFP 5.14), site search (RFP 5.10).
- Services to route to: CityServe (permits, dog licences, parking tickets), CityFix (service
  requests), CityCollect (garbage and recycling schedule), iCity (property search), utility bills,
  property taxes, active development applications.
- Delivered on AEM Edge Delivery Services: all type is Open Sans (already loaded), no new web fonts.

## Brand Commitments

- Register: `product` with civic warmth. Personality: `civic-formal`, `place-led`, approachable,
  plain-spoken, dependable, community-proud.
- Palette pinned (Mode A): CNV blue `#438ece`, CNV navy `#00467f`, ink navy `#1f3349`, text
  `#333333`, muted `#645f5f`, greys `#d8d8d8` / `#f4f4f4`, light blue `#c7d6e3`, white.
- Type pinned: Open Sans 300/400/600/700.
- Logo: the CNV mark, unaltered.
- Anti-references: the generic 2026 SaaS silhouette (gradient hero, floating glass cards, pill
  badges, "Get started" CTAs); marketing voice; stock photography; text baked into images; rotating
  carousels; tiny uppercase labels; editorial-studio vocabulary.

## Evidence on Hand

- Captured homepage copy, links and news: `stardust/current/pages/index.json`
- Photography (own, not stock): `stardust/current/assets/media/` — aerial Lonsdale, Shine on the
  Shipyards, Walk Roll Ride, Shipyards scenic, public works, curbside collection, roadwork.
- Logo and favicon: `stardust/current/assets/logo.png`, `favicon.png`
- Service names and URLs: the migrated Online Services page (CityServe, CityFix, CityCollect, iCity).
- Absent, must not be fabricated: event listings with real dates (events live in Trumba), service
  usage stats, resident quotes, weather or live status data.

## Product Principles

1. Put tasks first — the six most-used services are on the first screen of every variant.
2. Keep residents informed — news shows its date; events sit beside news.
3. Show the real city — the City's own photography, at a size that does it justice.
4. Read easily for everyone — 17px+ body, AA contrast everywhere, real headings, no text in images.
5. Stay calm — motion and colour support wayfinding, never decoration.

## Accessibility & Inclusion

WCAG 2.1 AA: text contrast ≥ 4.5:1 (CNV blue `#438ece` is 3.5:1, so it is never used for body-size
text); one h1 and a logical h2/h3 outline; descriptive alt for informative photos; accessible names on
icon links; visible focus (2px CNV blue outline + offset); no autoplay; all motion removed under
`prefers-reduced-motion`; 44px minimum touch targets; layout reflows to 320px.
