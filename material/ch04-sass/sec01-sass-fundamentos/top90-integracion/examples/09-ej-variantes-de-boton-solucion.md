---
example_stage: final-solution
example_description: "Solución: @each genera las tres variantes con --btn-bg: #{$color} y --btn-bg-hover con color.scale, y &:focus-visible añade el anillo de foco"
example_tags: "sass|solucion|each|mapas|interpolacion|sass-color|botones"
console: true
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

  // ✅ 3: & pega el estado al botón → .btn:focus-visible
  &:focus-visible {
    outline: 3px solid var(--btn-bg, #475569);
    outline-offset: 2px;
  }
}

// ✅ 1 y 2: una regla por variante; #{} en el selector y en los valores.
@each $name, $color in $variants {
  .btn--#{$name} {
    --btn-bg: #{$color};
    --btn-bg-hover: #{color.scale($color, $lightness: -20%)};
  }
}

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
