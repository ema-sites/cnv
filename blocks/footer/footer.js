// Footer: every label, link and image comes from the footer fragment (content/footer.plain.html);
// this only adds the layout classes.

/** Loads the footer fragment: /content first (local preview), then the site root (DA/EDS). */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // fragment images are relative to the fragment, not the page
  const base = resp.url.replace(/[^/]*$/, '');
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|\/|data:)/.test(src)) img.src = new URL(src, base).href;
    img.loading = 'lazy';
  });
  return wrapper;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const [contact, social, legal] = [...fragment.children];
  const main = document.createElement('div');
  main.className = 'footer-main';
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  main.append(inner);

  if (contact) {
    contact.className = 'footer-contact';
    contact.querySelector('p:has(img)')?.classList.add('footer-logo');
    inner.append(contact);
  }
  if (social) {
    social.className = 'footer-social';
    social.querySelector('p:has(img)')?.classList.add('footer-cityconnect');
    social.querySelector('ul')?.classList.add('footer-social-icons');
    social.querySelectorAll('.footer-social-icons a').forEach((a) => {
      if (/^https?:/.test(a.href) && new URL(a.href).host !== window.location.host) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
    inner.append(social);
  }

  block.append(main);
  if (legal) {
    legal.className = 'footer-legal';
    const legalInner = document.createElement('div');
    legalInner.className = 'footer-inner';
    legalInner.append(...legal.childNodes);
    legal.append(legalInner);
    block.append(legal);
  }
}
