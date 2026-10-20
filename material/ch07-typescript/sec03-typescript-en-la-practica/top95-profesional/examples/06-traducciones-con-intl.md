---
example_description: "El resumen de un pedido en español e inglés con un traductor tipado: cada mensaje es una función con sus parámetros (MessageParams), el inglés debe tener las mismas claves y firmas, y t('items', { count }) exige los parámetros correctos. Los formatos salen de Intl (plurales, listas, moneda, fecha y tiempo relativo) y el idioma del documento cambia con la elección"
example_tags: "typescript|profesional|i18n|intl|pluralrules|tipos-mapeados|genericos|clases|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <p class="language">
    <label for="locale">Idioma / Language</label>
    <select id="locale">
      <option value="es-MX">Español (México)</option>
      <option value="en-US">English (US)</option>
    </select>
  </p>
  <article class="order" aria-live="polite">
    <h1 id="heading"></h1>
    <p id="items"></p>
    <p id="includes"></p>
    <p id="delivery"></p>
    <p id="total" class="total"></p>
  </article>
  <p class="actions">
    <button type="button" id="add"></button>
    <button type="button" id="pay" class="primary"></button>
  </p>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --line: #cbd2d9; --accent: #9a3412; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
.language { display: flex; align-items: center; gap: 0.5rem; }
label { font-weight: 600; }
select, button { font: inherit; color: inherit; padding: 0.3rem 0.7rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; }
.order { padding: 0.5rem 1rem; border: 1px solid var(--line); border-radius: 0.75rem; background: #fff; }
h1 { font-size: 1.2rem; margin: 0.25rem 0; }
.order p { margin: 0.3rem 0; }
.total { font-weight: 700; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
button.primary { border-color: var(--accent); background: var(--accent); color: #fff; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
```

# TypeScript

```typescript
// Resumen de pedido en dos idiomas.
//
// Decisiones de diseño:
// - MessageParams dice, para cada clave, qué parámetros necesita su mensaje. Messages es un tipo
//   mapeado sobre él: cada idioma es un objeto de ese tipo, así que al inglés no le puede faltar
//   una clave ni puede usar otros parámetros.
// - Los mensajes son funciones, no plantillas: el plural, las listas, la moneda y las fechas los
//   resuelve Intl con el idioma (Intl.PluralRules elige 'one' u 'other' según las reglas de cada
//   lengua).
// - Las fechas se muestran en la zona de la tienda (America/Mexico_City) y el pedido es fijo,
//   para que el resumen no dependa del reloj de quien lo mira.
// - Al cambiar de idioma cambian también <html lang> y document.title, para que los lectores de
//   pantalla usen la voz correcta.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

const LOCALES = ['es-MX', 'en-US'] as const;
type Locale = (typeof LOCALES)[number];
type MessageParams = {
  heading: undefined;
  items: { count: number };
  includes: { names: string[] };
  delivery: { date: Date; days: number };
  total: { cents: number };
  pay: { cents: number };
  add: undefined;
};
type MessageKey = keyof MessageParams;
type Messages = { [K in MessageKey]: (params: MessageParams[K], locale: Locale) => string };

// ── Ayudantes de formato (Intl) ───────────────────────────────────────────
const money = (cents: number, locale: Locale): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'MXN' }).format(cents / 100);
const longDate = (date: Date, locale: Locale): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'America/Mexico_City' }).format(date);
const inDays = (days: number, locale: Locale): string => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day');
const listOf = (names: string[], locale: Locale): string => new Intl.ListFormat(locale, { type: 'conjunction' }).format(names);
function plural(count: number, locale: Locale, forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }): string {
  const rule = new Intl.PluralRules(locale).select(count);
  return (forms[rule] ?? forms.other).replace('#', String(count));
}

