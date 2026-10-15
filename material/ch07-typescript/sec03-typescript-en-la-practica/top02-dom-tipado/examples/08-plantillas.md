---
example_description: "Clonar un <template>: template.content.cloneNode(true) está tipado como Node (TS2339 al llamar a querySelector), aunque en ejecución sea un DocumentFragment. document.importNode(template.content, true) conserva el tipo; dentro del fragmento, un $ con contenedor da cada pieza con su tipo"
example_tags: "typescript|dom|template|clonenode|importnode|documentfragment|ts2339|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Productos de temporada</h1>
  <ul id="products" class="products"></ul>
  <template id="product-row">
    <li class="product">
      <span class="name"></span>
      <data class="price"></data>
    </li>
  </template>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.products { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.product { display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0.6rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
.name { flex: 1; }
.price { font-weight: 700; }
```

# TypeScript

```typescript
type Product = { sku: string; name: string; price: number };
const SEASON: Product[] = [
  { sku: 'PAN-01', name: 'Pan de muerto', price: 85 },
  { sku: 'CAL-02', name: 'Calabaza en tacha', price: 120 },
  { sku: 'ATO-03', name: 'Atole de guayaba', price: 45 },
];

function $<T extends Element>(selector: string, type: new () => T, root: ParentNode = document): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const template = $('#product-row', HTMLTemplateElement); // template.content: DocumentFragment
const list = $('#products', HTMLUListElement);

// 🐛 cloneNode está declarado en Node y devuelve Node, aunque el clon sea un DocumentFragment.
const clone = template.content.cloneNode(true);
console.log('🐛 cloneNode →', clone.nodeName, '| querySelector:', typeof clone.querySelector('li')); // ❌ Error TS2339 a propósito: Node no tiene querySelector

// ✅ importNode<T extends Node>(node: T, …): T devuelve el mismo tipo que recibe.
//    (template.content.cloneNode(true) as DocumentFragment también vale: es una aserción segura.)
function renderRow(product: Product): DocumentFragment {
  const fragment = document.importNode(template.content, true);
  $('.name', HTMLSpanElement, fragment).textContent = product.name;
  const price = $('.price', HTMLDataElement, fragment); // <data value="…"> guarda el valor para las máquinas
  price.value = String(product.price);
  price.textContent = `$${product.price}`;
  return fragment;
}

list.append(...SEASON.map(renderRow));
console.log('✅', list.children.length, 'productos:', SEASON.map((product) => product.name).join(', '));
console.log('✅ precios →', [...list.querySelectorAll('data')].map((price) => price.value).join(' · '));
```
