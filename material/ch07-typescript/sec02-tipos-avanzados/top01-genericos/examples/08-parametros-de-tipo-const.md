---
example_description: "Un parámetro de tipo const (<const T>, TypeScript 5.0) infiere los argumentos como si llevaran as const: la lista de rutas queda como una tupla de literales y go() solo acepta esas rutas (TS2345 con la unión completa en el mensaje)"
example_tags: "typescript|genericos|const|as-const|tipos-literales|ts2345"
example_stage: common-error
example_importance: useful
console: true
---

# TypeScript

```typescript
// Sin const, T se infiere «ancho», como un let: string[].
function createNavLoose<T extends readonly string[]>(paths: T) {
  return { paths, go: (path: T[number]) => `navegando a ${path}` };
}
const loose = createNavLoose(['/', '/tienda', '/carrito']); // T = string[]
console.log(loose.go('/tiend')); // sin error: go acepta cualquier string

// Con <const T>, como si quien llama hubiera escrito as const:
function createNav<const T extends readonly string[]>(paths: T) {
  // T[number] es «la unión de los elementos de T» (lección 2).
  return { paths, go: (path: T[number]) => `navegando a ${path}` };
}
const nav = createNav(['/', '/tienda', '/carrito']); // T = readonly ['/', '/tienda', '/carrito']

console.log(nav.go('/tienda'));
console.log(nav.go('/tiend')); // ❌ Error TS2345 a propósito: errata en la ruta
console.log('rutas →', nav.paths.join(' · '));
// En ejecución, const T no deja rastro: compiled.js es igual en las dos funciones.
```