// ── Los dos idiomas: mismas claves, mismos parámetros ─────────────────────
const MESSAGES: Record<Locale, Messages> = {
  'es-MX': {
    heading: () => 'Tu pedido',
    items: ({ count }, locale) => plural(count, locale, { one: '# producto', other: '# productos' }),
    includes: ({ names }, locale) => `Incluye ${listOf(names, locale)}`,
    delivery: ({ date, days }, locale) => `Llega el ${longDate(date, locale)} (${inDays(days, locale)})`,
    total: ({ cents }, locale) => `Total: ${money(cents, locale)}`,
    pay: ({ cents }, locale) => `Pagar ${money(cents, locale)}`,
    add: () => 'Añadir otro producto',
  },
  'en-US': {
    heading: () => 'Your order',
    items: ({ count }, locale) => plural(count, locale, { one: '# item', other: '# items' }),
    includes: ({ names }, locale) => `Includes ${listOf(names, locale)}`,
    delivery: ({ date, days }, locale) => `Arrives ${longDate(date, locale)} (${inDays(days, locale)})`,
    total: ({ cents }, locale) => `Total: ${money(cents, locale)}`,
    pay: ({ cents }, locale) => `Pay ${money(cents, locale)}`,
    add: () => 'Add another item',
  },
};

// ── El traductor: t('total', { cents }) comprueba la clave y sus parámetros ──
class Translator {
  constructor(public locale: Locale) {}

  t<K extends MessageKey>(key: K, ...args: MessageParams[K] extends undefined ? [] : [MessageParams[K]]): string {
    const message: Messages[K] = MESSAGES[this.locale][key]; // (params: MessageParams[K], locale) => string
    // Con la tupla condicional, TypeScript no sabe que args[0] es MessageParams[K] cuando hace
    // falta; la firma de t ya lo ha comprobado en cada llamada, así que aquí se afirma.
    return message(args[0] as MessageParams[K], this.locale);
  }
}

// ── El pedido (fijo) y la página ──────────────────────────────────────────
type Line = { name: string; cents: number };
const AVAILABLE: Line[] = [
  { name: 'Mole negro', cents: 16500 },
  { name: 'Café de Chiapas', cents: 21000 },
  { name: 'Chocolate de metate', cents: 9500 },
];
const DELIVERY = { date: new Date('2026-11-02T18:00:00Z'), days: 3 };
const lines: Line[] = AVAILABLE.slice(0, 1); // el pedido empieza con un producto
const isLocale = (value: string): value is Locale => LOCALES.some((locale) => locale === value);

function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const translator = new Translator('es-MX');
const localeSelect = $('#locale', HTMLSelectElement);
const addButton = $('#add', HTMLButtonElement);
const payButton = $('#pay', HTMLButtonElement);

function render(): void {
  const cents = lines.reduce((sum, line) => sum + line.cents, 0);
  const texts = {
    heading: translator.t('heading'),
    items: translator.t('items', { count: lines.length }),
    includes: translator.t('includes', { names: lines.map((line) => line.name) }),
    delivery: translator.t('delivery', DELIVERY),
    total: translator.t('total', { cents }),
  };
  for (const [id, text] of Object.entries(texts)) $(`#${id}`, HTMLElement).textContent = text;
  addButton.textContent = translator.t('add');
  addButton.disabled = lines.length === AVAILABLE.length;
  payButton.textContent = translator.t('pay', { cents });
  document.documentElement.lang = translator.locale;
  document.title = `${texts.heading} · ${texts.total}`;
  console.log(`🌐 ${translator.locale} → ${texts.heading} · ${texts.items} · ${texts.total} · ${texts.delivery}`);
}

localeSelect.addEventListener('change', () => {
  if (isLocale(localeSelect.value)) translator.locale = localeSelect.value;
  render();
});
addButton.addEventListener('click', () => {
  const next = AVAILABLE[lines.length];
  if (next) lines.push(next);
  render();
});
payButton.addEventListener('click', () => console.log(`💳 ${payButton.textContent}`));

render();
console.log('Listo: pulsa «Añadir otro producto», cambia el idioma o pulsa el botón de pago');
```
