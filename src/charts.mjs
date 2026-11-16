// charts.mjs —— 「03 算一下」的两张示例图表 + 四张分类卡的黄金逻辑图标。都在 build 时生成成内联 SVG。
// dataviz 规范:单一系列不放图例(标题就是名字);一种主色(MiYa accent,浅深两档都跑过 validator);
// 线 2px、柱头 4px 圆角贴底、柱间 2px 缝;网格与坐标轴退后;悬停 tooltip(site.js)+「用表格看」;标注示例数字。

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f1 = (n) => +n.toFixed(1);

// ── 示例数据(教学用,不是任何人的真实数据)──
export const HRV = [50, 53, 49, 55, 57, 52, 48, 46, 44, 47, 51, 54, 58, 61, 56, 53, 50, 49, 52, 55, 57, 54, 51, 48, 50, 53, 56, 58];
export const HRV_BASE = 52, HRV_BAND = [46, 58];
export const RECOVERY = [72, 65, 48, 30, 55, 68, 81, 77, 62, 40, 35, 58, 70, 74];
export const BANDS = [[0, 34], [34, 67], [67, 101]];   // 休息 / 适度 / 可以练,与报告同一套分档
export const hrvPeakPct = () => Math.round((Math.max(...HRV) / HRV_BASE - 1) * 100);

const W = 640, H = 260, PAD = { l: 40, r: 16, t: 16, b: 30 };
const PW = W - PAD.l - PAD.r, PH = H - PAD.t - PAD.b;

export function hrvChart(c) {
  const lo = 36, hi = 66;
  const x = (i) => PAD.l + (i / (HRV.length - 1)) * PW, y = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * PH;
  const pts = HRV.map((v, i) => [f1(x(i)), f1(y(v))]);
  const grid = [40, 50, 60].map((v) => `<line class="grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${f1(y(v))}" y2="${f1(y(v))}"/><text class="tick" x="${PAD.l - 8}" y="${f1(y(v)) + 4}" text-anchor="end">${v}</text>`).join('');
  const xt = [0, 7, 14, 21, 27].map((i) => `<text class="tick" x="${f1(x(i))}" y="${H - 8}" text-anchor="middle">${i + 1}</text>`).join('');
  const band = `<rect class="band" x="${PAD.l}" y="${f1(y(HRV_BAND[1]))}" width="${PW}" height="${f1(y(HRV_BAND[0]) - y(HRV_BAND[1]))}" rx="4"/>`
    + `<line class="base" x1="${PAD.l}" x2="${W - PAD.r}" y1="${f1(y(HRV_BASE))}" y2="${f1(y(HRV_BASE))}"/>`
    + `<text class="band-label" x="${W - PAD.r - 6}" y="${f1(y(HRV_BAND[1])) + 14}" text-anchor="end">${esc(c.hrvBand)}</text>`;
  const line = `<polyline class="series" points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
  const peak = HRV.indexOf(Math.max(...HRV));
  const mark = `<circle class="peak" cx="${pts[peak][0]}" cy="${pts[peak][1]}" r="5"/>`;
  const step = PW / (HRV.length - 1);
  const hits = HRV.map((v, i) => `<rect class="hit" x="${f1(x(i) - step / 2)}" y="${PAD.t}" width="${f1(step)}" height="${PH}" data-i="${i}" data-x="${pts[i][0]}" data-y="${pts[i][1]}" data-label="${esc(`${c.day} ${i + 1}`)}" data-value="${v} ms"/>`).join('');
  return figure('hrv', c.hrvTitle, c.hrvCaption, c,
    `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.hrvTitle)}">${grid}${band}${line}${mark}${xt}<line class="cross" x1="0" x2="0" y1="${PAD.t}" y2="${PAD.t + PH}"/><circle class="dot" r="5" cx="-20" cy="-20"/>${hits}</svg>`,
    [c.day, c.hrvSeries], HRV.map((v, i) => [i + 1, v]), `<div class="hero-num"><b>+${hrvPeakPct()}%</b><span>${esc(c.heroNote)}</span></div>`);
}

