#!/usr/bin/env node
// indexnow.mjs —— 把线上 sitemap.xml 里的网址推给 IndexNow(Bing 等搜索引擎共用,不用账号)。
//   node scripts/indexnow.mjs          # 读 https://miya.eden-tan.com/sitemap.xml,一次全推
//   node scripts/indexnow.mjs --dry    # 只列出会推哪些
// 前提:密钥文件已经部署在 https://miya.eden-tan.com/<key>.txt(build.mjs 生成)。只推本站自己的网址。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'miya.eden-tan.com';
const key = fs.readFileSync(path.join(ROOT, 'indexnow-key.txt'), 'utf8').trim();
const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => new URL(u).host === HOST);
if (!urls.length) { console.error('✗ sitemap 里没有网址'); process.exit(1); }
const keyCheck = await fetch(`https://${HOST}/${key}.txt`);
if (!keyCheck.ok) { console.error(`✗ 线上还没有密钥文件(${keyCheck.status}),先部署`); process.exit(1); }
if (process.argv.includes('--dry')) { console.log(urls.join('\n')); process.exit(0); }
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList: urls }),
});
console.log(`${res.ok ? '✓' : '✗'} IndexNow ${res.status}:推了 ${urls.length} 个网址`);
process.exit(res.ok ? 0 : 1);
