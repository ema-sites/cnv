---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-11-16T20:58:00Z
  againstInput: https://www.cnv.org/
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/pages/index.json
    - stardust/current/brand-review.html
    - stardust/current/_computed-styles.json
    - docs/NEXT_STEPS.md (RFP section 5 summary, user-supplied guide)
  referencesUsed:
    - { name: "GOV.UK homepage", url: "https://www.gov.uk/", serves: "item 1, 2", note: "task search + service links as the first screen; from agent knowledge, not fetched this run" }
    - { name: "vancouver.ca (City of Vancouver)", url: "https://vancouver.ca/", serves: "item 1", note: "neighbouring municipality: 'Popular services' tiles directly under the header; agent knowledge" }
    - { name: "boston.gov", url: "https://www.boston.gov/", serves: "item 4, 6", note: "real photography hero with text in HTML, large type; agent knowledge" }
  referenceResearch: "Live reference research not run (no browsing budget allotted for it). References are named from agent knowledge and justify the move only; every trait is backed by captured evidence."
---

# Improvements — https://www.cnv.org/

1. **[ia-clutter]** Services are not on the homepage — the four feature cards
   (The Shipyards, Community Events Calendar, Garbage & Recycling, Roadwork) and
   eight quick links sit below a 368px carousel; the City's own online services
   (CityServe, CityFix, CityCollect, iCity property search, utility bills,
   property taxes) appear nowhere on the page except the small uppercase
   "ONLINE SERVICES" utility link (pages/index.json § ctas[0]) · pattern: promo
   carousel first, tasks second · fix: a "What do you need today?" service band
   directly under the hero with search plus 6–8 named task tiles (Pay property
   taxes, Pay a utility bill, Report an issue (CityFix), Garbage & recycling
   schedule (CityCollect), Permits & licences (CityServe), Property search
   (iCity)). Counter-example: GOV.UK / vancouver.ca put tasks in the first screen.

2. **[contrast-or-density]** Brand blue fails WCAG AA as text — `#438ece` is
   3.5:1 on white (T-contrast) and carries every link, every news headline and
   the white 13px nav labels on the 64px blue bar · pattern: one mid-tone blue
   doing both fill and text duty · fix: move text and the nav bar onto captured
   CNV navy `#00467f` (9.6:1) and ink navy `#1f3349` (12.9:1); keep `#438ece` for
   large display type ≥24px bold/≥32px, rules, icons, focus rings and fills
   behind navy or white large text only.

3. **[contrast-or-density]** No semantic structure — 0 headings h1–h6
   (T-no-headings), 75% empty alt including the text-in-image grant banner and
   six nameless social icon links (T-img-alt-empty), autoplay carousel without
   pause (T-motion) · pattern: visual-only hierarchy · fix: one h1 ("City of North
   Vancouver" visually hidden or the hero line), h2 per module, h3 per item;
   hero copy as live HTML over photography with descriptive alt; carousel
   replaced by a single static feature (or a paused-by-default, controllable
   one); accessible names on all icon links; visible focus states.

4. **[dated-pattern]** Short black-stage banner carousel with text baked into
   artwork — 1440×368 stage, 4 autoplay slides, slide 1 a 7500×1917 3.7 MB PNG
   whose headline and deadline exist only as pixels (media.imgs[3]) · pattern:
   the 2012-era rotating banner (users rarely see slide 2+; content invisible to
   search and screen readers) · fix: one full-bleed photographic hero using the
   City's aerial/Shipyards photography with an HTML headline and a single
   "featured" call-out (e.g. the grant deadline) as real text. Counter-example:
   boston.gov's photo hero with live text.

5. **[contrast-or-density]** Type is small and ad-hoc — body 14px/22.4, CTA
   labels 10px uppercase with 1.5px tracking, nav 13px, scale
   10→11→13→14→16→18→22→30→35 with no ratio (T-scale) · pattern: desktop-era
   density · fix: 17–18px body, a 1.25 modular scale on Open Sans (already
   loaded at 300–700), section titles 600 weight instead of 300, minimum 14px
   for any label, sentence-case descriptive CTAs.

6. **[missed-opportunity]** The City's own photography is reduced to strips
   and thumbnails — aerial Lonsdale golden-hour and Shine-on-the-Shipyards
   photos (1800×460 originals) shown at 368px tall behind a carousel; feature
   photos at 344×198 (_brand-extraction.json § photography) · pattern: imagery
   as decoration · fix: give one photo the hero and let feature cards use 3:2
   images at full card width with titles below.

7. **[cliché]** Generic CTA labels — "Learn More" ×4 and "Read More" ×4, all
   10px uppercase (T-cta-vocab) · pattern: content-free link text repeated per
   card · fix: make the whole card/headline the link and drop the repeated
   label, or use descriptive labels ("See the events calendar").

8. **[missed-opportunity]** News and events are a plain list with no dates
   and no events — four headlines + abstracts; dates exist only in URLs
   (/2026/11/5/…); events live behind a Trumba link · pattern: undated news
   list · fix: news cards with visible dates and an "Upcoming events" column
   beside them (RFP 5.14: news and events prominent and sorted by date).

9. **[dated-pattern]** Stale footer — "Copyright © 2021", 10–11px legal text,
   social icons without names (T-temporal) · fix: current year, 14px legal
   links, labelled social links, CityConnect sign-up as a real form call-out.
