<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-11-16T21:15:00Z
  page:             index
  variant:          C
  pageUrl:          https://www.cnv.org/
  againstDirection: stardust/direction.md (Active 2026-11-16T21:02:00Z)
  consumedBy:       impeccable:craft
  canonFrom:        stardust/prototypes/index-A-proposed.html (tokens, header, footer, modules frozen)
  readArtifacts:
    - stardust/prototypes/index-A-shape.md
    - DESIGN-C.md
    - DESIGN-C.json
    - stardust/uplift-questions.md
  stardustVersion:  0.10.0
-->
---
slug: index
variant: C
url: https://www.cnv.org/
register: product (civic)
surprise: high
fidelity: quick
dominantDimension: motion (arrival register) carrying audience routing
motionRegister: arrival
compositionDelta_vs_A:
  - "hero-layout: 480px full-bleed → 85vh arrival stage with the photo parallaxing"
  - "service-router: separate section → rising white plate overlapping the hero by 96px (rising-plate gesture), tasks rise to meet the visitor"
  - "motion: static → cinematic arrival (load sequence, parallax, staggered section entrances)"
compositionDelta_vs_B:
  - "hero-layout: split photo | panel → full-bleed arrival stage"
  - "around-the-city: mosaic → A's 4-up cards with staggered entrance"
  - "news: lead story → A's dated list"
---

# Page shape: index — Variant C (arrival)

Copy set and section list: identical to `index-A-shape.md` (same IA, same order, same
classifications). Differences are the hero stage and the motion layer.

## Sections

0–1. skip link, header — canon from A.
2. **hero** — 85vh (min 560, max 820) stage; aerial photo `[data-parallax]`, scale 1.08 → 1 on load;
   scrim deepens with `--parallax-progress`; h1, lede `[data-anim]` with 90ms stagger; grants
   call-out card `[data-anim]` last.
3. **service plate** — white plate (8px radius, raised shadow) pulled up −96px over the hero; h2
   "What do you need today?", search, 6 tiles `[data-anim]` staggered 90ms. The plate rises faster
   than the hero (rising-plate gesture). Search field is never animated after load.
4–6. around the city, news & events, links — A's modules with `[data-anim]` on section heads and
   items (fade + 40px rise).
7. footer — canon from A; no footer wordmark wipe (no captured wordmark motif).

## Motion stack (_provenance.motion.choreographies)

1. `hero-arrival` — load: photo settle 1600ms, text enterUp 700ms, 90ms stagger.
2. `hero-parallax` — scroll: photo translateY to −35vh over 80% of hero range; scrim opacity +0.25.
3. `rising-plate` — scroll: plate translateY at 1.15× scroll speed for the first 30vh.
4. `section-entrance` — IO: fade + translateY(40px) → 0, stagger 90ms among peers.

Reduced motion: all four removed; elements rendered in final state. No-JS: `<noscript>` resets
`[data-anim]` to visible; the hide is gated by `html.js-anim` set inline in `<head>`.

## Data attributes

As A, plus `data-motion-register="arrival"` on `<body>`.

## Unsourced content

None.
