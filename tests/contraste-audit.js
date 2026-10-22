// Auditoria de contraste de botões (roda no browser via evaluate)
(() => {
  function lum(rgb) {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  }
  function parse(str) {
    const m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x.trim()));
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function contrast(a, b) {
    const l1 = lum(a), l2 = lum(b);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }
  function effBg(el) {
    let cur = el;
    while (cur) {
      const bg = parse(getComputedStyle(cur).backgroundColor);
      if (bg && bg[3] > 0.9) return bg;
      cur = cur.parentElement;
    }
    return [255, 255, 255];
  }
  const problemas = [];
  const seletor = 'button, .btn, a.btn, .btn-voice, .quiz-option, .nav-item, .action-card';
  const todos = document.querySelectorAll(seletor);
  todos.forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const fg = parse(cs.color);
    const bg = effBg(el);
    if (!fg || fg[3] < 0.9) return;
    const ratio = contrast(fg, bg);
    if (ratio < 4.5) {
      problemas.push({
        texto: (el.textContent || '').trim().substring(0, 30),
        ratio: Math.round(ratio * 100) / 100,
        corTexto: cs.color,
        corFundo: 'rgb(' + bg.slice(0, 3).join(',') + ')',
        classe: String(el.className).substring(0, 60)
      });
    }
  });
  return JSON.stringify({ total: todos.length, problemas }, null, 1);
})()
