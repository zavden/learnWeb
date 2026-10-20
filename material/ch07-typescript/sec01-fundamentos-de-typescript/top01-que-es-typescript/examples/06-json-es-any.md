---
example_description: "JSON.parse devuelve any: TypeScript acepta cualquier anotación sobre los datos que llegan de fuera sin comprobar nada; un total que llega como texto rompe en ejecución sin ningún error rojo. Los tipos no validan datos"
example_tags: "typescript|json|any|borrado-de-tipos|validacion|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Order = { id: string; total: number };

// Los datos de fuera (fetch, localStorage, un archivo) llegan como texto.
// Aquí, un pedido cuyo total llega como string por un fallo del servidor:
const body = '{"id": "P-1042", "total": "350.50"}';

// 🐛 JSON.parse devuelve any: TypeScript acepta la anotación Order SIN comprobar
// nada, porque no puede saber qué texto llegará cuando el código se ejecute.
const order: Order = JSON.parse(body);
console.log('typeof order.total →', typeof order.total); // el tipo dice number…

try {
  console.log(order.total.toFixed(2)); // …sin rojo en el editor, y falla al ejecutar
} catch (error) {
  console.log('⛔', String(error));
}

// ✅ Convierte y comprueba en la frontera, al recibir los datos:
const raw = JSON.parse(body);
const total = Number(raw.total);
if (typeof raw.id === 'string' && Number.isFinite(total)) {
  const safeOrder: Order = { id: raw.id, total };
  console.log('✅', safeOrder.id, '→', safeOrder.total.toFixed(2));
}

// Los tipos describen lo que ESPERAS, no lo que llega. Validar datos de fuera
// a fondo es el tema del módulo 2, lección 6.
```
