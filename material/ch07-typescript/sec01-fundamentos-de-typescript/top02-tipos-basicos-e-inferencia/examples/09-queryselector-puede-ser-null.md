---
example_description: "querySelector devuelve Element | null: TypeScript marca su uso directo (TS18047) porque no puede saber si el selector encaja; con una errata, ese mismo código revienta en ejecución. Soluciones: if, ?., y una función que exige el elemento"
example_tags: "typescript|dom|queryselector|null|strictnullchecks|ts18047|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<p>🛒 Carrito: <span id="cart-count">0</span> productos</p>
```

# TypeScript

```typescript
// querySelector recibe un selector en un string: TypeScript no puede saber si
// encajará con algo, así que su tipo de retorno es Element | null.
const badge = document.querySelector('#cart-count');
console.log('¿badge es null? →', badge === null);
badge.textContent = '3'; // ❌ Error TS18047 a propósito: 'badge' puede ser null

// 🐛 Con una errata en el selector, la MISMA línea revienta en ejecución.
//    Para TypeScript los dos casos son iguales; por eso marca los dos.
const typo = document.querySelector('#card-count');
console.log('¿typo es null? →', typo === null);
try {
  typo.textContent = '3'; // ❌ Error TS18047 a propósito: 'typo' puede ser null
} catch (error) {
  console.log('⛔', String(error));
}

// ✅ 1. Un if: dentro, badge es Element (sin null).
if (badge) badge.textContent = '4';

// ✅ 2. Para LEER algo opcional, ?. y ??:
console.log('✅', document.querySelector('#card-count')?.textContent ?? 'no hay contador');

// ✅ 3. Si el elemento es obligatorio, una función que falla con un mensaje
//    claro (capítulo 6). Su retorno es Element: el null ya no sale de ella.
function requireElement(selector: string): Element {
  const element = document.querySelector(selector);
  if (element === null) throw new Error(`Falta el elemento "${selector}"`);
  return element;
}
requireElement('#cart-count').textContent = '5';
console.log('✅ contador →', requireElement('#cart-count').textContent);

// Element es un tipo genérico (no sabe que es un <span>); cómo pedir el tipo
// exacto, con querySelector<T>, lo verás en el módulo 3 («DOM tipado»).
```
