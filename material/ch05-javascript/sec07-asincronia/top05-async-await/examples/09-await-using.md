---
example_description: "Nuevo (Chrome 134): await using llama y ESPERA al [Symbol.asyncDispose]() del recurso al salir del bloque, en orden inverso y también si hay un error; es el async with de Python y la versión asíncrona del using del módulo 6"
example_tags: "javascript|python|async|await-using|symbol-asyncdispose|limpieza|nuevo"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// ⚠️ NUEVO: «await using» y Symbol.asyncDispose llegaron a Chrome en la
// versión 134 (2025), junto con el using del módulo 6 (lección «Symbol»).
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Un recurso cuya limpieza es ASÍNCRONA: cerrar una conexión espera a que el
// servidor confirme. Su método [Symbol.asyncDispose]() devuelve una promesa.
async function openConnection(name) {
  await wait(20);
  console.log(`  🔌 abro ${name}`);
  return {
    async query(sql) {
      await wait(20);
      if (sql.includes('DROP')) throw new Error(`consulta prohibida en ${name}`);
      return `${name} ← ${sql}`;
    },
    async [Symbol.asyncDispose]() {
      await wait(20);
      console.log(`  🔌 cierro ${name} (confirmado por el servidor)`);
    },
  };
}

async function monthlyReport() {
  await using sales = await openConnection('ventas');
  await using stock = await openConnection('inventario');
  console.log('  consulta →', await sales.query('total de octubre'));
  console.log('  consulta →', await stock.query('productos agotados'));
  return 'informe listo';
} // ← aquí se cierran y se ESPERA a cada cierre, en orden inverso

async function dangerousReport() {
  await using sales = await openConnection('ventas');
  await sales.query('DROP TABLE pedidos');
}

async function main() {
  console.log('▶ salida normal');
  console.log('  resultado →', await monthlyReport()); // ya cerradas al llegar aquí

  console.log('▶ con un error');
  try {
    await dangerousReport();
  } catch (error) {
    console.log('  ⛔', error.message, '(la conexión ya estaba cerrada)');
  }
}
main();

// await using solo vale dentro de funciones async (y en el nivel superior de
// los módulos). Si el objeto solo tiene [Symbol.dispose] (síncrono), await
// using también lo usa. Para agrupar varias limpiezas existe
// AsyncDisposableStack, el primo asíncrono de DisposableStack.
// > Desde Python: es async with; [Symbol.asyncDispose]() hace de __aexit__.
//   AsyncDisposableStack es contextlib.AsyncExitStack.
```
