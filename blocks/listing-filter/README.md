# listing-filter

Custom **custom** block. Purpose: filter bar for a listing: dropdowns (year, status), keyword box and GO button.

## Authoring (Document Authoring)

Model: `collection`

Repeating rows — one row per item. Each item: one row per control: select | label | options; keyword | placeholder; button | GO (optional); optional action | listing page URL.

## Index mode (News Room)

Add a `source` row and the block lists results itself from the site index (published pages), newest
first, 10 at a time with "Show more", instead of filtering the content below it:

| | |
|---|---|
| source | /query-index.json |
| folders | /city-hall/news-room/news-releases/, /city-hall/news-room/whats-new/ |
| limit | 10 |

A dropdown labelled Year matches each page's date (publication-date metadata, else the date in its
address); keywords must all appear in the title or summary. The filters are kept in the address
(`?year=2026&q=mayor`), so results can be shared and bookmarked.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
