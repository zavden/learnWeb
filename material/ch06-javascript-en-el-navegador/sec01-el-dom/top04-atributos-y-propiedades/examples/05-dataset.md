---
example_description: "dataset da los atributos data-* con el nombre en camelCase (data-product-id → productId) y siempre como strings: 'false' es truthy y '21000' + 100 concatena. Escribir en dataset crea el atributo con guiones, y una mayúscula en el HTML se pierde"
example_tags: "javascript|dom|dataset|data-atributos|camelcase|strings|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<ul id="products">
  <li data-product-id="42" data-in-stock="false" data-price-cents="21000">Café de Chiapas</li>
  <li data-productId="43">Café de Veracruz</li>
</ul>
```

# CSS

```css
/* Los data-* también sirven como ganchos de CSS */
[data-in-stock="false"] {
  color: #64748b;
  text-decoration: line-through;
}
```

# JavaScript

```javascript
const coffee = document.querySelector('li');

// data-product-id → dataset.productId: sin «data-» y con camelCase.
console.log('dataset →', coffee.dataset);
console.log('dataset.productId →', coffee.dataset.productId);
console.log("🐛 dataset['product-id'] →", coffee.dataset['product-id']);

// 🐛 Los valores son SIEMPRE strings:
if (coffee.dataset.inStock) {
  console.log("🐛 if (dataset.inStock) → entra, aunque vale 'false' (un string no vacío)");
}
console.log("✅ dataset.inStock === 'true' →", coffee.dataset.inStock === 'true');
console.log('🐛 priceCents + 100 →', coffee.dataset.priceCents + 100);
console.log('✅ Number(priceCents) + 100 →', Number(coffee.dataset.priceCents) + 100);

// Escribir en dataset crea el atributo (camelCase → guiones); delete lo quita.
coffee.dataset.lastViewed = '2026-10-14';
console.log("getAttribute('data-last-viewed') →", coffee.getAttribute('data-last-viewed'));
delete coffee.dataset.lastViewed;
console.log("hasAttribute('data-last-viewed') →", coffee.hasAttribute('data-last-viewed'));

// 🐛 En el HTML, los nombres de atributo se pasan a minúsculas al parsear:
//    data-productId es data-productid, y en dataset es «productid».
const veracruz = coffee.nextElementSibling;
console.log('🐛 veracruz.dataset →', veracruz.dataset);
console.log('🐛 veracruz.dataset.productId →', veracruz.dataset.productId);
// ✅ En el HTML, data-* siempre en minúsculas y con guiones: data-product-id.
```
