# cards-news

Custom **cards** block. Purpose: homepage City News & Events list: linked headline, one-line summary and READ MORE link per story.

The list is built automatically from the site's query index (`/query-index.json`): it shows the newest **published** pages under the news folders, newest first. A page's date is its `publication-date` metadata if set, otherwise the `/YYYY/M/D/` date in its address, otherwise when it was last modified. The headline is the page title and the summary is its description.

## Authoring (Document Authoring)

Model: `configuration`

Key | value rows (read with `readBlockConfig`), all optional:

| Key | Value | Default |
|---|---|---|
| `limit` | number of stories to show | `4` |
| `folders` | comma-separated folders to list pages from | `/city-hall/news-room/news-releases/, /city-hall/news-room/whats-new/` |
| `source` | index to read | `/query-index.json` |

To add a story, create a page in one of the folders, give it a title and a description, and publish it.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
