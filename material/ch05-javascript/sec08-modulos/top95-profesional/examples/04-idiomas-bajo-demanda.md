---
example_description: "Traducciones por idioma cargadas con import(): negociación del idioma a partir de las preferencias, catálogos que se piden una sola vez (caché de promesas), plurales con Intl.PluralRules, textos que faltan con alternativa y aviso, y fechas y precios con Intl"
example_tags: "javascript|profesional|modulos|import-dinamico|i18n|intl|plurales"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="order-page">
  <p class="language">
    <label for="language" id="language-label">Idioma</label>
    <select id="language"></select>
  </p>
  <article id="order" class="order" aria-live="polite">
    <h1 id="order-title">…</h1>
    <p id="order-items"></p>
    <p id="order-total" class="total"></p>
    <p id="order-shipped"></p>
  </article>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #172554; background: #eff6ff; line-height: 1.5; }
.order-page { max-width: 28rem; margin: 0 auto; padding: 1.25rem 1rem; }
.language { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem; }
select { font: inherit; padding: 0.3rem 0.5rem; border: 1px solid #93c5fd; border-radius: 0.4rem; background: #fff; color: inherit; }
select:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
.order { padding: 1rem 1.25rem; border-radius: 0.75rem; background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / 0.15); }
.order h1 { margin: 0 0 0.25rem; font-size: 1.3rem; }
.order p { margin: 0.25rem 0; }
.total { font-size: 1.15rem; font-weight: 700; }
```

# JavaScript

```javascript
// TRADUCCIONES CARGADAS POR IDIOMA.
//
// Archivos (assets/04-i18n/):
//   i18n.js → negotiate(preferencias), loadTranslator(idioma), stats
//   locales/es-MX.js, en-US.js, pt-BR.js → export default { currency, messages }
//     (a pt-BR le falta «order.shipped»)
//
// Decisiones (detalladas en i18n.js):
// - Solo se descarga el catálogo del idioma elegido (y el de reserva).
// - La caché guarda PROMESAS: dos cambios de idioma seguidos, una descarga.
// - Los plurales con Intl.PluralRules: cada idioma tiene sus reglas.
// - Un texto que falta usa el del idioma por defecto y queda apuntado.
// - Fechas en la zona horaria de la tienda (America/Mexico_City).
//
// Alcance: módulos 1-8. querySelector, textContent, append, lang y el evento
// change del <select> son del capítulo 6.
import { AVAILABLE, negotiate, loadTranslator, stats } from './04-i18n/i18n.js';

const order = { id: 'P-1042', items: 3, totalCents: 117900, shippedAt: '2026-10-13T18:30:00Z' };

function orderTexts(i18n, data) {
  return {
    title: i18n.t('order.title', { id: data.id }),
    items: i18n.t('order.items', { count: data.items }),
    total: i18n.t('order.total', { total: i18n.formatPrice(data.totalCents) }),
    shipped: i18n.t('order.shipped', { date: i18n.formatDate(data.shippedAt) }),
  };
}

// ── La interfaz ──────────────────────────────────────────────────────────
const select = document.querySelector('#language');
for (const locale of AVAILABLE) {
  const option = document.createElement('option');
  option.value = locale;
  option.textContent = new Intl.DisplayNames([locale], { type: 'language' }).of(locale); // su nombre en su idioma
  select.append(option);
}

async function show(locale) {
  const i18n = await loadTranslator(locale);
  const texts = orderTexts(i18n, order);
  document.querySelector('#order').lang = locale; // lectores de pantalla y separación de palabras
  document.querySelector('#language-label').textContent = i18n.t('language.label');
  document.querySelector('#order-title').textContent = texts.title;
  document.querySelector('#order-items').textContent = texts.items;
  document.querySelector('#order-total').textContent = texts.total;
  document.querySelector('#order-shipped').textContent = texts.shipped;
  select.value = locale;
  return i18n;
}
select.addEventListener('change', () => show(select.value));

// ── Demostración ─────────────────────────────────────────────────────────
console.group('▶ negociar el idioma');
for (const preferred of [['es-AR', 'en'], ['pt-PT', 'en-US'], ['en-GB'], ['de-DE', 'en-US'], ['fr-CA', 'fr']]) {
  console.log(preferred.join(', '), '→', negotiate(preferred));
}
console.groupEnd();

console.group('▶ el pedido en cada idioma');
for (const locale of AVAILABLE) {
  const texts = orderTexts(await loadTranslator(locale), order);
  console.log(`[${locale}] ${texts.title} · ${texts.items} · ${texts.total}`);
  console.log(`         ${texts.shipped}`);
}
console.groupEnd();

console.group('▶ plurales: 0, 1 y 2 productos');
for (const locale of AVAILABLE) {
  const i18n = await loadTranslator(locale);
  console.log(`[${locale}]`, [0, 1, 2].map((count) => i18n.t('order.items', { count })).join(' · '));
}
console.groupEnd();

const ptBR = await loadTranslator('pt-BR');
console.log('textos que faltan en pt-BR →', ptBR.missing());
console.log('catálogos descargados →', stats.loads, '(uno por idioma, aunque se pidieron muchas veces)');

// Arranca con el idioma que negociarían las preferencias de esta persona.
// (En una página real: negotiate(navigator.languages); aquí, fijo, para que
// el resultado no dependa de tu navegador.)
await show(negotiate(['es-AR', 'en']));
console.log('en pantalla →', document.querySelector('#order-title').textContent, '·', document.querySelector('#order-total').textContent);
```
