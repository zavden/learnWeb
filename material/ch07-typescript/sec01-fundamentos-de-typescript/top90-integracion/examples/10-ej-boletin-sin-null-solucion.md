---
example_description: "Solución: byId, formById e inputById descartan null y estrechan con instanceof; el error «Falta el elemento #mesage» delató el id mal escrito. Sin errores de tipos y con las cuatro comprobaciones ✓"
example_tags: "typescript|ejercicio|solucion|dom|null|instanceof"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main class="box">
  <h1>Boletín de recetas</h1>
  <p>Una receta de temporada cada viernes. Suscriptores: <output id="count">0</output></p>
  <form id="newsletter" novalidate>
    <label for="email">Correo electrónico</label>
    <input id="email" type="email" autocomplete="email">
    <button type="submit">Suscribirme</button>
  </form>
  <p id="message" role="status"></p>
</main>
```

# CSS

```css
:root {
  color-scheme: light;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #fff8f0;
}
.box {
  max-width: 24rem;
  margin: 1rem auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0;
}
form {
  display: grid;
  gap: 0.4rem;
}
input,
button {
  font: inherit;
  padding: 0.4rem 0.6rem;
}
button {
  justify-self: start;
  border: 0;
  border-radius: 0.4rem;
  background: #9a3412;
  color: #fff;
  cursor: pointer;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
#message {
  min-height: 1.5em;
  font-weight: 600;
}
```

# TypeScript

```typescript
// Elementos obligatorios: sin null y del tipo correcto (lecciones 2 y 4).
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function formById(id: string): HTMLFormElement {
  const element = byId(id);
  if (!(element instanceof HTMLFormElement)) throw new Error(`#${id} no es un <form>`);
  return element;
}
function inputById(id: string): HTMLInputElement {
  const element = byId(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`#${id} no es un <input>`);
  return element;
}

const form = formById('newsletter');
const emailInput = inputById('email');
const message = byId('message'); // ✅ era '#mesage': byId lo habría dicho al cargar
const counter = byId('count');

let subscribers = 0;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = emailInput.value.trim(); // HTMLInputElement sí tiene value
  if (!email.includes('@')) {
    message.textContent = 'Escribe un correo válido, como ana@example.com';
    return;
  }
  subscribers += 1;
  counter.textContent = String(subscribers);
  message.textContent = `¡Listo! Te escribiremos a ${email}`;
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Simulan que escribes un correo y envías el formulario. El submit simulado
// no burbujea, para que la vista previa de LearnWeb no lo intercepte.
function check(description: string, actual: unknown, expected: unknown): void {
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
function simulateSubmit(email: string): void {
  const input = document.getElementById('email');
  const target = document.getElementById('newsletter');
  if (input instanceof HTMLInputElement) input.value = email;
  target?.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
}
const textOf = (id: string): string => document.getElementById(id)?.textContent ?? '(no existe)';

simulateSubmit('ana.example.com');
check('un correo sin @ muestra el aviso', textOf('message'), 'Escribe un correo válido, como ana@example.com');
check('un correo sin @ no suma suscriptores', textOf('count'), '0');
simulateSubmit('  ana@example.com ');
check('un correo válido suma un suscriptor', textOf('count'), '1');
check('el mensaje nombra el correo, sin espacios', textOf('message'), '¡Listo! Te escribiremos a ana@example.com');
```
