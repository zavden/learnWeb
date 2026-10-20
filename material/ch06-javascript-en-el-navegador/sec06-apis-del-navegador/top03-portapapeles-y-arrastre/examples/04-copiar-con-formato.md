---
example_description: "navigator.clipboard.write con un ClipboardItem que lleva dos versiones del mismo contenido, text/html y text/plain: al pegar en un correo o un documento llega con formato, y en un editor de texto llega plano; un cuadro de pegado muestra los tipos que llegan"
example_tags: "javascript|clipboard|clipboarditem|text-html|blob|formato"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <article id="recipe" class="recipe">
    <h1>Café de olla</h1>
    <p><strong>4 tazas</strong> · 15 minutos</p>
    <ul>
      <li>1 l de agua</li>
      <li>4 cucharadas de café molido grueso</li>
      <li>1 cono de piloncillo y 1 raja de canela</li>
    </ul>
  </article>
  <p><button id="copy" type="button">Copiar receta con formato</button></p>
  <label for="paste-check">Pega aquí para ver qué ha llegado:</label>
  <textarea id="paste-check" rows="2" placeholder="Cmd + V o Ctrl + V"></textarea>
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
.recipe {
  padding: 0.5rem 1rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.recipe h1 {
  font-size: 1.2rem;
  margin: 0.25rem 0;
}
.recipe p {
  margin: 0;
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
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
textarea:focus-visible {
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
const recipe = document.querySelector('#recipe');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Dos versiones del mismo contenido: quien pegue elige la que entienda.
function recipeAsPlainText() {
  const title = recipe.querySelector('h1').textContent;
  const meta = recipe.querySelector('p').textContent;
  const items = [...recipe.querySelectorAll('li')].map((item) => `- ${item.textContent}`);
  return [title, meta, ...items].join('\n');
}

document.querySelector('#copy').addEventListener('click', async () => {
  const html = recipe.innerHTML.trim(); // nuestro propio HTML, sin datos ajenos
  const plain = recipeAsPlainText();
  // Un Blob son bytes con un tipo MIME (módulo «Red y almacenamiento»).
  const item = new ClipboardItem({
    'text/html': new Blob([html], { type: 'text/html' }),
    'text/plain': new Blob([plain], { type: 'text/plain' }),
  });
  try {
    await navigator.clipboard.write([item]);
    logLine(`✅ copiado en dos tipos: text/html y text/plain (${plain.split('\n').length} líneas)`);
  } catch (error) {
    const reason = window.origin === 'null' ? 'esta tarjeta es un iframe aislado; ábrela con ▶ o en el editor' : 'permiso denegado o la página sin foco';
    logLine(`⚠️ ${error.name}: ${reason}`);
  }
});

// Comprobación sin permisos: el evento paste enseña los tipos que llegan.
document.querySelector('#paste-check').addEventListener('paste', (event) => {
  const types = [...event.clipboardData.types].sort().join(', ');
  const html = event.clipboardData.getData('text/html');
  logLine(`📋 paste → tipos: ${types}`);
  logLine(`   ¿el HTML trae <strong>? ${html.includes('<strong>')} · texto: ${event.clipboardData.getData('text/plain').split('\n')[0]}…`);
});

logLine(`¿ClipboardItem admite image/png? ${ClipboardItem.supports('image/png')} · ¿image/webp? ${ClipboardItem.supports('image/webp')}`);
logLine('Listo: pulsa «Copiar receta con formato» y pega en el cuadro (y en un correo)');
```
