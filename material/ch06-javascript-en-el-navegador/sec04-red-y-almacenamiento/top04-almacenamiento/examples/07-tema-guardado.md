---
example_description: "El selector de tema Sistema / Claro / Oscuro del módulo de responsive, ahora recordado en localStorage: sin nada guardado sigue a prefers-color-scheme (color-scheme: light dark + light-dark()); elegir Claro u Oscuro lo guarda, y «Sistema» borra la clave"
example_tags: "javascript|localstorage|tema-oscuro|color-scheme|light-dark|prefers-color-scheme"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<fieldset class="theme-picker">
  <legend>Tema</legend>
  <label><input type="radio" name="theme" value="system" checked> Sistema</label>
  <label><input type="radio" name="theme" value="light"> Claro</label>
  <label><input type="radio" name="theme" value="dark"> Oscuro</label>
</fieldset>

<article class="dashboard">
  <h2>Ventas de la semana</h2>
  <dl class="stats">
    <div><dt>Pedidos</dt><dd>128</dd></div>
    <div><dt>Ingresos</dt><dd>46&nbsp;300 MXN</dd></div>
    <div><dt>Devoluciones</dt><dd class="is-alert">3</dd></div>
  </dl>
</article>
<ol id="log" class="log" aria-live="polite"></ol>
```

# CSS

```css
/* Los colores, una vez y con sus dos versiones (módulo «Diseño responsive»). */
:root {
  color-scheme: light dark; /* sin elección: el sistema decide */
  --surface: light-dark(#ffffff, #0f172a);
  --surface-alt: light-dark(#f1f5f9, #1e293b);
  --text: light-dark(#1e293b, #e2e8f0);
  --muted: light-dark(#475569, #94a3b8);
  --alert: light-dark(#b91c1c, #fca5a5);
  --accent: light-dark(#1d4ed8, #93c5fd);
}
/* La elección guardada llega como atributo en <html>. */
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }

body {
  margin: 0;
  padding: 1rem;
  background: var(--surface);
  color: var(--text);
  font-family: system-ui, sans-serif;
  font-size: 0.9rem;
}
.theme-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 12px;
  border-color: var(--muted);
}
.theme-picker input {
  accent-color: var(--accent);
}
.theme-picker input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.dashboard {
  padding: 12px;
  border-radius: 10px;
  background: var(--surface-alt);
}
.dashboard h2 {
  margin: 0 0 8px;
  font-size: 1rem;
}
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: 0;
}
.stats dt {
  color: var(--muted);
  font-size: 0.8rem;
}
.stats dd {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}
.stats .is-alert {
  color: var(--alert);
}
.log {
  margin: 12px 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--muted);
  border-radius: 0.5rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const THEME_KEY = 'lw-almacen-tema';
const THEMES = ['light', 'dark'];
const NAMES = { system: 'Sistema', light: 'Claro', dark: 'Oscuro' };
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// matchMedia pregunta por una media query desde JS (módulo «APIs modernas del
// navegador»); aquí solo para contar qué tema está decidiendo el sistema.
const systemPrefersDark = () => matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
  if (THEMES.includes(theme)) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme; // «Sistema»: manda color-scheme: light dark
  document.querySelector(`input[name="theme"][value="${theme}"]`).checked = true;
  const effective = theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;
  logLine(`🎨 ${NAMES[theme]} → se ve el tema ${NAMES[effective].toLowerCase()}`);
}

// Al cargar: lo guardado, si es un valor que conocemos; si no, «Sistema».
const saved = localStorage.getItem(THEME_KEY);
logLine(`guardado → ${JSON.stringify(saved)} · el sistema prefiere el ${systemPrefersDark() ? 'oscuro' : 'claro'}`);
applyTheme(THEMES.includes(saved) ? saved : 'system');

document.querySelector('.theme-picker').addEventListener('change', (event) => {
  const theme = event.target.value;
  if (THEMES.includes(theme)) {
    localStorage.setItem(THEME_KEY, theme);
    logLine(`💾 ${THEME_KEY} = ${theme}`);
  } else {
    localStorage.removeItem(THEME_KEY); // «Sistema» = no recordar nada
    logLine(`🗑️ ${THEME_KEY} borrado: sigo al sistema`);
  }
  applyTheme(theme);
});
logLine('Listo: elige «Claro», pulsa ⟳ en la vista previa (se recuerda) y vuelve a «Sistema»');

// En una página real, applyTheme iría en un <script> pequeño dentro del
// <head>, antes de pintar nada: así no se ve un destello del otro tema.
```
