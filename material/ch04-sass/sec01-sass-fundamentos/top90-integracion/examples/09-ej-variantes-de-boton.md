---
exercise: true
exercise_title: "Genera las variantes del botón"
exercise_instructions: "Recorre $variants con @each y genera una regla .btn--primary, .btn--success y .btn--danger (TODO 1) || En cada regla, fija --btn-bg al color de la variante: el valor de una custom property necesita interpolación (TODO 1) || En el mismo bucle, añade --btn-bg-hover con el color un 20 % más oscuro, usando color.scale (TODO 2) || Dentro de .btn, añade el estado :focus-visible con un outline de 3px sólido del color del botón y outline-offset: 2px (TODO 3) || Comprueba que las cuatro líneas de la lista marcan ✅ y que los botones cambian al pasar el ratón"
exercise_hints: "La clase se construye con interpolación en el selector: .btn--#{…} || Sin #{}, Sass copia el texto «$color» tal cual dentro de la custom property || color.scale($color, $lightness: -20%) devuelve un color nuevo; también hay que interpolarlo || Un estado del propio elemento se anida con &, sin espacio"
exercise_solution_example: 09-ej-variantes-de-boton-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: generar las variantes de un botón desde un mapa con @each, custom properties interpoladas, color.scale y un estado de foco con &; un pequeño script comprueba el CSS generado"
example_tags: "sass|ejercicio|each|mapas|interpolacion|sass-color|botones"
---

# HTML

```html
<div class="toolbar">
  <button type="button" class="btn btn--primary">Guardar</button>
  <button type="button" class="btn btn--success">Publicar</button>
  <button type="button" class="btn btn--danger">Eliminar</button>
</div>

<ul class="checklist">
  <li>Una regla por variante: <output id="check-rules">…</output></li>
  <li><code>--btn-bg</code> con el color de cada variante: <output id="check-bg">…</output></li>
  <li><code>--btn-bg-hover</code> más oscuro: <output id="check-hover">…</output></li>
  <li>Anillo de foco en <code>.btn:focus-visible</code>: <output id="check-focus">…</output></li>
</ul>
```

# SCSS

```scss
@use "sass:color";

$variants: (
  primary: #1d4ed8,
  success: #15803d,
  danger: #b91c1c,
);

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: var(--btn-bg, #475569);          // gris mientras nadie defina --btn-bg
  color: #ffffff;
  font: inherit;

  &:hover {
    background: var(--btn-bg-hover, #334155);
  }

  // TODO 3: el anillo de foco: outline de 3px sólido en var(--btn-bg, #475569)
  //         y outline-offset de 2px, solo con :focus-visible.
}

// TODO 1: recorre $variants con @each ($name, $color) y genera .btn--primary,
//         .btn--success y .btn--danger. Cada regla fija --btn-bg al color.
// TODO 2: en el mismo bucle, --btn-bg-hover: el color un 20 % más oscuro.

.checklist {
  padding-left: 1.2em;
  color: #475569;

  output {
    color: #1e293b;
    font-weight: bold;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee el CSS que ha
// generado tu Sass (el mismo de compiled.css) y escribe ✅ o ❌ en la lista y en
// la consola. No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

// Todas las reglas de estilo de la página, también las de dentro de @media.
const rules = [];
function collect(list) {
  for (const rule of list) {
    if (rule.selectorText) rules.push(rule);
    if (rule.cssRules) collect(rule.cssRules);
  }
}
for (const sheet of document.styleSheets) {
  try { collect(sheet.cssRules); } catch { /* hoja de otro origen: se ignora */ }
}
const ruleFor = (selector) => rules.find((rule) => rule.selectorText === selector);

const expected = { primary: '#1d4ed8', success: '#15803d', danger: '#b91c1c' };
const names = Object.keys(expected);
const value = (name, prop) => (ruleFor(`.btn--${name}`)?.style.getPropertyValue(prop) || '').trim();

const missing = names.filter((name) => !ruleFor(`.btn--${name}`));
check('check-rules', missing.length === 0,
  missing.length === 0 ? 'las tres existen' : `faltan ${missing.map((name) => '.btn--' + name).join(', ')}`);

const wrong = names.filter((name) => value(name, '--btn-bg').toLowerCase() !== expected[name]);
const literal = names.some((name) => value(name, '--btn-bg').startsWith('$'));
check('check-bg', wrong.length === 0,
  wrong.length === 0 ? 'correcto' : literal ? 'vale «$…»: ¿falta la interpolación #{}?' : `revisa ${wrong.join(', ')}`);

// Luminosidad aproximada de un color (0 = negro, 255 = blanco).
const probe = document.createElement('span');
document.body.append(probe);
function lightness(color) {
  if (!color || !CSS.supports('color', color)) return NaN;
  probe.style.color = color;
  const [r, g, b] = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const darker = names.filter((name) => lightness(value(name, '--btn-bg-hover')) < lightness(expected[name]));
probe.remove();
check('check-hover', darker.length === names.length, `${darker.length} de 3 variantes`);

const focus = ruleFor('.btn:focus-visible');
const focusText = focus ? focus.style.cssText : '';
const focusOk = /outline:[^;]*3px/.test(focusText) && /solid/.test(focusText) && /outline-offset: 2px/.test(focusText);
check('check-focus', focusOk,
  !focus ? 'no hay ninguna regla .btn:focus-visible' : focusOk ? 'outline de 3px sólido, separado 2px' : 'la regla existe, pero revisa el outline');
```
