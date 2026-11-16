---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-11-16T21:02:00Z
  againstInput: https://www.cnv.org/
  phrase: "uplift presales redesign — three variants; visual refresh within the CNV brand, guided by RFP section 5 (homepage first)"
  readArtifacts:
    - stardust/uplift-improvements.md
    - stardust/uplift-questions.md
    - stardust/current/PRODUCT.md
    - stardust/current/_brand-extraction.json
---

# Direction — City of North Vancouver homepage

Mode A (brand-faithful). Palette pinned to captured colours: CNV blue
`#438ece`, CNV navy `#00467f`, ink navy `#1f3349`, `#333333`, `#645f5f`,
`#d8d8d8`, white; plus `#f4f4f4` and `#c7d6e3` captured from content pages.
Typography pinned to Open Sans 300/400/600/700. Logo: captured CNV mark.

Guide: RFP section 5 goals — a modern, engaging design that keeps the CNV
brand (5.1); mobile-first and fast (5.1); WCAG 2.1 AA (5.4); services easy to
find; news and events prominent and dated (5.14); search (5.10).

Shared across all variants (non-negotiable fixes): semantic headings, AA
contrast (text on navy/ink, `#438ece` only for large type, rules, icons and
fills), no text-in-image, no autoplay, 17px+ body, labelled icon links,
visible focus, current-year footer.

IA priorities (preserved in every variant): header with the 6 sections +
search + utility links; services; feature topics (Shipyards, events,
garbage & recycling, roadwork); City News & Events; Quick Links & Resources;
Council Meetings; footer (address, phone, hours, CityConnect, social,
Translate).

## Variant A — Faithful + improvements

Role: risk-averse green-light. "Yes, that's us, with the obvious fixes."
Composition: same as captured — header, one hero, four feature cards, news,
quick links + council, footer — with a service band inserted under the hero.
Motion: static (no cinematic layer).
Improvements applied: 1 service band, 2 contrast, 3 semantics, 4 single photo
hero with live text, 5 type scale, 6 larger photos, 7 descriptive CTAs, 8
dated news + upcoming events, 9 footer.

## Variant B — What if we amplified the City's own photography?

Role: design-team motivator. The brand's underused capability foregrounded.
What if: "What if North Vancouver's own photography carried the page — the
places residents know, at editorial scale?"
Captured trait amplified: own place photography (aerial Lonsdale, the
Shipyards, Walk-Roll-Ride, public works).
Evidence: _brand-extraction.json § photography — 1800×460 originals shown at
368px; feature photos at 344×198.
Composition: split hero (photograph ~60% + navy text panel with the service
search and top tasks); "Around the City" asymmetric photo mosaic (one large
+ three small) replacing the equal 4-up cards; lead news story with photo +
three dated headlines + upcoming events; quick links and council as a compact
two-column index on `#f4f4f4`; navy footer.
Motion: static (no cinematic layer).

## Variant C — What if motion was part of the identity?

Role: visionary pitch. The brand's third dimension — kinetic.
What if: "What if the homepage arrived like the city does — the aerial view
settling into place, then the things residents come to do rising to meet
you?"
Cinematic register: arrival (auto-picked from PRODUCT.md Brand Personality:
civic + place-led)
Captured trait amplified: audience routing — the resident's tasks
Evidence: pages/index.json § ctas (no task above the fold);
_brand-extraction.json § photography[0] (aerial arrival image).
Composition: identical IA to A; the bet is motion, not layout.
Motion: cinematic, register arrival — hero image settle, headline/search
rise, task tiles stagger, section reveals on scroll; fully disabled under
prefers-reduced-motion.
