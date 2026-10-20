---
example_description: "La inscripción a un taller de cocina con validadores tipados: cada campo declara cómo se lee de FormData y qué reglas cumple (Rule<string> o Rule<number>, y TypeScript no deja mezclarlas); un resumen de errores con enlaces a cada campo, errores junto a cada control con aria-describedby y una comprobación asíncrona del usuario que cancela la anterior con AbortController"
example_tags: "typescript|profesional|formularios|validacion|tipos-mapeados|genericos|formdata|abortcontroller|fetch|accesibilidad"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Taller de cocina oaxaqueña · Inscripción</h1>
  <section id="summary" class="summary" aria-labelledby="summary-title" hidden>
    <h2 id="summary-title" tabindex="-1"></h2>
    <ul id="summary-list"></ul>
  </section>
  <form id="signup" novalidate>
    <p class="field"><label for="name">Nombre</label><input id="name" name="name" autocomplete="name" aria-describedby="name-error"><span class="error" id="name-error"></span></p>
    <p class="field"><label for="email">Correo</label><input id="email" name="email" type="email" autocomplete="email" aria-describedby="email-error"><span class="error" id="email-error"></span></p>
    <p class="field"><label for="username">Usuario (minúsculas, números y _)</label><input id="username" name="username" autocomplete="username" aria-describedby="username-status username-error"><span class="status" id="username-status" aria-live="polite"></span><span class="error" id="username-error"></span></p>
    <p class="field"><label for="seats">Plazas (1 a 4)</label><input id="seats" name="seats" type="number" min="1" max="4" value="1" aria-describedby="seats-error"><span class="error" id="seats-error"></span></p>
    <p class="field">
      <label for="level">Nivel</label>
      <select id="level" name="level" aria-describedby="level-error">
        <option value="basic">Básico</option>
        <option value="advanced">Avanzado</option>
      </select>
      <span class="error" id="level-error"></span>
    </p>
    <button type="button" id="submit">Inscribirme</button>
  </form>
  <p id="result" role="status"></p>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --danger: #b91c1c; --ok: #166534; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
