---
example_description: "Serializar un formulario a JSON con tipos: JSON.stringify(Object.fromEntries(formData)) da la edad como string, pierde la casilla sin marcar y un género de dos; un objeto construido con valueAsNumber, checked y getAll no. Adelanto: enviarlo con fetch al servidor de pruebas"
example_tags: "javascript|formularios|formdata|json|fetch|serializar"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Club de lectura El Faro</h1>
  <form id="signup" action="/club/alta" method="post">
    <p><label>Nombre <input name="reader" value="Marta Ruiz" autocomplete="name"></label></p>
    <p><label>Edad <input name="age" type="number" min="12" max="120" value="34"></label></p>
    <fieldset>
      <legend>Géneros favoritos</legend>
      <label><input type="checkbox" name="genres" value="novel" checked> Novela</label>
      <label><input type="checkbox" name="genres" value="essay"> Ensayo</label>
      <label><input type="checkbox" name="genres" value="poetry" checked> Poesía</label>
    </fieldset>
    <p><label><input type="checkbox" name="newsletter"> Quiero el boletín</label></p>
    <button type="submit">Darme de alta</button>
  </form>
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
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0 0 0.5rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
input:not([type="checkbox"]),
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
const form = document.querySelector('#signup');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 🐛 El atajo: todo strings, el último de cada nombre y nada de lo que no se envía.
const quickJson = () => JSON.stringify(Object.fromEntries(new FormData(form)));

// ✅ Un objeto con la forma que espera el servidor: cada campo, con su tipo.
function toPayload() {
  const formData = new FormData(form);
  return {
    reader: formData.get('reader'),
    age: form.elements.age.valueAsNumber, // número (NaN → JSON.stringify lo escribe null)
    genres: formData.getAll('genres'), // siempre un array
    newsletter: form.elements.newsletter.checked, // siempre un booleano
  };
}

logLine(`🐛 atajo → ${quickJson()}`);
logLine(`✅ con tipos → ${JSON.stringify(toPayload())}`);

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // antes de cualquier await (lección «Acciones por defecto»)
  const json = JSON.stringify(toPayload());
  logLine(`📤 enviando → ${json}`);
  // Adelanto: fetch (módulo «Red y almacenamiento»). /api/demo/echo es el servidor
  // de pruebas de LearnWeb: responde con un JSON que describe lo que recibió.
  const response = await fetch('/api/demo/echo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
  });
  const echo = await response.json();
  logLine(`📥 ${response.status} · content-type: ${echo.headers['content-type']}`);
  logLine(`📥 body.age → ${echo.body.age} (${typeof echo.body.age}) · body.genres → ${JSON.stringify(echo.body.genres)}`);
});
logLine('Listo: pulsa «Darme de alta»; prueba también a marcar «Ensayo» o vaciar la edad');
```
