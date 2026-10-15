---
example_description: "Un tipo mapeado { [K in keyof T]: … } recorre las claves de un tipo y crea otro con las mismas claves: del formulario de reserva salen el estado «tocado» (booleanos) y los mensajes de error (string | null)"
example_tags: "typescript|tipos-mapeados|keyof|formularios|genericos"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type BookingForm = { guest: string; email: string; party: number };

// «Para cada clave K de T, una propiedad K de tipo …»: un bucle for…in, pero de tipos.
type Touched<T> = { [K in keyof T]: boolean };
type FieldErrors<T> = { [K in keyof T]: string | null };
// T[K] da acceso al tipo original de cada propiedad:
type Drafts<T> = { [K in keyof T]: T[K] | '' }; // cada campo puede estar vacío

type Checks = [
  Expect<Equal<Touched<BookingForm>, { guest: boolean; email: boolean; party: boolean }>>,
  Expect<Equal<FieldErrors<BookingForm>, { guest: string | null; email: string | null; party: string | null }>>,
  Expect<Equal<Drafts<BookingForm>, { guest: string; email: string; party: number | '' }>>,
];

// Si BookingForm gana un campo (phone), los tres tipos lo incluyen solos,
// y los objetos de abajo darían error hasta que se les añada.
const draft: Drafts<BookingForm> = { guest: 'Carmen Vidal', email: '', party: '' };
const touched: Touched<BookingForm> = { guest: true, email: true, party: false };
const errors: FieldErrors<BookingForm> = {
  guest: null,
  email: draft.email === '' ? 'Escribe tu correo' : null,
  party: null,
};

// Object.keys devuelve string[] (en ejecución podría haber más claves): de ahí el as.
for (const field of Object.keys(errors) as (keyof BookingForm)[]) {
  if (touched[field] && errors[field]) console.log(`⚠️ ${field}: ${errors[field]}`);
}
console.log('tocados →', touched);
```
