---
example_description: "Ejercicio: el formulario de un boletín usa querySelector sin tratar null (TS18047) y lee value de un Element (TS2339); además, un id mal escrito hace que el aviso nunca aparezca. Con funciones que exigen cada elemento y lo estrechan con instanceof, desaparecen los errores de tipos y el bug"
example_tags: "typescript|ejercicio|dom|null|instanceof|queryselector|formularios"
exercise: true
exercise_title: "Un boletín sin null"
exercise_instructions: "Al abrirlo verás errores TS18047 («possibly 'null'») y TS2339 (value no existe en Element), y dos comprobaciones ✗ || Escribe funciones que devuelvan cada elemento obligatorio sin null: byId(id): HTMLElement, y formById / inputById, que además comprueban con instanceof que es un <form> o un <input> || Usa esas funciones en lugar de querySelector: un elemento que falta lanzará un error con su nombre, y así encontrarás el id mal escrito || Las comprobaciones simulan el envío con dispatchEvent: ejecuta hasta que las cuatro salgan ✓ || El objetivo incluye que no quede NINGÚN error de tipos (editor o franja del diálogo «▶ Run»)"
exercise_hints: "document.getElementById devuelve HTMLElement | null: si es null, lanza un Error con el id || if (!(element instanceof HTMLInputElement)) throw … estrecha a HTMLInputElement, que sí tiene value || Mira los ids del HTML: uno de los selectores del script no coincide"
exercise_solution_example: 10-ej-boletin-sin-null-solucion.md
exercise_locked_files: index.html,styles.css
example_stage: exercise
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
// TODO 1: escribe byId, formById e inputById (sin null, con instanceof)
//         y úsalas en lugar de estos querySelector.
const form = document.querySelector('#newsletter');
const emailInput = document.querySelector('#email');
const message = document.querySelector('#mesage');
const counter = document.querySelector('#count');

let subscribers = 0;

// TODO 2: cuando el script compile sin errores, comprueba que las cuatro
//         comprobaciones salen ✓.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
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
