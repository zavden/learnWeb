---
example_description: "Un tipo condicional T extends U ? X : Y elige un tipo según otro: InputKind<T> da 'checkbox', 'number' o 'text' según el tipo de cada campo, y combinado con un tipo mapeado deduce el tipo de input de todo un formulario"
example_tags: "typescript|tipos-condicionales|tipos-mapeados|extends|formularios"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// «Si T es asignable a boolean, 'checkbox'; si no, si es number, 'number'; si no, 'text'.»
type InputKind<T> = T extends boolean ? 'checkbox' : T extends number ? 'number' : 'text';

type Checks1 = [
  Expect<Equal<InputKind<boolean>, 'checkbox'>>,
  Expect<Equal<InputKind<number>, 'number'>>,
  Expect<Equal<InputKind<string>, 'text'>>,
  Expect<Equal<InputKind<Date>, 'text'>>, // todo lo demás cae en la última rama
];

// Con un tipo mapeado: el tipo de input de cada campo de un modelo.
type FormInputs<T> = { [K in keyof T]: InputKind<T[K]> };

type Reservation = { guest: string; party: number; terrace: boolean; notes: string };
type ReservationInputs = FormInputs<Reservation>;
// → { guest: 'text'; party: 'number'; terrace: 'checkbox'; notes: 'text' }

type Checks2 = [
  Expect<Equal<ReservationInputs, { guest: 'text'; party: 'number'; terrace: 'checkbox'; notes: 'text' }>>,
];

// El objeto que describe el formulario solo admite el tipo correcto para cada campo:
const INPUTS: ReservationInputs = { guest: 'text', party: 'number', terrace: 'checkbox', notes: 'text' };
// party: 'text' sería un error: un campo number debe ser un input 'number'.

for (const [field, kind] of Object.entries(INPUTS)) {
  console.log(`<input type="${kind}" name="${field}">`);
}
```
