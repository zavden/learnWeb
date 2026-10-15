---
example_description: "Un callback de tipo (id: string) => void puede devolver un valor sin error (por eso forEach acepta (id) => ids.push(id)), y ese valor existe aunque el tipo diga void; en cambio, una función declarada con retorno void no puede devolver nada (TS2322)"
example_tags: "typescript|funciones|callbacks|void|ts2322|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// Un tipo de callback que «no devuelve nada»:
type OnSaved = (id: string) => void;

const savedIds: string[] = [];

// 🐛 push devuelve un number (la nueva longitud)… y no hay error: un callback
//    void PUEDE devolver un valor. Quien lo llama promete ignorarlo.
const remember: OnSaved = (id) => savedIds.push(id);

function save(id: string, onSaved: OnSaved): void {
  onSaved(id);
}
save('P-2001', remember);

// Gracias a esa regla, esto funciona (forEach espera un callback void):
['P-2002', 'P-2003'].forEach((id) => savedIds.push(id));
console.log('savedIds →', savedIds);

// 🐛 La otra cara: el valor existe en ejecución aunque el tipo diga void.
const result = remember('P-2004');
console.log('🐛 result →', result, '| typeof →', typeof result);

// En cambio, una función DECLARADA con retorno void no puede devolver nada:
function logSaved(id: string): void {
  console.log('guardado →', id);
  return savedIds.length; // ❌ Error TS2322 a propósito: el retorno es void
}
logSaved('P-2005');
// Regla: no uses nunca el resultado de una función cuyo tipo de retorno es void.
```
