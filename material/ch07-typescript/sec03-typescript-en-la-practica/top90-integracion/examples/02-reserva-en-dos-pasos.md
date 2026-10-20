---
example_description: "Un asistente de reserva en dos pasos: el estado es un tipo (TourBooking) del que salen los errores por campo (Partial<Record<keyof …>>); los valores se leen con FormData y se estrechan (string | File | null → texto, número o una unión de literales); el envío a /api/demo/echo devuelve un Result que la página trata sin try/catch"
example_tags: "typescript|integracion|formularios|formdata|tipos-de-utilidad|result|fetch|dom|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Recorrido por Teotihuacan</h1>
  <form id="booking" novalidate>
    <fieldset id="step-1">
      <legend>Paso 1 de 2 · El recorrido</legend>
      <p class="field">
        <label for="tour">Horario</label>
        <select id="tour" name="tour">
          <option value="sunrise">Amanecer en globo (06:00)</option>
          <option value="guided">Visita guiada (10:00)</option>
        </select>
      </p>
      <p class="field"><label for="people">Personas (1 a 6)</label><input id="people" name="people" type="number" min="1" max="6" value="2"></p>
      <p class="error" id="people-error"></p>
      <button type="button" id="next">Siguiente</button>
    </fieldset>
    <fieldset id="step-2" hidden>
      <legend>Paso 2 de 2 · Tus datos</legend>
      <p class="field"><label for="email">Correo</label><input id="email" name="email" type="email" autocomplete="email"></p>
      <p class="error" id="email-error"></p>
      <p class="check"><input id="fail" name="fail" type="checkbox"><label for="fail">Simular que el servidor está caído</label></p>
      <button type="button" id="back">Atrás</button>
      <button type="button" id="send">Reservar</button>
    </fieldset>
  </form>
  <p id="status" role="status"></p>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
fieldset { border: 1px solid #cbd2d9; border-radius: 0.75rem; background: #fff; padding: 0.5rem 1rem 0.75rem; }
fieldset[hidden] { display: none; }
legend { font-weight: 700; padding: 0 0.25rem; }
.field { display: grid; gap: 0.15rem; margin: 0.4rem 0 0; }
.check { display: flex; gap: 0.4rem; align-items: center; }
label { font-weight: 600; }
.check label { font-weight: 400; }
input, select, button { font: inherit; color: inherit; }
input:not([type="checkbox"]), select { padding: 0.25rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
input[aria-invalid="true"] { border-color: #b91c1c; }
.error { min-height: 1.2em; margin: 0.2rem 0 0.4rem; color: #b91c1c; font-size: 0.9rem; }
button { padding: 0.3rem 0.8rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
#status { font-weight: 600; }
```

# TypeScript

```typescript
// ── El estado: un tipo, y todo lo demás sale de él ───────────────────────
const TOURS = { sunrise: 'Amanecer en globo', guided: 'Visita guiada' } as const;
type TourId = keyof typeof TOURS;
type TourBooking = { tour: TourId; people: number; email: string; fail: boolean };
type FieldErrors = Partial<Record<keyof TourBooking, string>>;
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// ── FormData: string | File | null, estrechado campo a campo ──────────────
function text(data: FormData, name: keyof TourBooking): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : ''; // null (no existe) o File: texto vacío
}
const isTourId = (value: string): value is TourId => Object.hasOwn(TOURS, value);

function readBooking(form: HTMLFormElement): { booking: TourBooking; errors: FieldErrors } {
  const data = new FormData(form);
  const tour = text(data, 'tour');
  const people = Number(text(data, 'people'));
  const email = text(data, 'email');
  const errors: FieldErrors = {};
  if (!Number.isInteger(people) || people < 1 || people > 6) errors.people = 'Escribe un número de 1 a 6';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Escribe un correo como ana@example.com';
  return { booking: { tour: isTourId(tour) ? tour : 'guided', people, email, fail: data.has('fail') }, errors };
}

// ── El envío: nunca lanza; devuelve un Result ─────────────────────────────
async function sendBooking(booking: TourBooking): Promise<Result<string>> {
  try {
    const response = await fetch(`/api/demo/echo?status=${booking.fail ? 503 : 201}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { ok: false, error: `el servidor no pudo reservar (${response.status}); inténtalo en un momento` };
    return { ok: true, value: `${TOURS[booking.tour]} para ${booking.people} · confirmación enviada a ${booking.email}` };
  } catch (error) {
    return { ok: false, error: error instanceof DOMException && error.name === 'TimeoutError' ? 'el servidor no contestó' : 'sin conexión' };
  }
}

// ── La página ─────────────────────────────────────────────────────────────
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const form = $('#booking', HTMLFormElement);
const steps = [$('#step-1', HTMLFieldSetElement), $('#step-2', HTMLFieldSetElement)] as const;
const statusLine = $('#status', HTMLParagraphElement);
const report = (message: string): void => {
  console.log(message);
  statusLine.textContent = message;
};

// Muestra los errores de UN paso; devuelve el primer campo con error.
function showErrors(errors: FieldErrors, fields: (keyof TourBooking)[]): HTMLInputElement | null {
  let first: HTMLInputElement | null = null;
  for (const field of fields) {
    const input = $(`#${field}`, HTMLInputElement);
    const message = errors[field] ?? '';
    $(`#${field}-error`, HTMLParagraphElement).textContent = message;
    input.setAttribute('aria-invalid', String(message !== ''));
    if (message && !first) first = input;
  }
  return first;
}
function goTo(step: 0 | 1): void {
  steps.forEach((fieldset, index) => { fieldset.hidden = index !== step; });
  const firstControl = steps[step].querySelector('input, select'); // Element | null: no es un nombre de etiqueta
  if (firstControl instanceof HTMLElement) firstControl.focus();
}

$('#next', HTMLButtonElement).addEventListener('click', () => {
  const { booking, errors } = readBooking(form);
  const wrong = showErrors(errors, ['people']);
  if (wrong) return void wrong.focus();
  report(`➡️ paso 2 · ${TOURS[booking.tour]} para ${booking.people}`);
  goTo(1);
});
$('#back', HTMLButtonElement).addEventListener('click', () => goTo(0));
$('#send', HTMLButtonElement).addEventListener('click', async (event) => {
  const { booking, errors } = readBooking(form);
  const wrong = showErrors(errors, ['email']);
  if (wrong) return void wrong.focus();
  const button = event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : null;
  if (button) button.disabled = true;
  report('Enviando…');
  const result = await sendBooking(booking);
  if (button) button.disabled = false;
  report(result.ok ? `✅ ${result.value}` : `⚠️ ${result.error}`);
});
form.addEventListener('submit', (event) => event.preventDefault()); // Enter en un campo no envía
report('Listo: elige el horario y las personas, pulsa «Siguiente», escribe tu correo y pulsa «Reservar»');
```
