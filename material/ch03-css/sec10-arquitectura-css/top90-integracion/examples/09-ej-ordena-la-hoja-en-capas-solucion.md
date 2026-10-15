---
example_stage: final-solution
console: true
example_description: "Solución: @layer reset, base, components, utilities en la primera línea; cada bloque en su capa (el reset sigue al final y pierde); la utilidad sin !important; y :where(.prose) a para que el botón gane dentro de la misma capa"
example_tags: "css|solucion|layer|capas|important|where|reset|cssom"
---

# HTML

```html
<header class="site-header">
  <p class="site-header__brand">Librería Las Hojas</p>
</header>
<main class="page">
  <h2>Novedades de octubre</h2>
  <ul>
    <li><cite>Los recuerdos del porvenir</cite>, Elena Garro</li>
    <li><cite>Las batallas en el desierto</cite>, José Emilio Pacheco</li>
  </ul>
  <article class="prose">
    <h2>Club de lectura</h2>
    <p>Este mes leemos <cite>Pedro Páramo</cite>: nos vemos el jueves 29 a las 19:00. <a href="/club/pedro-paramo">Ver la guía de lectura</a>.</p>
    <a class="button" href="/club/inscripcion">Apuntarme al club</a>
  </article>
</main>
<footer class="site-footer">
  <p><a href="/contacto">Contacto</a> · <a class="u-accent" href="/tarjetas-de-regalo">Tarjetas de regalo</a></p>
</footer>
<ul class="checks" style="margin: 12px 16px; padding-left: 1.2rem; font-size: 0.75rem;">
  <li id="check-order">…</li>
  <li id="check-layered">…</li>
  <li id="check-reset">…</li>
  <li id="check-utility">…</li>
  <li id="check-prose">…</li>
</ul>
```

# CSS

```css
/* ✅ TODO 1: el orden, en la primera línea. */
@layer reset, base, components, utilities;

/* ── Base ── */
@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    color: #1c1917;
    background: #ffffff;
  }

  h2 {
    margin-block: 1em 0.4em;
    font-size: 1.1rem;
  }

  ul {
    padding-inline-start: 1.25em;
  }

  a {
    color: #0f766e;
  }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

/* ── Componentes ── */
@layer components {
  .site-header,
  .site-footer {
    padding: 10px 16px;
  }

  .site-header__brand {
    font-weight: 700;
  }

  .site-footer {
    background: #1c1917;
    color: #e7e5e4;
    font-size: 0.85rem;
  }

  .site-footer a {
    color: #d6d3d1;
  }

  .page {
    padding: 0 16px 16px;
  }

  /* ✅ TODO 4: dentro de la misma capa cuenta la especificidad. Con
     :where(), (0,0,1): el botón (0,1,0) gana. */
  :where(.prose) a {
    color: #0f766e;
    text-decoration: underline;
  }

  .button {
    display: inline-block;
    margin-top: 8px;
    padding: 6px 14px;
    border-radius: 999px;
    background: #9a3412;
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }
}

/* ── Utilidades ── ✅ TODO 3: la última capa gana a components sin
   !important, aunque .site-footer a pese más. */
@layer utilities {
  .u-accent {
    color: #fcd34d;
  }
}

/* ── Reset ── ✅ Sigue al final del archivo, pero está en la capa de menos
   prioridad: pierde contra los márgenes y la sangría de la base. */
@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  h1,
  h2,
  p,
  ul {
    margin: 0;
    padding: 0;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee las reglas de la
// hoja (el CSSOM) y los estilos calculados, y escribe ✅ o ❌ en la lista (y en la
// consola). No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

// La hoja del ejercicio: la que tiene la regla del pie.
const sheet = [...document.styleSheets].find((candidate) => {
  try {
    return [...candidate.cssRules].some((rule) => rule.cssText.includes('site-footer'));
  } catch {
    return false;
  }
});

// Recorre todas las reglas: las de dentro de capas, @media y reglas anidadas.
const found = { unlayered: 0, important: 0 };
function walk(rules, inLayer) {
  for (const rule of rules) {
    const isLayer = rule instanceof CSSLayerBlockRule;
    if (rule instanceof CSSStyleRule && !inLayer) found.unlayered += 1;
    if (rule.style) {
      for (let i = 0; i < rule.style.length; i += 1) {
        if (rule.style.getPropertyPriority(rule.style[i]) === 'important') found.important += 1;
      }
    }
    if (rule.cssRules) walk(rule.cssRules, inLayer || isLayer);
  }
}
walk(sheet.cssRules, false);

const first = sheet.cssRules[0];
const names = first instanceof CSSLayerStatementRule ? [...first.nameList] : [];
check('check-order', names.join(', ') === 'reset, base, components, utilities',
  `primera regla: ${names.length ? `@layer ${names.join(', ')}` : first.constructor.name}`);

check('check-layered', found.unlayered === 0, `reglas fuera de una capa: ${found.unlayered}`);

const title = getComputedStyle(document.querySelector('.page > h2'));
const list = getComputedStyle(document.querySelector('.page > ul'));
check('check-reset', parseFloat(title.marginTop) > 0 && parseFloat(list.paddingInlineStart) > 0,
  `el reset no borra la base: margen del título ${title.marginTop} · sangría de la lista ${list.paddingInlineStart}`);

const accent = getComputedStyle(document.querySelector('.u-accent')).color;
check('check-utility', accent === 'rgb(252, 211, 77)' && found.important === 0,
  `la utilidad gana sin !important: color ${accent} · declaraciones !important: ${found.important}`);

const button = getComputedStyle(document.querySelector('.prose .button'));
check('check-prose', button.color === 'rgb(255, 255, 255)' && button.textDecorationLine === 'none',
  `botón dentro de .prose: color ${button.color} · subrayado ${button.textDecorationLine}`);
```
