---
example_description: "Un índice que se genera solo: recorre los h2 y h3 de un artículo, les da un id legible y único (sin tildes, y con -2 si el título se repite) y construye una lista anidada de enlaces; después la recorre recursivamente para comprobarla"
example_tags: "javascript|dom|integracion|indice|id|anclas|recursion|createelement"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="guide">
  <nav class="toc" aria-labelledby="toc-title">
    <h2 id="toc-title">En esta página</h2>
    <ol id="toc"></ol>
  </nav>
  <article id="article">
    <h1>Café de olla</h1>
    <p>La bebida de las mañanas frías, servida en jarro de barro.</p>
    <h2>Ingredientes</h2>
    <p>Agua, café molido grueso, piloncillo, canela y clavo.</p>
    <h2>Preparación</h2>
    <h3>El piloncillo</h3>
    <p>Disuélvelo en el agua a fuego medio antes de añadir nada más.</p>
    <h3>La canela y el clavo</h3>
    <p>Diez minutos de hervor suave, con la olla tapada.</p>
    <h2>¿Con o sin café?</h2>
    <p>Sin café es un ponche; con café, el desayuno.</p>
    <h2>Variantes del año</h2>
    <h3>Preparación</h3>
    <p>En diciembre se añade naranja y un poco de guayaba.</p>
  </article>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.guide {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
}
.toc {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 0.5rem;
}
.toc h2 {
  margin: 0.25rem 0;
  font-size: 1rem;
}
.toc ol {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
}
.toc a {
  color: #1d4ed8;
}
.toc a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Un id legible a partir de un título: minúsculas, sin tildes (NFD separa la
// letra de su tilde, lección «Strings»), y guiones entre las palabras.
function slugify(text) {
  let slug = '';
  let pendingDash = false;
  for (const char of text.normalize('NFD').toLowerCase()) {
    const code = char.codePointAt(0);
    if (code >= 0x300 && code <= 0x36f) continue; // la tilde suelta: fuera
    const isLetterOrDigit = (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9');
    if (isLetterOrDigit) {
      if (pendingDash && slug !== '') slug += '-';
      slug += char;
      pendingDash = false;
    } else {
      pendingDash = true; // espacios, ¿, ?… se convierten en un solo guion
    }
  }
  return slug;
}

// Único en TODA la página: si ya existe, prueba -2, -3…
function uniqueId(base) {
  let candidate = base;
  for (let n = 2; document.getElementById(candidate) !== null; n++) candidate = `${base}-${n}`;
  return candidate;
}

function createLink(heading) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = `#${heading.id}`;
  link.textContent = heading.textContent;
  item.append(link);
  return item;
}

const toc = document.querySelector('#toc');
let currentSection = null; // el <li> del último h2, donde cuelgan sus h3
for (const heading of document.querySelectorAll('#article h2, #article h3')) {
  if (!heading.id) heading.id = uniqueId(slugify(heading.textContent));
  const item = createLink(heading);
  if (heading.localName === 'h2' || currentSection === null) {
    toc.append(item);
    currentSection = item;
  } else {
    let sublist = currentSection.querySelector(':scope > ol');
    if (sublist === null) {
      sublist = document.createElement('ol');
      currentSection.append(sublist);
    }
    sublist.append(item);
  }
}

// Comprobación: recorrer el índice recursivamente e imprimirlo numerado.
function printToc(list, prefix = '') {
  [...list.children].forEach((item, index) => {
    const number = `${prefix}${index + 1}`;
    const link = item.querySelector(':scope > a');
    console.log(`${'  '.repeat(prefix.split('.').length - 1)}${number}. ${link.textContent} → ${link.getAttribute('href')}`);
    const sublist = item.querySelector(':scope > ol');
    if (sublist) printToc(sublist, `${number}.`);
  });
}
printToc(toc);

const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
console.log('¿todos los id son únicos? →', new Set(ids).size === ids.length);
console.log('¿cada enlace lleva a un título? →', [...toc.querySelectorAll('a')].every((link) =>
  document.getElementById(link.getAttribute('href').slice(1))?.matches('h2, h3')));
// Pulsa los enlaces: un href="#id" lleva al título sin JavaScript.
```
