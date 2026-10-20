---
exercise: true
exercise_title: "Arregla el panel de filtros"
exercise_instructions: "Marca y desmarca «Filtros»: el panel entra deslizándose, pero al cerrarse desaparece de golpe. Haz que la transición valga también para cerrar (TODO 1) || El panel se mueve animando left, que rehace el layout en cada fotograma: déjalo siempre en left: 0 y escóndelo con translate (TODO 2) || transition: all anima cualquier cosa que cambie: escribe solo las propiedades que se animan (TODO 3) || El desplazamiento debe ocurrir solo si el sistema no pide reducir el movimiento; con reduce, el panel aparece con un fundido (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "Manda la transición del estado de llegada: al cerrar, el estado de llegada es la regla base || translate con un porcentaje se mide con la propia caja: -100% la esconde entera a la izquierda || Para que el panel no reciba el foco cerrado, visibility también cambia: tiene que estar en la lista para que no desaparezca antes de terminar de salir || El fundido (opacity y visibility) puede ir fuera de la media query; translate, dentro de @media (prefers-reduced-motion: no-preference)"
exercise_solution_example: 09-ej-arregla-el-panel-de-filtros-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: un panel lateral de filtros con cuatro errores de animación (la transición solo en el estado abierto, left en lugar de translate, transition: all y el movimiento fuera de prefers-reduced-motion) que un script comprueba leyendo los estilos calculados y las reglas de la hoja"
example_tags: "css|ejercicio|transiciones|translate|prefers-reduced-motion|cssom"
---

# HTML

```html
<div class="shop">
  <header class="shop__bar">
    <label class="toggle"><input type="checkbox" id="show-filters"> Filtros</label>
    <span>24 plantas</span>
  </header>
  <aside class="filters" aria-label="Filtros">
    <h3>Filtrar por</h3>
    <label><input type="checkbox"> Interior</label>
    <label><input type="checkbox"> Exterior</label>
    <label><input type="checkbox"> Poco riego</label>
  </aside>
  <p class="shop__text">Nopal · Echeveria · Helecho · Pothos · Albahaca · Limonero enano…</p>
</div>
<ul class="checks">
  <li id="check-base">…</li>
  <li id="check-translate">…</li>
  <li id="check-list">…</li>
  <li id="check-motion">…</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.shop {
  position: relative;
  height: 180px;
  overflow: clip;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

.shop__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #cbd5e1;
  font-size: 0.85rem;
}

.toggle {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 4px 10px;
  border: 1px solid #64748b;
  border-radius: 999px;
  font-weight: 600;
}

.shop__text {
  margin: 12px;
  font-size: 0.85rem;
}

.filters {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  display: grid;
  align-content: start;
  gap: 6px;
  width: 200px;
  box-sizing: border-box;
  padding: 12px;
  background: #f0fdf4;
  box-shadow: 4px 0 14px rgb(15 23 42 / 0.2);
  font-size: 0.85rem;
  /* TODO 2: el panel cerrado se esconde con left. */
  left: -200px;
  visibility: hidden;
}

.filters h3 {
  margin: 0 0 4px;
  font-size: 0.9rem;
}

body:has(#show-filters:checked) .filters {
  /* TODO 2: y se abre con left. */
  left: 0;
  visibility: visible;
  /* TODO 1 y TODO 3: la transición está solo aquí, y es «all». */
  transition: all 300ms ease-out;
}

/* TODO 4: el desplazamiento, solo con prefers-reduced-motion: no-preference. */

.checks {
  margin: 10px 0 0;
  padding-left: 1.2rem;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee los estilos calculados
// del panel CERRADO y las reglas de la hoja de estilos, y escribe ✅ o ❌ en la lista
// (y en la consola). No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const panel = getComputedStyle(document.querySelector('.filters'));
const durations = panel.transitionDuration.split(',').map((value) => parseFloat(value));
check('check-base', durations.some((value) => value > 0),
  `cerrado, transition-duration: ${panel.transitionDuration}`);

check('check-translate', panel.left === '0px' && !['none', '0px'].includes(panel.translate),
  `cerrado, left: ${panel.left} · translate: ${panel.translate}`);

const properties = panel.transitionProperty.split(',').map((value) => value.trim());
check('check-list',
  !properties.includes('all') && !properties.includes('left')
    && properties.includes('translate') && properties.includes('visibility'),
  `transition-property: ${panel.transitionProperty}`);

// Recorre las reglas de la hoja (también las de dentro de @media) y anota en qué
// media query está cada una.
function collectRules(rules, mediaText, found) {
  for (const rule of rules) {
    if (rule.media) {
      collectRules(rule.cssRules, rule.media.mediaText, found);
    } else if (rule.style) {
      found.push({ mediaText, transition: rule.style.transitionProperty });
    } else if (rule.cssRules) {
      collectRules(rule.cssRules, mediaText, found);
    }
  }
  return found;
}

const rules = [];
for (const sheet of document.styleSheets) {
  try {
    collectRules(sheet.cssRules, '', rules);
  } catch {
    // hojas de otro origen: no se pueden leer
  }
}
const isMotion = (rule) => /translate|left/.test(rule.transition);
const inNoPreference = (rule) => rule.mediaText.includes('prefers-reduced-motion: no-preference');
const motionInside = rules.filter((rule) => isMotion(rule) && inNoPreference(rule)).length;
const motionOutside = rules.filter((rule) => isMotion(rule) && !inNoPreference(rule)).length;
check('check-motion', motionInside > 0 && motionOutside === 0,
  `transiciones de movimiento dentro de no-preference: ${motionInside} · fuera: ${motionOutside}`);
```
