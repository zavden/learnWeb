---
example_description: "toString(2) de un negativo pone un signo menos en vez de sus bits; >> conserva el signo y >>> rellena con ceros; x >>> 0 convierte un resultado de 32 bits en un entero sin signo, como hace falta en un hash FNV-1a"
example_tags: "javascript|python|bits|desplazamiento|sin-signo|hash|imul"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Ayudante: los 32 bits de un número. Primero >>> 0 (sin signo) y luego toString(2).
const bits32 = (n) => (n >>> 0).toString(2).padStart(32, '0');

// toString(2) de un negativo NO enseña sus bits: escribe un signo menos.
console.log('(-8).toString(2) →', (-8).toString(2)); // '-1000'
// Los bits de verdad (complemento a dos: el bit de la izquierda a 1 = negativo):
console.log('bits de -8      →', bits32(-8));

// >> desplaza y rellena con copias del bit de signo: sigue siendo «dividir entre 2».
console.log('-8 >> 1  →', bits32(-8 >> 1), -8 >> 1);    // -4
// >>> rellena con ceros: el resultado se lee siempre sin signo (positivo).
console.log('-8 >>> 1 →', bits32(-8 >>> 1), -8 >>> 1);  // 2147483644
// Con números positivos, los dos dan lo mismo:
console.log('40 >> 3 →', 40 >> 3, '| 40 >>> 3 →', 40 >>> 3); // 5 | 5

// Caso real: FNV-1a, un hash de 32 bits para repartir clientes en 100 «cubos»
// (pruebas A/B, feature flags). Math.imul multiplica como un int32: con *
// normal, el producto pasaría de 2 ** 53 y perdería los bits de abajo.
function fnv1a(text) {
  let hash = 0x811c9dc5;
  for (const char of text) { // texto ASCII: con acentos, primero a bytes (lección 4)
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash; // 🐛 un int32: puede ser negativo
}
for (const customer of ['pago-rapido:rosa', 'pago-rapido:lucia']) {
  const hash = fnv1a(customer);
  console.log(customer, '→ hash', hash, '| 🐛 cubo', hash % 100, '| ✅ cubo', (hash >>> 0) % 100);
}
// Con lucia, el cubo -72 no existe: esa persona nunca entra en ninguna prueba.
console.log('el hash de lucia en hex →', (fnv1a('pago-rapido:lucia') >>> 0).toString(16)); // 'eefd92e8'

// Python no tiene >>> ni int32: sus >> conservan el signo y los int no se desbordan.
// Para imitar 32 bits sin signo se usa una máscara: (x * 0x01000193) & 0xffffffff.
```
