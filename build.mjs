#!/usr/bin/env node
// build.mjs —— 生成 miya.eden-tan.com 的静态页面(五种语言 × 首页 / 隐私 / 支持)。
//
//   MIYA_CONTACT_EMAIL=<联系邮箱> node build.mjs     # 输出到 dist/
//
// 零依赖、不加载任何外部资源:没有统计、没有 cookie、没有外部字体或 CDN。
// 文案在 src/content/<语言>.json,结构必须和 en.json 一样;文案里的 {email} 换成联系邮箱。
// 联系邮箱不写进仓库,由环境变量给(GitHub Actions 里是仓库变量 MIYA_CONTACT_EMAIL)。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const SITE = 'https://miya.eden-tan.com';
const APP_ID = '6813415265';
const APP_STORE = `https://apps.apple.com/app/id${APP_ID}`;
const CONTACT = process.env.MIYA_CONTACT_EMAIL || '';
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(CONTACT)) {
  console.error('✗ 需要环境变量 MIYA_CONTACT_EMAIL(支持页和隐私政策里的联系邮箱)');
  process.exit(1);
}

// 网址前缀、<html lang>、hreflang、菜单里的语言名(用该语言自己写)
const LANGS = [
  { code: 'en', dir: '', html: 'en', hreflang: 'en', name: 'English' },
  { code: 'zh', dir: 'zh/', html: 'zh-Hans', hreflang: 'zh-Hans', name: '简体中文' },
  { code: 'zh-Hant', dir: 'zh-hant/', html: 'zh-Hant', hreflang: 'zh-Hant', name: '繁體中文' },
  { code: 'ja', dir: 'ja/', html: 'ja', hreflang: 'ja', name: '日本語' },
  { code: 'es', dir: 'es/', html: 'es', hreflang: 'es', name: 'Español' },
];
const PAGES = [
  { key: 'home', dir: '' },
  { key: 'privacy', dir: 'privacy/' },
  { key: 'support', dir: 'support/' },
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// 文案转义后再把 {email} 换成可点的邮件链接
const txt = s => esc(s).replace(/\{email\}/g, `<a href="mailto:${CONTACT}">${CONTACT}</a>`);
const url = (lang, page) => `/${lang.dir}${page.dir}`;

// 结构检查:每种语言的键、数组长度都要和 en.json 一样,值不能是空字符串
function sameShape(a, b, where) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) throw new Error(`${where}: 数组长度不同`);
    a.forEach((x, i) => sameShape(x, b[i], `${where}[${i}]`));
  } else if (a && typeof a === 'object') {
    for (const k of Object.keys(a)) {
      if (!b || !(k in b)) throw new Error(`${where}.${k}: 缺这个键`);
      sameShape(a[k], b[k], `${where}.${k}`);
    }
  } else if (typeof b !== 'string' || !b.trim()) throw new Error(`${where}: 不是非空字符串`);
}

const content = {};
for (const L of LANGS) content[L.code] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'content', `${L.code}.json`), 'utf8'));
for (const L of LANGS) sameShape(content.en, content[L.code], L.code);

function layout(L, page, { title, description, body, noindex = false }) {
  const c = content[L.code];
  const alternates = LANGS.map(o => `<link rel="alternate" hreflang="${o.hreflang}" href="${SITE}${url(o, page)}">`).join('\n  ')
    + `\n  <link rel="alternate" hreflang="x-default" href="${SITE}${url(LANGS[0], page)}">`;
  const nav = PAGES.slice(1).map(p => `<a href="${url(L, p)}"${p === page ? ' aria-current="page"' : ''}>${esc(c.nav[p.key])}</a>`).join('');
  const langs = LANGS.map(o => `<a href="${url(o, page)}" lang="${o.html}" hreflang="${o.hreflang}"${o === L ? ' aria-current="true"' : ''}>${esc(o.name)}</a>`).join('');
  return `<!doctype html>
<html lang="${L.html}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE}${url(L, page)}">
  ${alternates}`}
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/assets/icon.png">
  <meta name="apple-itunes-app" content="app-id=${APP_ID}">
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="top">
    <a class="brand" href="${url(L, PAGES[0])}"><img src="/assets/favicon.png" alt="" width="28" height="28">MiYa</a>
    <nav class="pages">${nav}</nav>
    <details class="langs">
      <summary>${esc(L.name)}</summary>
      <div role="list" aria-label="${esc(c.nav.language)}">${langs}</div>
    </details>
  </header>
  <main>
