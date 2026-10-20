---
example_description: "Preferencias guardadas en localStorage con tipos: una tabla satisfies describe cada clave con su valor por defecto y su validador, PrefValues saca el tipo de cada una con infer, get<K>/set<K> no admiten mezclas, y un valor dañado se detecta, se borra y se sustituye por el de por defecto. Claves lw-ts-prefs-* con botón para restablecer"
example_tags: "typescript|profesional|localstorage|genericos|infer|satisfies|keyof|validacion|json|dom|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app" id="app" data-theme="auto">
  <h1>Preferencias de la tienda</h1>
  <form id="prefs" class="card" novalidate>
    <p class="row">
      <label for="theme">Tema</label>
      <select id="theme"><option value="auto">Automático</option><option value="light">Claro</option><option value="dark">Oscuro</option></select>
      <label for="currency">Moneda</label>
      <select id="currency"><option>MXN</option><option>USD</option><option>EUR</option></select>
    </p>
    <p><label class="check"><input id="show-prices" type="checkbox"> Mostrar precios</label></p>
    <p class="row"><label for="search">Buscar</label><input id="search" type="search" autocomplete="off"><button type="button" id="search-button">Buscar</button></p>
    <p id="recent-label" class="muted">Búsquedas recientes</p>
    <ul id="recent" class="chips" aria-labelledby="recent-label"></ul>
  </form>
  <article class="preview" aria-label="Vista previa">
    <h2>Café de Chiapas · 1 kg</h2>
    <p id="price" class="price"></p>
  </article>
  <p class="row">
    <button type="button" id="corrupt">Simular un valor dañado</button>
    <button type="button" id="reset">Restablecer</button>
  </p>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #d9e2ec; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.app { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
