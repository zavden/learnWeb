---
exercise: true
exercise_title: "Protege la nota del widget con @scope"
exercise_instructions: "El widget del tiempo usa selectores descendientes (.weather p, .weather a) que también pintan la nota de la autora que va dentro: su enlace sale amarillo y su texto, casi blanco sobre crema. Pasa las reglas del widget a @scope (.weather) to (.weather__note), con :scope para la propia caja y p, h2 y a a secas (TODO 1) || La nota ya no recibe las reglas del widget, pero hereda su color claro: haz que declare el suyo (TODO 2) || Comprueba que las tres líneas de la lista marcan ✅"
exercise_hints: "Dentro de @scope (.weather), .weather se escribe :scope y .weather p se escribe p || El límite (to) deja fuera el elemento .weather__note y todo lo que contiene || El límite frena a los selectores, no a la herencia: color, font-size… pasan de padre a hijo || Un color oscuro sobre el fondo #fffbeb: por ejemplo, el del texto de la página"
exercise_solution_example: 11-ej-protege-el-widget-con-scope-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: un widget del tiempo cuyas reglas descendientes pintan la nota de la autora que lleva dentro; hay que pasar el widget a un ámbito con agujero y hacer que el agujero declare su color, porque la herencia cruza el límite. Un script lee el CSSOM y calcula el contraste de la nota"
example_tags: "css|ejercicio|scope|donut|herencia|contraste|cssom"
---

# HTML

```html
<article class="post">
  <h1>Un fin de semana en Valle de Bravo</h1>
  <p>Llegamos el sábado temprano para subir a la Peña y bajar al embarcadero a comer trucha. El <a href="/blog/valle-de-bravo/hospedaje">hospedaje</a> estaba a dos calles de la plaza.</p>
  <aside class="weather" aria-labelledby="weather-title">
    <h2 id="weather-title">El tiempo en Valle de Bravo</h2>
    <p class="weather__now">22 °C · soleado</p>
    <p>Sábado 24 °C · domingo 19 °C, con lluvia por la tarde.</p>
    <div class="weather__note">
      <p>Nota de la autora: lleva chamarra para el embarcadero y revisa <a href="/blog/valle-de-bravo/lluvia">qué hacer si llueve</a>.</p>
    </div>
    <a href="/clima/valle-de-bravo">Pronóstico de 10 días</a>
  </aside>
</article>
<ul class="checks" style="margin: 12px 16px; padding-left: 1.2rem; font-size: 0.75rem;">
  <li id="check-scope">…</li>
  <li id="check-hole">…</li>
  <li id="check-contrast">…</li>
</ul>
```

# CSS

```css
/* ── La página ── */
body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1c1917;
  background: #ffffff;
}

.post {
  display: grid;
  gap: 10px;
  max-width: 30rem;
  padding: 16px;
}

.post h1,
.post p {
  margin: 0;
}

.post h1 {
  font-size: 1.3rem;
}

a {
  color: #1d4ed8;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* La nota de la autora: es contenido de la página, no del widget. */
.weather__note {
  padding: 8px 10px;
  border-radius: 8px;
  background: #fffbeb;
}

/* ── El widget del tiempo ── TODO 1: pásalo a
   @scope (.weather) to (.weather__note) { … } */
.weather {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #1e293b;
  color: #e2e8f0;
}

.weather h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
}

.weather p {
  margin: 0;
  color: #e2e8f0;
  font-size: 0.85rem;
}

.weather a {
  color: #fde68a;
  font-weight: 700;
}

/* TODO 2: el agujero hereda el color claro del widget. */
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

// ¿Hay una regla @scope con raíz .weather y límite .weather__note?
let scopeRule = null;
function walk(rules) {
  for (const rule of rules) {
    if (rule instanceof CSSScopeRule) scopeRule = rule;
    if (rule.cssRules) walk(rule.cssRules);
  }
}
for (const sheet of document.styleSheets) {
  try {
    walk(sheet.cssRules);
  } catch {
    // hojas de otro origen: no se pueden leer
  }
}
const widgetLink = getComputedStyle(document.querySelector('.weather > a')).color;
const scopeOk = Boolean(scopeRule) && scopeRule.start.includes('weather') && !scopeRule.start.includes('note')
  && String(scopeRule.end).includes('weather__note');
check('check-scope', scopeOk && widgetLink === 'rgb(253, 230, 138)',
  scopeRule ? `@scope (${scopeRule.start}) to (${scopeRule.end}) · enlace del widget: ${widgetLink}` : 'no hay ninguna regla @scope');

const noteLink = getComputedStyle(document.querySelector('.weather__note a')).color;
check('check-hole', noteLink === 'rgb(29, 78, 216)', `enlace de la nota: ${noteLink} (el de la página es rgb(29, 78, 216))`);

// Contraste WCAG entre el texto de la nota y su fondo.
function luminance(rgb) {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map((channel) => {
    const value = Number(channel) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const noteText = getComputedStyle(document.querySelector('.weather__note p')).color;
const noteBackground = getComputedStyle(document.querySelector('.weather__note')).backgroundColor;
const [lighter, darker] = [luminance(noteText), luminance(noteBackground)].sort((a, b) => b - a);
const ratio = (lighter + 0.05) / (darker + 0.05);
check('check-contrast', ratio >= 4.5, `contraste del texto de la nota: ${ratio.toFixed(2)}:1 (mínimo 4.5:1)`);
```
