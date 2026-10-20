---
example_description: "Ejercicio: añade la validación nativa a una inscripción (obligatorios, correo, código postal, edad, número de socio opcional y un pattern roto) y une cada pista a su campo"
example_tags: "ejercicio|formularios|validacion|required|pattern|min|max|inputmode"
example_stage: exercise
example_importance: critical
exercise: true
exercise_title: "Valida la inscripción"
exercise_instructions: "Haz obligatorio el nombre y añade su autocomplete || Convierte el correo en type=\"email\", obligatorio y con autocomplete || Cambia el código postal: no es una cantidad; exige cinco cifras con teclado numérico y que sea obligatorio || Limita la edad de 16 a 99 y hazla obligatoria || Da al número de socio el formato HU- y cuatro cifras, sin hacerlo obligatorio || Arregla el pattern del nombre de usuario (el navegador lo ignora) y hazlo obligatorio || Une cada pista (small) a su campo con aria-describedby || Comprueba que la consola sale toda ✅"
exercise_hints: "La consola prueba valores en cada campo: si dice que acepta algo que no debería, falta una restricción || Código postal: type de texto (bórralo), inputmode=\"numeric\", pattern=\"[0-9]{5}\" || Un campo opcional con pattern acepta el valor vacío: no le pongas required || Dentro de [ ], el guion se escribe \\- || aria-describedby=\"postal-hint\""
exercise_solution_example: 10-ej-valida-la-inscripcion-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<h1>Inscripción en el curso de poda</h1>
<p>Todos los campos son obligatorios salvo el número de socio.</p>

<form action="https://huerta.example/cursos/poda/inscripcion" method="post">
  <p>
    <label for="full-name">Nombre y apellidos</label>
    <!-- TODO 1: obligatorio, y que el navegador pueda rellenarlo solo -->
    <input id="full-name" name="full_name">
  </p>
  <p>
    <label for="email">Correo electrónico</label>
    <!-- TODO 2: obligatorio, con comprobación de formato y autocompletado -->
    <input id="email" name="email" type="text">
  </p>
  <p>
    <label for="postal-code">Código postal</label>
    <!-- TODO 3: no es una cantidad. Cinco cifras exactas, teclado numérico, obligatorio -->
    <input id="postal-code" name="postal_code" type="number">
    <small id="postal-hint">Cinco cifras, por ejemplo 50001.</small>
  </p>
  <p>
    <label for="age">Edad</label>
    <!-- TODO 4: obligatoria, de 16 a 99 -->
    <input id="age" name="age" type="number">
    <small id="age-hint">El curso es para mayores de 16 años.</small>
  </p>
  <p>
    <label for="member">Número de socio (opcional)</label>
    <!-- TODO 5: opcional; si se escribe, HU- y cuatro cifras -->
    <input id="member" name="member">
    <small id="member-hint">Como aparece en tu carné: HU-0042.</small>
  </p>
  <p>
    <label for="username">Nombre de usuario</label>
    <!-- TODO 6: este pattern es inválido y el navegador lo ignora. Arréglalo; obligatorio. -->
    <input id="username" name="username" pattern="[a-z0-9_-]{3,20}" aria-describedby="username-hint">
    <small id="username-hint">De 3 a 20 minúsculas sin tilde, cifras, guiones o guiones bajos.</small>
  </p>
  <!-- TODO 7: une cada pista a su campo (el nombre de usuario ya lo está) -->
  <button type="submit">Inscribirme</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

label,
small {
  display: block;
}

small {
  color: #475569;
}

input:user-invalid {
  outline: 2px solid #b91c1c;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Comprobaciones automáticas (bloqueadas: no hace falta tocarlas). Adelanto: JavaScript se
// explica en su capítulo. accepts() escribe un valor de prueba en el campo, mira si el
// navegador lo da por válido y deja el valor que había.
function accepts(field, value) {
  const original = field.value;
  field.value = value;
  const valid = field.validity.valid;
  field.value = original;
  return valid;
}

const field = (id) => document.getElementById(id);
const fullName = field('full-name');
const email = field('email');
const postal = field('postal-code');
const age = field('age');
const member = field('member');
const username = field('username');
const hints = [...document.querySelectorAll('small[id]')];

const checks = [
  ['nombre: obligatorio y con autocomplete="name"', !accepts(fullName, '') && fullName.autocomplete === 'name'],
  ['correo: obligatorio, rechaza «ana@» y con autocomplete="email"', !accepts(email, '') && !accepts(email, 'ana@') && accepts(email, 'ana@correo.es') && email.autocomplete === 'email'],
  ['código postal: texto con teclado numérico y cinco cifras exactas', postal.type !== 'number' && postal.inputMode === 'numeric' && !accepts(postal, '') && !accepts(postal, '5000') && accepts(postal, '50001')],
  ['edad: obligatoria, de 16 a 99', !accepts(age, '') && !accepts(age, '15') && accepts(age, '16') && accepts(age, '99') && !accepts(age, '100')],
  ['número de socio: opcional, con formato HU-0000', accepts(member, '') && accepts(member, 'HU-0042') && !accepts(member, 'hu-0042') && !accepts(member, 'HU-42')],
  ['nombre de usuario: el pattern funciona y es obligatorio', !accepts(username, '') && !accepts(username, '¡Hola!') && accepts(username, 'marta_ruiz-62')],
  ['cada pista está unida a su campo', hints.every((hint) => document.querySelector(`[aria-describedby~="${hint.id}"]`))],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
```
