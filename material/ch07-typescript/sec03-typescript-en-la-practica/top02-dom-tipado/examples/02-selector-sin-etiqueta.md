---
example_description: "Con un selector que no es solo un nombre de etiqueta ('.qty', '#qty', 'input.qty'), querySelector devuelve Element | null: TypeScript no lee CSS. Element no tiene value ni dataset (TS2339) aunque el elemento real sea un <input>. Se arregla estrechando con instanceof o buscando por etiqueta dentro de un contenedor"
example_tags: "typescript|dom|queryselector|element|instanceof|ts2339|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tu carrito</h1>
  <ul class="cart">
    <li class="line" data-sku="CAF-01">
      <span class="product">Café de Chiapas</span> · <span class="price">$210</span>
      <input class="qty" type="number" min="1" value="2" aria-label="Bolsas de Café de Chiapas">
    </li>
  </ul>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.cart { list-style: none; margin: 0; padding: 0.5rem 0.75rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
input { font: inherit; color: inherit; width: 4rem; padding: 0.2rem 0.3rem; border: 1px solid #7b8794; border-radius: 0.4rem; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
```

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// TypeScript no interpreta selectores CSS: solo reconoce un nombre de etiqueta EXACTO.
const byClass = document.querySelector('.qty');
const byTagAndClass = document.querySelector('input.qty'); // también es un texto cualquiera
const line = document.querySelector('.line');

type Checks = [
  Expect<Equal<typeof byClass, Element | null>>,
  Expect<Equal<typeof byTagAndClass, Element | null>>,
];

// 🐛 En ejecución es un <input>, pero Element no tiene value ni dataset:
console.log('🐛 value →', byClass?.value); // ❌ Error TS2339 a propósito: value no existe en Element
console.log('🐛 sku →', line?.dataset.sku); // ❌ Error TS2339 a propósito: dataset es de HTMLElement

// ✅ 1. instanceof estrecha con una comprobación real.
if (byClass instanceof HTMLInputElement) {
  console.log('✅ instanceof → bolsas:', byClass.valueAsNumber);
}
if (line instanceof HTMLElement) {
  console.log('✅ instanceof → sku:', line.dataset.sku);
}

// ✅ 2. Dentro de un contenedor, un nombre de etiqueta vuelve a dar el tipo exacto.
const qtyInput = line?.querySelector('input'); // HTMLInputElement | null | undefined
console.log('✅ por etiqueta → total:', (qtyInput?.valueAsNumber ?? 0) * 210);
```
