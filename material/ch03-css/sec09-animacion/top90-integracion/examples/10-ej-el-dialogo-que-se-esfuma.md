---
exercise: true
exercise_title: "El diálogo que se esfuma"
exercise_instructions: "Abre y cierra el diálogo «Eliminar dirección»: aparece y desaparece de golpe, aunque tiene una transición. Haz que se funda al entrar con @starting-style (TODO 1) || Haz que se funda al salir: display y overlay en la transición, con allow-discrete (TODO 2) || El fondo oscuro también aparece y desaparece de golpe: dale su transición, con display y overlay (TODO 3) || El diálogo crece con scale: esa transición solo debe existir dentro de @media (prefers-reduced-motion: no-preference) (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "Un diálogo cerrado tiene display: none: al abrirse no tiene estilo «de antes». @starting-style va después de la regla dialog[open] || La palabra allow-discrete se escribe detrás de cada propiedad discreta del atajo: display 250ms allow-discrete || ::backdrop es otro elemento, con su propia transition y su propio @starting-style || Deja opacity fuera de la media query y mete en ella la versión de transition que incluye scale"
exercise_solution_example: 10-ej-el-dialogo-que-se-esfuma-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: un diálogo modal que aparece y desaparece de golpe; hay que darle @starting-style, display y overlay con allow-discrete, una transición al fondo ::backdrop y meter el crecimiento con scale en prefers-reduced-motion. Un script lo comprueba con los estilos calculados y las reglas de la hoja"
example_tags: "css|ejercicio|dialog|backdrop|starting-style|allow-discrete|overlay|cssom"
---

# HTML

```html
<h2>Direcciones de envío</h2>
<p class="address">Calle Durango 112, Roma Norte, Ciudad de México</p>
<button type="button" commandfor="delete-address" command="show-modal">Eliminar dirección</button>

<dialog id="delete-address" aria-labelledby="delete-title">
  <h3 id="delete-title">¿Eliminar esta dirección?</h3>
  <p>Ya no aparecerá al pagar. Podrás volver a añadirla cuando quieras.</p>
  <div class="buttons">
    <button type="button" commandfor="delete-address" command="close">Cancelar</button>
    <button type="button" class="is-danger" commandfor="delete-address" command="close">Eliminar</button>
  </div>
</dialog>

<ul class="checks">
  <li id="check-entry">…</li>
  <li id="check-exit">…</li>
  <li id="check-backdrop">…</li>
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

h2 {
  margin: 0 0 4px;
  font-size: 1.05rem;
}

.address {
  margin: 0 0 10px;
}

button {
  padding: 6px 12px;
  border: 1px solid #64748b;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.is-danger {
  border-color: #be123c;
  background: #be123c;
  color: #ffffff;
}

dialog {
  max-width: 300px;
  padding: 16px;
  border: 0;
  border-radius: 12px;
  background: #ffffff;
  color: #1e293b;
  box-shadow: 0 20px 40px rgb(15 23 42 / 0.3);
}

dialog h3 {
  margin: 0 0 8px;
}

dialog p {
  margin: 0 0 14px;
  font-size: 0.9rem;
}

.buttons {
  display: flex;
  gap: 8px;
  justify-content: end;
}

/* El diálogo: cerrado, transparente y un poco más pequeño. */
dialog {
  opacity: 0;
  scale: 0.94;
  /* TODO 2: falta lo que mantiene el diálogo visible y en la capa superior
     mientras se cierra. TODO 4: scale es movimiento. */
  transition: opacity 250ms, scale 250ms;
}

dialog[open] {
  opacity: 1;
  scale: 1;
}

/* TODO 1: al abrirse, el diálogo no tiene estilo «de antes». */

/* TODO 3: el fondo, sin transición. */
dialog::backdrop {
  background-color: rgb(15 23 42 / 0.55);
}

.checks {
  margin: 14px 0 0;
  padding-left: 1.2rem;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee los estilos calculados
// del diálogo CERRADO y las reglas de la hoja de estilos, y escribe ✅ o ❌ en la lista
// (y en la consola). No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

// Todas las reglas de estilo de la hoja, con su media query y si están dentro
// de un @starting-style.
function collectRules(rules, context, found) {
  for (const rule of rules) {
    if (rule.media) {
      collectRules(rule.cssRules, { ...context, mediaText: rule.media.mediaText }, found);
    } else if (rule.constructor.name === 'CSSStartingStyleRule') {
      collectRules(rule.cssRules, { ...context, starting: true }, found);
    } else if (rule.style) {
      found.push({ ...context, selector: rule.selectorText, style: rule.style });
    }
  }
  return found;
}

const rules = [];
for (const sheet of document.styleSheets) {
  try {
    collectRules(sheet.cssRules, { mediaText: '', starting: false }, rules);
  } catch {
    // hojas de otro origen: no se pueden leer
  }
}

const entryRule = rules.find((rule) => rule.starting
  && /dialog\[open\]$/.test(rule.selector) && rule.style.opacity === '0');
check('check-entry', Boolean(entryRule),
  entryRule ? `@starting-style { ${entryRule.selector} { opacity: 0 } }` : 'no hay un @starting-style para dialog[open] con opacity: 0');

// ¿La propiedad está en la transición, con allow-discrete en su misma posición?
function discreteIn(style, property) {
  const properties = style.transitionProperty.split(',').map((value) => value.trim());
  const behaviors = style.transitionBehavior.split(',').map((value) => value.trim());
  const index = properties.indexOf(property);
  return index >= 0 && behaviors[index % behaviors.length] === 'allow-discrete';
}

const dialog = getComputedStyle(document.querySelector('dialog'));
check('check-exit', discreteIn(dialog, 'display') && discreteIn(dialog, 'overlay'),
  `transition-property: ${dialog.transitionProperty} · transition-behavior: ${dialog.transitionBehavior}`);

const backdropRule = rules.find((rule) => !rule.starting && rule.selector.includes('::backdrop')
  && /background-color|opacity/.test(rule.style.transitionProperty)
  && discreteIn(rule.style, 'display') && discreteIn(rule.style, 'overlay'));
check('check-backdrop', Boolean(backdropRule),
  backdropRule ? `${backdropRule.selector}: ${backdropRule.style.transitionProperty}` : '::backdrop sin una transición de color con display y overlay');

const inNoPreference = (rule) => rule.mediaText.includes('prefers-reduced-motion: no-preference');
const scaleRules = rules.filter((rule) => !rule.starting && /scale|translate/.test(rule.style.transitionProperty));
const outside = scaleRules.filter((rule) => !inNoPreference(rule)).length;
check('check-motion', scaleRules.length > 0 && outside === 0,
  `transiciones de scale dentro de no-preference: ${scaleRules.length - outside} · fuera: ${outside}`);
```
