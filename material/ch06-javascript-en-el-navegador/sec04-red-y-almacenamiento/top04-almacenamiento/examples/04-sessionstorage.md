---
example_description: "sessionStorage tiene la misma API que localStorage pero vive lo que vive la pestaña: un borrador de reseña sobrevive a ⟳ y desaparece en otra pestaña (↗), mientras el nombre guardado en localStorage aparece en todas"
example_tags: "javascript|sessionstorage|localstorage|borrador|pestanas"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Reseña: mole poblano de doña Rosa</h1>
  <form id="review-form">
    <label for="author">Tu nombre <small>(localStorage: todas las pestañas)</small></label>
    <input id="author" autocomplete="off">
    <label for="review">Tu reseña <small>(sessionStorage: solo esta pestaña)</small></label>
    <textarea id="review" rows="3"></textarea>
    <p class="actions">
      <button type="submit">Publicar</button>
      <button id="forget" type="button">Olvidar mi nombre</button>
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
  display: grid;
  gap: 0.3rem;
}
small {
  color: #52606d;
}
input,
textarea,
button {
  font: inherit;
  padding: 0.4rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
}
button {
  cursor: pointer;
}
input:focus-visible,
textarea:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
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
const NAME_KEY = 'lw-almacen-autor';     // localStorage
const DRAFT_KEY = 'lw-almacen-borrador'; // sessionStorage
const authorInput = document.querySelector('#author');
const reviewInput = document.querySelector('#review');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Al cargar, recupera lo que haya en cada almacén.
authorInput.value = localStorage.getItem(NAME_KEY) ?? '';
reviewInput.value = sessionStorage.getItem(DRAFT_KEY) ?? '';
logLine(`localStorage (nombre) → ${JSON.stringify(authorInput.value)}`);
logLine(`sessionStorage (borrador) → ${JSON.stringify(reviewInput.value)}`);

// Guarda en cada tecla (evento input, módulo «Formularios con JavaScript»).
authorInput.addEventListener('input', () => localStorage.setItem(NAME_KEY, authorInput.value));
reviewInput.addEventListener('input', () => sessionStorage.setItem(DRAFT_KEY, reviewInput.value));

document.querySelector('#review-form').addEventListener('submit', (event) => {
  event.preventDefault();
  sessionStorage.removeItem(DRAFT_KEY); // publicada: el borrador sobra
  logLine(`📨 publicada: «${reviewInput.value}»; borrador eliminado`);
  reviewInput.value = '';
});
document.querySelector('#forget').addEventListener('click', () => {
  localStorage.removeItem(NAME_KEY);
  authorInput.value = '';
  logLine('🗑️ nombre olvidado en todas las pestañas');
});
logLine('Listo: escribe tu nombre y una reseña, pulsa ⟳ y después abre el ejemplo con ↗');

// sessionStorage es por PESTAÑA y por origen: sobrevive a recargas (⟳ vuelve
// a cargar la vista previa en la misma pestaña) y muere al cerrarla. La
// pestaña de ↗ es otra sesión: el borrador no está, el nombre sí.
```
