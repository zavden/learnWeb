---
example_description: "Cambiar de idioma en caliente: cada catálogo es un JSON que se carga con import() y with { type: 'json' } solo al elegirlo, el módulo i18n es el dueño del idioma actual (un let exportado, enlace vivo) y volver a un idioma no lo descarga otra vez"
example_tags: "javascript|modulos|import-dinamico|json|i18n|live-bindings"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/03-i18n/):
//   i18n.js            → locale (let exportado), setLocale(), t(), tCount(), formatPrice()
//   locales/es-MX.json → { "cartTitle": "Tu carrito", "items.one": …, … }
//   locales/en-US.json → los mismos textos en inglés
import { locale, setLocale, t, tCount, formatPrice, loads } from './03-i18n/i18n.js';

const cart = { count: 3, totalCents: 117900 };

function renderCart() {
  return `[${locale}] ${t('cartTitle')}: ${tCount('items', cart.count)} · ${t('total', { amount: formatPrice(cart.totalCents) })}`;
}

console.log('idioma antes de cargar nada →', locale);
await setLocale('es-MX');
console.log(renderCart());
await setLocale('en-US');
console.log(renderCart()); // locale es un enlace vivo: ya dice en-US
cart.count = 1;
console.log(renderCart());

try {
  await setLocale('fr-FR');
} catch (error) {
  console.log('⛔', error.message, '→ sigue en', locale);
}

await setLocale('es-MX'); // vuelve: el JSON ya está en el mapa de módulos
console.log(renderCart());
console.log('setLocale() llamado con →', loads.map((load) => load.tag).join(', '));
// La segunda vez, import() devolvió el MISMO módulo JSON: no hubo descarga.
console.log('¿el mismo catálogo es-MX que la primera vez? →', loads[2].catalog === loads[0].catalog);

// Fíjate en el precio en inglés: «MX$1,179.00». Intl escribe el símbolo
// según el idioma: para alguien de EE. UU., «$» serían dólares.
```
