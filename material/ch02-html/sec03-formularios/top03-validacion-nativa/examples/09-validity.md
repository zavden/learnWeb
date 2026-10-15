---
example_description: "Cada campo tiene un objeto validity con un indicador por cada motivo de error y un validationMessage escrito en el idioma del navegador"
example_tags: "html|formularios|validacion|validity|validationmessage|javascript"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Cada campo falla por un motivo distinto. Corrígelos y mira la consola. Después escribe
     «1e» en «Personas»: no es un número, y su value se queda vacío.
     (oninput se ejecuta al escribir; los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://alojamientos.example/reserva" method="post" oninput="report(event.target)">
  <p><label for="nickname">Nombre</label><br><input id="nickname" name="nickname" required></p>
  <p><label for="email">Correo</label><br><input id="email" name="email" type="email" value="ana@" required></p>
  <p><label for="guests">Personas (de 1 a 12)</label><br><input id="guests" name="guests" type="number" min="1" max="12" value="15"></p>
  <button type="submit">Reservar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. validity tiene un indicador (true/false) por
// cada motivo de error; valid es true cuando ninguno lo está. validationMessage es el aviso que
// mostraría el navegador, en SU idioma (no en el de la página).
const FLAGS = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooShort', 'tooLong',
  'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput', 'customError'];

function report(input) {
  const failing = FLAGS.filter((flag) => input.validity[flag]);
  const detail = failing.length ? ` · ${failing.join(', ')} · «${input.validationMessage}»` : '';
  console.log(`${input.name} = '${input.value}' → valid: ${input.validity.valid}${detail}`);
}

for (const input of document.querySelectorAll('input')) report(input);
```