.card { padding: 0.5rem 1rem; background: #fff; border: 1px solid var(--line); border-radius: 0.75rem; }
.row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.check { display: inline-flex; gap: 0.4rem; align-items: center; }
input, select, button { font: inherit; }
input[type="search"], select { padding: 0.25rem 0.4rem; border: 1px solid var(--line); border-radius: 0.4rem; background: #fff; color: var(--ink); }
button { padding: 0.3rem 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
.muted { margin: 0.25rem 0; color: var(--muted); font-size: 0.9rem; }
.chips { list-style: none; display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0 0 0.5rem; padding: 0; min-height: 1.5rem; }
.chips button { padding: 0.1rem 0.6rem; border-radius: 1rem; font-size: 0.85rem; }
.preview { margin: 0.75rem 0; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--soft); background: #fff; color: var(--ink); }
.preview h2 { font-size: 1rem; margin: 0; }
.price { margin: 0.25rem 0 0; font-weight: 700; }
[data-theme="dark"] .preview { background: #0f172a; color: #e2e8f0; border-color: #334155; }
@media (prefers-color-scheme: dark) { [data-theme="auto"] .preview { background: #0f172a; color: #e2e8f0; border-color: #334155; } }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── Cada preferencia: valor por defecto + validador ───────────────────────
type Pref<T> = { readonly fallback: T; readonly parse: (value: unknown) => T | undefined };
const pref = <T>(fallback: T, parse: (value: unknown) => T | undefined): Pref<T> => ({ fallback, parse });

const THEMES = ['auto', 'light', 'dark'] as const;
const CURRENCIES = ['MXN', 'USD', 'EUR'] as const;
type Theme = (typeof THEMES)[number];
type Currency = (typeof CURRENCIES)[number];
const isStringList = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');

const DEFINITIONS = {
  theme: pref<Theme>('auto', (value) => THEMES.find((theme) => theme === value)),
  currency: pref<Currency>('MXN', (value) => CURRENCIES.find((currency) => currency === value)),
  showPrices: pref<boolean>(true, (value) => (typeof value === 'boolean' ? value : undefined)),
  recentSearches: pref<string[]>([], (value) => (isStringList(value) ? value.slice(0, 5) : undefined)),
} satisfies Record<string, Pref<unknown>>;

// El tipo de cada valor, sacado de su validador con infer (lección 3).
type PrefValues = { [K in keyof typeof DEFINITIONS]: (typeof DEFINITIONS)[K] extends Pref<infer T> ? T : never };
type PrefKey = keyof PrefValues;
// El mismo objeto visto como tipo mapeado: así, con K genérico, PREFERENCES[K] es Pref<PrefValues[K]>.
const PREFERENCES: { [K in PrefKey]: Pref<PrefValues[K]> } = DEFINITIONS;

// ── Un almacén tipado sobre localStorage ──────────────────────────────────
class PreferenceStore {
  readonly #prefix = 'lw-ts-prefs-';
  readonly #onProblem: (message: string) => void;
  constructor(onProblem: (message: string) => void) {
    this.#onProblem = onProblem;
  }
  storageKey(key: PrefKey): string {
    return `${this.#prefix}${key}`;
  }
  get<K extends PrefKey>(key: K): PrefValues[K] {
    const definition = PREFERENCES[key];
    const raw = localStorage.getItem(this.storageKey(key));
    if (raw === null) return definition.fallback;
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      data = undefined;
    }
    const value = definition.parse(data);
    if (value !== undefined) return value;
    localStorage.removeItem(this.storageKey(key)); // un valor dañado no debe romper la página
    this.#onProblem(`⚠️ ${this.storageKey(key)} no era válido (${raw}): se usa ${JSON.stringify(definition.fallback)}`);
    return definition.fallback;
  }
  set<K extends PrefKey>(key: K, value: PrefValues[K]): string {
    const text = JSON.stringify(value);
    localStorage.setItem(this.storageKey(key), text);
    return `💾 ${this.storageKey(key)} = ${text}`;
  }
  reset(): void {
    for (const key of Object.keys(PREFERENCES)) localStorage.removeItem(`${this.#prefix}${key}`);
  }
}
// store.set('theme', 'sepia') sería un error: 'sepia' no es un Theme. store.set('showPrices', 'sí') también.

// ── La interfaz ───────────────────────────────────────────────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const app = byId('app', HTMLElement);
const themeSelect = byId('theme', HTMLSelectElement);
const currencySelect = byId('currency', HTMLSelectElement);
const showPricesBox = byId('show-prices', HTMLInputElement);
const searchInput = byId('search', HTMLInputElement);
const logList = byId('log', HTMLOListElement);
const RATES = { MXN: 1, USD: 0.054, EUR: 0.05 } satisfies Record<Currency, number>;
const LOCALES = { MXN: 'es-MX', USD: 'en-US', EUR: 'es-ES' } satisfies Record<Currency, string>;

function report(message: string): void {
  console.log(message);
  logList.append(Object.assign(document.createElement('li'), { textContent: message }));
}
const store = new PreferenceStore(report);

function render(): void {
  const theme = store.get('theme'); // Theme
  const currency = store.get('currency'); // Currency
  const showPrices = store.get('showPrices'); // boolean
  const recent = store.get('recentSearches'); // string[]
  app.dataset.theme = theme;
  themeSelect.value = theme;
  currencySelect.value = currency;
  showPricesBox.checked = showPrices;
  const money = new Intl.NumberFormat(LOCALES[currency], { style: 'currency', currency });
  byId('price', HTMLParagraphElement).textContent = showPrices ? money.format(210 * RATES[currency]) : 'Precio visible al iniciar sesión';
  byId('recent', HTMLUListElement).replaceChildren(...recent.map((term) => {
    const item = document.createElement('li');
    const chip = Object.assign(document.createElement('button'), { type: 'button', textContent: term });
    chip.addEventListener('click', () => {
      searchInput.value = term;
      searchInput.focus();
    });
    item.append(chip);
    return item;
  }));
}
function summary(): string {
  return `⚙️ tema ${store.get('theme')} · moneda ${store.get('currency')} · precios ${store.get('showPrices') ? 'visibles' : 'ocultos'} · ${store.get('recentSearches').length} búsquedas`;
}

// Los <select> dan texto: se convierte con el validador de la propia preferencia.
themeSelect.addEventListener('change', () => {
  const theme = PREFERENCES.theme.parse(themeSelect.value);
  if (theme !== undefined) report(store.set('theme', theme));
  render();
});
currencySelect.addEventListener('change', () => {
  const currency = PREFERENCES.currency.parse(currencySelect.value);
  if (currency !== undefined) report(store.set('currency', currency));
  render();
});
showPricesBox.addEventListener('change', () => {
  report(store.set('showPrices', showPricesBox.checked));
  render();
});
// Enter en el buscador enviaría el formulario (y recargaría la página): se convierte en una búsqueda.
byId('prefs', HTMLFormElement).addEventListener('submit', (event) => {
  event.preventDefault();
  byId('search-button', HTMLButtonElement).click();
});
byId('search-button', HTMLButtonElement).addEventListener('click', () => {
  const term = searchInput.value.trim().toLowerCase();
  if (term === '') return;
  const recent = [term, ...store.get('recentSearches').filter((item) => item !== term)].slice(0, 5);
  report(store.set('recentSearches', recent));
  searchInput.value = '';
  render();
});
byId('corrupt', HTMLButtonElement).addEventListener('click', () => {
  localStorage.setItem(store.storageKey('currency'), '"YEN"'); // como si otra versión de la app lo hubiera escrito
  render();
  report(summary());
});
byId('reset', HTMLButtonElement).addEventListener('click', () => {
  store.reset();
  render();
  report(`🧹 preferencias restablecidas · ${summary()}`);
});

render();
console.log(summary());
console.log('Listo: cambia el tema o la moneda, busca algo, recarga con ⟳ o pulsa «Simular un valor dañado» y «Restablecer»');
```
