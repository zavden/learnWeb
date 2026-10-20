---
example_description: "Con strictNullChecks, null y undefined son tipos aparte: find devuelve Guest | undefined (TS18048 al usarlo directamente) y un campo string | null exige descartar null; soluciones: un if, ?. con ??, y el ! que no comprueba nada"
example_tags: "typescript|python|null|undefined|strictnullchecks|optional-chaining|ts18048"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// phone puede faltar: string | null se lee «string o null».
type Guest = { name: string; phone: string | null };

const guests: Guest[] = [
  { name: 'Ana Ruiz', phone: '55 1234 5678' },
  { name: 'Iván Soto', phone: null },
];

// find puede no encontrar a nadie: su tipo es Guest | undefined.
const guest = guests.find((g) => g.name === 'Eva Luna');
try {
  console.log(guest.name); // ❌ Error TS18048 a propósito: guest puede ser undefined
} catch (error) {
  console.log('⛔', String(error));
}

// ✅ a) Comprueba antes de usar: dentro del if, guest ya es Guest.
if (guest !== undefined) {
  console.log('✅ a)', guest.name);
} else {
  console.log('✅ a) no hay ninguna reserva para Eva Luna');
}

// ✅ b) ?. corta en null/undefined y ?? pone un valor por defecto:
console.log('✅ b)', guest?.name ?? 'sin reserva');
for (const { name, phone } of guests) {
  console.log(`   ${name}: ${phone?.replaceAll(' ', '') ?? 'sin teléfono'}`);
}

// ✅ c) ! le dice a TypeScript «no es null ni undefined, créeme». No comprueba
//    nada en ejecución: si te equivocas, el TypeError vuelve (lección 5).
const ana = guests.find((g) => g.name === 'Ana Ruiz')!;
console.log('✅ c)', ana.name);

// > Desde Python: phone: Optional[str] (o str | None); mypy también obliga a
//   descartar None antes de usar el valor.
```
