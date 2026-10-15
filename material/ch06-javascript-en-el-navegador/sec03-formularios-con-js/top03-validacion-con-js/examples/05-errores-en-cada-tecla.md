---
example_description: "Validar en cada tecla desde la primera: el correo sale «mal» mientras se escribe bien, y con el mensaje en una región aria-live assertive un lector de pantalla interrumpe al usuario en cada pulsación"
example_tags: "javascript|formularios|validacion|aria-live|accesibilidad|input|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Boletín de la Huerta Urbana</h1>
  <form id="newsletter" action="/boletin" method="post" novalidate>
    <label for="email">Correo</label>
    <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-error">
    <!-- 🐛 Una región assertive interrumpe lo que esté leyendo el lector de pantalla. -->
    <p id="email-error" class="error" aria-live="assertive"></p>
    <button type="submit">Suscribirme</button>
  </form>
  <p>Anuncios enviados al lector de pantalla: <output id="count">0</output></p>
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
form {
  display: grid;
  gap: 0.3rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
label {
  font-weight: 600;
}
.error {
  min-height: 1.4em;
  margin: 0;
  color: #b91c1c;
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
input[aria-invalid="true"] {
  border: 2px solid #b91c1c;
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
const email = document.querySelector('#email');
const errorLine = document.querySelector('#email-error');
const logList = document.querySelector('#log');
let announcements = 0;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function messageFor(field) {
  if (field.validity.valueMissing) return 'Escribe tu correo.';
  if (!field.value.includes('@')) return 'Falta la @ del correo.';
  if (field.validity.typeMismatch) return 'Falta lo que va después de la @.';
  return '';
}

// 🐛 Se valida en CADA tecla, desde la primera: castiga a quien todavía está escribiendo.
email.addEventListener('input', () => {
  const message = messageFor(email);
  email.setAttribute('aria-invalid', String(message !== ''));
  // 🐛 Y cada cambio del texto de una región aria-live es un anuncio (aquí, assertive:
  //    interrumpe al lector de pantalla mientras el usuario teclea).
  errorLine.textContent = message;
  if (message) {
    announcements += 1;
    document.querySelector('#count').textContent = announcements;
  }
  logLine(`🐛 '${email.value}' → ${message ? `📢 «${message}»` : 'sin error'}`);
});
logLine('Listo: escribe «lu@mx» en el correo, despacio');

// La versión correcta (ejemplo siguiente): mensajes al salir del campo y al enviar,
// en un párrafo de aria-describedby que no es una región viva.
```
