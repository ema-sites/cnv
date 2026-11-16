<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-11-16T21:14:00Z
  page:             index
  variant:          B
  pageUrl:          https://www.cnv.org/
  againstDirection: stardust/direction.md (Active 2026-11-16T21:02:00Z)
  consumedBy:       impeccable:craft
  canonFrom:        stardust/prototypes/index-A-proposed.html (tokens, header, footer frozen)
  readArtifacts:
    - stardust/prototypes/index-A-shape.md
    - DESIGN-B.md
    - DESIGN-B.json
    - stardust/uplift-questions.md
  stardustVersion:  0.10.0
-->
---
slug: index
variant: B
url: https://www.cnv.org/
register: product (civic)
surprise: medium
fidelity: quick
dominantDimension: photography-led composition (own place photography at editorial scale)
compositionDelta_vs_A:
  - "hero-layout: full-bleed photo + scrim → split 7/5 photo | navy service panel"
  - "section-presence: standalone service-router section removed — services move into the hero panel"
  - "around-the-city layout: equal 4-up cards → asymmetric mosaic (1 large 4:3 + 3 small) with scrim captions"
  - "news layout: uniform list → lead story with photo + dated headline list"
compositionDelta_vs_C:
  - "same four structural deltas as vs A (C keeps A's IA)"
  - "motion: static vs cinematic arrival"
---

# Page shape: index — Variant B (photography at editorial scale)

Copy set: identical to `index-A-shape.md` § Shared copy set (same classifications). Additional:
mosaic tile captions use the captured feature titles; lead news photo is the captured Shine-on-the-
Shipyards banner (assets/media/2026-SOTS-Homepage-banner.jpg) — reused at a semantic position the
capture supports (it is the Shipyards winter photo and the lead story is "Get Ready for Winter at The
Shipyards").

## Sections (in render order)

0. skip link.
1. **header** — canon from A (frozen).
2. **hero** (lineage: captured carousel aerial photo + captured "ONLINE SERVICES" utility link,
   consolidated). Split grid 7/5 at ≥900: left the aerial photo, full height (min 560px), alt
   "Aerial view of Lonsdale's towers and neighbourhoods at golden hour"; right a navy `#00467f`
   panel: h1 "City of North Vancouver", lede, search field (white), h2 (visually small, 15/600
   harbour-light) "Popular services" and the 6 service links as a list of 48px rows with CNV-blue
   chevrons, "All online services" link. Phones: photo 4:3 on top, panel below.
3. **featured** (lineage: captured carousel slide 1 grant banner, as text). A slim mist band: "Culture
   Makes the City programming grants — application deadline Dec 13, 2026" + "Apply now" button.
4. **around the city** (lineage: captured feature cards; trait amplified). h2 "Around the City".
   Mosaic: The Shipyards large (spans 2 rows, 4:3, uses the Shipyards scenic photo), Community Events,
   Garbage & Recycling, Roadwork small. Each tile: photo, bottom scrim (transparent → ink-navy 88%),
   h3 white + one-line description (white 15px). Whole tile linked. Phones: single column, 3:2.
5. **news & events** (lineage: captured news list). h2 "City News & Events". Lead story: photo (SOTS
   banner, 16:9 crop) + date + h3 + abstract; right column: 3 dated headlines; below/right: events
   panel (same copy as A). "All news" link.
6. **links** — compact index on mist, same content as A, in a 3-column layout (Quick links split in
   two + Council).
7. **footer** — canon from A.

## Anti-template pass

- hero: reflex = full-bleed photo + centred text; alternatives = split photo | navy panel, photo strip
  + text below, mosaic hero; picked split — gives the photo 58% of the first viewport with no text on
  it while keeping tasks in view (reference: boston.gov / Copenhagen kk.dk style split heroes, agent
  knowledge).
- feature cards: reflex = equal 4-up; picked asymmetric mosaic (non-template move: scale-displacement).

## Substrate transitions

default paper; exceptions: [featured band on mist — highlights the time-bound campaign; links on
mist — secondary navigation]. (Navy hero panel is part of the hero composition, not a substrate band.)

## Data attributes

- `section[data-section="hero"][data-intent="orient-and-act"][data-layout="split-7-5"]`
- `section[data-section="featured"][data-intent="campaign"][data-layout="band"]`
- `section[data-section="around-the-city"][data-intent="discovery"][data-layout="mosaic"][data-items="4"]`
- `section[data-section="news-events"][data-intent="inform"][data-layout="lead-plus-list"][data-items="5"]`
- `section[data-section="links"][data-intent="cross-link"][data-layout="three-column"][data-items="12"]`

## Unsourced content

None.
