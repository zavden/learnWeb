---
example_description: "El evento submit del formulario (también con Enter) y preventDefault() para enviarlo con JavaScript sin recargar; el formulario sin listener haría la navegación de verdad, que la vista previa de LearnWeb bloquea y describe en la consola"
example_tags: "javascript|eventos|submit|preventdefault|formularios"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Boletín del tostador</h1>
  <form id="newsletter-js" class="newsletter" action="/boletin">
    <h2>Con JavaScript</h2>
    <label for="email-js">Correo</label>
    <input id="email-js" name="email" type="email" required value="lucia@example.com">
    <button type="submit">Suscribirme</button>
  </form>
  <form class="newsletter" action="/boletin">
    <h2>Sin JavaScript</h2>
    <label for="email-plain">Correo</label>
    <input id="email-plain" name="email" type="email" required value="lucia@example.com">
    <button type="submit">Suscribirme</button>
  </form>
  <p id="message" class="message" role="status"></p>
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
  font-size: 1rem;
  margin: 0;
}
.newsletter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.newsletter h2 {
  flex-basis: 100%;
}
input {
  flex: 1 1 12rem;
  font: inherit;
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.message {
  font-weight: 600;
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
const form = document.querySelector('#newsletter-js');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Escucha 'submit' en el FORMULARIO, no 'click' en el botón: submit llega
// también al pulsar Enter en el campo, y solo cuando la validación nativa
// (required, type="email") ya ha pasado.
form.addEventListener('submit', (event) => {
  event.preventDefault(); // ← no navegues a /boletin?email=…
  logLine(`📨 submit → defaultPrevented: ${event.defaultPrevented}`);
  const email = document.querySelector('#email-js').value;
  document.querySelector('#message').textContent = `✅ Suscrita: ${email}`;
  logLine(`✅ suscrita ${email}, sin recargar la página`);
  // Aquí iría el envío con fetch (módulo «Red y almacenamiento»).
});
logLine('Listo: pulsa los dos «Suscribirme» (o Enter dentro de cada campo)');

// El segundo formulario no tiene listener: su acción por defecto es navegar a
// /boletin?email=… y la página se sustituiría por la respuesta del servidor.
// La vista previa de LearnWeb bloquea esa navegación y la describe en la
// consola («Form submitted (navigation blocked in preview)…»). En una página
// normal, verías otra página (aquí, un «no encontrado»).
```
