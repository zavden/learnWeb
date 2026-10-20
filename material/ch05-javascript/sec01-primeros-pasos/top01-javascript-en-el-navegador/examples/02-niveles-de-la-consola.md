---
example_description: "log, info, warn, error y debug: niveles de mensaje y filtros de la consola"
example_tags: "javascript|consola|depuracion"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Cada método escribe con un nivel distinto. Usa los botones
// All / Log / Info / Warn / Error de la consola para filtrar por nivel.
console.log('log: un mensaje normal');
console.info('info: un dato informativo');
console.warn('warn: algo raro, pero el programa sigue');
console.error('error: algo ha ido mal');

// debug: en LearnWeb aparece junto a los Log;
// en Chrome va al nivel «Verbose», oculto por defecto.
console.debug('debug: detalle para depurar');

// console.error solo ESCRIBE en rojo: no lanza ningún error ni detiene nada.
console.log('Sigo ejecutándome después de console.error');

// Si imprimes lo mismo varias veces desde la misma línea,
// la consola lo agrupa con un contador en lugar de repetirlo.
// (for repite el bloque 3 veces: lo verás en «Control de flujo».)
for (let i = 0; i < 3; i++) {
  console.log('mensaje repetido');
}
```
