// site.js —— 本站唯一的脚本:图表悬停提示、「按部分 / 按时段」切换。不联网、不存任何东西。
(function () {
  // 图表:鼠标 / 手指移到某一天,显示那天的数值;线图带一条竖线和一个点
  document.querySelectorAll('[data-chart]').forEach(function (fig) {
    var svg = fig.querySelector('svg.chart'), tip = fig.querySelector('.tip');
    var cross = svg.querySelector('.cross'), dot = svg.querySelector('.dot');
    function show(hit) {
      var x = +hit.dataset.x, y = +hit.dataset.y, vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
      if (cross) { cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.style.opacity = 1; }
      if (dot) { dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.style.opacity = 1; }
      svg.querySelectorAll('.bar').forEach(function (b, i) { b.classList.toggle('is-dim', i !== +hit.dataset.i); });
      tip.innerHTML = '<span>' + hit.dataset.label + '</span><b>' + hit.dataset.value + '</b>';
      tip.hidden = false;
      var px = x / vb.width * r.width, py = y / vb.height * r.height;
      tip.style.left = Math.max(8, Math.min(r.width - tip.offsetWidth - 8, px - tip.offsetWidth / 2)) + 'px';
      tip.style.top = Math.max(0, py - tip.offsetHeight - 14) + 'px';
    }
    function hide() {
      tip.hidden = true;
      if (cross) cross.style.opacity = 0;
      if (dot) dot.style.opacity = 0;
      svg.querySelectorAll('.bar').forEach(function (b) { b.classList.remove('is-dim'); });
    }
    svg.querySelectorAll('.hit').forEach(function (hit) {
      hit.addEventListener('pointerenter', function () { show(hit); });
      hit.addEventListener('pointerdown', function () { show(hit); });
    });
    svg.addEventListener('pointerleave', hide);
  });
  // 地图:两种看法,同一份内容只出现一次(按时段那一组是另一组短卡片)
  document.querySelectorAll('[data-views]').forEach(function (box) {
    var btns = box.querySelectorAll('[data-view-btn]');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        box.dataset.views = b.dataset.viewBtn;
        btns.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      });
    });
  });
})();
