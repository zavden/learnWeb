---
example_description: "Estrechar con igualdad: === null quita null, != null quita null y undefined a la vez; typeof x === 'object' NO quita null (typeof null es 'object') y TypeScript lo sabe: TS18047"
example_tags: "typescript|estrechamiento|narrowing|null|undefined|typeof|ts18047|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
type Contact = { email: string };

// 🐛 typeof null === 'object' (capítulo 5). TypeScript lo sabe: dentro de
//    este if, contact sigue pudiendo ser null.
function emailOf(contact: Contact | null | undefined): string {
  if (typeof contact === 'object') {
    return contact.email; // ❌ Error TS18047 a propósito: contact puede ser null
  }
  return 'sin contacto';
}
console.log('objeto →', emailOf({ email: 'ana@example.com' }));
try {
  console.log(emailOf(null));
} catch (error) {
  console.log('⛔ null →', String(error));
}

// ✅ != null descarta null Y undefined a la vez (la única excepción razonable
//    a usar siempre ===). Dentro del if, contact es Contact.
function emailOfFixed(contact: Contact | null | undefined): string {
  if (contact != null) return contact.email;
  return 'sin contacto';
}
console.log('✅', emailOfFixed(null), '|', emailOfFixed(undefined), '|', emailOfFixed({ email: 'ivan@example.com' }));

// === estrecha también entre valores concretos:
function shippingLabel(zone: 'local' | 'nacional' | null): string {
  if (zone === null) return 'sin zona';
  if (zone === 'local') return 'entrega hoy';
  return 'entrega en 3 días'; // aquí zone solo puede ser 'nacional'
}
console.log(shippingLabel('local'), '|', shippingLabel('nacional'), '|', shippingLabel(null));
```
