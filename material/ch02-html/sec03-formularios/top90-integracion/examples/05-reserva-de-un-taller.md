---
example_description: "Una reserva con fecha, hora y plazas limitadas: min, max y step nativos, una regla propia con setCustomValidity (solo sábados) y pistas que lo explican antes del error"
example_tags: "integracion|formularios|date|time|min|max|step|setcustomvalidity"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Los tres valores iniciales fallan. Intenta reservar y corrígelos uno a uno mirando la consola.
     (oninput: los eventos llegan en el capítulo de JavaScript.) -->
<h1>Reserva un taller</h1>
<form action="https://huerta.example/talleres/reserva" method="post" oninput="checkField(event.target)">
  <p>
    <label for="workshop">Taller</label>
    <select id="workshop" name="workshop" required>
      <option value="">Elige un taller</option>
      <option value="compost" selected>Compostaje doméstico</option>
      <option value="seedbeds">Semilleros de invierno</option>
    </select>
  </p>
  <p>
    <label for="day">Día</label>
    <input id="day" name="day" type="date" min="2026-10-17" max="2026-12-19" value="2026-10-23" required aria-describedby="day-hint">
    <small id="day-hint">Los talleres son los sábados, del 17 de octubre al 19 de diciembre.</small>
  </p>
  <p>
    <label for="time">Hora de inicio</label>
    <!-- step en segundos: 1800 = turnos de media hora, contados desde min -->
    <input id="time" name="time" type="time" min="10:00" max="13:00" step="1800" value="10:15" required aria-describedby="time-hint">
    <small id="time-hint">Turnos cada media hora, de 10:00 a 13:00.</small>
  </p>
  <p>
    <label for="people">Personas</label>
    <input id="people" name="people" type="number" min="1" max="4" value="6" required aria-describedby="people-hint">
    <small id="people-hint">Como máximo, 4 por reserva.</small>
  </p>
  <button type="submit">Reservar</button>
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

/* En rojo solo cuando el usuario ya ha interactuado (los valores iniciales no lo están) */
:user-invalid {
  outline: 2px solid #b91c1c;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const FLAGS = ['valueMissing', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput', 'customError'];

function checkField(field) {
  // La regla que HTML no puede expresar: el día tiene que ser sábado.
  // valueAsDate es el día a medianoche UTC; getUTCDay() da 0 (domingo) … 6 (sábado).
  if (field.name === 'day') {
    const isSaturday = field.valueAsDate?.getUTCDay() === 6;
    field.setCustomValidity(field.value && !isSaturday ? 'Los talleres son los sábados: elige un sábado.' : '');
  }
  const failing = FLAGS.filter((flag) => field.validity[flag]);
  const message = field.validity.customError ? ` · «${field.validationMessage}»` : '';
  console.log(`${field.name} = ${field.value} →`, failing.length ? `❌ ${failing.join(', ')}${message}` : '✅');
}

for (const field of document.querySelectorAll('input')) checkField(field);
```
