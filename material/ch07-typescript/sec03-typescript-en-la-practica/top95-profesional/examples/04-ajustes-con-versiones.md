---
example_description: "Los ajustes de lectura de un recetario guardados en localStorage con versiones: cada versión del formato es un tipo, un predicado la reconoce desde unknown y una cadena de migraciones tipadas (1 → 2 → 3) actualiza los datos viejos; lo que no se reconoce se descarta y se avisa, sin romper la página"
example_tags: "typescript|profesional|localstorage|migraciones|versiones|validacion|unknown|predicados-de-tipo|tipos-mapeados|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Ajustes de lectura · Recetario</h1>
  <form id="settings" class="settings" novalidate>
    <fieldset>
      <legend>Tema</legend>
      <label><input type="radio" name="theme" value="light"> Claro</label>
      <label><input type="radio" name="theme" value="dark"> Oscuro</label>
      <label><input type="radio" name="theme" value="auto"> Como el sistema</label>
    </fieldset>
    <p class="field">
      <label for="scale">Tamaño del texto</label>
      <input id="scale" name="scale" type="range" min="0.8" max="1.4" step="0.1">
      <output id="scale-value" for="scale"></output>
    </p>
    <p class="check"><input id="motion" name="motion" type="checkbox"><label for="motion">Reducir animaciones</label></p>
  </form>
  <article id="preview" class="preview" aria-label="Vista previa">
    <h2>Pan de muerto</h2>
    <p>Mezcla la harina con el azúcar, la levadura y la ralladura de naranja; añade los huevos y la mantequilla y amasa diez minutos.</p>
  </article>
  <div class="actions" role="group" aria-label="Datos guardados">
    <button type="button" id="old">Simular datos de 2024 (v1)</button>
    <button type="button" id="broken">Simular datos dañados</button>
    <button type="button" id="reset">Restablecer</button>
  </div>
  <p id="status" role="status"></p>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --line: #cbd2d9; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
