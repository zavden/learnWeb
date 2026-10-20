---
example_description: "Solución: la inscripción con todas sus restricciones nativas, el código postal como texto numérico, el pattern arreglado y cada pista unida a su campo"
example_tags: "solucion|formularios|validacion|required|pattern|min|max|inputmode"
example_stage: final-solution
example_importance: critical
console: true
---

# HTML

```html
<h1>Inscripción en el curso de poda</h1>
<p>Todos los campos son obligatorios salvo el número de socio.</p>

<form action="https://huerta.example/cursos/poda/inscripcion" method="post">
  <p>
    <label for="full-name">Nombre y apellidos</label>
    <!-- 1. required + el token de autocompletado -->
    <input id="full-name" name="full_name" autocomplete="name" required>
  </p>
  <p>
    <label for="email">Correo electrónico</label>
    <!-- 2. type="email" comprueba la forma (algo@dominio) -->
    <input id="email" name="email" type="email" autocomplete="email" required>
  </p>
  <p>
    <label for="postal-code">Código postal</label>
    <!-- 3. Texto con teclado numérico: sin flechas, con maxlength y pattern -->
    <input id="postal-code" name="postal_code" inputmode="numeric" autocomplete="postal-code"
           pattern="[0-9]{5}" maxlength="5" size="6" required aria-describedby="postal-hint">
    <small id="postal-hint">Cinco cifras, por ejemplo 50001.</small>
  </p>
  <p>
    <label for="age">Edad</label>
    <!-- 4. La edad sí es una cantidad: number con min y max -->
    <input id="age" name="age" type="number" min="16" max="99" required aria-describedby="age-hint">
    <small id="age-hint">El curso es para mayores de 16 años.</small>
  </p>
  <p>
    <label for="member">Número de socio (opcional)</label>
    <!-- 5. Sin required: vacío es válido; si se escribe, debe cumplir el pattern -->
    <input id="member" name="member" pattern="HU-[0-9]{4}" maxlength="7" size="8" aria-describedby="member-hint">
    <small id="member-hint">Como aparece en tu carné: HU-0042.</small>
  </p>
  <p>
    <label for="username">Nombre de usuario</label>
    <!-- 6. El guion dentro de [ ] escapado: \- -->
    <input id="username" name="username" autocomplete="username" pattern="[a-z0-9_\-]{3,20}" required aria-describedby="username-hint">
    <small id="username-hint">De 3 a 20 minúsculas sin tilde, cifras, guiones o guiones bajos.</small>
  </p>
  <!-- 7. Cada pista, unida a su campo con aria-describedby -->
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
