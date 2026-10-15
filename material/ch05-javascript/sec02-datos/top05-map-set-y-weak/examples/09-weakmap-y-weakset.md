---
example_description: "WeakMap y WeakSet asocian datos a objetos sin impedir que el recolector de basura los libere; solo admiten objetos como claves y no se pueden recorrer"
example_tags: "javascript|weakmap|weakset|memoria|gc"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Caso típico: guardar datos «al lado» de un objeto ajeno sin modificarlo
// (por ejemplo, metadatos de elementos del DOM o de objetos de otra librería).
const clickCount = new WeakMap();

function registerClick(target) {   // las funciones se estudian en el módulo 3
  clickCount.set(target, (clickCount.get(target) ?? 0) + 1);
}

let button = { label: 'Comprar' };
registerClick(button);
registerClick(button);
console.log('clics →', clickCount.get(button));   // 2
console.log('has(button) →', clickCount.has(button));

// Las claves deben ser objetos (o símbolos no registrados): un primitivo lanza TypeError.
try {
  clickCount.set('Comprar', 1);
} catch (error) {
  console.log('clave primitiva →', error.name, '|', error.message);
}

// No hay size, keys(), forEach ni for…of: el contenido depende de lo que el GC ya haya liberado.
console.log('clickCount.size →', clickCount.size);   // undefined

// Cuando desaparece la última referencia al objeto, su entrada puede liberarse sola.
// Con un Map normal, la entrada mantendría vivo el objeto para siempre (una fuga de memoria).
button = null;

// WeakSet: «marcar» objetos sin retenerlos.
const processed = new WeakSet();
const job = { id: 7 };
processed.add(job);
console.log('¿procesado? →', processed.has(job));    // true
```
