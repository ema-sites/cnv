---
name: City of North Vancouver — Variant C (arrival motion)
description: What if the homepage arrived like the city does?
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
  service-plate:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.md}"
---

# Design System: City of North Vancouver — Variant C

## Overview

A's tokens and A's IA; the bet is motion in the `arrival` register. The aerial photograph settles
into place as the page loads, the headline and search rise in, and the service "plate" rises over the
hero as you scroll, bringing the six resident tasks up to meet you. Calm, slow, civic.

## Colors / Typography / Shapes

Identical to Variant A.

## Layout

Identical to Variant A, except the hero is taller (85vh) to give the arrival room, and the service
router is a white plate that overlaps the bottom of the hero by 96px.

## Motion (register: arrival)

- Load: hero photo scale 1.08 → 1 over 1.6s; headline, lede and search `enterUp` with 90ms stagger.
- Scroll: hero photo parallaxes up (−35vh over 80% of its range); scrim deepens.
- The service plate rises faster than the hero, covering it (rising plate).
- Sections: fade + 40px rise on entry, 90ms stagger across tiles and news items.
- Easing `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, enter 700ms.
- `prefers-reduced-motion: reduce` removes every effect; content is visible without JavaScript.
- Never animates the search field itself or anything a resident is typing into.

## Do's and Don'ts

- Do keep motion slow and one-directional (up). Do make every animated element readable at rest.
- Don't loop, autoplay or bounce. Don't delay access to the services.
