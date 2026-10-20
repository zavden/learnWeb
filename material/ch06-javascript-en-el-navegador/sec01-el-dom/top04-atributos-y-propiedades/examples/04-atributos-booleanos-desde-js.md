---
example_description: "setAttribute('disabled', 'false') DESACTIVA el botón: un atributo booleano funciona por presencia. Desde JavaScript se usa la propiedad booleana (disabled = false), toggleAttribute o removeAttribute. aria-expanded, en cambio, no es booleano: es el texto «true» o «false»"
example_tags: "javascript|dom|atributos-booleanos|disabled|toggleattribute|aria|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<p><button type="button" id="pay-bug">Pagar $487.20 (🐛)</button></p>
<p><button type="button" id="pay">Pagar $487.20 (✅)</button></p>
<p><button type="button" id="details-button" aria-expanded="false" aria-controls="details">Ver detalles del envío</button></p>
<p id="details" hidden>Llega el jueves por paquetería estándar.</p>
```

# JavaScript

```javascript
// 🐛 Queremos ACTIVAR el botón… y escribimos el valor «false»:
const payBug = document.querySelector('#pay-bug');
payBug.setAttribute('disabled', 'false');
console.log("🐛 tras setAttribute('disabled', 'false') → disabled:", payBug.disabled);
console.log('🐛 el botón →', payBug);
// Un atributo booleano funciona por PRESENCIA, sea cual sea su valor
// (lección «Elementos y atributos» del capítulo de HTML). Este botón no se puede pulsar.

// ✅ La propiedad es un booleano de verdad: true pone el atributo, false lo quita.
const pay = document.querySelector('#pay');
pay.disabled = true;
console.log('✅ disabled = true →', pay);
pay.disabled = false;
console.log("✅ disabled = false → hasAttribute('disabled'):", pay.hasAttribute('disabled'));

// ✅ toggleAttribute(nombre, forzar) pone o quita el atributo según una condición:
const cartIsEmpty = true;
pay.toggleAttribute('disabled', cartIsEmpty);
console.log('✅ toggleAttribute con el carrito vacío → disabled:', pay.disabled);
pay.toggleAttribute('disabled', !cartIsEmpty);
console.log('✅ toggleAttribute con productos → disabled:', pay.disabled);

// ⚠️ Al revés con ARIA: aria-expanded NO es booleano. Su valor es el texto
// "true" o "false", y quitarlo no significa «cerrado» sino «no se despliega».
const detailsButton = document.querySelector('#details-button');
detailsButton.setAttribute('aria-expanded', 'true');
document.querySelector('#details').hidden = false;
console.log("aria-expanded →", detailsButton.getAttribute('aria-expanded'));
console.log('detailsButton.ariaExpanded →', JSON.stringify(detailsButton.ariaExpanded)); // también un string
```
