// art.mjs —— 页首插画:光学夜景(engraved-scenes ②,底版照搬 LifeOs optical 模板)。
// 题意:手表一直在测的一串数字,经 MiYa 分成四件看得懂的事。
// 光做的事:一束光从 Apple Watch 出发,进三棱镜分成四道,四道光的尽头是四类内容的物件
// (心脏 = 心脏、电池 = 恢复 / 电量、脚印 = 活动、秒表 = 运动)。不画人、不写字。
// 几何在加载时算一次;viewBox 1600 × 700;焦点 = 棱镜重心 (611, 294) = (38.2%, 42%)。

const VB_W = 1600, VB_H = 700, HORIZON = 400, PHI = (1 + Math.sqrt(5)) / 2;
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== false)
  .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`).join(' ');
const el = (tag, o = {}, kids = '') => `<${tag} ${attrs(o)}>${Array.isArray(kids) ? kids.join('') : kids}</${tag}>`;
const f1 = (n) => +n.toFixed(1);

const rays = (vp, n = 40) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return [f1(vp[0] + Math.cos(a) * 1500), f1(vp[1] + Math.sin(a) * 1500)];
});
const FLOOR_Y = [400, 412, 427, 446, 470, 500, 538, 586, 646];
const FLOOR_X = Array.from({ length: 21 }, (_, i) => (i - 10) * 160);

function Plate(id, vp, children) {
  const cx = `${(vp[0] / VB_W) * 100}%`, cy = `${(vp[1] / VB_H) * 100}%`;
  return el('svg', { class: 'banner__svg', viewBox: `0 0 ${VB_W} ${VB_H}`, preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true', focusable: 'false' }, [
    el('defs', {}, [
      el('radialGradient', { id: `${id}-sky`, cx, cy, r: '75%' }, [
        el('stop', { offset: 0, style: 'stop-color: var(--pb-glow)' }),
        el('stop', { offset: 0.45, style: 'stop-color: var(--pb-sky)' }),
        el('stop', { offset: 1, style: 'stop-color: var(--pb-deep)' }),
      ]),
      el('pattern', { id: `${id}-hatch`, width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(35)' },
        el('line', { x1: 0, y1: 0, x2: 0, y2: 8, class: 'cb-hatch-line' })),
      el('pattern', { id: `${id}-beam-hatch`, width: 9, height: 9, patternUnits: 'userSpaceOnUse' },
        el('line', { x1: 0, y1: 0, x2: 0, y2: 9, class: 'cb-beam-hatch-line' })),
    ]),
    el('rect', { width: VB_W, height: VB_H, fill: `url(#${id}-sky)` }),
    el('g', { class: 'banner__rays' }, rays(vp).map(([x, y]) => el('line', { x1: vp[0], y1: vp[1], x2: x, y2: y }))),
    el('g', { class: 'banner__floor' }, [
      ...FLOOR_Y.map((y) => el('line', { x1: 0, y1: y, x2: VB_W, y2: y })),
      ...FLOOR_X.map((dx) => el('line', { x1: vp[0] + dx * 0.25, y1: HORIZON, x2: vp[0] + dx * 2.2, y2: VB_H })),
    ]),
    children,
  ]);
}

const F = [611, 294];
const PRISM = { apex: [611, 160], left: [501, 360], right: [721, 360] };
const ENTRY = [546, 288], EXIT = [674, 276];
const BEAM_Y = [118, 262, 406, 550], BEAM_HALF = 50, END_X = 1418;   // 四道光 = 四类内容
const beamPoints = (i) => {
  const [x0, y0] = EXIT, s0 = y0 + (i - 1.5) * 5;
  return `${x0},${s0 - 2.5} ${END_X},${BEAM_Y[i] - BEAM_HALF} ${END_X},${BEAM_Y[i] + BEAM_HALF} ${x0},${s0 + 2.5}`;
};
const PRISM_HATCH = Array.from({ length: 14 }, (_, i) => {
  const t = (i + 1) / 15;
  return { x0: f1(PRISM.apex[0] + (PRISM.right[0] - PRISM.apex[0]) * t), y0: f1(PRISM.apex[1] + (PRISM.right[1] - PRISM.apex[1]) * t),
           x1: f1(PRISM.left[0] + (PRISM.right[0] - PRISM.left[0]) * t), y1: PRISM.left[1] };
});
const ROSETTE = Array.from({ length: 24 }, (_, i) => i * 7.5);
const SPIRAL = (() => {
  const a = 3.2, pts = [];
  for (let k = 0; k <= 280; k += 1) {
    const th = (k / 280) * Math.PI * 4.5, r = a * PHI ** ((2 * th) / Math.PI);
    pts.push(`${k ? 'L' : 'M'} ${(F[0] + r * Math.cos(-th)).toFixed(1)} ${(F[1] + r * Math.sin(-th)).toFixed(1)}`);
  }
  return pts.join(' ');
})();
const RING_IN = 236, RING_OUT = Math.round(RING_IN * PHI);

