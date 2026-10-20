---
example_description: "Una tupla [string, number] admite push sin error de tipos (es un array en ejecución) aunque leer la posición nueva sí sea TS2493; una tupla readonly quita push, pop y compañía (y readonly solo existe para el verificador)"
example_tags: "typescript|tuplas|readonly|push|ts2493|ts2339|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// Hora de una visita guiada y plazas libres.
const slot: [string, number] = ['10:30', 4];

// 🐛 push está permitido en una tupla: TypeScript solo vigila la asignación
//    y las posiciones, no los métodos que cambian la longitud.
slot.push(99);
console.log('slot →', slot, '| length →', slot.length);

// …y el tipo sigue diciendo «2 elementos»: leer la posición nueva es un error.
console.log('slot[2] →', slot[2]); // ❌ Error TS2493 a propósito: la tupla tiene longitud 2

// ✅ Una tupla readonly no tiene push, pop, splice ni asignación por posición.
const nextSlot: readonly [string, number] = ['12:00', 2];
nextSlot.push(99); // ❌ Error TS2339 a propósito: push no existe en una tupla readonly
nextSlot[1] = 0; // ❌ Error TS2540 a propósito: las posiciones son de solo lectura

// readonly es una comprobación de TypeScript, no de JavaScript: con el
// error en rojo, el código se ejecuta y el array cambia igual.
console.log('nextSlot →', nextSlot);
```
