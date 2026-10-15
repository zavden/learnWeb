---
example_description: "setCustomValidity('mensaje') deja el campo inválido (customError) hasta que se vacía con setCustomValidity(''): si solo se llama cuando hay error, el campo sigue inválido aunque el usuario lo corrija y el formulario no se envía nunca"
example_tags: "javascript|formularios|validacion|setcustomvalidity|customerror|fechas|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Hotel Casa Azul · Oaxaca</h1>
  <div class="forms">
    <form id="stay-buggy" class="stay" action="/reservas" method="post">
      <h2>🐛 Sin limpiar</h2>
      <label>Llegada <input name="check_in" type="date" value="2026-11-20"></label>
      <label>Salida <input name="check_out" type="date" value="2026-11-18"></label>
      <button type="submit">Reservar</button>
    </form>
    <form id="stay-fixed" class="stay" action="/reservas" method="post">
      <h2>✅ Con setCustomValidity('')</h2>
      <label>Llegada <input name="check_in" type="date" value="2026-11-20"></label>
      <label>Salida <input name="check_out" type="date" value="2026-11-18"></label>
      <button type="submit">Reservar</button>
    </form>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
h2 {
  font-size: 0.95rem;
  margin: 0;
}
.forms {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.75rem;
}
.stay {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
input,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
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
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const MESSAGE = 'La salida debe ser posterior a la llegada.';

// HTML no puede comparar dos campos: la regla se añade con setCustomValidity.
// Las fechas AAAA-MM-DD se comparan bien como strings (y sin el lío de las zonas).
function checkDates(form) {
  const { check_in: checkIn, check_out: checkOut } = form.elements;
  const wrong = checkOut.value <= checkIn.value;
  if (form.id === 'stay-buggy') {
    // 🐛 Solo se pone el mensaje; nunca se quita. Un mensaje no vacío deja el
    //    campo inválido (customError) PARA SIEMPRE.
    if (wrong) checkOut.setCustomValidity(MESSAGE);
  } else {
    // ✅ El texto vacío lo vuelve a dar por bueno.
    checkOut.setCustomValidity(wrong ? MESSAGE : '');
  }
  const mark = form.id === 'stay-buggy' ? '🐛' : '✅';
  logLine(`${mark} salida ${checkOut.value} → customError: ${checkOut.validity.customError} · válido: ${checkOut.validity.valid}`);
}

for (const form of document.querySelectorAll('.stay')) {
  checkDates(form); // los valores iniciales no disparan eventos: comprobamos al cargar
  form.addEventListener('change', () => checkDates(form));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    logLine(`📨 submit → reserva del ${form.elements.check_in.value} al ${form.elements.check_out.value}`);
  });
}
logLine('Listo: cambia la salida de los dos formularios al 23 de noviembre y pulsa «Reservar»');
```
