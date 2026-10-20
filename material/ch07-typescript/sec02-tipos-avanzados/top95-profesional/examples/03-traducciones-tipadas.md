---
example_description: "Las traducciones de un resumen de compra con claves anidadas comprobadas: Paths<T> calcula 'checkout.total' y compañía con tipos mapeados recursivos y plantillas, ParamsOf saca los {marcadores} de cada texto con infer, y t() exige exactamente esos valores; el inglés debe tener la misma forma que el español"
example_tags: "typescript|profesional|template-literal-types|infer|tipos-mapeados|tipos-recursivos|i18n|intl|dom|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <p class="language"><label for="language">Idioma / Language</label>
    <select id="language"><option value="es-MX">Español (México)</option><option value="en-US">English (US)</option></select></p>
  <section class="card" aria-labelledby="title">
    <h1 id="title"></h1>
    <p id="items"></p>
    <ul class="lines">
      <li>Mole negro (500 g) · 2</li>
      <li>Café de Chiapas (1 kg) · 1</li>
    </ul>
    <p id="total" class="total"></p>
    <p id="free" class="note"></p>
    <p id="eta" class="note"></p>
    <button type="button" id="pay" class="primary"></button>
  </section>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --accent: #9a3412; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #fff8f0; }
.app { max-width: 28rem; margin: 0 auto; padding: 1rem; }
.language { display: flex; gap: 0.5rem; align-items: center; margin: 0 0 0.75rem; }
select, button { font: inherit; }
select { padding: 0.25rem 0.4rem; border: 1px solid var(--line); border-radius: 0.4rem; background: #fff; color: var(--ink); }
.card { padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--line); border-radius: 0.75rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.25rem; }
.lines { margin: 0.25rem 0; padding-left: 1.2rem; color: var(--muted); }
.total { font-weight: 700; font-size: 1.1rem; margin: 0.5rem 0 0.25rem; }
.note { margin: 0.15rem 0; color: var(--muted); font-size: 0.9rem; }
.primary { margin-top: 0.75rem; width: 100%; padding: 0.5rem; border: 0; border-radius: 0.5rem; background: var(--accent); color: #fff; font-weight: 600; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { font-size: 0.8rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── El idioma de referencia: as const conserva cada texto como literal ────
const es = {
  checkout: { title: 'Tu pedido', items: '{count} productos', total: 'Total: {amount}', pay: 'Pagar {amount}' },
  shipping: { free: 'Envío gratis a partir de {amount}', eta: 'Llega entre el {from} y el {to}' },
} as const;

// Los demás idiomas tienen la MISMA forma, con textos cualesquiera (mapeado recursivo).
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
type Dictionary = Widen<typeof es>;
const en: Dictionary = {
  checkout: { title: 'Your order', items: '{count} items', total: 'Total: {amount}', pay: 'Pay {amount}' },
  shipping: { free: 'Free shipping on orders over {amount}', eta: 'Arrives between {from} and {to}' },
};
// Si a en le faltara checkout.pay, sería un error TS2741 que dice qué clave falta.

// ── Las claves: 'checkout.title' | 'checkout.items' | … (lecciones 3 y 5) ──
type Paths<T> = { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];
type Lookup<T, P extends string> =
  P extends `${infer Head}.${infer Rest}` ? (Head extends keyof T ? Lookup<T[Head], Rest> : never)
  : P extends keyof T ? T[P] : never;
// Los marcadores de un texto: '{from} y el {to}' → 'from' | 'to'.
type ParamsOf<S> = S extends `${string}{${infer Name}}${infer Rest}` ? Name | ParamsOf<Rest> : never;
type Key = Paths<typeof es>;
// Sin marcadores, t() no acepta un segundo argumento; con ellos, exige exactamente esos.
type Args<P extends Key> = [ParamsOf<Lookup<typeof es, P>>] extends [never] ? [] : [values: Record<ParamsOf<Lookup<typeof es, P>>, string | number>];

const DICTIONARIES = { 'es-MX': es, 'en-US': en } satisfies Record<string, Dictionary>;
type Locale = keyof typeof DICTIONARIES;
const isLocale = (value: string): value is Locale => value in DICTIONARIES;

function translate<P extends Key>(locale: Locale, path: P, ...args: Args<P>): string {
  let node: unknown = DICTIONARIES[locale];
  for (const part of path.split('.')) node = typeof node === 'object' && node !== null ? Reflect.get(node, part) : undefined;
  if (typeof node !== 'string') throw new Error(`Falta la traducción ${path} (${locale})`);
  const values: Record<string, string | number> = args[0] ?? {};
  return node.replace(/\{(\w+)\}/g, (_match, name: string) => String(values[name] ?? `{${name}}`));
}
// translate('es-MX', 'checkout.items') sería un error: faltan los valores ({ count }).
// translate('es-MX', 'checkout.items', { cuenta: 3 }) también: el marcador se llama count.

// ── La interfaz ───────────────────────────────────────────────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const ORDER = { items: 3, totalMxn: 1089, freeFromMxn: 999, eta: ['2026-10-20', '2026-10-23'] } as const;
const logList = byId('log', HTMLOListElement);

function render(locale: Locale): void {
  const money = (amount: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'MXN' }).format(amount);
  const day = (iso: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
  const texts = {
    title: translate(locale, 'checkout.title'),
    items: translate(locale, 'checkout.items', { count: ORDER.items }),
    total: translate(locale, 'checkout.total', { amount: money(ORDER.totalMxn) }),
    free: translate(locale, 'shipping.free', { amount: money(ORDER.freeFromMxn) }),
    eta: translate(locale, 'shipping.eta', { from: day(ORDER.eta[0]), to: day(ORDER.eta[1]) }),
    pay: translate(locale, 'checkout.pay', { amount: money(ORDER.totalMxn) }),
  };
  for (const [id, text] of Object.entries(texts)) byId(id, HTMLElement).textContent = text;
  document.documentElement.lang = locale.slice(0, 2); // los lectores de pantalla cambian de voz
  const line = `🌐 ${locale} → ${texts.title} · ${texts.total} · ${texts.eta}`;
  console.log(line);
  logList.append(Object.assign(document.createElement('li'), { textContent: line }));
}

byId('language', HTMLSelectElement).addEventListener('change', (event) => {
  if (event.currentTarget instanceof HTMLSelectElement && isLocale(event.currentTarget.value)) render(event.currentTarget.value);
});
byId('pay', HTMLButtonElement).addEventListener('click', (event) => {
  if (event.currentTarget instanceof HTMLButtonElement) console.log(`💳 ${event.currentTarget.textContent}`);
});
render('es-MX');
console.log('Listo: cambia el idioma o pulsa el botón de pago');
```
