---
example_description: "Un parámetro de tipo con valor por defecto (<T = string>) se usa cuando no hay argumento del que deducirlo; si lo hay, gana la inferencia, y siempre se puede escribir explícito"
example_tags: "typescript|genericos|valores-por-defecto|inferencia|formularios"
example_stage: minimal
example_importance: useful
console: true
---

# TypeScript

```typescript
// Un campo de formulario: la mayoría guardan texto, así que T vale string si nadie dice otra cosa.
type Field<T = string> = { label: string; value: T | null; touched: boolean };

function createField<T = string>(label: string, initial: T | null = null): Field<T> {
  return { label, value: initial, touched: false };
}

// Sin valor inicial no hay de dónde deducir T: se usa el valor por defecto.
const guestName = createField('Nombre'); // Field<string>
// Con valor inicial, la inferencia gana al valor por defecto.
const partySize = createField('Personas', 2); // Field<number>
// Y siempre se puede decir explícitamente.
const terrace = createField<boolean>('Terraza'); // Field<boolean>

guestName.value = 'Carmen Vidal'; // string ✅
partySize.value = 4; // number ✅
terrace.value = true; // boolean ✅
// guestName.value = 4 sería un error TS2322: el campo es Field<string>.

// En los tipos, el valor por defecto ahorra escribir <string> en el caso común.
const notes: Field = { label: 'Notas', value: 'cumpleaños', touched: true }; // Field<string>

for (const field of [guestName, partySize, terrace, notes]) {
  console.log(`${field.label} → ${String(field.value)} (${typeof field.value})`);
}
```
