---
name: City of North Vancouver — Variant B (own photography at editorial scale)
description: What if North Vancouver's own photography carried the page?
colors:
  cnv-blue: "#438ece"
  cnv-navy: "#00467f"
  ink-navy: "#1f3349"
  text: "#333333"
  text-muted: "#645f5f"
  rule-grey: "#d8d8d8"
  mist: "#f4f4f4"
  harbour-light: "#c7d6e3"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "'Open Sans', sans-serif"
    fontSize: "clamp(2.25rem, 1.4rem + 3.6vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.1
  h2:
    fontFamily: "'Open Sans', sans-serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.4vw, 2.0625rem)"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "'Open Sans', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "'Open Sans', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
spacing:
  section: "64px"
  container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.cnv-navy}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    height: "48px"
  photo-tile:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
  service-panel:
    backgroundColor: "{colors.cnv-navy}"
    textColor: "{colors.paper}"
---

# Design System: City of North Vancouver — Variant B

## Overview

Same tokens as A; the bet is composition. The City's own photographs (aerial Lonsdale, the
Shipyards, Walk Roll Ride, public works) carry the page at large sizes, framed by navy panels.
Services stay in the first screen, inside the hero's navy panel. Static.

## Colors

Same roles as A. Navy `#00467f` takes more area here — the hero panel and the footer — so the
reserved shade (fill-only on the current site) becomes a ground. CNV blue stays an accent.

## Typography

Same scale as A. Photo captions 15/600 white on an ink-navy scrim band (12.9:1 at the scrim's
solid end).

## Layout

- Hero: split 7/5 — the aerial photograph full height on the left, a navy panel on the right with the
  h1, service search and six task links in a list.
- "Around the City": asymmetric mosaic — one large photo tile (Shipyards) plus three smaller tiles,
  titles in a scrim band at the bottom of each photo.
- News: one lead story with photo and date, then three dated headlines and an events column.
- Quick Links + Council: compact two-column index on mist `#f4f4f4`.

## Elevation & Depth

Depth from photography and navy grounds, not shadows.

## Shapes

8px photo tiles; square-edged navy panel meeting the photo.

## Components

- **Photo tile**: image 3:2 (large tile 4:3), bottom scrim `linear-gradient` to ink-navy 85%, h3 white.
- **Service panel**: navy, white list links with CNV-blue chevrons, 48px rows.

## Do's and Don'ts

- Do use only the City's own photos. Do give every photo real alt text.
- Don't put text on a photo without the scrim. Don't crop photos to thumbnails.
