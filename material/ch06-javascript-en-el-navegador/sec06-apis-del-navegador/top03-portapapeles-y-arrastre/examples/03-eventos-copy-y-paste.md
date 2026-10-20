---
example_description: "Los eventos copy y paste dan acceso al portapapeles sin permisos, solo cuando la persona copia o pega: copy añade la fuente al texto copiado de una receta (clipboardData.setData + preventDefault) y paste convierte las filas pegadas desde una hoja de cálculo (separadas por tabuladores) en una tabla"
example_tags: "javascript|clipboard|copy|paste|clipboarddata|hoja-de-calculo"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pozole rojo</h1>
  <ul id="ingredients" class="ingredients">
    <li>2 kg de maíz pozolero</li>
    <li>1 kg de espinazo de cerdo</li>
    <li>5 chiles guajillo y 3 anchos</li>
  </ul>
  <label for="paste-box">Pega aquí filas de tu hoja de cálculo (producto, cantidad, precio):</label>
  <textarea id="paste-box" rows="2" placeholder="Cmd + V o Ctrl + V"></textarea>
  <table class="order">
    <caption>Pedido importado</caption>
    <thead><tr><th scope="col">Producto</th><th scope="col">Cant.</th><th scope="col">Precio</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>
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
  margin: 0 0 0.25rem;
}
.ingredients {
  margin: 0 0 0.75rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
}
textarea {
  box-sizing: border-box;
  width: 100%;
  font: inherit;
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
}
textarea:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}
.order {
  width: 100%;
  margin-top: 0.5rem;
  border-collapse: collapse;
  background: #ffffff;
}
.order caption {
  text-align: start;
  font-weight: 700;
}
.order th,
.order td {
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid #e4e7eb;
  text-align: start;
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
const SOURCE = 'Fuente: Recetario de la Cocina de Lupita · /recetas/pozole-rojo';
const pasteBox = document.querySelector('#paste-box');
const rowsBody = document.querySelector('#rows');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// COPY: se dispara al copiar (Cmd/Ctrl + C, menú contextual). Escuchamos en
// document y actuamos solo si la selección empieza en la lista.
const ingredients = document.querySelector('#ingredients');
document.addEventListener('copy', (event) => {
  const selection = document.getSelection();
  const selected = selection.toString().trim();
  if (!selected || !ingredients.contains(selection.anchorNode)) return; // que copie lo normal
  // clipboardData solo se puede escribir dentro de este evento.
  event.clipboardData.setData('text/plain', `${selected}\n\n${SOURCE}`);
  event.preventDefault(); // sin esto, se copiaría solo la selección
  logLine(`📋 copy → ${selected.split('\n').length} línea(s) + la fuente`);
});

// PASTE: el texto pegado llega en clipboardData, sin pedir permiso.
function importRows(text) {
  const rows = text.trim().split(/\r?\n/).map((line) => line.split('\t'));
  for (const [product, quantity = '', price = ''] of rows) {
    const row = document.createElement('tr');
    for (const value of [product, quantity, price]) {
      const cell = document.createElement('td');
      cell.textContent = value.trim(); // siempre como texto
      row.append(cell);
    }
    rowsBody.append(row);
  }
  return rows.length;
}
pasteBox.addEventListener('paste', (event) => {
  const types = [...event.clipboardData.types].sort().join(', ');
  const text = event.clipboardData.getData('text/plain');
  if (!text.includes('\t')) {
    logLine(`📋 paste → tipos: ${types} · sin tabuladores: lo pego como texto normal`);
    return; // acción por defecto: el texto entra en el textarea
  }
  event.preventDefault(); // las filas van a la tabla, no al textarea
  logLine(`📋 paste → tipos: ${types} · ${importRows(text)} fila(s) importadas`);
});

logLine('Listo: selecciona un ingrediente y cópialo; luego pega filas de una hoja de cálculo');

// Al pegar desde Excel, Numbers o Google Sheets llegan también 'text/html'
// (la tabla con formato) y a veces imágenes: elige el tipo que entiendas.
```
