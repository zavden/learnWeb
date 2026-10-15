---
example_description: "event.submitter dice qué botón envió el formulario; su name/value solo entra en new FormData(form, submitter), no en new FormData(form). formaction y formmethod cambian el destino por botón, y el registro de LearnWeb muestra la petición: GET con la query o POST con su enctype"
example_tags: "javascript|formularios|submitter|formaction|formmethod|formdata|get|post"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Nueva receta · Cocina de la abuela</h1>
  <form id="recipe" action="/recetas" method="post">
    <p><label>Título <input name="title" value="Pozole rojo"></label></p>
    <p><label>Raciones <input name="servings" type="number" min="1" value="6"></label></p>
    <p class="actions">
      <button type="submit" name="intent" value="draft">Guardar borrador</button>
      <button type="submit" name="intent" value="publish">Publicar</button>
      <button type="submit" formaction="/recetas/vista-previa" formmethod="get">Vista previa</button>
      <button type="submit" name="intent" value="publish" formenctype="multipart/form-data">Publicar (multipart)</button>
    </p>
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
input {
  width: 9rem;
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
}
```

# JavaScript

```javascript
const form = document.querySelector('#recipe');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

form.addEventListener('submit', (event) => {
  const button = event.submitter; // el botón que envió (null si fue requestSubmit() sin botón)
  logLine(`📨 «${button.textContent}» → ${button.name ? `${button.name}=${button.value}` : 'sin name'}`);
  // 🐛 new FormData(form) NO incluye el botón: el formulario no sabe cuál se pulsó.
  logLine(`   new FormData(form).get('intent') → ${new FormData(form).get('intent')}`);
  // ✅ Con el submitter como segundo argumento, sí (como en el envío real).
  logLine(`   new FormData(form, submitter).get('intent') → ${new FormData(form, button).get('intent')}`);
  // Sin preventDefault: LearnWeb bloquea la navegación y escribe en la consola la petición.
});
logLine('Listo: pulsa los cuatro botones y compara las líneas «Form submitted» de la consola');
```
