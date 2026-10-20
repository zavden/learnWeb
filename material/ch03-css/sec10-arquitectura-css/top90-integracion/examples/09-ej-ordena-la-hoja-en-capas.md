---
exercise: true
exercise_title: "Ordena la hoja en capas"
exercise_instructions: "La hoja de la librería no tiene capas: el reset, pegado al final, borra los márgenes de la base, y la utilidad del pie solo gana con !important. Declara en la primera línea el orden @layer reset, base, components, utilities (TODO 1) || Mete cada bloque en su capa, también el reset, que puede quedarse al final del archivo (TODO 2) || Quita el !important de la utilidad: en la última capa no le hace falta (TODO 3) || Dentro de components, .prose a sigue ganando al botón «Apuntarme al club» por especificidad: rebájala con :where() (TODO 4) || Comprueba que las cinco líneas de la lista marcan ✅"
exercise_hints: "La sentencia @layer con la lista de nombres tiene que ser la primera regla de la hoja; los comentarios no cuentan || Una capa se puede abrir con @layer nombre { … } en cualquier sitio del archivo: el orden ya lo decidió la primera línea || Entre capas no cuenta la especificidad, pero dentro de una misma capa sí: .prose a (0,1,1) gana a .button (0,1,0) || :where(.prose) a pesa lo mismo que a"
exercise_solution_example: 09-ej-ordena-la-hoja-en-capas-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: una hoja sin capas con un reset pegado al final, una utilidad con !important y un estilo de texto largo que gana a un componente; hay que declarar el orden de las capas, repartir los bloques, quitar el !important y usar :where(). Un script lee el CSSOM y los estilos calculados"
example_tags: "css|ejercicio|layer|capas|important|where|reset|cssom"
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
/* TODO 1: la primera línea de la hoja, el orden de las capas. */

/* ── Base ── TODO 2: en la capa base. */
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

/* ── Componentes ── TODO 2: en la capa components. */
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

/* TODO 4: un estilo de texto largo no debería ganar a un componente. */
.prose a {
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

/* ── Utilidades ── TODO 2: en la capa utilities. TODO 3: sin !important. */
.u-accent {
  color: #fcd34d !important;
}

/* ── Reset, pegado de otro proyecto ── TODO 2: en la capa reset (puede
   quedarse aquí, al final). */
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