form { padding: 0.25rem 1rem 0.75rem; border: 1px solid var(--line); border-radius: 0.75rem; background: #fff; }
.field { display: grid; gap: 0.15rem; margin: 0.5rem 0; }
label { font-weight: 600; }
input, select, button { font: inherit; color: inherit; }
input, select { padding: 0.25rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
input[aria-invalid="true"], select[aria-invalid="true"] { border: 2px solid var(--danger); }
.error { color: var(--danger); font-size: 0.9rem; min-height: 0; }
.status { color: var(--muted); font-size: 0.9rem; }
button { padding: 0.35rem 0.9rem; border: 1px solid #9a3412; border-radius: 0.5rem; background: #9a3412; color: #fff; cursor: pointer; }
.summary { margin-bottom: 0.75rem; padding: 0.5rem 1rem; border: 2px solid var(--danger); border-radius: 0.75rem; background: #fff; }
.summary[hidden] { display: none; }
.summary h2 { font-size: 1rem; margin: 0.25rem 0; }
.summary a { color: var(--danger); }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
#result { font-weight: 600; color: var(--ok); }
```

# TypeScript

```typescript
// Inscripción con validadores tipados.
//
// Decisiones de diseño:
// - El formulario se describe con un tipo (Signup) y un esquema mapeado sobre él: cada campo dice
//   cómo se lee de FormData (string | File | null → su tipo) y qué reglas cumple. Una regla de
//   texto en un campo numérico no compila.
// - Errores en dos sitios, como pide WCAG: junto a cada control (aria-describedby y aria-invalid)
//   y en un resumen con enlaces a los campos, que recibe el foco al enviar.
// - El usuario se comprueba «en el servidor» mientras se escribe: espera 300 ms sin teclear y
//   cancela la comprobación anterior con AbortController (las respuestas viejas no pisan a las
//   nuevas). El servidor de prueba solo pone el retraso; la lista de usuarios ocupados la simula
//   la página.
// - El botón es type="button": en las tarjetas de la teoría los formularios no se envían.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

const LEVELS = { basic: 'básico', advanced: 'avanzado' } as const;
type Level = keyof typeof LEVELS;
type Signup = { name: string; email: string; username: string; seats: number; level: Level };

type Rule<T> = (value: T) => string | null;
type FieldSpec<T> = { label: string; read: (data: FormData) => T; rules: Rule<T>[] };
type Schema<F> = { [K in keyof F]: FieldSpec<F[K]> };
type Errors<F> = Partial<Record<keyof F, string>>;

// ── Reglas reutilizables ──────────────────────────────────────────────────
const required: Rule<string> = (value) => (value === '' ? 'Es obligatorio' : null);
const minLength = (min: number): Rule<string> => (value) => (value.length < min ? `Escribe al menos ${min} caracteres` : null);
const matches = (pattern: RegExp, message: string): Rule<string> => (value) => (pattern.test(value) ? null : message);
const between = (min: number, max: number): Rule<number> => (value) =>
  (Number.isInteger(value) && value >= min && value <= max ? null : `Elige un número de ${min} a ${max}`);

const text = (name: string) => (data: FormData): string => {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
};
const isLevel = (value: string): value is Level => Object.hasOwn(LEVELS, value);

const SCHEMA: Schema<Signup> = {
  name: { label: 'Nombre', read: text('name'), rules: [required, minLength(3)] },
  email: { label: 'Correo', read: text('email'), rules: [required, matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Escribe un correo como ana@example.com')] },
  username: { label: 'Usuario', read: text('username'), rules: [required, matches(/^[a-z0-9_]{3,15}$/, 'De 3 a 15 minúsculas, números o _')] },
  seats: { label: 'Plazas', read: (data) => Number(text('seats')(data)), rules: [between(1, 4)] }, // [required] aquí no compilaría
  level: { label: 'Nivel', read: (data) => { const value = text('level')(data); return isLevel(value) ? value : 'basic'; }, rules: [] },
};

function keysOf<F extends object>(value: F): (keyof F)[] {
  return Object.keys(value) as (keyof F)[]; // Object.keys da string[]
}
function validate<F>(schema: Schema<F>, data: FormData): { values: F; errors: Errors<F> } {
  const values = {} as F; // se rellena campo a campo justo debajo
  const errors: Errors<F> = {};
  for (const key of keysOf(schema)) {
    const spec = schema[key];
    const value = spec.read(data);
    values[key] = value;
    const message = spec.rules.map((rule) => rule(value)).find((result) => result !== null);
    if (message) errors[key] = message;
  }
  return { values, errors };
}

// ── La comprobación asíncrona del usuario ─────────────────────────────────
type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'unknown';
const TAKEN = new Set(['lucia', 'chef_ana', 'ivan']);
let availability: Availability = 'idle';
let checking: AbortController | null = null;
let debounce: ReturnType<typeof setTimeout> | undefined;

async function checkUsername(username: string, signal: AbortSignal): Promise<Availability> {
  try {
    const response = await fetch(`/api/demo/echo?delay=400&username=${encodeURIComponent(username)}`, { signal });
    if (!response.ok) return 'unknown';
    return TAKEN.has(username) ? 'taken' : 'available';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error; // la cancelamos nosotros
    return 'unknown';
  }
}

// ── La página ─────────────────────────────────────────────────────────────
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const form = $('#signup', HTMLFormElement);
const summary = $('#summary', HTMLElement);
const summaryTitle = $('#summary-title', HTMLHeadingElement);
const summaryList = $('#summary-list', HTMLUListElement);
const usernameInput = $('#username', HTMLInputElement);
const usernameStatus = $('#username-status', HTMLSpanElement);
const result = $('#result', HTMLParagraphElement);

function showErrors(errors: Errors<Signup>): void {
  for (const key of keysOf(SCHEMA)) {
    const message = errors[key] ?? '';
    $(`#${key}-error`, HTMLSpanElement).textContent = message;
    $(`#${key}`, HTMLElement).setAttribute('aria-invalid', String(message !== ''));
  }
  const wrong = keysOf(SCHEMA).filter((key) => errors[key] !== undefined);
  summary.hidden = wrong.length === 0;
  summaryTitle.textContent = `Hay ${wrong.length} ${wrong.length === 1 ? 'campo' : 'campos'} por corregir`;
  summaryList.replaceChildren(...wrong.map((key) => {
    const item = document.createElement('li');
    item.append(Object.assign(document.createElement('a'), { href: `#${key}`, textContent: `${SCHEMA[key].label}: ${errors[key]}` }));
    return item;
  }));
}

usernameInput.addEventListener('input', () => {
  clearTimeout(debounce);
  checking?.abort();
  const username = usernameInput.value.trim();
  availability = 'idle';
  usernameStatus.textContent = '';
  if (!/^[a-z0-9_]{3,15}$/.test(username)) return;
  debounce = setTimeout(async () => {
    checking = new AbortController();
    availability = 'checking';
    usernameStatus.textContent = 'Comprobando…';
    try {
      availability = await checkUsername(username, checking.signal);
    } catch {
      return; // cancelada: ya hay otra en marcha
    }
    usernameStatus.textContent = availability === 'available' ? '✓ disponible' : availability === 'taken' ? 'ya está en uso' : 'no se pudo comprobar';
    console.log(`🔎 ${username} → ${availability === 'available' ? 'disponible' : availability === 'taken' ? 'ocupado' : 'sin comprobar'}`);
  }, 300);
});

summaryList.addEventListener('click', (event) => {
  const link = event.target instanceof Element ? event.target.closest('a') : null;
  const field = link ? document.getElementById(link.hash.slice(1)) : null;
  if (!link || !field) return;
  event.preventDefault(); // sin saltar en el historial: solo mover el foco al campo
  field.focus();
});

$('#submit', HTMLButtonElement).addEventListener('click', async () => {
  const { values, errors } = validate(SCHEMA, new FormData(form));
  if (!errors.username && availability === 'taken') errors.username = 'Ese usuario ya está en uso: elige otro';
  if (!errors.username && availability === 'checking') errors.username = 'Espera a que termine la comprobación del usuario';
  showErrors(errors);
  const wrong = keysOf(errors);
  if (wrong.length > 0) {
    summaryTitle.focus();
    result.textContent = '';
    console.log(`⚠️ ${wrong.length} ${wrong.length === 1 ? 'campo' : 'campos'} por corregir: ${wrong.map((key) => SCHEMA[key].label).join(', ')}`);
    return;
  }
  const response = await fetch('/api/demo/echo?status=201', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
  result.textContent = response.ok
    ? `✅ ${response.status} · ${values.name} (${values.username}) · ${values.seats} ${values.seats === 1 ? 'plaza' : 'plazas'} · nivel ${LEVELS[values.level]}`
    : `⚠️ el servidor respondió ${response.status}`;
  console.log(result.textContent);
});
form.addEventListener('submit', (event) => event.preventDefault());
console.log('Listo: pulsa «Inscribirme» con el formulario vacío, prueba los usuarios «chef_ana» y «chef_lucia» y completa la inscripción');
```
