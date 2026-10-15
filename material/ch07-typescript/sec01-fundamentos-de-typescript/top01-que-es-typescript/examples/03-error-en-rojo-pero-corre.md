---
example_description: "Un error de tipos (TS2322: un string donde se esperaba number) sale en rojo en el editor, pero el JavaScript se ejecuta igual y el fallo llega a la consola: TypeScript avisa, no frena"
example_tags: "typescript|errores|ts2322|verificador|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Precio de una bolsa de café, en pesos.
const unitPrice: number = 210;

// 🐛 Una cantidad que llega como texto (como el value de un <input>):
const quantity: number = '2'; // ❌ Error TS2322 a propósito: '2' es un string, no un number

// TypeScript marca la línea en rojo… y el código se ejecuta IGUAL.
// A partir de aquí, TypeScript cree que quantity es un number.
console.log('quantity →', quantity, '|', typeof quantity);
console.log('subtotal →', unitPrice * quantity); // 420: el * convierte el texto
console.log('🐛 una bolsa más →', quantity + 1); // '21': el + concatena

// ✅ Convierte el texto en número ANTES de guardarlo en una variable number:
const fixedQuantity: number = Number('2');
console.log('✅ una bolsa más →', fixedQuantity + 1);

// En el editor: subrayado rojo, marca en el margen y la lista «Compile» de la
// barra de estado. En el diálogo «▶ Run» de la teoría, la franja «Errores de
// tipos (el código se ejecuta igual)» encima de la consola.
```