fieldset { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 0 0 0.5rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; }
legend { font-weight: 600; }
.field { display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0; }
.field label { font-weight: 600; }
.check { display: flex; align-items: center; gap: 0.4rem; margin: 0.5rem 0; }
.preview { --scale: 1; margin: 0.75rem 0; padding: 0.5rem 1rem; border: 1px solid var(--line); border-radius: 0.75rem; background: #ffffff; color: #1f2933; font-size: calc(1rem * var(--scale)); transition: background-color 0.3s, color 0.3s; }
.preview[data-theme="dark"] { background: #1f2933; color: #f5f7fa; }
.preview[data-motion="reduce"] { transition: none; }
@media (prefers-color-scheme: dark) { .preview[data-theme="auto"] { background: #1f2933; color: #f5f7fa; } }
@media (prefers-reduced-motion: reduce) { .preview { transition: none; } }
.preview h2 { font-size: 1.2em; margin: 0.25rem 0; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; color: inherit; padding: 0.3rem 0.7rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
#status { font-weight: 600; min-height: 1.45em; }
```

# TypeScript

```typescript
// Ajustes de lectura con versiones.
//
// Decisiones de diseño:
// - Cada versión del formato guardado es un tipo con su número (version: 1 | 2 | 3), y un
//   predicado la reconoce desde unknown. Lo que no encaja con ninguna se descarta y se avisa.
// - Las migraciones son un tipo mapeado sobre «versión → siguiente»: la de 1 recibe un V1 y
//   debe devolver un V2. upgrade() las encadena con un switch sobre version.
// - Al leer datos viejos se migran y se guardan ya en la versión actual (una sola vez).
// - localStorage puede lanzar (bloqueado, cuota llena): toda lectura y escritura va en try/catch.
//   En la tarjeta de la teoría es una copia en memoria; en ▶ o el editor, el de verdad.
//   Clave: «lw-ts3-ajustes-lectura»; «Restablecer» la borra.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

const STORAGE_KEY = 'lw-ts3-ajustes-lectura';
const THEMES = ['light', 'dark', 'auto'] as const;
type Theme = (typeof THEMES)[number];

// ── Las tres versiones del formato ────────────────────────────────────────
type V1 = { version: 1; theme: 'light' | 'dark'; fontSize: 'small' | 'large' }; // 2024
type V2 = { version: 2; theme: Theme; textScale: number }; // 2025
type V3 = { version: 3; appearance: { theme: Theme; textScale: number }; reduceMotion: boolean }; // actual
type Versions = { 1: V1; 2: V2; 3: V3 };
type Next = { 1: 2; 2: 3 };
type Migrations = { [N in keyof Next]: (old: Versions[N]) => Versions[Next[N]] };

const DEFAULTS: V3 = { version: 3, appearance: { theme: 'auto', textScale: 1 }, reduceMotion: false };

const MIGRATIONS: Migrations = {
  1: (old) => ({ version: 2, theme: old.theme, textScale: old.fontSize === 'large' ? 1.2 : 0.9 }),
  2: (old) => ({ version: 3, appearance: { theme: old.theme, textScale: old.textScale }, reduceMotion: false }),
};

function upgrade(data: V1 | V2 | V3, steps: string[] = []): { settings: V3; steps: string[] } {
  switch (data.version) {
    case 1: return upgrade(MIGRATIONS[1](data), [...steps, '1 → 2']);
    case 2: return upgrade(MIGRATIONS[2](data), [...steps, '2 → 3']);
    case 3: return { settings: data, steps };
  }
}

// ── Reconocer cada versión desde unknown ──────────────────────────────────
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isTheme = (value: unknown): value is Theme => THEMES.some((theme) => theme === value);
const isScale = (value: unknown): value is number => typeof value === 'number' && value >= 0.8 && value <= 1.4;

function recognize(data: unknown): V1 | V2 | V3 | null {
  if (!isRecord(data)) return null;
  if (data.version === 1 && (data.theme === 'light' || data.theme === 'dark') && (data.fontSize === 'small' || data.fontSize === 'large')) {
    return { version: 1, theme: data.theme, fontSize: data.fontSize };
  }
  if (data.version === 2 && isTheme(data.theme) && isScale(data.textScale)) {
    return { version: 2, theme: data.theme, textScale: data.textScale };
  }
  const appearance = data.appearance;
  if (data.version === 3 && isRecord(appearance) && isTheme(appearance.theme) && isScale(appearance.textScale) && typeof data.reduceMotion === 'boolean') {
    return { version: 3, appearance: { theme: appearance.theme, textScale: appearance.textScale }, reduceMotion: data.reduceMotion };
  }
  return null;
}

// ── El repositorio: la única puerta a localStorage ────────────────────────
type LoadResult = { settings: V3; message: string };

function load(): LoadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { settings: DEFAULTS, message: '⚠️ el almacenamiento no está disponible: se usan los valores por defecto' };
  }
  if (raw === null) return { settings: DEFAULTS, message: '⚙️ sin ajustes guardados: valores por defecto' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }
  const known = recognize(parsed);
  if (known === null) {
    save(DEFAULTS);
    return { settings: DEFAULTS, message: '⚠️ los ajustes guardados no se reconocen: se restablecen' };
  }
  const { settings, steps } = upgrade(known);
  if (steps.length > 0) save(settings);
  return { settings, message: steps.length > 0 ? `🔄 ajustes de la versión ${known.version} migrados (${steps.join(', ')})` : '⚙️ ajustes cargados (versión 3)' };
}
function save(settings: V3): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // sin almacenamiento: la página funciona igual, pero no recuerda
  }
}

// ── La interfaz ───────────────────────────────────────────────────────────
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const form = $('#settings', HTMLFormElement);
const scaleInput = $('#scale', HTMLInputElement);
const scaleOutput = $('#scale-value', HTMLOutputElement);
const motionInput = $('#motion', HTMLInputElement);
const preview = $('#preview', HTMLElement);
const statusLine = $('#status', HTMLParagraphElement);
const percent = new Intl.NumberFormat('es-MX', { style: 'percent' });
let current: V3 = DEFAULTS;

const report = (text: string): void => {
  console.log(text);
  statusLine.textContent = text;
};
const describe = (settings: V3): string =>
  `tema ${settings.appearance.theme} · texto ${percent.format(settings.appearance.textScale)} · animaciones ${settings.reduceMotion ? 'reducidas' : 'normales'}`;

function apply(settings: V3): void {
  current = settings;
  for (const radio of form.querySelectorAll('input[name="theme"]')) {
    if (radio instanceof HTMLInputElement) radio.checked = radio.value === settings.appearance.theme;
  }
  scaleInput.value = String(settings.appearance.textScale);
  scaleOutput.value = percent.format(settings.appearance.textScale);
  motionInput.checked = settings.reduceMotion;
  preview.dataset.theme = settings.appearance.theme;
  preview.dataset.motion = settings.reduceMotion ? 'reduce' : 'normal';
  preview.style.setProperty('--scale', String(settings.appearance.textScale));
}

form.addEventListener('input', () => {
  const data = new FormData(form);
  const theme = data.get('theme');
  const scale = Number(data.get('scale'));
  const next: V3 = {
    version: 3,
    appearance: { theme: isTheme(theme) ? theme : current.appearance.theme, textScale: isScale(scale) ? Math.round(scale * 10) / 10 : current.appearance.textScale },
    reduceMotion: data.has('motion'),
  };
  apply(next);
  save(next);
  report(`💾 ${describe(next)}`);
});
form.addEventListener('submit', (event) => event.preventDefault());

$('#old', HTMLButtonElement).addEventListener('click', () => {
  const legacy: V1 = { version: 1, theme: 'dark', fontSize: 'large' };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy)); // lo que guardó la aplicación en 2024
  } catch {
    return report('⚠️ el almacenamiento no está disponible');
  }
  const { settings, message } = load();
  apply(settings);
  report(`${message} · ${describe(settings)}`);
});
$('#broken', HTMLButtonElement).addEventListener('click', () => {
  try {
    localStorage.setItem(STORAGE_KEY, '{"version": 3, "appearance": {"theme": "sepia"'); // JSON cortado
  } catch {
    return report('⚠️ el almacenamiento no está disponible');
  }
  const { settings, message } = load();
  apply(settings);
  report(`${message} · ${describe(settings)}`);
});
$('#reset', HTMLButtonElement).addEventListener('click', () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nada que borrar
  }
  apply(DEFAULTS);
  report(`🧹 ajustes borrados · ${describe(DEFAULTS)}`);
});

const initial = load();
apply(initial.settings);
report(`${initial.message} · ${describe(initial.settings)}`);
console.log('Listo: cambia el tema o el tamaño, o pulsa «Simular datos de 2024 (v1)», «Simular datos dañados» y «Restablecer»');
```
