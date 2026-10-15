---
example_description: "Resumen de un log de servidor: for…of con continue, contadores con ??, switch por nivel y líneas corruptas"
example_tags: "javascript|integracion|bucles|switch|nullish|console.table"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Integra: for…of y continue (lección 6), contadores con ?? (5), switch (6),
// validación (7) y console.table (1).
// slice e indexOf son métodos de string; los objetos con claves dinámicas
// (counts[level]) se estudian en «Números, texto y colecciones».

const logLines = [
  '2026-10-12 09:14:03 INFO Servidor iniciado en el puerto 3000',
  '2026-10-12 09:14:05 INFO Conexión con la base de datos establecida',
  '2026-10-12 09:20:41 WARN Respuesta lenta en /api/productos (1840 ms)',
  '2026-10-12 09:21:10 ERROR Pago rechazado: tarjeta caducada (pedido 10231)',
  '2026-10-12 09:21:11 INFO Reintento de pago programado',
  'línea corrupta sin formato',
  '2026-10-12 09:30:00 DEBUG Caché de sesiones limpiada',
  '2026-10-12 09:45:17 ERROR Tiempo de espera agotado con el servicio de envíos',
  '',
  '2026-10-12 09:50:02 NOTICE Copia de seguridad completada',
];

const counts = {};
let errorReport = '';
let skipped = 0;
let lineNumber = 0;

for (const line of logLines) {
  lineNumber++;

  // Formato esperado: «AAAA-MM-DD hh:mm:ss NIVEL mensaje».
  // Si la línea no lo cumple, la saltamos (continue) y seguimos con la siguiente.
  if (line.length < 21 || line[4] !== '-' || line[10] !== ' ' || line[13] !== ':') {
    console.warn(`línea ${lineNumber} ignorada: formato desconocido`);
    skipped++;
    continue;
  }

  const time = line.slice(11, 19);
  const rest = line.slice(20);                // «NIVEL mensaje»
  const space = rest.indexOf(' ');
  const level = space === -1 ? rest : rest.slice(0, space);
  const message = space === -1 ? '' : rest.slice(space + 1);

  // Contador: si la clave aún no existe vale undefined, y ?? lo convierte en 0.
  counts[level] = (counts[level] ?? 0) + 1;

  switch (level) {
    case 'ERROR':
      errorReport += `  ${time} ${message}\n`;
      break;
    case 'WARN':
    case 'INFO':
    case 'DEBUG':
      break; // niveles conocidos: solo se cuentan
    default:
      console.warn(`línea ${lineNumber}: nivel desconocido «${level}»`);
  }
}

console.log('Mensajes por nivel:');
console.table(counts);
console.log(`Errores a revisar:\n${errorReport}`);
console.log(`Líneas leídas: ${lineNumber} | ignoradas: ${skipped}`);
```
