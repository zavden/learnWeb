---
example_description: "new FormData(form) recoge los pares nombre/valor que enviaría el formulario: get, getAll para los nombres repetidos, has, recorrerlo con for…of y convertirlo en la query de un GET con URLSearchParams"
example_tags: "javascript|formularios|formdata|submit|preventdefault|urlsearchparams"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Pedido de café</h1>
  <form id="order" action="/pedidos" method="post">
    <p>
      <label for="customer">Nombre</label>
      <input id="customer" name="customer" value="Lucía Méndez" autocomplete="name">
    </p>
    <p>
      <label for="quantity">Bolsas de 500 g</label>
      <input id="quantity" name="quantity" type="number" min="1" max="10" value="2">
    </p>
    <fieldset>
      <legend>Extras</legend>
      <label><input type="checkbox" name="extras" value="cinnamon" checked> Canela</label>
      <label><input type="checkbox" name="extras" value="piloncillo" checked> Piloncillo</label>
      <label><input type="checkbox" name="extras" value="clove"> Clavo</label>
    </fieldset>
    <p><label><input type="checkbox" name="gift"> Envolver para regalo</label></p>
    <p>
      <label for="notes">Notas</label>
      <textarea id="notes" name="notes" rows="2">Entregar por la tarde</textarea>
    </p>
    <button type="submit">Hacer el pedido</button>
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
  display: grid;
  gap: 0.25rem;
  margin: 0 0 0.75rem;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0 0 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
input:not([type="checkbox"]),
textarea,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.35rem 0.5rem;
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
const form = document.querySelector('#order');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function show(formData) {
  logLine(`get('customer') → ${formData.get('customer')}`);
  logLine(`get('quantity') → '${formData.get('quantity')}' (un string, como value)`);
  // get da el PRIMER valor de un nombre; getAll, todos.
  logLine(`get('extras') → ${formData.get('extras')} · getAll('extras') → ${JSON.stringify(formData.getAll('extras'))}`);
  // Una casilla sin marcar no está: has → false, get → null.
  logLine(`has('gift') → ${formData.has('gift')} · get('gift') → ${formData.get('gift')}`);
  // Es iterable: cada entrada es un par [nombre, valor], en el orden del formulario.
  for (const [key, value] of formData) logLine(`  ${key} = ${value}`);
  // Adelanto (módulo «Red y almacenamiento»): URLSearchParams lo convierte en la
  // query que llevaría la URL de un formulario GET.
  logLine(`como query → ${new URLSearchParams(formData)}`);
}

// FormData se puede construir en cualquier momento, no solo al enviar.
show(new FormData(form));

form.addEventListener('submit', (event) => {
  event.preventDefault(); // sin esto, el navegador enviaría el formulario y cambiaría de página
  logLine('📨 submit cancelado; esto es lo que se habría enviado:');
  show(new FormData(form));
});
logLine('Listo: cambia algún campo (marca «Clavo», desmarca la canela…) y pulsa «Hacer el pedido»');
```