// ── 物件:金色发光轮廓 + 35° 排线填面 + 一处本道光的颜色 ──
const OX = 1490;
function heart(id, cy) {
  const d = `M ${OX} ${cy + 34} C ${OX - 70} ${cy - 6} ${OX - 38} ${cy - 58} ${OX} ${cy - 22} C ${OX + 38} ${cy - 58} ${OX + 70} ${cy - 6} ${OX} ${cy + 34} Z`;
  return [el('path', { d, fill: `url(#${id}-hatch)`, class: 'cb-body' }), el('path', { d, class: 'cb-edge' }),
    el('path', { d: `M ${OX - 44} ${cy + 2} L ${OX - 18} ${cy + 2} L ${OX - 8} ${cy - 16} L ${OX + 4} ${cy + 18} L ${OX + 14} ${cy + 2} L ${OX + 44} ${cy + 2}`, class: 'cb-pulse-line' })];
}
function battery(id, cy) {
  const x = OX - 46, w = 84, h = 46;
  return [el('rect', { x, y: cy - h / 2, width: w, height: h, rx: 9, fill: `url(#${id}-hatch)`, class: 'cb-body' }),
    el('rect', { x, y: cy - h / 2, width: w, height: h, rx: 9, class: 'cb-edge' }),
    el('rect', { x: x + w, y: cy - 9, width: 9, height: 18, rx: 3, class: 'cb-edge' }),
    el('rect', { x: x + 8, y: cy - h / 2 + 8, width: (w - 16) * 0.68, height: h - 16, rx: 4, class: 'cb-accent-fill cb-charge' })];
}
function footprints(id, cy) {
  const foot = (x, y, rot) => {
    const sole = `M ${x - 13} ${y + 22} C ${x - 20} ${y - 4} ${x - 14} ${y - 26} ${x} ${y - 26} C ${x + 14} ${y - 26} ${x + 18} ${y - 4} ${x + 12} ${y + 22} C ${x + 8} ${y + 32} ${x - 9} ${y + 32} ${x - 13} ${y + 22} Z`;
    return el('g', { transform: `rotate(${rot} ${x} ${y})` }, [
      el('path', { d: sole, fill: `url(#${id}-hatch)`, class: 'cb-body' }), el('path', { d: sole, class: 'cb-edge' }),
      ...[[-11, -38, 4.6], [-2, -42, 4], [6, -40, 3.6], [12, -35, 3.2], [16, -28, 2.8]].map(([dx, dy, r]) => el('circle', { cx: x + dx, cy: y + dy, r, class: 'cb-edge' })),
    ]);
  };
  return [foot(OX - 22, cy + 12, -12), el('g', { class: 'cb-step' }, foot(OX + 24, cy - 6, 10))];
}
function stopwatch(id, cy) {
  const r = 34, c = [OX, cy + 6];
  return [el('circle', { cx: c[0], cy: c[1], r, fill: `url(#${id}-hatch)`, class: 'cb-body' }),
    el('circle', { cx: c[0], cy: c[1], r, class: 'cb-edge' }),
    el('rect', { x: c[0] - 8, y: c[1] - r - 14, width: 16, height: 10, rx: 3, class: 'cb-edge' }),
    el('line', { x1: c[0] + r * 0.72, y1: c[1] - r * 0.72, x2: c[0] + r * 0.9, y2: c[1] - r * 0.9, class: 'cb-edge' }),
    el('circle', { cx: c[0], cy: c[1], r: r - 9, class: 'cb-line cb-dash' }),
    el('g', { class: 'cb-hand', style: `transform-origin: ${c[0]}px ${c[1]}px` }, el('line', { x1: c[0], y1: c[1], x2: c[0], y2: c[1] - r + 10, class: 'cb-hand-line' })),
    el('circle', { cx: c[0], cy: c[1], r: 4, class: 'cb-accent-fill' })];
}
const OBJECTS = [heart, battery, footprints, stopwatch];

// ── Apple Watch:光的来源 ──
function watch(id) {
  const x = 112, y = 230, w = 104, h = 124;
  return [
    el('path', { d: `M ${x + 18} ${y} L ${x + 26} ${y - 70} L ${x + w - 26} ${y - 70} L ${x + w - 18} ${y} Z`, fill: `url(#${id}-hatch)`, class: 'cb-body' }),
    el('path', { d: `M ${x + 18} ${y} L ${x + 26} ${y - 70} L ${x + w - 26} ${y - 70} L ${x + w - 18} ${y} Z`, class: 'cb-line' }),
    el('path', { d: `M ${x + 18} ${y + h} L ${x + 26} ${y + h + 70} L ${x + w - 26} ${y + h + 70} L ${x + w - 18} ${y + h} Z`, fill: `url(#${id}-hatch)`, class: 'cb-body' }),
    el('path', { d: `M ${x + 18} ${y + h} L ${x + 26} ${y + h + 70} L ${x + w - 26} ${y + h + 70} L ${x + w - 18} ${y + h} Z`, class: 'cb-line' }),
    el('rect', { x, y, width: w, height: h, rx: 30, fill: `url(#${id}-hatch)`, class: 'cb-body' }),
    el('rect', { x, y, width: w, height: h, rx: 30, class: 'cb-edge' }),
    el('rect', { x: x + 12, y: y + 12, width: w - 24, height: h - 24, rx: 20, class: 'cb-line' }),
    el('rect', { x: x + w, y: y + 34, width: 9, height: 22, rx: 4, class: 'cb-edge' }),
    el('circle', { cx: x + w / 2, cy: y + h / 2, r: 9, class: 'cb-accent-fill' }),
    el('circle', { cx: x + w / 2, cy: y + h / 2, r: 9, class: 'cb-pulse' }),
  ];
}

