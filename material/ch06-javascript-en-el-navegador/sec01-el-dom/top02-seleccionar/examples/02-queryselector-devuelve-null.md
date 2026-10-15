---
example_description: "querySelector devuelve null cuando nada encaja (una errata en el selector, o un script que se ejecuta antes de que exista el elemento), y el error salta una línea después: «Cannot read properties of null». ?. para lo opcional; una función que falla con un mensaje claro para lo obligatorio"
example_tags: "javascript|dom|queryselector|null|typeerror|optional-chaining|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<script>
  // 🐛 Este <script> está ANTES del contador: cuando se ejecuta, el parser
  //    todavía no ha llegado a <span id="cart-count">, así que no existe.
  document.querySelector('#cart-count').textContent = '1';
</script>
<p>🛒 Carrito: <span id="cart-count">0</span> productos</p>
```

# JavaScript

```javascript
// 🐛 Una errata en el selector: #card-count en vez de #cart-count.
const badge = document.querySelector('#card-count');
console.log('🐛 #card-count →', badge);
try {
  console.log(badge.textContent); // el error salta AQUÍ, no en el querySelector
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}

// ✅ 1. Si el elemento puede faltar (una sección opcional), ?. corta en null:
console.log('✅ con ?. →', document.querySelector('#card-count')?.textContent);
// Ojo: ?. no sirve para ASIGNAR. «el?.textContent = '2'» es un SyntaxError.

// ✅ 2. Si el elemento DEBE existir, falla pronto y di qué falta:
function requireElement(selector) {
  const element = document.querySelector(selector);
  if (element === null) throw new Error(`No hay ningún elemento para el selector "${selector}"`);
  return element;
}
try {
  requireElement('#card-count');
} catch (error) {
  console.log('⛔', error.message);
}

const cartCount = requireElement('#cart-count');
cartCount.textContent = '2';
console.log('✅ #cart-count →', cartCount);

// El primer error de la consola es el del <script> de arriba: un error sin
// atrapar detiene ESE script, pero los demás de la página siguen.
// TypeScript (capítulo 7) te obligará a tratar este null antes de usar el elemento.
```
