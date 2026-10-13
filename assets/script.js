// MaC Foundation — shared behavior
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('nav.links');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // loading screen: tap to skip
  const loader = document.getElementById('loader');
  if (loader) loader.addEventListener('click', () => loader.classList.add('gone'));

  // scroll reveal
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && items.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    items.forEach(el => io.observe(el));
  } else items.forEach(el => el.classList.add('in'));

  // active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.links a').forEach(a => { if (a.getAttribute('href') === path) a.classList.add('active'); });

  // sheet music: words become notes, lyrics sit underneath
  const NS = 'http://www.w3.org/2000/svg';
  const hash = s => { let h = 7; for (const c of s.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };

  function drawMelody(box) {
    const words = box.dataset.lyrics.split(/\s+/).filter(Boolean);
    box.innerHTML = '<div class="tempo">♩ = 60 &nbsp;' + (box.dataset.tempo || 'andante') + '</div>';
    const W = box.clientWidth - 32, top = 36, bottom = 76;
    let pos = 3, rows = [[]], used = 0;
    words.forEach(w => {
      const width = 54 + w.length * 8;
      if (used + width > W - 40 && rows[rows.length - 1].length) { rows.push([]); used = 0; }
      pos = Math.max(0, Math.min(8, pos + (hash(w) % 5) - 2));
      rows[rows.length - 1].push({ w, width, pos }); used += width;
    });
    rows.forEach((row, r) => {
      const svg = el('svg', { viewBox: `0 0 ${W} 122`, role: 'img', 'aria-label': row.map(n => n.w).join(' ') });
      for (let i = 0; i < 5; i++) svg.appendChild(el('line', { x1: 0, x2: W, y1: top + i * 10, y2: top + i * 10, stroke: '#000', 'stroke-width': 1.5 }));
      svg.appendChild(el('line', { x1: 1, x2: 1, y1: top, y2: bottom, stroke: '#000', 'stroke-width': 3 }));
      const total = row.reduce((s, n) => s + n.width, 0), gap = (W - 24 - total) / row.length;
      let x = 14 + gap / 2;
      row.forEach((n, i) => {
        const cx = x + n.width / 2, cy = bottom - n.pos * 5, up = n.pos < 4, half = n.w.length > 6;
        svg.appendChild(el('ellipse', { cx, cy, rx: 7, ry: 5, transform: `rotate(-20 ${cx} ${cy})`, fill: half ? '#fff' : '#000', stroke: '#000', 'stroke-width': 2 }));
        const sx = up ? cx + 6.3 : cx - 6.3;
        svg.appendChild(el('line', { x1: sx, x2: sx, y1: cy, y2: up ? cy - 32 : cy + 32, stroke: '#000', 'stroke-width': 1.8 }));
        const t = el('text', { x: cx, y: 110, 'text-anchor': 'middle' }); t.textContent = n.w; svg.appendChild(t);
        x += n.width + gap;
        if ((i + 1) % 4 === 0 && i < row.length - 1) { const bx = x - gap / 2; svg.appendChild(el('line', { x1: bx, x2: bx, y1: top, y2: bottom, stroke: '#000', 'stroke-width': 1.5 })); }
      });
      const last = r === rows.length - 1;
      svg.appendChild(el('line', { x1: W - (last ? 6 : 1), x2: W - (last ? 6 : 1), y1: top, y2: bottom, stroke: '#000', 'stroke-width': 1.5 }));
      if (last) svg.appendChild(el('line', { x1: W - 1, x2: W - 1, y1: top, y2: bottom, stroke: '#000', 'stroke-width': 4 }));
      box.appendChild(svg);
    });
  }
  const melodies = document.querySelectorAll('.melody');
  let lastW = 0, t;
  const build = () => { if (melodies[0] && melodies[0].clientWidth === lastW) return; lastW = melodies[0] ? melodies[0].clientWidth : 0; melodies.forEach(drawMelody); };
  build();
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 150); });
});
