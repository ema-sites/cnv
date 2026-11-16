/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for www.cnv.org.
 * Inserts <hr> section breaks (and Section Metadata for styled sections)
 * based on payload.template.sections. Breaks are placed in beforeTransform
 * while the section elements still exist; metadata is added in afterTransform.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try the next one
    }
  }
  return null;
}

function resolveSections(root, sections) {
  const found = sections.map((s) => ({ section: s, el: findSectionElement(root, s) }));
  // drop fallback matches that wrap another section (e.g. #mainform) to keep order sane
  return found.filter((f, i) => f.el && !found.some((o, j) => j !== i && o.el && o.el !== f.el && f.el.contains(o.el)));
}

export default function transform(hookName, element, payload) {
  const template = (payload && payload.template) || {};
  const sections = Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || (payload && payload.document);

  if (hookName === 'beforeTransform') {
    const resolved = resolveSections(element, sections);
    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { section, el } = resolved[i];
      if (i === 0 && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first', 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      const el = marker ? null : findSectionElement(element, section);
      if (!marker && !el) continue;
      const meta = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (marker) {
        // metadata belongs at the end of the section the marker opens
        let end = marker.nextElementSibling;
        while (end && end.nextElementSibling && end.nextElementSibling.tagName !== 'HR') {
          end = end.nextElementSibling;
        }
        (end || marker).after(meta);
      } else {
        el.after(meta);
      }
    }
    element.querySelectorAll('hr[data-excat-first]').forEach((hr) => hr.remove());
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
  }
}
