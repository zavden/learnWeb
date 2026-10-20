---
example_description: "Con strict (noImplicitAny), un parámetro sin anotación es un error TS7006: TypeScript no deduce los tipos de los parámetros a partir de las llamadas; anotados, el error se traslada a la llamada equivocada"
example_tags: "typescript|strict|noimplicitany|ts7006|ts2345|parametros"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// 🐛 Sin tipos, los parámetros serían any (cualquier cosa), y strict lo prohíbe.
function addShipping(subtotal, shipping) { // ❌ Error TS7006 a propósito (2 veces): falta el tipo
  return subtotal + shipping;
}
console.log('🐛 →', addShipping('500', 99)); // '50099': el + concatena

// ✅ Con anotaciones, TypeScript comprueba cada llamada…
function addShippingCents(subtotal: number, shipping: number): number {
  return subtotal + shipping;
}
console.log('✅ →', addShippingCents(500, 99));

// …y el error aparece donde está el fallo: en la llamada con un texto.
console.log('🐛 →', addShippingCents('500', 99)); // ❌ Error TS2345 a propósito: '500' es un string

// > Desde Python: mypy se salta por defecto las funciones sin anotar; TypeScript
//   con strict te obliga a anotar los parámetros (lo demás lo deduce solo).
```
