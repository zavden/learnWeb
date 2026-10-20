---
example_description: "Readonly es superficial (push en un array anidado compila); un tipo recursivo DeepReadonly<T> se aplica a sí mismo en cada nivel y convierte esos cambios en errores (TS2339, TS2540)… pero solo al verificar: en ejecución hace falta deepFreeze"
example_tags: "typescript|tipos-recursivos|readonly|tipos-mapeados|tipos-condicionales|freeze|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
type Album = {
  title: string;
  tracks: { name: string; seconds: number }[];
  label: { name: string; country: string };
};

// 🐛 Readonly (y readonly, módulo 1) solo protege el primer nivel:
const shallow: Readonly<Album> = {
  title: 'Re',
  tracks: [{ name: 'El aparato', seconds: 254 }],
  label: { name: 'WEA', country: 'MX' },
};
shallow.tracks.push({ name: 'La ingrata', seconds: 213 }); // sin error de tipos
console.log('🐛 Readonly →', shallow.tracks.length, 'pistas');

// ✅ Un tipo recursivo: en cada propiedad que es un objeto (o array), se aplica a sí mismo.
type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };

const deep: DeepReadonly<Album> = shallow;
deep.tracks.push({ name: 'Las flores', seconds: 230 }); // ❌ Error TS2339 a propósito: el array es readonly
deep.label.country = 'ES'; // ❌ Error TS2540 a propósito: también en el segundo nivel

// …pero los tipos se borran: en ejecución las dos líneas anteriores funcionaron.
console.log('⚠️ DeepReadonly →', deep.tracks.length, 'pistas,', deep.label.country);

// Para impedirlo DE VERDAD, deepFreeze (capítulo 5), con el tipo que describe lo que hace:
function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>; // TypeScript no puede comprobar que freeze hace lo mismo
}
const frozen = deepFreeze({ title: 'Amor prohibido', tracks: [{ name: 'Fotos y recuerdos', seconds: 220 }] });
try {
  (frozen.tracks as { name: string; seconds: number }[]).push({ name: 'No me queda más', seconds: 210 });
} catch (error) {
  console.log('✅ deepFreeze →', String(error));
}
```