${body}
  </main>
  <footer>
    <p>${esc(c.footer)}</p>
    <p><a href="${url(L, PAGES[1])}">${esc(c.nav.privacy)}</a> · <a href="${url(L, PAGES[2])}">${esc(c.nav.support)}</a></p>
  </footer>
</body>
</html>
`;
}

function home(L, page) {
  const c = content[L.code], H = c.home;
  return layout(L, page, {
    title: H.title, description: H.description,
    body: `    <section class="hero">
      <img class="icon" src="/assets/icon.png" alt="MiYa" width="128" height="128">
      <h1>${txt(H.tagline)}</h1>
      <p class="lead">${txt(H.lead)}</p>
      <a class="store" href="${APP_STORE}">${esc(c.appStore)}</a>
    </section>
    <section class="features">
${H.features.map(f => `      <article><h2>${txt(f.h)}</h2><p>${txt(f.p)}</p></article>`).join('\n')}
    </section>
    <p class="note">${txt(H.note)}</p>`,
  });
}

function privacy(L, page) {
  const P = content[L.code].privacy;
  const sec = s => `      <section><h2>${txt(s.h)}</h2>${s.p ? `<p>${txt(s.p)}</p>` : ''}${s.ul ? `<ul>${s.ul.map(x => `<li>${txt(x)}</li>`).join('')}</ul>` : ''}</section>`;
  return layout(L, page, {
    title: P.title, description: P.description,
    body: `    <article class="doc">
      <h1>${txt(P.title)}</h1>
      <p class="meta">${txt(P.updated)}</p>
      <p class="lead">${txt(P.intro)}</p>
${P.sections.map(sec).join('\n')}
    </article>`,
  });
}

function support(L, page) {
  const S = content[L.code].support;
  return layout(L, page, {
    title: S.title, description: S.description,
    body: `    <article class="doc">
      <h1>${txt(S.title)}</h1>
      <p class="lead">${txt(S.intro)}</p>
${S.faq.map(f => `      <details class="faq"><summary>${txt(f.q)}</summary><p>${txt(f.a)}</p></details>`).join('\n')}
      <section class="contact"><h2>${txt(S.contact)}</h2><p>{email}</p><p class="meta">${txt(S.contactNote)}</p></section>
    </article>`.replace('<p>{email}</p>', `<p>${txt('{email}')}</p>`),
  });
}

const RENDER = { home, privacy, support };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const write = (rel, text) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };

for (const L of LANGS) for (const page of PAGES) write(path.join(url(L, page), 'index.html'), RENDER[page.key](L, page));
fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src', 'style.css'), path.join(OUT, 'style.css'));
write('CNAME', 'miya.eden-tan.com\n');
write('.nojekyll', '');
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.flatMap(L => PAGES.map(p => `  <url><loc>${SITE}${url(L, p)}</loc>${LANGS.map(o => `<xhtml:link rel="alternate" hreflang="${o.hreflang}" href="${SITE}${url(o, p)}"/>`).join('')}</url>`)).join('\n')}
</urlset>
`);
write('404.html', layout(LANGS[0], PAGES[0], { title: 'Not found — MiYa', description: 'Page not found.', noindex: true,
  body: '    <article class="doc"><h1>Page not found</h1><p><a href="/">MiYa</a></p></article>' }));

console.log(`✓ dist/:${LANGS.length} 种语言 × ${PAGES.length} 页`);
