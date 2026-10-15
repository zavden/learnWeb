---
example_description: "Leer un archivo que elige la persona: <input type=\"file\"> da objetos File (name, size, type); file.text() lee el contenido como texto (una promesa) y file.slice(0, 4).arrayBuffer() los primeros bytes; se valida el tipo y el tamaño (accept solo filtra el diálogo) y se convierte un CSV o un JSON de recetas en una lista"
example_tags: "javascript|file-api|input-file|file-text|csv|json|validacion"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Importar recetas</h1>
  <p class="samples">Archivos de prueba (de la carpeta assets): <a href="recipes.csv" download>recipes.csv</a> · <a href="recipes.json" download>recipes.json</a></p>
  <label for="recipes-file">Elige un archivo .csv o .json (máx. 100 KB)</label>
  <input id="recipes-file" type="file" accept=".csv,.json,text/csv,application/json">
  <p id="error" class="error" aria-live="polite"></p>
  <ul id="recipes" class="recipes"></ul>
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
  margin: 0 0 0.5rem;
}
a {
  color: #1d4ed8;
}
label {
  display: block;
  margin-bottom: 0.25rem;
}
input:focus-visible,
a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.error {
  min-height: 1.2em;
  color: #b91c1c;
}
.recipes {
  padding-left: 1.2rem;
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
const MAX_BYTES = 100 * 1024;
const input = document.querySelector('#recipes-file');
const errorText = document.querySelector('#error');
const recipeList = document.querySelector('#recipes');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// accept solo filtra el diálogo («Todos los archivos» sigue ahí): comprueba.
function problemWith(file) {
  if (!/\.(csv|json)$/i.test(file.name)) return `${file.name}: solo se admiten archivos .csv o .json`;
  if (file.size > MAX_BYTES) return `${file.name}: pesa más de 100 KB`;
  return '';
}

// CSV sencillo: cabecera + una receta por línea, sin comas dentro de los
// campos (para CSV con comillas, usa un parser de verdad).
function parseCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const keys = header.split(',');
  return lines.map((line) => Object.fromEntries(line.split(',').map((value, index) => [keys[index], value])));
}

input.addEventListener('change', async () => {
  const file = input.files[0];
  recipeList.replaceChildren();
  if (!file) return;
  const problem = problemWith(file);
  input.setCustomValidity(problem); // el mismo customError del módulo de formularios
  errorText.textContent = problem;
  if (problem) {
    logLine(`⛔ ${problem}`);
    return;
  }
  logLine(`📄 ${file.name} · ${file.size} bytes · ${file.type}`);

  // Los bytes del principio (los datos binarios llegan en el capítulo 8).
  const firstBytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  logLine(`primeros 4 bytes → ${[...firstBytes].map((byte) => byte.toString(16).padStart(2, '0')).join(' ')}`);

  const text = await file.text(); // todo el archivo como texto UTF-8
  logLine(`texto → ${text.length} caracteres`);
  try {
    const recipes = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseCsv(text);
    for (const recipe of recipes) {
      const item = document.createElement('li');
      item.textContent = `${recipe.name} · ${recipe.minutes} min · ${recipe.servings} porciones`;
      recipeList.append(item);
    }
    logLine(`✅ ${recipes.length} recetas → ${recipes.map((recipe) => recipe.name).join(', ')}`);
  } catch (error) {
    errorText.textContent = `${file.name} no tiene el formato esperado`;
    logLine(`⛔ ${error.name}: ${error.message}`);
  }
});
logLine('Listo: elige recipes.csv o recipes.json (descárgalos antes con los enlaces)');
```
