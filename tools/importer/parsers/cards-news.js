/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-news (www.cnv.org homepage "City News & Events")
 *
 * The catalog element (#content-columns > div:nth-child(5)) holds the whole homepage
 * content column: .homeNewsPanel (news list) followed by .home-links ("Quick Links &
 * Resources" and "Council Meetings" link lists). Only the news items become the block;
 * the "City News & Events" heading and the link lists stay in place as default content.
 *
 * Source per item: .homeNewsPanel .eventItem
 *   .eventDate (hidden, dropped) | .eventTitle > a | .eventAbstract | .learnMore > a
 *
 * Block (cards, no images: 1 column): one row per story, single cell with
 * linked title heading, summary paragraph, READ MORE call-to-action.
 */

function text(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

export default function parse(element, { document }) {
  const panel = element.querySelector('.homeNewsPanel')
    || element.closest('.homeNewsPanel')
    || element;
  const items = [...panel.querySelectorAll('.eventItem')];
  if (!items.length) return;

  const cells = [];
  items.forEach((item) => {
    const titleLink = item.querySelector('.eventTitle a[href]');
    const titleText = text(item.querySelector('.eventTitle'));
    if (!titleText) return;

    const content = [];
    const h3 = document.createElement('h3');
    if (titleLink) {
      const a = document.createElement('a');
      a.href = titleLink.getAttribute('href');
      a.textContent = text(titleLink) || titleText;
      h3.append(a);
    } else {
      h3.textContent = titleText;
    }
    content.push(h3);

    const summaryText = text(item.querySelector('.eventAbstract'));
    if (summaryText) {
      const summary = document.createElement('p');
      summary.textContent = summaryText;
      content.push(summary);
    }

    const moreLink = item.querySelector('.learnMore a[href]');
    const moreHref = (moreLink && moreLink.getAttribute('href'))
      || (titleLink && titleLink.getAttribute('href'));
    if (moreHref) {
      const more = document.createElement('p');
      const a = document.createElement('a');
      a.href = moreHref;
      a.textContent = text(moreLink) || 'Read More';
      more.append(a);
      content.push(more);
    }

    cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });

  // keep the panel title as a default-content heading above the block
  const titleDiv = panel.querySelector('.firstLineTitle');
  if (titleDiv && text(titleDiv)) {
    const h2 = document.createElement('h2');
    h2.textContent = text(titleDiv);
    titleDiv.replaceWith(h2);
  }

  // link-list titles stay as default content; give them heading semantics
  element.querySelectorAll('.home-links .links-title').forEach((t) => {
    if (!text(t)) return;
    const h3 = document.createElement('h3');
    h3.textContent = text(t);
    t.replaceWith(h3);
  });

  // put the block where the news list was: the wrapper that holds all items
  let list = items[0].parentElement;
  while (list && list !== panel && !items.every((i) => list.contains(i))) {
    list = list.parentElement;
  }
  if (!list || list === panel) {
    items[0].before(block);
    items.forEach((i) => i.remove());
  } else {
    list.replaceWith(block);
  }
}
