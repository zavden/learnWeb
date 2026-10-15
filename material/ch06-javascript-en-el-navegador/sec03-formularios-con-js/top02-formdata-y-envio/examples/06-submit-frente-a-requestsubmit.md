---
example_description: "form.submit() envía sin validar y sin disparar el evento submit: el servidor de pruebas recibe un correo vacío y 6 plazas de 4, y tu listener no se entera. form.requestSubmit(botón) se comporta como pulsar el botón: valida, dispara submit y pasa el submitter"
example_tags: "javascript|formularios|submit|requestsubmit|validacion|submitter|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Reserva para la cata de mezcal</h1>
  <!-- target: la respuesta se carga en el iframe de abajo, no en esta página.
       /api/demo/echo es el servidor de pruebas de LearnWeb: responde con lo que recibe. -->
  <form id="booking" action="/api/demo/echo" method="post" target="server-reply">
    <p><label>Correo <input name="email" type="email" required></label></p>
    <p><label>Plazas (máximo 4) <input name="seats" type="number" min="1" max="4" value="6"></label></p>
    <p class="actions">
      <button id="reserve" type="submit">Reservar</button>
      <button id="js-submit" type="button">form.submit() 🐛</button>
      <button id="js-request" type="button">form.requestSubmit(reservar) ✅</button>
    </p>
  </form>
  <p class="caption">Lo que recibe el servidor:</p>
  <iframe name="server-reply" title="Respuesta del servidor de pruebas"></iframe>
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
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
form p {
  margin: 0 0 0.5rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
input,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
button {
  cursor: pointer;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.caption {
  margin: 0.75rem 0 0.25rem;
  font-weight: 600;
}
iframe {
  box-sizing: border-box;
  width: 100%;
  height: 5rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
const form = document.querySelector('#booking');
const reply = document.querySelector('iframe');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// El listener de siempre: aquí validarías más cosas, enviarías con fetch…
form.addEventListener('submit', (event) => {
  event.preventDefault();
  logLine(`📨 submit · submitter: ${event.submitter ? `«${event.submitter.textContent}»` : 'ninguno'}`);
});

// 🐛 submit() envía TAL CUAL: sin validación y sin evento submit (tu listener no corre).
document.querySelector('#js-submit').addEventListener('click', () => {
  logLine(`🐛 form.submit() con checkValidity() → ${form.checkValidity()}: se envía igual`);
  form.submit();
});

// ✅ requestSubmit(botón) hace lo mismo que pulsar ese botón: valida (y muestra el
//    aviso del primer campo inválido), dispara submit y pasa el botón como submitter.
document.querySelector('#js-request').addEventListener('click', () => {
  logLine('✅ form.requestSubmit(reservar)');
  form.requestSubmit(document.querySelector('#reserve'));
});

// Cuando el iframe carga la respuesta, leemos lo que recibió el servidor.
reply.addEventListener('load', () => {
  const text = reply.contentDocument?.querySelector('pre')?.textContent;
  if (!text) return;
  logLine(`🐛 el servidor recibió → ${JSON.stringify(JSON.parse(text).body)}`);
});
logLine('Listo: pulsa «form.submit()» y «form.requestSubmit()»; luego completa el formulario y repite');
```