export function heroArt(id = 'hero') {
  const prism = `${PRISM.apex.join(',')} ${PRISM.left.join(',')} ${PRISM.right.join(',')}`;
  const start = [216 + 9, 292];
  return Plate(id, F, [
    el('defs', {}, [
      el('linearGradient', { id: `${id}-beam-fade`, x1: 0, x2: 1, y1: 0, y2: 0 }, [
        el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 1 }),
        el('stop', { offset: 0.75, 'stop-color': '#fff', 'stop-opacity': 0.6 }),
        el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0.3 }),
      ]),
      el('mask', { id: `${id}-beams` }, el('rect', { width: VB_W, height: VB_H, fill: `url(#${id}-beam-fade)` })),
    ]),
    el('g', { class: 'cb-line cb-dash' }, [
      el('line', { x1: VB_W * 0.382, y1: 0, x2: VB_W * 0.382, y2: VB_H }),
      el('line', { x1: VB_W * 0.618, y1: 0, x2: VB_W * 0.618, y2: VB_H }),
      el('line', { x1: 0, y1: F[1], x2: VB_W, y2: F[1] }),
    ]),
    el('circle', { cx: F[0], cy: F[1], r: RING_IN, class: 'hb-ring' }),
    el('circle', { cx: F[0], cy: F[1], r: RING_IN + 14, class: 'hb-ticks' }),
    el('circle', { cx: F[0], cy: F[1], r: RING_OUT, class: 'hb-ring' }),
    el('circle', { cx: F[0], cy: F[1], r: RING_OUT - 14, class: 'hb-ticks is-fine' }),
    el('g', { class: 'hb-rosette', style: `transform-origin: ${F[0]}px ${F[1]}px` },
      ROSETTE.map((deg) => el('ellipse', { cx: F[0], cy: F[1], rx: 176, ry: 62, transform: `rotate(${deg} ${F[0]} ${F[1]})` }))),
    el('path', { d: SPIRAL, class: 'hb-spiral' }),
    el('g', { class: 'cb-line' }, [
      el('ellipse', { cx: F[0], cy: 492, rx: 520, ry: 66 }),
      el('ellipse', { cx: F[0], cy: 486, rx: 360, ry: 44 }),
      el('ellipse', { cx: F[0], cy: 480, rx: 210, ry: 25 }),
    ]),
    el('g', { mask: `url(#${id}-beams)` }, BEAM_Y.map((_, i) => el('g', { class: 'hb-col', 'data-col': i, style: `animation-delay: ${i * 1.4}s` }, [
      el('polygon', { points: beamPoints(i), class: 'hb-col-fill' }),
      el('polygon', { points: beamPoints(i), fill: `url(#${id}-beam-hatch)` }),
    ]))),
    ...BEAM_Y.map((y, i) => el('g', { class: 'hb-obj', 'data-col': i }, [
      el('circle', { cx: OX, cy: y, r: 62, class: 'cb-line cb-dash' }),
      ...OBJECTS[i](id, y),
    ])),
    ...watch(id),
    el('line', { x1: start[0], y1: start[1], x2: ENTRY[0], y2: ENTRY[1], class: 'cb-ray-glow' }),
    el('line', { x1: start[0], y1: start[1], x2: ENTRY[0], y2: ENTRY[1], class: 'cb-ray' }),
    el('line', { x1: ENTRY[0], y1: ENTRY[1], x2: EXIT[0], y2: EXIT[1], class: 'hb-ray-mid' }),
    el('polygon', { points: prism, class: 'hb-prism-body' }),
    ...PRISM_HATCH.map((h) => el('line', { x1: h.x0, y1: h.y0, x2: h.x1, y2: h.y1, class: 'hb-prism-hatch' })),
    el('polygon', { points: prism, class: 'cb-edge' }),
    el('ellipse', { cx: F[0], cy: F[1] - 50, rx: 170, ry: 54, transform: `rotate(-14 ${F[0]} ${F[1] - 50})`, class: 'hb-halo' }),
    el('ellipse', { cx: F[0], cy: F[1] - 20, rx: 130, ry: 40, transform: `rotate(22 ${F[0]} ${F[1] - 20})`, class: 'hb-halo is-reverse' }),
    el('rect', { x: 18, y: 18, width: VB_W - 36, height: VB_H - 36, rx: 10, class: 'hb-frame' }),
    el('rect', { x: 28, y: 28, width: VB_W - 56, height: VB_H - 56, rx: 6, class: 'hb-frame is-inner' }),
  ]);
}
