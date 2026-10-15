---
example_description: "Una página de ajustes (tema Sistema/Claro/Oscuro, densidad, moneda y avisos) guardada como un único objeto JSON con versión en localStorage, validada campo a campo, aplicada al instante con atributos data-* y light-dark(), y sincronizada entre pestañas con el evento storage. «Restablecer» borra la clave y vuelve a seguir al sistema"
example_tags: "javascript|localstorage|evento-storage|tema-oscuro|light-dark|intl|ajustes|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="settings">
  <h1>Ajustes de tu cuenta</h1>
  <form id="settings-form">
    <fieldset>
      <legend>Tema</legend>
      <label><input type="radio" name="theme" value="system"> Sistema</label>
      <label><input type="radio" name="theme" value="light"> Claro</label>
      <label><input type="radio" name="theme" value="dark"> Oscuro</label>
    </fieldset>
    <fieldset>
      <legend>Densidad</legend>
      <label><input type="radio" name="density" value="comfortable"> Cómoda</label>
      <label><input type="radio" name="density" value="compact"> Compacta</label>
    </fieldset>
    <label class="field">Moneda
      <select name="currency">
        <option value="MXN">Peso mexicano (MXN)</option>
        <option value="USD">Dólar (USD)</option>
      </select>
    </label>
    <label><input type="checkbox" name="offers"> Avisarme de ofertas por correo</label>
    <p><button id="reset" type="button">Restablecer</button></p>
  </form>
  <article class="preview" aria-label="Vista previa">
    <h2>Café de Chiapas · 500 g</h2>
    <p>Tueste medio, notas de cacao y nuez.</p>
    <p class="price"><output id="price"></output></p>
  </article>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root {
  color-scheme: light dark;
  --surface: light-dark(#ffffff, #0f172a);
  --surface-alt: light-dark(#f1f5f9, #1e293b);
  --text: light-dark(#1e293b, #e2e8f0);
  --muted: light-dark(#475569, #94a3b8);
  --accent: light-dark(#1d4ed8, #93c5fd);
  --gap: 0.75rem;
}
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }
:root[data-density="compact"] { --gap: 0.35rem; font-size: 0.92rem; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--text); background: var(--surface); }
.settings { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 var(--gap); font-size: 1.25rem; }
form { display: grid; gap: var(--gap); }
fieldset { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 0; border: 1px solid var(--muted); border-radius: 0.5rem; }
.field { display: grid; gap: 0.2rem; }
select, button { font: inherit; padding: 0.3rem 0.6rem; border: 1px solid var(--muted); border-radius: 0.5rem; background: var(--surface); color: var(--text); }
button { cursor: pointer; }
input { accent-color: var(--accent); }
:is(input, select, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.preview { margin-top: var(--gap); padding: var(--gap); border-radius: 0.75rem; background: var(--surface-alt); }
.preview h2 { margin: 0; font-size: 1rem; }
.preview p { margin: 0.25rem 0 0; color: var(--muted); }
.preview .price { color: var(--text); font-weight: 700; }
.log { margin: var(--gap) 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--muted); border-radius: 0.5rem; font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Página de ajustes persistente y sincronizada.
//
// Decisiones de diseño:
// - Un solo objeto JSON con versión en «lw-red-ajustes». Al leerlo se valida
//   campo a campo: un valor desconocido toma el de por defecto sin descartar
//   los demás (un ajuste roto no borra los buenos).
// - Sin nada guardado, el tema es «Sistema»: color-scheme: light dark deja
//   decidir a prefers-color-scheme. «Restablecer» BORRA la clave (no guarda
//   los valores por defecto), así la página vuelve a seguir al sistema.
// - Aplicar = atributos data-* en <html> que el CSS ya sabe interpretar; el
//   JavaScript no toca ningún color.
// - El evento storage aplica lo que cambie otra pestaña. Esta pestaña no lo
//   recibe: aplica ella misma tras guardar.
// - En una página real, el tema se aplicaría también en un <script> pequeño
//   del <head>, antes de pintar (lección «Almacenamiento en el navegador»).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const SETTINGS_KEY = 'lw-red-ajustes';
const DEFAULTS = { theme: 'system', density: 'comfortable', currency: 'MXN', offers: false };
const ALLOWED = { theme: ['system', 'light', 'dark'], density: ['comfortable', 'compact'], currency: ['MXN', 'USD'] };
const PRICES = { MXN: 210, USD: 11.9 };
const NAMES = { system: 'sistema', light: 'claro', dark: 'oscuro', comfortable: 'cómoda', compact: 'compacta' };
const form = document.querySelector('#settings-form');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function readSettings() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  } catch {
    saved = null;
  }
  if (saved?.version !== 1) return { ...DEFAULTS };
  return {
    theme: ALLOWED.theme.includes(saved.theme) ? saved.theme : DEFAULTS.theme,
    density: ALLOWED.density.includes(saved.density) ? saved.density : DEFAULTS.density,
    currency: ALLOWED.currency.includes(saved.currency) ? saved.currency : DEFAULTS.currency,
    offers: saved.offers === true,
  };
}
function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ version: 1, ...settings }));
  } catch (error) {
    logLine(`⚠️ no se pudieron guardar los ajustes (${error.name}); se aplican solo a esta visita`);
  }
}
function applySettings(settings) {
  const root = document.documentElement;
  if (settings.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = settings.theme;
  root.dataset.density = settings.density;
  form.elements.theme.value = settings.theme;
  form.elements.density.value = settings.density;
  form.elements.currency.value = settings.currency;
  form.elements.offers.checked = settings.offers;
  document.querySelector('#price').textContent = new Intl.NumberFormat('es-MX', { style: 'currency', currency: settings.currency }).format(PRICES[settings.currency]);
}
const describe = (settings) => `tema ${NAMES[settings.theme]} · densidad ${NAMES[settings.density]} · moneda ${settings.currency} · ofertas ${settings.offers ? 'sí' : 'no'}`;

form.addEventListener('change', () => {
  const settings = {
    theme: form.elements.theme.value,
    density: form.elements.density.value,
    currency: form.elements.currency.value,
    offers: form.elements.offers.checked,
  };
  saveSettings(settings);
  applySettings(settings);
  logLine(`💾 ${describe(settings)}`);
});
document.querySelector('#reset').addEventListener('click', () => {
  localStorage.removeItem(SETTINGS_KEY);
  applySettings({ ...DEFAULTS });
  logLine('↺ ajustes restablecidos: el tema vuelve a seguir al sistema');
});
window.addEventListener('storage', (event) => {
  if (event.key !== SETTINGS_KEY && event.key !== null) return;
  const settings = readSettings();
  applySettings(settings);
  logLine(`📨 otra pestaña cambió los ajustes: ${describe(settings)}`);
});

const initial = readSettings();
applySettings(initial);
logLine(`⚙️ ${describe(initial)}${localStorage.getItem(SETTINGS_KEY) === null ? ' (por defecto)' : ' (guardados)'}`);
logLine('Listo: cambia el tema y la moneda, pulsa ⟳ (se recuerdan); abre el ejemplo con ↗ y cambia algo allí');
```
