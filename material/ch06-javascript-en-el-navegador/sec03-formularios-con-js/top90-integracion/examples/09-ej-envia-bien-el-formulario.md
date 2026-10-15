---
example_description: "Ejercicio: el alta en un club de lectura tiene cinco errores de la lección «FormData y envío»: un campo disabled que no viaja, un botón sin type que envía, Object.fromEntries que pierde un género, el botón pulsado que no llega a los datos y un atajo que usa form.submit()"
example_tags: "javascript|formularios|ejercicio|formdata|getall|submitter|requestsubmit|button"
exercise: true
exercise_title: "Envía bien el formulario"
exercise_instructions: "En el HTML, el número de socio está disabled y no viaja: hazlo de solo lectura (TODO 1) || En el HTML, el botón «+1 invitado» envía el formulario: dale el type correcto (TODO 2) || En collect, genres pierde valores: debe ser un array con todos los géneros marcados (TODO 3) || collect debe incluir el name/value del botón que envió, el submitter (TODO 4) || submitFromShortcut (Ctrl/⌘ + Enter) usa form.submit(), que no valida ni dispara submit: cámbialo (TODO 5) || Ejecuta hasta que las cinco comprobaciones salgan ✓"
exercise_hints: "readonly envía el valor; disabled, no || Un <button> sin type dentro de un form es type=\"submit\" || formData.getAll(nombre) || new FormData(form, submitter) || form.requestSubmit(botón) se comporta como pulsar ese botón"
exercise_solution_example: 09-ej-envia-bien-el-formulario-solucion.md
exercise_locked_files: styles.css
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Club de lectura El Faro</h1>
  <form id="club" action="/club/inscripcion" method="post">
    <!-- TODO 1: disabled no se envía. Este valor debe viajar sin poder editarse. -->
    <label>Número de socio <input name="member_id" value="CL-0815" disabled></label>
    <fieldset>
      <legend>Géneros</legend>
      <label><input type="checkbox" name="genres" value="novel" checked> Novela</label>
      <label><input type="checkbox" name="genres" value="essay"> Ensayo</label>
      <label><input type="checkbox" name="genres" value="poetry" checked> Poesía</label>
    </fieldset>
    <p class="guests">
      <label>Invitados <input name="guests" type="number" min="0" max="3" value="0"></label>
      <!-- TODO 2: este botón no debe enviar el formulario. -->
      <button id="add-guest">+1 invitado</button>
    </p>
    <label>Comentario (Ctrl/⌘ + Enter para enviar) <textarea name="comment" rows="2"></textarea></label>
    <button id="join" type="submit" name="intent" value="join">Inscribirme</button>
  </form>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 28rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.15rem;
  margin-top: 0;
}
form {
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
fieldset {
  display: flex;
  gap: 1rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
.guests {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  margin: 0;
}
input:not([type="checkbox"]),
textarea,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.25rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
button {
  justify-self: start;
  cursor: pointer;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// EJERCICIO: corrige los TODO 3, 4 y 5 aquí (el 1 y el 2 están en el HTML).
const form = document.querySelector('#club');
const joinButton = document.querySelector('#join');

document.querySelector('#add-guest').addEventListener('click', () => {
  form.elements.guests.stepUp(); // suma 1 respetando max
});

function collect(clubForm, submitter) {
  const formData = new FormData(clubForm); // TODO 4: que incluya el botón que envió
  return {
    ...Object.fromEntries(formData),
    genres: formData.get('genres'), // TODO 3: todos los géneros, en un array
  };
}

function submitFromShortcut() {
  form.submit(); // TODO 5: que valide y dispare submit, como el botón «Inscribirme»
}

form.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submitFromShortcut();
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log('📨', JSON.stringify(collect(form, event.submitter)));
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}

check('el número de socio viaja en FormData', () => new FormData(form).get('member_id'), 'CL-0815');
check('«+1 invitado» es un botón que no envía', () => document.querySelector('#add-guest').type, 'button');
check('collect devuelve los dos géneros marcados', () => JSON.stringify(collect(form, joinButton).genres), '["novel","poetry"]');
check('collect incluye intent=join del botón que envió', () => collect(form, joinButton).intent, 'join');
check('el atajo usa requestSubmit (valida y dispara submit)', () => {
  const calls = [];
  // Sustituimos los dos métodos un momento para ver cuál se llama, sin enviar nada.
  form.submit = () => calls.push('submit');
  form.requestSubmit = () => calls.push('requestSubmit');
  try {
    submitFromShortcut();
  } finally {
    delete form.submit;
    delete form.requestSubmit;
  }
  return calls.join(',');
}, 'requestSubmit');
```
