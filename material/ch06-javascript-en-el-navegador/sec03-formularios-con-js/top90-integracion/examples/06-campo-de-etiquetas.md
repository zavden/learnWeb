---
example_description: "Un campo de etiquetas: beforeinput convierte la coma en «crear etiqueta», Enter se cancela en keydown para no enviar, lo pegado se trocea con split y una regex, cada etiqueta se normaliza y valida con \\p{L} (setCustomValidity para el error) y viaja como un <input type=\"hidden\" name=\"tags\">, que FormData recoge con getAll"
example_tags: "javascript|formularios|integracion|beforeinput|formdata|getall|regex|setcustomvalidity"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Nueva receta · Cocina de la abuela</h1>
  <form id="recipe" action="/recetas" method="post">
    <label for="title">Título</label>
    <input id="title" name="title" value="Pozole rojo">
    <label for="tag-input">Etiquetas</label>
    <ul id="tags" class="tags" aria-label="Etiquetas añadidas"></ul>
    <input id="tag-input" autocomplete="off" aria-describedby="tag-hint tag-error">
    <p id="tag-hint" class="hint">Escribe una etiqueta y pulsa coma o Enter. Solo letras, cifras y espacios.</p>
    <p id="tag-error" class="error"></p>
    <button type="submit">Publicar receta</button>
  </form>
  <ol id="log" class="log" aria-label="Registro"></ol>
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
  font-size: 1.15rem;
  margin-top: 0;
}
form {
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
label {
  font-weight: 600;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.tags li {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.25rem 0.1rem 0.6rem;
  border-radius: 999px;
  background: #e0e7ff;
}
.tags button {
  padding: 0 0.4rem;
  border: 0;
  background: transparent;
}
.hint,
.error {
  margin: 0;
  font-size: 0.9rem;
}
.hint {
  color: #52606d;
}
.error {
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
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Combina: «Leer y escribir controles» (beforeinput → input), «FormData y envío»
// (getAll, inputs ocultos), «Validación con JavaScript» (setCustomValidity,
// aria-describedby) y «Expresiones regulares» (split, \p{L}, \s+).
const form = document.querySelector('#recipe');
const tagInput = document.querySelector('#tag-input');
const tagList = document.querySelector('#tags');
const logList = document.querySelector('#log');
const VALID_TAG = /^[\p{L}\p{N}][\p{L}\p{N} ]{1,23}$/v;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

const currentTags = () => new FormData(form).getAll('tags');
// Mientras haya una etiqueta rechazada en el campo, el formulario no se envía.
function showError(message) {
  tagInput.setCustomValidity(message); // '' lo vuelve a dar por bueno
  tagInput.setAttribute('aria-invalid', String(message !== ''));
  document.querySelector('#tag-error').textContent = message ? `⚠ ${message}` : '';
  if (message) logLine(`⚠️ ${message}`);
  return false;
}

function addTag(raw) {
  const tag = raw.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
  if (tag === '') return false;
  if (!VALID_TAG.test(tag)) return showError(`«${tag}» no vale: de 2 a 24 letras, cifras o espacios.`);
  if (currentTags().includes(tag)) return showError(`«${tag}» ya está.`);
  showError('');
  const item = document.createElement('li');
  const text = document.createElement('span');
  text.textContent = tag;
  const remove = document.createElement('button');
  remove.type = 'button'; // dentro de un form: sin type, enviaría
  remove.setAttribute('aria-label', `Quitar ${tag}`);
  remove.textContent = '×';
  const hidden = document.createElement('input');
  hidden.type = 'hidden'; // viaja con el formulario como un par tags=…
  hidden.name = 'tags';
  hidden.value = tag;
  item.append(text, remove, hidden);
  tagList.append(item);
  logLine(`🏷️ + ${tag} → ${JSON.stringify(currentTags())}`);
  return true;
}

// La coma no se escribe: crea la etiqueta con lo que hay en el campo.
tagInput.addEventListener('beforeinput', (event) => {
  if (event.inputType !== 'insertText' || event.data !== ',') return;
  event.preventDefault();
  if (addTag(tagInput.value)) tagInput.value = ''; // si no vale, el texto se queda para corregirlo
});
// Lo pegado puede traer varias: «café, cacao; maíz» se trocea con split.
tagInput.addEventListener('input', (event) => {
  if (tagInput.validity.customError) showError(''); // premiar pronto: al editar, fuera el error
  if (event.inputType !== 'insertFromPaste' || !/[,;]/.test(tagInput.value)) return;
  const pieces = tagInput.value.split(/\s*[,;]\s*/);
  tagInput.value = pieces.pop(); // el último trozo se queda para seguir escribiendo
  pieces.forEach(addTag);
});
// Enter en el campo «pulsaría» el botón de envío: aquí crea la etiqueta.
tagInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.isComposing || tagInput.value.trim() === '') return;
  event.preventDefault();
  if (addTag(tagInput.value)) tagInput.value = '';
});
tagList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const tag = button.closest('li').querySelector('input').value;
  button.closest('li').remove();
  tagInput.focus(); // el botón desapareció: el foco vuelve al campo
  logLine(`🏷️ − ${tag} → ${JSON.stringify(currentTags())}`);
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  logLine(`📨 ${JSON.stringify({ title: formData.get('title'), tags: formData.getAll('tags') })}`);
});
['Mexicana', 'caldos'].forEach(addTag);
logLine('Listo: escribe «Sin gluten,»; luego «caldos» y Enter, y bórralo; pega «maíz, chile guajillo,» y pulsa «Publicar receta»');
```
