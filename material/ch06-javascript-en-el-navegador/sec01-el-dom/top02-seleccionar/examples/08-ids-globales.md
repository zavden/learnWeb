---
example_description: "Un elemento con id se puede usar como variable global sin buscarlo (acceso por nombre en window), pero solo si el id no coincide con nada de window: con id=\"status\" o id=\"history\" la «variable» es otra cosa. Busca siempre los elementos de forma explícita"
example_tags: "javascript|dom|id|window|globales|getelementbyid|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<p>Total del pedido: <output id="total">$487.20</output></p>
<p id="status">Pedido en preparación</p>
<section id="history" aria-label="Pedidos anteriores">
  <ul id="past-orders">
    <li>P-1001 · Café de Chiapas</li>
  </ul>
</section>
```

# JavaScript

```javascript
// 🐛 Ni querySelector ni getElementById: ¡y funciona!
console.log('total →', total);
console.log("¿es el mismo que getElementById('total')? →", total === document.getElementById('total'));
// Un id con guiones no es un identificador válido, pero también está:
console.log("window['past-orders'] →", window['past-orders']);

// El navegador crea una «variable» global por cada id… salvo que window ya
// tenga una propiedad con ese nombre. Entonces gana window:
console.log('🐛 typeof status →', typeof status); // window.status, un texto antiguo
console.log('🐛 status →', JSON.stringify(status));
console.log('🐛 history.nodeName →', history.nodeName); // el historial del navegador
console.log('🐛 ¿history es el historial del navegador? →', history instanceof History);

// ✅ Búscalos siempre de forma explícita: se lee de dónde sale cada cosa y
//    no depende de qué nombres tenga window.
const orderStatus = document.getElementById('status');
const historySection = document.querySelector('#history');
console.log('✅ status →', orderStatus);
console.log('✅ history →', historySection.nodeName, historySection.getAttribute('aria-label'));
```
