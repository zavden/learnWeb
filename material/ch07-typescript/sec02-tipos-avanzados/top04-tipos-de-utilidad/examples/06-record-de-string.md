---
example_description: "Record<string, T> promete que CUALQUIER clave existe: leer una que falta da undefined en ejecución pero T para TypeScript (noUncheckedIndexedAccess está apagado), y el fallo llega sin aviso. Partial<Record<string, T>> o un Map obligan a comprobar (TS18048)"
example_tags: "typescript|tipos-de-utilidad|record|partial|map|undefined|ts18048|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Existencias por SKU: claves de texto cualesquiera.
const stock: Record<string, number> = { 'MOL-01': 12, 'CAF-02': 0 };

// 🐛 Para TypeScript, stock['TAS-04'] es un number: Record<string, number>
// dice que TODA clave de texto tiene un número.
const missing = stock['TAS-04'];
try {
  console.log('🐛 TAS-04 →', missing.toFixed(0)); // sin rojo… y falla
} catch (error) {
  console.log('🐛 TAS-04 →', String(error));
}

// ✅ 1. Partial<Record<…>>: cada lectura es number | undefined y hay que comprobarla.
const safeStock: Partial<Record<string, number>> = { 'MOL-01': 12, 'CAF-02': 0 };
const mole = safeStock['MOL-01']; // number | undefined, aunque esta clave sí existe
console.log('MOL-01 →', mole.toFixed(0)); // ❌ Error TS18048 a propósito: TypeScript exige comprobar
const maybe = safeStock['TAS-04']; // number | undefined
console.log('✅ TAS-04 →', maybe === undefined ? 'SKU desconocido' : maybe.toFixed(0));

// ✅ 2. Un Map: get ya devuelve number | undefined, y has() pregunta sin leer.
const stockMap = new Map<string, number>([['MOL-01', 12], ['CAF-02', 0]]);
console.log('✅ MOL-01 →', stockMap.get('MOL-01') ?? 'SKU desconocido');
console.log('✅ ¿TAS-04? →', stockMap.has('TAS-04'));

// La opción noUncheckedIndexedAccess de tsconfig añade | undefined a TODAS estas lecturas
// (también a los índices de arrays). No forma parte de strict y LearnWeb no la activa.
```