export function recoveryChart(c) {
  const PAD = { l: 40, r: 92, t: 16, b: 30 }, PW = W - PAD.l - PAD.r, PH = H - PAD.t - PAD.b;   // 右边留给分档名
  const x0 = (i) => PAD.l + i * (PW / RECOVERY.length), bw = PW / RECOVERY.length - 2;
  const y = (v) => PAD.t + (1 - v / 100) * PH;
  const bands = BANDS.map(([a, b], k) => `<rect class="zone z${k}" x="${PAD.l}" y="${f1(y(Math.min(b, 100)))}" width="${PW}" height="${f1(y(a) - y(Math.min(b, 100)))}"/>`
    + `<text class="band-label" x="${W - PAD.r + 8}" y="${f1((y(Math.min(b, 100)) + y(a)) / 2) + 4}" text-anchor="start">${esc(c.bands[k])}</text>`).join('');
  const lines = [34, 67].map((v) => `<line class="base" x1="${PAD.l}" x2="${W - PAD.r}" y1="${f1(y(v))}" y2="${f1(y(v))}"/><text class="tick" x="${PAD.l - 8}" y="${f1(y(v)) + 4}" text-anchor="end">${v}</text>`).join('');
  // 柱:顶端 4px 圆角、底端贴基线(path 画,只圆上面两个角)
  const bar = (i, v) => {
    const X = f1(x0(i) + 1), Y = f1(y(v)), B = f1(y(0)), r = Math.min(4, (B - Y) / 2);
    return `<path class="bar" d="M${X} ${B} V${f1(Y + r)} Q${X} ${Y} ${f1(X + r)} ${Y} H${f1(X + bw - r)} Q${f1(X + bw)} ${Y} ${f1(X + bw)} ${f1(Y + r)} V${B} Z"/>`;
  };
  const bars = RECOVERY.map((v, i) => bar(i, v)).join('');
  const xt = [0, 6, 13].map((i) => `<text class="tick" x="${f1(x0(i) + 1 + bw / 2)}" y="${H - 8}" text-anchor="middle">${i + 1}</text>`).join('');
  const bandOf = (v) => c.bands[BANDS.findIndex(([a, b]) => v >= a && v < b)];
  const hits = RECOVERY.map((v, i) => `<rect class="hit" x="${f1(x0(i))}" y="${PAD.t}" width="${f1(PW / RECOVERY.length)}" height="${PH}" data-i="${i}" data-x="${f1(x0(i) + 1 + bw / 2)}" data-y="${f1(y(v))}" data-label="${esc(`${c.day} ${i + 1}`)}" data-value="${v} · ${esc(bandOf(v))}"/>`).join('');
  return figure('recovery', c.recTitle, c.recCaption, c,
    `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.recTitle)}">${bands}${lines}${bars}${xt}<line class="baseline" x1="${PAD.l}" x2="${W - PAD.r}" y1="${f1(y(0))}" y2="${f1(y(0))}"/>${hits}</svg>`,
    [c.day, c.recSeries], RECOVERY.map((v, i) => [i + 1, `${v} (${bandOf(v)})`]));
}

function figure(key, title, caption, c, svg, head, rows, extra = '') {
  return `<figure class="chart-card" id="chart-${key}" data-chart>
        <figcaption><h3>${esc(title)}</h3><p>${esc(caption)}</p></figcaption>
        ${extra}
        <div class="chart-wrap">${svg}<div class="tip" role="status" aria-live="polite" hidden></div></div>
        <p class="sample">${esc(c.sample)}</p>
        <details class="table-view"><summary>${esc(c.table)}</summary>
          <table><thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
        </details>
      </figure>`;
}

// ── 黄金逻辑图标(golden-design-system):24 网格,圆与圆角只用 R = 9·φ^-k(9 / 5.56 / 3.44 / 2.13 / 1.31),
//    线宽 φ ≈ 1.62;单墨 + 一处金色重点。透明底,currentColor 是墨,.gold 是重点色 ──
const R = [9, 5.56, 3.44, 2.13, 1.31];
export const ICONS = {
  heart: `<path d="M12 20.2 4.3 12.4A${R[3]} ${R[3]} 0 0 1 4 12a4.3 4.3 0 0 1 8-2.2A4.3 4.3 0 0 1 20 12a${R[3]} ${R[3]} 0 0 1-.3.4Z" fill="currentColor"/><path d="M6.2 12.6h2.4l1.3-2 2 3.6 1.2-1.6h4.7" fill="none" stroke="var(--icon-paper)" stroke-width="1.31" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.9" cy="10.6" r="${R[4] / 1.3}" class="gold"/>`,
  recovery: `<rect x="2.5" y="7" width="17" height="10" rx="${R[2]}" fill="currentColor"/><rect x="19.9" y="10" width="1.8" height="4" rx="0.81" fill="currentColor"/><rect x="4.6" y="9.1" width="8.2" height="5.8" rx="${R[4]}" class="gold"/><path d="M15.4 9.6v4.8" stroke="var(--icon-paper)" stroke-width="1.31" stroke-linecap="round"/>`,
  activity: `<path d="M7.3 21.2c-2.4 0-3.4-2.6-3.1-5.6.3-3.2 1.7-6 3.9-6s2.9 2.8 2.5 6c-.4 3-1 5.6-3.3 5.6Z" fill="currentColor"/><path d="M16.4 14.6c-2.2 0-3-2.4-2.7-5 .3-2.9 1.5-5.4 3.4-5.4s2.6 2.5 2.3 5.4c-.3 2.6-.9 5-3 5Z" fill="currentColor"/><circle cx="17.1" cy="7.2" r="${R[4]}" class="gold"/>`,
  workouts: `<circle cx="12" cy="13.6" r="${R[0] - 1.6}" fill="currentColor"/><rect x="10.2" y="2.4" width="3.6" height="2.6" rx="0.81" fill="currentColor"/><path d="M12 13.6V9.2" stroke="var(--icon-paper)" stroke-width="1.62" stroke-linecap="round"/><circle cx="12" cy="13.6" r="${R[3] - 0.6}" class="gold"/>`,
};
export const icon = (key, size = 24) => `<svg class="gicon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">${ICONS[key]}</svg>`;
