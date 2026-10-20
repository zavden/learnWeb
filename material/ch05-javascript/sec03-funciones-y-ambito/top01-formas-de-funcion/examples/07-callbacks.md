---
example_description: "Un callback es una función que pasas a otra para que ella la llame: funciones propias que reciben callbacks y quién decide los argumentos"
example_tags: "javascript|python|funciones|callbacks"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un CALLBACK es una función que pasas a otra para que ELLA la llame cuando toque.
// Ya los usas: map, filter y toSorted reciben callbacks.

// Una función propia que recibe un callback: repite una acción n veces.
function times(n, action) {
  for (let i = 1; i <= n; i++) {
    action(i); // times decide CUÁNDO se llama y con qué argumentos
  }
}
times(3, (lap) => console.log('  vuelta', lap));

// Una función con DOS callbacks: uno decide, el otro reacciona.
function countValid(items, isValid, onInvalid) {
  let valid = 0;
  for (const item of items) {
    if (isValid(item)) valid++;
    else onInvalid(item);
  }
  return valid;
}

const emails = ['ana@example.com', 'sin-arroba', 'luis@example.org', ''];
const validCount = countValid(
  emails,
  (email) => email.includes('@'),                              // isValid
  (email) => console.log('  ⚠️ no válido:', JSON.stringify(email)), // onInvalid
);
console.log('válidos →', validCount); // 2

// El callback también puede ser una función con nombre, declarada aparte.
function isCorporate(email) {
  return email.endsWith('@example.com');
}
console.log('corporativos →', emails.filter(isCorporate)); // ['ana@example.com']

// Quien llama al callback decide los argumentos: forEach pasa (elemento, índice, array).
emails.forEach((email, index) => {
  if (email === '') console.log(`  el email ${index} está vacío`);
});

// > Desde Python: es lo mismo que sorted(xs, key=f) o map(f, xs).
// El mismo mecanismo sirve para «llámame cuando pase algo»: un clic (capítulo 6)
// o un temporizador (módulo «Asincronía y event loop»).
```
