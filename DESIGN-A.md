---
name: City of North Vancouver — Variant A (faithful + improvements)
description: Tomorrow's version of the cnv.org homepage you have today
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
  h3:
    fontFamily: "'Open Sans', sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.6vw, 1.3125rem)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'Open Sans', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Open Sans', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
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
    padding: "12px 20px"
    height: "48px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
  link:
    textColor: "{colors.cnv-navy}"
---

# Design System: City of North Vancouver — Variant A

## Overview

The current homepage, fixed. Same order — header, one hero, the four feature topics, City News &
Events, Quick Links & Resources, Council Meetings, footer — with a service router added under the
hero. White page, navy text and nav bar, CNV blue as the accent, Open Sans on a 1.25 scale. Static.

## Colors

### Primary
- **CNV navy `#00467f`**: nav bar, links, buttons, footer. 9.6:1 on white.

### Secondary
- **CNV blue `#438ece`**: accent only — section rules, icons, focus ring, hover underline, tile
  tint at 10%. Never body-size text (3.5:1).

### Neutral
- Ink navy `#1f3349` headings · `#333` body · `#645f5f` meta/dates · `#f4f4f4` alternate band ·
  `#d8d8d8` hairlines · `#c7d6e3` badges.

## Typography

Open Sans only. Display 52px/700 (36px on phones), h2 33/600, h3 21/600, body 17/1.6, labels 14/600.
Sentence case everywhere; no uppercase micro-labels.

## Layout

1200px container, fluid gutters. Sections 64px apart (40px on phones). Hero 1440×480 photo with a
left-aligned headline on a navy scrim. Service router: 6 tiles in 3×2 (2×3 on phones) beside a
search field. Feature cards 4-up → 2-up → 1-up. News 2/3 + events 1/3. Quick links and Council in
two columns.

## Elevation & Depth

Flat by default. Clickable cards get one soft shadow on hover. No glass, no gradients except the
hero legibility scrim.

## Shapes

4px controls, 8px cards and photos.

## Components

- **Header**: utility row (Online services, Careers, Contact us), logo, search; navy nav bar, 15px
  white labels.
- **Service tile**: icon in CNV blue, 17px/600 navy label, whole tile is the link, 64px min height.
- **Feature card**: 3:2 photo, h3 link, one-line description.
- **News item**: date (14px muted), h3 headline link, summary.
- **Footer**: navy band with address, phone, hours, CityConnect sign-up, labelled social links,
  Translate; grey legal band with the current year.

## Do's and Don'ts

- Do keep the IA order residents know. Do date every news item. Do label every icon.
- Don't use CNV blue for text. Don't bring back the carousel. Don't use "Learn more".
