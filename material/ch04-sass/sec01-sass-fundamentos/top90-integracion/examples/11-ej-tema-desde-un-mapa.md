---
exercise: true
exercise_title: "Publica los temas de un mapa como custom properties"
exercise_instructions: "Completa el mixin theme($name): recorre map.get($themes, $name) con @each y escribe una custom property por token (--color-surface, --color-text…) (TODO 1) || Incluye el tema claro en :root (TODO 2) || Incluye el tema oscuro en .page:has(#dark-mode:checked) y añade color-scheme: dark (TODO 3) || Marca la casilla «Tema oscuro» para verlo y comprueba que las tres líneas de la lista marcan ✅"
exercise_hints: "@each $token, $value in map.get($themes, $name) recorre las parejas del tema || El nombre de la propiedad también se interpola: --color-#{$token} || El valor necesita #{} o el navegador recibirá «$value» || Una regla con solo variables Sass no genera nada: el cambio de tema solo funciona porque las custom properties sí existen en el navegador"
exercise_solution_example: 11-ej-tema-desde-un-mapa-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: convertir un mapa de temas en custom properties con un mixin, @each e interpolación, y activar el tema oscuro con :has(:checked); un script comprueba los valores en los dos temas"
example_tags: "sass|ejercicio|temas|custom-properties|mapas|each|interpolacion|mixins"
---

# HTML

```html
<div class="page">
  <label class="switch"><input type="checkbox" id="dark-mode"> Tema oscuro</label>

  <article class="note">
    <h2 class="note__title">Riego de esta semana</h2>
    <p>Martes y viernes a las 7:00, 20 minutos por sector. El jueves se suspende por la lluvia prevista.</p>
    <a class="note__link" href="/riego/programa">Cambiar el programa</a>
  </article>

  <ul class="checklist">
    <li>El tema claro define sus 5 tokens en <code>:root</code>: <output id="check-light">…</output></li>
    <li>Con la casilla marcada, cambian a los del tema oscuro: <output id="check-dark">…</output></li>
    <li><code>color-scheme: dark</code> en el tema oscuro: <output id="check-scheme">…</output></li>
  </ul>
</div>
```

# SCSS

```scss
@use "sass:map";

$themes: (
  light: (
    page: #f1f5f9,
    surface: #ffffff,
    text: #1e293b,
    accent: #1d4ed8,
    border: #cbd5e1,
  ),
  dark: (
    page: #020617,
    surface: #0f172a,
    text: #e2e8f0,
    accent: #93c5fd,
    border: #334155,
  ),
);

// TODO 1: recorre map.get($themes, $name) con @each y escribe una custom
//         property por token: --color-page, --color-surface, --color-text…
@mixin theme($name) {
}

:root {
  // TODO 2: el tema claro.
}

.page:has(#dark-mode:checked) {
  // TODO 3: el tema oscuro y color-scheme: dark.
}

// ── Los componentes solo leen custom properties (no tocar) ─────────────────
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.page {
  min-height: 100vh;
  padding: 16px;
  background: var(--color-page);
  color: var(--color-text);
}

.note {
  max-width: 28rem;
  margin: 16px 0;
  padding: 4px 20px 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);

  &__title,
  &__link {
    color: var(--color-accent);
  }
}

.checklist {
  padding-left: 1.2em;

  output {
    font-weight: bold;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee las custom
// properties que calcula el navegador (marca y desmarca la casilla un instante
// para probar el tema oscuro) y escribe ✅ o ❌ en la lista y en la consola.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const light = { page: '#f1f5f9', surface: '#ffffff', text: '#1e293b', accent: '#1d4ed8', border: '#cbd5e1' };
const dark = { page: '#020617', surface: '#0f172a', text: '#e2e8f0', accent: '#93c5fd', border: '#334155' };
const page = document.querySelector('.page');
const toggle = document.getElementById('dark-mode');

// Qué tokens no tienen el valor esperado en un elemento.
function wrongTokens(element, theme) {
  const style = getComputedStyle(element);
  return Object.keys(theme).filter((token) =>
    style.getPropertyValue(`--color-${token}`).trim().toLowerCase() !== theme[token]);
}

const lightWrong = wrongTokens(document.documentElement, light);
const literal = getComputedStyle(document.documentElement).getPropertyValue('--color-page').trim().startsWith('$');
check('check-light', lightWrong.length === 0,
  lightWrong.length === 0 ? 'los 5 correctos' : literal ? 'valen «$…»: ¿falta #{} en el valor?' : `revisa: ${lightWrong.join(', ')}`);

const wasChecked = toggle.checked;
toggle.checked = true;
const darkWrong = wrongTokens(page, dark);
const scheme = getComputedStyle(page).colorScheme;
toggle.checked = wasChecked;

check('check-dark', darkWrong.length === 0,
  darkWrong.length === 0 ? 'los 5 correctos' : `revisa: ${darkWrong.join(', ')}`);
check('check-scheme', scheme === 'dark', `color-scheme: ${scheme}`);
```
