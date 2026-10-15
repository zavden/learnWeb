---
example_description: "Funciones flecha: cuerpo de expresión con return implícito (la lambda de Python) y cuerpo de bloque con return explícito"
example_tags: "javascript|python|funciones|flecha|lambda"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una función flecha es una expresión de función más corta: (parámetros) => cuerpo.

// 1) CUERPO DE EXPRESIÓN (sin llaves): devuelve el valor de la expresión.
//    Es el «return implícito», igual que una lambda de Python.
const double = (x) => x * 2;           // lambda x: x * 2
const add = (a, b) => a + b;           // lambda a, b: a + b
const greet = () => 'Hola';            // lambda: 'Hola'   (sin parámetros: paréntesis vacíos)

console.log('double(21) →', double(21)); // 42
console.log('add(2, 3) →', add(2, 3));   // 5
console.log('greet() →', greet());       // 'Hola'

// Con un solo parámetro los paréntesis son opcionales (x => x * 2);
// en el curso los escribimos siempre.

// 2) CUERPO DE BLOQUE (con llaves): una función normal con varias sentencias.
//    Aquí NO hay return implícito: si quieres devolver algo, escribe return.
const priceWithVat = (netCents) => {
  const vatCents = Math.round(netCents * 0.21);
  console.log(`  IVA de ${netCents} → ${vatCents}`);
  return netCents + vatCents;
};
console.log('priceWithVat(1000) →', priceWithVat(1000)); // 1210

// Una lambda de Python solo admite UNA expresión; una flecha con llaves
// admite todo lo que admitiría un def.

// Donde más brillan es como callbacks, escritas en el mismo sitio donde se usan:
const prices = [1200, 450, 3000];
console.log('el doble →', prices.map((cents) => double(cents)));
console.log('> 1000 →', prices.filter((cents) => cents > 1000));

// Como las expresiones de función, toman el nombre de la variable.
console.log('double.name →', double.name); // 'double'
```
