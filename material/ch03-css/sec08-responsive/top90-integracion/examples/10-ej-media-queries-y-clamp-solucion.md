---
example_stage: final-solution
example_description: "Solución: la media query de la rejilla después de la regla base, los avisos con width < 40rem y width >= 40rem, y el título con clamp(1.25rem, 0.9773rem + 1.3636vw, 2rem)"
example_tags: "css|solucion|media-queries|cascada|rangos|clamp|tipografia-fluida"
console: true
---

# HTML

```html
<h1 class="page-title">Macetas de barro</h1>
<p class="notice notice--mobile">📱 Desliza para ver más modelos.</p>
<p class="notice notice--desktop">🖥️ Pasa el ratón por cada maceta para ver sus medidas.</p>
<ul class="products">
  <li>Maceta lisa · 20 cm · 180 MXN</li>
  <li>Maceta bruñida · 25 cm · 260 MXN</li>
  <li>Maceta con plato · 30 cm · 340 MXN</li>
  <li>Jardinera · 60 cm · 520 MXN</li>
</ul>

<ul class="checklist">
  <li>Rejilla de 1 o 2 columnas según el ancho: <output id="check-grid">…</output></li>
  <li>Un solo aviso, con sintaxis de rangos: <output id="check-notices">…</output></li>
  <li>Título fluido de 20 a 32px: <output id="check-title">…</output></li>
</ul>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }

.products {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 0;
  list-style: none;
}

/* ✅ 1: la media query DESPUÉS de la regla base: con empate de
   especificidad, gana por ir detrás. */
@media (width >= 25rem) {
  .products { grid-template-columns: repeat(2, 1fr); }
}

.products li { padding: 10px; border: 1px solid #b45309; border-radius: 8px; background: #fff7ed; font-size: 0.85rem; }

/* ✅ 2: < y >= reparten todos los anchos, sin solaparse. */
.notice { display: none; margin: 0 0 8px; padding: 6px 10px; border-radius: 6px; background: #e0e7ff; font-size: 0.8rem; }

@media (width < 40rem) {
  .notice--mobile { display: block; }
}

@media (width >= 40rem) {
  .notice--desktop { display: block; }
}

/* ✅ 3: pendiente = 12 / 880 = 0.013636 → 1.3636vw;
   corte = 20 − 0.013636 × 320 = 15.636px → 0.9773rem; límites 20 y 32px. */
.page-title {
  margin: 0 0 8px;
  font-size: clamp(1.25rem, 0.9773rem + 1.3636vw, 2rem);
  line-height: 1.1;
}

.checklist { padding-inline-start: 1.2em; color: #475569; font-size: 0.8rem; }
.checklist output { color: #1e293b; font-weight: bold; }
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. El script calcula lo que
// debería verse con el ancho ACTUAL de la vista previa (matchMedia pregunta lo
// mismo que una media query), lo compara con lo que se ve y lee las reglas de
// la hoja. Escribe ✅ o ❌ en la lista y en la consola.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const rules = [];
function collect(list, media) {
  for (const rule of list) {
    if (rule.selectorText) rules.push({ rule, media });
    if (rule.cssRules) collect(rule.cssRules, rule.conditionText || media);
  }
}
for (const sheet of document.styleSheets) {
  try { collect(sheet.cssRules, ''); } catch { /* hoja de otro origen */ }
}

// 1. Columnas esperadas para este ancho, y el orden de las reglas.
const wide = matchMedia('(width >= 25rem)').matches;
const value = getComputedStyle(document.querySelector('.products')).gridTemplateColumns;
const columns = value === 'none' ? 1 : value.split(' ').length;
const base = rules.findIndex((entry) => entry.media === '' && entry.rule.selectorText === '.products');
const query = rules.findIndex((entry) => entry.media !== '' && entry.rule.selectorText === '.products');
check('check-grid', columns === (wide ? 2 : 1) && query > base,
  `${columns} columna(s), esperadas ${wide ? 2 : 1}${query < base ? ' · la media query va antes de la regla base' : ''}`);

// 2. Un solo aviso visible, el que toca, y nada de min-width / max-width.
const desktop = matchMedia('(width >= 40rem)').matches;
const shown = (name) => getComputedStyle(document.querySelector(`.notice--${name}`)).display !== 'none';
const oldSyntax = rules.some((entry) => entry.media.includes('min-width') || entry.media.includes('max-width'));
check('check-notices', shown('mobile') === !desktop && shown('desktop') === desktop && !oldSyntax,
  oldSyntax ? 'todavía hay min-width o max-width' : `móvil ${shown('mobile') ? 'visible' : 'oculto'}, escritorio ${shown('desktop') ? 'visible' : 'oculto'}`);

// 3. La recta: 20px a 320px, 32px a 1200px, con límites.
const slope = (32 - 20) / (1200 - 320);
const expected = Math.min(32, Math.max(20, 20 - slope * 320 + slope * window.innerWidth));
const actual = parseFloat(getComputedStyle(document.querySelector('.page-title')).fontSize);
const declared = rules.find((entry) => entry.rule.selectorText === '.page-title')?.rule.style.fontSize || '';
const units = declared.includes('rem') && declared.includes('vw') && !declared.includes('px');
check('check-title', Math.abs(actual - expected) < 0.3 && units,
  `${actual.toFixed(2)}px, esperados ${expected.toFixed(2)}px con ${window.innerWidth}px de ventana${units ? '' : ' · escribe el clamp() en rem y vw'}`);
```
