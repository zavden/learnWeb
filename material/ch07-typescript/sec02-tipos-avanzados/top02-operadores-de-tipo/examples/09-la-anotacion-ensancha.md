---
example_description: "Una anotación como Record<string, Zone> ensancha el tipo de la variable: se pierden las claves concretas, una errata (annotated.nacional) compila y falla al ejecutar. Con satisfies, la misma errata es TS2551 con «Did you mean 'national'?»"
example_tags: "typescript|satisfies|anotaciones|record|keyof|ts2551|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Zone = { label: string; cost: number };

// 🐛 Con una anotación, el tipo de la variable ES Record<string, Zone>:
// TypeScript olvida que las claves son exactamente local y national.
const annotated: Record<string, Zone> = {
  local: { label: 'Ciudad de México', cost: 69 },
  national: { label: 'Resto del país', cost: 189 },
};
type AnnotatedKey = keyof typeof annotated; // → string: cualquier texto es una clave válida

try {
  console.log(annotated.nacional.cost); // errata sin rojo…
} catch (error) {
  console.log('🐛 anotación →', String(error)); // …y falla al ejecutar
}

// ✅ Con satisfies se comprueba lo mismo, y el tipo conserva las claves:
const checked = {
  local: { label: 'Ciudad de México', cost: 69 },
  national: { label: 'Resto del país', cost: 189 },
} satisfies Record<string, Zone>;
type CheckedKey = keyof typeof checked; // → 'local' | 'national'

try {
  console.log(checked.nacional.cost); // ❌ Error TS2551 a propósito: la errata se detecta
} catch (error) {
  console.log('⚠️ satisfies → el mismo fallo, pero avisado en rojo:', String(error));
}
console.log('✅ national →', checked.national.cost);
```
