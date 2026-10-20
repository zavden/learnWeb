---
example_stage: final-solution
example_description: "Solución: color-scheme: light dark en la raíz, color-scheme: dark en el pie (los mismos tokens eligen su valor oscuro) y scroll-behavior: smooth dentro de @media (prefers-reduced-motion: no-preference)"
example_tags: "css|solucion|light-dark|color-scheme|prefers-reduced-motion|scroll-behavior"
console: true
---

# HTML

```html
<header class="site-header">
  <p class="site-header__name">Recetas de la abuela</p>
  <nav aria-label="Pasos"><a href="#ingredientes">Ingredientes</a> · <a href="#preparacion">Preparación</a></nav>
</header>
<main class="recipe">
  <h1>Agua de jamaica</h1>
  <section id="ingredientes"><h2>Ingredientes</h2><p>Una taza de flor de jamaica, dos litros de agua y azúcar al gusto.</p></section>
  <section id="preparacion"><h2>Preparación</h2><p>Hierve la flor en un litro de agua diez minutos, cuela, añade el resto del agua fría y endulza. Sirve con hielo.</p></section>
</main>
<footer class="site-footer">Recetas de la abuela · Oaxaca, 2026</footer>

<ul class="checklist">
  <li>La página sigue el tema del sistema: <output id="check-scheme">…</output></li>
  <li>El pie, oscuro en los dos temas: <output id="check-footer">…</output></li>
  <li>Desplazamiento suave solo sin «reducir movimiento»: <output id="check-motion">…</output></li>
</ul>
```

# CSS

```css
/* ✅ 1: la página admite los dos esquemas; light-dark() elige según el sistema. */
:root {
  color-scheme: light dark;
  --surface: light-dark(#ffffff, #0f172a);
  --surface-alt: light-dark(#fef2f2, #2a1215);
  --text: light-dark(#1e293b, #e2e8f0);
  --accent: light-dark(#be123c, #fda4af);
}

/* ✅ 3: sin movimiento por defecto; se añade si nadie ha pedido menos. */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

body {
  margin: 0;
  background: var(--surface);
  color: var(--text);
  font-family: system-ui, sans-serif;
}

.site-header { display: flex; flex-wrap: wrap; gap: 4px 16px; justify-content: space-between; padding: 12px; background: var(--surface-alt); }
.site-header__name { margin: 0; font-weight: 700; }
a { color: var(--accent); }
.recipe { padding: 0 12px; }
.recipe section { min-height: 8rem; }
.recipe h1 { margin: 12px 0 0; font-size: 1.4rem; }
.recipe h2 { margin: 12px 0 4px; font-size: 1rem; }

/* ✅ 2: un solo esquema lo fuerza: los mismos tokens dan sus valores oscuros. */
.site-footer {
  color-scheme: dark;
  padding: 12px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.8rem;
}

.checklist { padding: 0 12px 0 32px; font-size: 0.8rem; }
.checklist output { font-weight: bold; }
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee los estilos
// calculados y las reglas de la hoja (también las de dentro de @media), y
// escribe ✅ o ❌ en la lista y en la consola.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const rootScheme = getComputedStyle(document.documentElement).colorScheme;
check('check-scheme', rootScheme.includes('light') && rootScheme.includes('dark'),
  `color-scheme de la raíz: ${rootScheme}`);

const footer = getComputedStyle(document.querySelector('.site-footer'));
check('check-footer', footer.colorScheme === 'dark' && footer.backgroundColor === 'rgb(15, 23, 42)',
  `color-scheme: ${footer.colorScheme} · fondo ${footer.backgroundColor}`);

// Cada regla, con la media query que la envuelve ('' si no hay ninguna).
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
const scroll = (entry) => entry.rule.style.scrollBehavior;
const alwaysSmooth = rules.some((entry) => entry.media === '' && scroll(entry) === 'smooth');
const smoothWhenAllowed = rules.some((entry) => entry.media.includes('prefers-reduced-motion: no-preference') && scroll(entry) === 'smooth');
const autoWhenReduced = rules.some((entry) => entry.media.includes('prefers-reduced-motion: reduce') && scroll(entry) === 'auto');
check('check-motion', (smoothWhenAllowed && !alwaysSmooth) || autoWhenReduced,
  alwaysSmooth && !autoWhenReduced ? 'smooth fuera de cualquier media query' : smoothWhenAllowed || autoWhenReduced ? 'respeta la preferencia' : 'no hay ningún scroll-behavior: smooth');
```
