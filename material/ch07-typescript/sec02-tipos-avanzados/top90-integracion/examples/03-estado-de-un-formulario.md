---
example_description: "El formulario de una visita escolar al museo, con su estado calculado a partir de un solo tipo: RawForm<T> (condicional: casillas → boolean, el resto → texto), Touched<T> y FieldErrors<T> (mapeados), validadores por campo con su tipo exacto, y un byId genérico que estrecha con instanceof"
example_tags: "typescript|integracion|tipos-mapeados|tipos-condicionales|tipos-de-utilidad|formularios|dom|genericos|accesibilidad"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main class="app">
  <h1>Visita escolar al museo</h1>
  <form id="visit-form" class="card" novalidate>
    <div class="field"><label for="school">Escuela</label><input id="school" autocomplete="organization" aria-describedby="school-error"><p id="school-error" class="error"></p></div>
    <div class="field"><label for="email">Correo de contacto</label><input id="email" type="email" autocomplete="email" aria-describedby="email-error"><p id="email-error" class="error"></p></div>
    <div class="row">
      <div class="field"><label for="students">Alumnos</label><input id="students" type="number" min="5" max="40" value="25" aria-describedby="students-error"><p id="students-error" class="error"></p></div>
      <div class="field"><label for="date">Fecha</label><input id="date" type="date" value="2026-11-03" aria-describedby="date-error"><p id="date-error" class="error"></p></div>
    </div>
    <p class="check"><input id="guided" type="checkbox"><label for="guided">Con visita guiada ($25 por alumno)</label></p>
    <button id="submit" type="submit" class="primary">Reservar</button>
  </form>
  <ol id="log" class="log" aria-label="Registro" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --accent: #1d4ed8; --danger: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.app { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
.card { padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--line); border-radius: 0.75rem; }
.row { display: flex; flex-wrap: wrap; gap: 0 1rem; }
.field { display: grid; gap: 0.15rem; }
input, button { font: inherit; }
input:not([type="checkbox"]) { padding: 0.3rem 0.45rem; border: 1px solid var(--line); border-radius: 0.4rem; }
[aria-invalid="true"] { border: 2px solid var(--danger); }
.error { min-height: 1.3em; margin: 0; color: var(--danger); font-size: 0.85rem; font-weight: 600; }
.check { display: flex; gap: 0.5rem; align-items: center; }
button.primary { padding: 0.4rem 0.9rem; border: 1px solid var(--accent); border-radius: 0.5rem; background: var(--accent); color: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── Un solo tipo, y todo lo demás calculado a partir de él ────────────────
type GroupVisit = { school: string; email: string; students: number; date: string; guided: boolean };
type Field = keyof GroupVisit;
type RawForm<T> = { [K in keyof T]: T[K] extends boolean ? boolean : string }; // lo que dan los controles
type Touched<T> = { [K in keyof T]: boolean };
type FieldErrors<T> = Partial<Record<keyof T, string>>;
type Validators<T> = { [K in keyof T]?: (value: RawForm<T>[K]) => string | null };

const LABELS = { school: 'Escuela', email: 'Correo', students: 'Alumnos', date: 'Fecha', guided: 'Visita guiada' } satisfies Record<Field, string>;
const FIELDS = Object.keys(LABELS) as Field[]; // Object.keys da string[]: as

function isOpenDay(text: string): boolean {
  const day = new Date(`${text}T12:00:00Z`);
  return text >= '2026-11-01' && text <= '2026-12-19' && day.getUTCDay() !== 1; // sin lunes
}
const VALIDATORS: Validators<GroupVisit> = {
  school: (value) => (value.trim().length >= 3 ? null : 'Escribe el nombre de la escuela'),
  email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Escribe un correo como direccion@escuela.mx'),
  students: (value) => (/^\d+$/.test(value) && Number(value) >= 5 && Number(value) <= 40 ? null : 'De 5 a 40 alumnos'),
  date: (value) => (isOpenDay(value) ? null : 'Abrimos de martes a domingo, del 1 de noviembre al 19 de diciembre'),
};
// K genérico: TypeScript relaciona VALIDATORS[K] con raw[K] (los dos salen de las mismas claves).
function runValidator<K extends Field>(field: K, raw: RawForm<GroupVisit>): string | null {
  const check = VALIDATORS[field];
  return check ? check(raw[field]) : null;
}

// ── El DOM: un byId genérico que estrecha con instanceof ──────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const inputs = {
  school: byId('school', HTMLInputElement), email: byId('email', HTMLInputElement),
  students: byId('students', HTMLInputElement), date: byId('date', HTMLInputElement), guided: byId('guided', HTMLInputElement),
} satisfies Record<Field, HTMLInputElement>;
const logList = byId('log', HTMLOListElement);

const readForm = (): RawForm<GroupVisit> => ({
  school: inputs.school.value, email: inputs.email.value, students: inputs.students.value,
  date: inputs.date.value, guided: inputs.guided.checked,
});
const touched: Touched<GroupVisit> = { school: false, email: false, students: false, date: false, guided: false };

function render(): FieldErrors<GroupVisit> {
  const raw = readForm();
  const errors: FieldErrors<GroupVisit> = {};
  for (const field of FIELDS) {
    const message = runValidator(field, raw);
    if (message !== null) errors[field] = message;
    const shown = touched[field] ? errors[field] ?? '' : '';
    const output = document.getElementById(`${field}-error`);
    if (output) output.textContent = shown;
    inputs[field].setAttribute('aria-invalid', String(shown !== ''));
  }
  return errors;
}
function report(message: string): void {
  console.log(message);
  logList.append(Object.assign(document.createElement('li'), { textContent: message }));
}

byId('visit-form', HTMLFormElement).addEventListener('focusout', (event) => {
  const field = FIELDS.find((name) => inputs[name] === event.target); // estrecha a Field
  if (field) {
    touched[field] = true;
    render();
  }
});
byId('submit', HTMLButtonElement).addEventListener('click', (event) => {
  event.preventDefault(); // un clic (no submit): funciona también en las tarjetas aisladas
  for (const field of FIELDS) touched[field] = true;
  const errors = render();
  const wrong = FIELDS.filter((field) => errors[field] !== undefined);
  if (wrong.length > 0) {
    inputs[wrong[0] ?? 'school'].focus();
    report(`⚠️ ${wrong.length} campo(s) por corregir: ${wrong.map((field) => LABELS[field]).join(', ')}`);
    return;
  }
  const raw = readForm();
  const visit: GroupVisit = { ...raw, school: raw.school.trim(), students: Number(raw.students) };
  const price = visit.guided ? `con visita guiada ($${(visit.students * 25).toFixed(2)})` : 'sin visita guiada';
  report(`✅ ${visit.school} · ${visit.students} alumnos · ${visit.date} · ${price}`);
});

render();
console.log('Listo: rellena el formulario (los errores salen al dejar cada campo) y pulsa «Reservar»');
```
