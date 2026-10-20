---
example_description: "Llamar a una función generadora no ejecuta nada de su cuerpo: una validación de argumentos dentro del generador no salta al llamarlo, sino lejos, en el primer next(); se valida en una función normal que devuelve el generador"
example_tags: "javascript|python|generadores|validacion|errores|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Reparte una lista en páginas de `size` elementos.
function* paginate(items, size) {
  console.log(`  ⚙️ empieza el cuerpo de paginate (size = ${size})`);
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError(`Tamaño de página no válido: ${size}`);
  }
  for (let start = 0; start < items.length; start += size) {
    yield items.slice(start, start + size);
  }
}

const chores = ['regar', 'barrer', 'lavar', 'planchar', 'cocinar'];

// 🐛 La llamada con un tamaño absurdo NO lanza: solo crea el generador.
let pages;
try {
  pages = paginate(chores, 0);
  console.log('🐛 paginate(chores, 0) → ningún error; devuelve', Object.prototype.toString.call(pages));
} catch (error) {
  console.log('(este catch nunca se ejecuta)', error.message);
}

// …el error salta más tarde, en otro sitio: donde alguien recorra las páginas.
console.log('— mucho después, en otra parte del programa —');
try {
  for (const page of pages) console.log(page);
} catch (error) {
  console.log('🐛 al recorrer →', error.name, '|', error.message);
}

// ✅ Una función NORMAL valida en el momento de la llamada y devuelve el
//    generador interno, que ya recibe argumentos correctos.
function* pagesOf(items, size) {
  for (let start = 0; start < items.length; start += size) {
    yield items.slice(start, start + size);
  }
}
function paginateChecked(items, size) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError(`Tamaño de página no válido: ${size}`);
  }
  return pagesOf(items, size);
}

try {
  paginateChecked(chores, 0);
} catch (error) {
  console.log('✅ en la llamada →', error.name, '|', error.message);
}
console.log('✅ páginas de 2 →', JSON.stringify([...paginateChecked(chores, 2)]));

// > Desde Python: exactamente igual. Una función con yield no ejecuta nada
//   hasta el primer next(), y la solución es la misma: una función normal que
//   valida y devuelve el generador.
```
