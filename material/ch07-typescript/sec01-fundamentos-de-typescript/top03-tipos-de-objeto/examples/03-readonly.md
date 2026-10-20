---
example_description: "readonly impide reasignar una propiedad (TS2540), pero solo mientras escribes: en ejecución la asignación funciona. Y es superficial: un array readonly como propiedad se puede seguir cambiando por dentro, salvo con readonly string[]"
example_tags: "typescript|objetos|readonly|inmutabilidad|ts2540|ts2339|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Ticket = {
  readonly code: string; // no se puede reasignar
  readonly visitors: string[]; // la PROPIEDAD es readonly; el array, no
  room: string;
};

const ticket: Ticket = { code: 'MUNAL-2026-0815', visitors: ['Ana'], room: 'Sala 1' };
ticket.room = 'Sala 3'; // ✅ room no es readonly

// 🐛 1. readonly solo existe para el verificador: el error sale en rojo…
ticket.code = 'FALSO-0001'; // ❌ Error TS2540 a propósito: code es de solo lectura
console.log('🐛 code →', ticket.code); // …y la asignación se ejecuta igual

// 🐛 2. readonly es superficial: protege la propiedad, no lo que hay dentro.
ticket.visitors = []; // ❌ Error TS2540 a propósito: no se puede reasignar…
ticket.visitors.push('Bruno'); // …pero cambiar el array por dentro sí: sin error
console.log('🐛 visitors →', ticket.visitors);

// ✅ readonly string[] protege también el contenido (mientras escribes):
type SafeTicket = { readonly code: string; readonly visitors: readonly string[] };
const safe: SafeTicket = { code: 'MUNAL-2026-0816', visitors: ['Carmen'] };
safe.visitors.push('Diego'); // ❌ Error TS2339 a propósito: push no existe en readonly string[]

// ✅ Para protegerlo también en ejecución: Object.freeze (capítulo 5), que
//    TypeScript entiende y marca como solo lectura.
const frozen = Object.freeze({ code: 'MUNAL-2026-0817', room: 'Sala 2' });
try {
  frozen.room = 'Sala 9'; // ❌ Error TS2540 a propósito: y en ejecución, un TypeError
} catch (error) {
  console.log('✅ en ejecución →', String(error));
}
console.log('✅ frozen.room →', frozen.room);
```
