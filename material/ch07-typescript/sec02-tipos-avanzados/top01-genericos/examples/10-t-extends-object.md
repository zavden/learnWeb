---
example_description: "T extends object no significa «objeto con propiedades»: deja pasar arrays, funciones y fechas, y la función da resultados absurdos. Record<string, unknown> los rechaza (TS2345), aunque también rechaza los tipos declarados con interface"
example_tags: "typescript|genericos|restricciones|object|record|ts2345|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// Cuántos campos de un registro están rellenos (para una barra de «perfil completo»).
function filledFields<T extends object>(record: T): string {
  const values: unknown[] = Object.values(record);
  const filled = values.filter((value) => value !== '' && value != null).length;
  return `${filled}/${values.length}`;
}

const profile = { fullName: 'Ana Ruiz', phone: '', city: 'Puebla' };
console.log('perfil →', filledFields(profile)); // 2/3

// 🐛 object es «cualquier cosa que no sea un primitivo»: arrays, funciones y fechas también.
console.log('🐛 array →', filledFields(['Ana Ruiz', '', 'Puebla'])); // cuenta posiciones
console.log('🐛 función →', filledFields(() => 'Ana Ruiz'));
console.log('🐛 fecha →', filledFields(new Date('2026-10-14T12:00:00Z')));

// ✅ Record<string, unknown> pide un objeto con claves de texto: los demás no encajan.
function filledFieldsStrict<T extends Record<string, unknown>>(record: T): string {
  return filledFields(record);
}
console.log('✅ perfil →', filledFieldsStrict(profile));
filledFieldsStrict(['Ana Ruiz', '', 'Puebla']); // ❌ Error TS2345 a propósito: un array no es un registro

// ⚠️ Pega: un tipo declarado con interface tampoco encaja (no tiene firma de índice
// implícita). Con type sí. Si tus datos usan interface, conserva object y comprueba
// Array.isArray / typeof === 'function' en ejecución.
interface Profile {
  fullName: string;
  city: string;
}
const saved: Profile = { fullName: 'Iván Soto', city: 'Mérida' };
filledFieldsStrict(saved); // ❌ Error TS2345 a propósito: interface sin firma de índice
```
