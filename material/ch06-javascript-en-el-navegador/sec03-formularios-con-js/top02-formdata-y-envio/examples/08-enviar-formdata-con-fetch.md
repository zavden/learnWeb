---
example_description: "Enviar un formulario sin recargar (adelanto de fetch): un FormData viaja como multipart/form-data, con archivos; new URLSearchParams(formData) como urlencoded, sin archivos. Mientras se envía, el formulario queda desactivado y anuncia su estado; un 422 se muestra como error"
example_tags: "javascript|formularios|formdata|fetch|multipart|urlencoded|envio"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Trabaja con nosotros · Café La Ceiba</h1>
  <form id="application" action="/empleo" method="post" enctype="multipart/form-data">
    <fieldset class="fields">
      <legend>Tu solicitud</legend>
      <p><label>Nombre <input name="applicant" value="Lucía Méndez" autocomplete="name"></label></p>
      <p>
        <label>Puesto
          <select name="position">
            <option value="barista" selected>Barista</option>
            <option value="roaster">Tostador</option>
          </select>
        </label>
      </p>
      <p>
        <label><input type="checkbox" name="skills" value="latte-art" checked> Arte latte</label>
        <label><input type="checkbox" name="skills" value="cupping" checked> Catas</label>
      </p>
      <p><label>Currículum (opcional) <input name="cv" type="file" accept=".pdf,.txt"></label></p>
      <p><label><input id="simulate-error" type="checkbox"> Simular un error 422 del servidor</label></p>
      <p class="actions">
        <button type="submit" value="multipart">Enviar como FormData</button>
        <button type="submit" value="urlencoded">Enviar como URLSearchParams</button>
      </p>
    </fieldset>
  </form>
  <p id="status" role="status"></p>
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
.fields {
  margin: 0;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.fields p {
  margin: 0 0 0.5rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
input:not([type="checkbox"], [type="file"]),
select,
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
button:disabled {
  cursor: progress;
  color: #52606d;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
#status {
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
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
const form = document.querySelector('#application');
const fields = form.querySelector('.fields');
const statusLine = document.querySelector('#status');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const format = event.submitter.value;
  const formData = new FormData(form); // sin el botón: no queremos enviar «format»
  // Sin archivo elegido, FormData lleva un archivo vacío (name ''): mejor quitarlo.
  if (formData.get('cv').size === 0) formData.delete('cv');

  // multipart: el FormData tal cual (fetch pone Content-Type con su boundary).
  // urlencoded: URLSearchParams, que no puede llevar archivos.
  if (format === 'urlencoded') formData.delete('cv');
  const body = format === 'multipart' ? formData : new URLSearchParams(formData);
  const query = document.querySelector('#simulate-error').checked ? '?status=422&delay=800' : '?delay=800';

  // Mientras se envía: el fieldset desactiva todo (no hay dobles envíos) y se anuncia.
  fields.disabled = true;
  form.setAttribute('aria-busy', 'true');
  statusLine.textContent = 'Enviando tu solicitud…';
  logLine(`📤 ${format} → enviando…`);
  try {
    // Adelanto: fetch (módulo «Red y almacenamiento»), al servidor de pruebas de LearnWeb.
    const response = await fetch(`/api/demo/echo${query}`, { method: 'POST', body });
    const echo = await response.json();
    if (!response.ok) {
      statusLine.textContent = 'El servidor rechazó la solicitud. Revisa los datos.';
      logLine(`⚠️ ${response.status}: aquí mostrarías los errores del servidor junto a cada campo`);
      return;
    }
    const contentType = echo.headers['content-type'];
    logLine(`✅ ${response.status} · multipart: ${contentType.startsWith('multipart/form-data')} · urlencoded: ${contentType.startsWith('application/x-www-form-urlencoded')}`);
    logLine(`   body → ${JSON.stringify(echo.body)}`);
    statusLine.textContent = '¡Solicitud enviada!';
  } catch (error) {
    statusLine.textContent = 'No hay conexión. Inténtalo de nuevo.';
    logLine(`⚠️ ${error.name}: ${error.message}`);
  } finally {
    fields.disabled = false;
    form.removeAttribute('aria-busy');
    event.submitter.focus(); // al desactivarse, el botón perdió el foco: se lo devolvemos
  }
});
logLine('Listo: envía de las dos formas; luego elige un archivo, o marca «Simular un error 422»');
```
