---
example_description: "Nuevo (Chrome 134): una declaración using llama al [Symbol.dispose]() del valor al salir del bloque, en orden inverso y también si hay un error; el with de Python y lo que se escribía con try/finally"
example_tags: "javascript|python|symbol|using|symbol-dispose|limpieza|nuevo"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// ⚠️ NUEVO: «using» y Symbol.dispose llegaron a Chrome en la versión 134 (2025).
// Un objeto «desechable» tiene un método [Symbol.dispose](): su limpieza.
function openConnection(name) {
  console.log(`  🔌 abro ${name}`);
  return {
    query(sql) {
      return `${name} ← ${sql}`;
    },
    [Symbol.dispose]() {
      console.log(`  🔌 cierro ${name}`);
    },
  };
}

// using declara una constante y promete llamar a su [Symbol.dispose]() al
// salir del bloque, pase lo que pase.
function monthlyReport() {
  using sales = openConnection('ventas');
  using stock = openConnection('inventario');
  console.log('  consulta →', sales.query('total de octubre'));
  console.log('  consulta →', stock.query('productos agotados'));
  return 'informe listo';
} // ← aquí se cierran, en orden INVERSO: primero inventario, después ventas

console.log('▶ salida normal');
console.log('  resultado →', monthlyReport());

console.log('▶ con un error');
function failingReport() {
  using sales = openConnection('ventas');
  throw new Error('la consulta tardó demasiado');
}
try {
  failingReport();
} catch (error) {
  console.log('  ⛔', error.message, '(la conexión ya estaba cerrada)');
}

// Lo que using te ahorra: el try/finally de toda la vida.
console.log('▶ lo mismo con try/finally');
const sales = openConnection('ventas');
try {
  console.log('  consulta →', sales.query('total de octubre'));
} finally {
  sales[Symbol.dispose]();
}

// En un script clásico, using solo vale dentro de un bloque o de una función:
// en el nivel superior es un SyntaxError (en los módulos, sí se permite).

// > Desde Python: es el with. [Symbol.dispose]() hace de __exit__; no hay
//   __enter__: la variable recibe el propio objeto. Para limpiezas asíncronas
//   existen await using y Symbol.asyncDispose (módulo de asincronía).
```
