---
name: City of North Vancouver (current state)
description: Descriptive snapshot of www.cnv.org homepage design, captured 2026-11-16
colors:
  cnv-blue: "#438ece"
  cnv-navy: "#00467f"
  ink-navy: "#1f3349"
  text: "#333333"
  text-muted: "#645f5f"
  footer-grey: "#d8d8d8"
  background: "#ffffff"
  media-black: "#000000"
typography:
  section-title:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "35px"
    fontWeight: 300
    lineHeight: "35px"
  news-headline:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: "26px"
  card-title:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "24px"
  body:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22.4px"
  nav:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "14px"
    letterSpacing: "0.26px"
  cta-label:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "1.5px"
rounded:
  none: "0"
  control: "11px"
  dot: "50%"
spacing:
  section: "30px"
  container: "1140px"
components:
  nav-bar:
    backgroundColor: "{colors.cnv-blue}"
    textColor: "{colors.background}"
    typography: "{typography.nav}"
    height: "64px"
  feature-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.none}"
    width: "276px"
  footer-main:
    backgroundColor: "{colors.cnv-navy}"
    textColor: "{colors.background}"
  footer-legal:
    backgroundColor: "{colors.footer-grey}"
    textColor: "{colors.media-black}"
---

# Design System: City of North Vancouver (current state)

## Overview

A 2010s Sitecore/Bootstrap municipal portal: white page, a solid blue nav bar, a short black-stage
banner carousel, then four square photo cards and two text lists, closed by a navy footer. Content sits
in a 1140px container. All type is Open Sans; titles use the light 300 weight at 30–35px. There are
no shadows, no gradients and almost no radius. Hierarchy comes from colour (blue links vs navy titles)
rather than size or space.

## Colors

### Primary
- **CNV blue `#438ece`**: nav bar fill, every link, news headlines, LEARN MORE / READ MORE labels.
  3.5:1 on white.

### Secondary
- **CNV navy `#00467f`**: footer band only. 9.6:1 on white.

### Neutral
- Ink navy `#1f3349` (titles), `#333` (body), `#645f5f` (abstracts), `#d8d8d8` (legal band), white.

## Typography

Open Sans throughout. Ad-hoc scale 10 → 11 → 13 → 14 → 16 → 18 → 22 → 30 → 35. Body 14/22.4.
Section titles 35/300 ink navy; news headlines 22/400 blue; card titles 18/700 ink navy; nav 13/600
white; CTA labels 10/700 uppercase, 1.5px tracking. None of these are semantic headings.

## Layout

1140px centred container (150px gutters at 1440). Order: utility row → logo/search → 64px nav bar →
1440×368 carousel → 4-up cards (276px) → news list (772px) beside nothing → 2-column quick links +
council links → footer. At 360 the nav collapses to a hamburger and cards stack.

## Elevation & Depth

Flat. No shadows. Depth only from the black carousel stage and the navy footer.

## Shapes

Square corners on cards and images. 11px radius on the carousel control pill; 50% dots.

## Components

- **Nav bar**: blue, white 13px labels, chevron glyph (Font Awesome U+F105) for children.
- **Feature card**: 344×198 photo, 18px bold title, 2-line description, LEARN MORE.
- **News item**: 22px blue headline link, one-line grey abstract, right-aligned READ MORE, hairline rule.
- **Link list**: 16px blue links in two columns.
- **Footer**: logo, address, phone, hours, CityConnect logo, social icons, Translate; legal band.

## Do's and Don'ts

Descriptive file; see `stardust/current/brand-review.html` § Tensions for the decision agenda.
