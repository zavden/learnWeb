---
example_description: "Varias utilidades juntas para el estado de un formulario: los valores como Record<keyof SignupForm, string> (todo llega como texto), los errores como Partial<Record<…>> (solo los campos con error) y un update que recibe un Partial de los valores"
example_tags: "typescript|tipos-de-utilidad|record|partial|keyof|formularios|validacion"
example_stage: intermediate
example_importance: important
console: true
---

# TypeScript

```typescript
// El formulario de alta de una suscripción de café.
type SignupForm = { fullName: string; email: string; bags: number };
type Field = keyof SignupForm; // 'fullName' | 'email' | 'bags'

// Los inputs siempre dan texto: un string por campo, todos presentes.
type FormValues = Record<Field, string>;
// Errores: solo los campos que fallan (Partial), cada uno con su mensaje.
type FormErrors = Partial<Record<Field, string>>;
type FormState = { readonly values: FormValues; readonly errors: FormErrors; readonly valid: boolean };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.fullName.trim() === '') errors.fullName = 'Escribe tu nombre';
  if (!values.email.includes('@')) errors.email = 'El correo necesita una @';
  const bags = Number(values.bags);
  if (!Number.isInteger(bags) || bags < 1 || bags > 6) errors.bags = 'Entre 1 y 6 bolsas';
  return errors;
}

// Un cambio trae solo los campos que se tocaron: Partial de los valores.
function update(state: FormState, changes: Partial<FormValues>): FormState {
  const values = { ...state.values, ...changes };
  const errors = validate(values);
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

function report(state: FormState): string {
  const fields = Object.keys(state.errors) as Field[];
  return state.valid ? '✅ listo para enviar' : fields.map((field) => `⚠️ ${field}: ${state.errors[field]}`).join(' | ');
}

const empty: FormValues = { fullName: '', email: '', bags: '1' };
let state: FormState = { values: empty, errors: validate(empty), valid: false };
console.log(report(state));
state = update(state, { fullName: 'Carmen Vidal', bags: '9' });
console.log(report(state));
state = update(state, { email: 'carmen@example.com', bags: '2' });
console.log(report(state));
// update(state, { phone: '…' }) sería un error: phone no es un campo de SignupForm.
```
