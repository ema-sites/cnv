# search

Site search, run in the browser. The header and homepage search boxes submit to `/search?q=…`;
this block reads the query, searches the site's indexes and lists ranked results (title, section or
news date, a snippet with the matching words highlighted). Filters: all results, pages, news.

## Sources

Merged by page path; the first source wins for a page that is in both:

1. `/query-index.json`: the live index (published pages only).
2. `/search-index.json`: a snapshot of every migrated page, generated from the content folder with
   `node tools/search/build-search-index.mjs` and committed with the code. Re-generate it after
   large content changes. Once every page is published (and the index carries page text), this
   snapshot can be dropped by setting `sources` to `/query-index.json`.

## Authoring (Document Authoring)

Put a **Search** block on the `/search` page. Optional key | value rows:

| Search | |
|---|---|
| sources | /query-index.json, /search-index.json |
| limit | 20 |

## Supported variations

No variations.
