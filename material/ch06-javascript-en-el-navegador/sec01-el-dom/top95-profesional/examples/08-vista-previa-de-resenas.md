---
example_description: "La vista previa de un editor de reseñas: un formato mínimo (**negrita**, _cursiva_, listas con guion, párrafos) convertido en nodos con createElement, sin innerHTML, así que cualquier etiqueta escrita se ve como texto; y un segundo panel que limpia HTML pegado de otra web con setHTML en Chrome (o lo muestra como texto)"
example_tags: "javascript|dom|profesional|editor|seguridad|xss|sethtml|createelement"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="editor">
  <h1>Escribe tu reseña</h1>
  <div class="panes">
    <section class="pane" aria-labelledby="write-title">
      <h2 id="write-title">Texto</h2>
      <label for="review-source">Usa **negrita**, _cursiva_ y líneas que empiezan por «- »</label>
      <textarea id="review-source" rows="9"></textarea>
    </section>
    <section class="pane" aria-labelledby="preview-title">
      <h2 id="preview-title">Vista previa</h2>
      <div class="preview" id="review-preview" aria-live="polite"></div>
    </section>
  </div>
  <section class="pane" aria-labelledby="paste-title">
    <h2 id="paste-title">HTML pegado de otra web</h2>
    <label for="paste-source">Pega HTML: solo se queda lo seguro</label>
    <textarea id="paste-source" rows="3"></textarea>
    <div class="preview" id="paste-preview"></div>
    <p class="note" id="paste-mode"></p>
  </section>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.editor {
  max-width: 60rem;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
h2 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}
.panes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.pane {
  flex: 1 1 16rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}
textarea {
  font: inherit;
  padding: 0.5rem;
  border: 1px solid #64748b;
  border-radius: 0.25rem;
}
textarea:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.preview {
  min-height: 4rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border: 1px dashed #94a3b8;
  border-radius: 0.25rem;
}
.preview p {
  margin: 0 0 0.5rem;
}
.note {
  margin: 0;
  font-size: 0.85rem;
  color: #475569;
}
```

# JavaScript

```javascript
// VISTA PREVIA SEGURA DE UNA RESEÑA.
//
// Decisiones:
// - El formato de las reseñas se convierte en NODOS: un recorrido carácter a
//   carácter (sin expresiones regulares) abre y cierra <strong> y <em> con
//   una pila; el texto entra siempre como nodos de texto. Nada se interpreta
//   como HTML, así que «<script>» se ve tal cual (lección «Crear y modificar
//   elementos»).
// - Bloques: una línea en blanco separa párrafos, un salto simple es un <br>
//   y las líneas que empiezan por «- » forman una lista.
// - El HTML pegado pasa por setHTML() (el Sanitizer del navegador, en Chrome);
//   sin setHTML, se muestra como texto: nunca innerHTML con HTML ajeno.
// - La vista previa se rehace entera con replaceChildren en cada cambio: es
//   pequeña y no tiene estado que conservar.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

// **negrita** y _cursiva_ → nodos. Un marcador sin cerrar se queda abierto
// hasta el final del texto (como en muchos editores sencillos).
function parseInline(text) {
  const root = document.createDocumentFragment();
  const stack = [root];
  let buffer = '';
  const flush = () => {
    if (buffer !== '') stack.at(-1).append(buffer); // un string en append = un nodo de texto
    buffer = '';
  };
  const toggle = (tagName) => {
    flush();
    const top = stack.at(-1);
    if (top !== root && top.localName === tagName) {
      stack.pop();
    } else {
      const element = document.createElement(tagName);
      top.append(element);
      stack.push(element);
    }
  };
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith('**', i)) {
      toggle('strong');
      i += 1;
    } else if (text[i] === '_') {
      toggle('em');
    } else {
      buffer += text[i];
    }
  }
  flush();
  return root;
}

function renderReview(source) {
  const fragment = document.createDocumentFragment();
  const blocks = source.replaceAll('\r\n', '\n').split('\n\n').map((block) => block.trim()).filter(Boolean);
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.every((line) => line.startsWith('- '))) {
      const list = document.createElement('ul');
      for (const line of lines) {
        const item = document.createElement('li');
        item.append(parseInline(line.slice(2)));
        list.append(item);
      }
      fragment.append(list);
    } else {
      const paragraph = document.createElement('p');
      lines.forEach((line, index) => {
        if (index > 0) paragraph.append(document.createElement('br'));
        paragraph.append(parseInline(line));
      });
      fragment.append(paragraph);
    }
  }
  return fragment;
}

const canSanitize = typeof Element.prototype.setHTML === 'function';
function renderPasted(target, html) {
  if (canSanitize) target.setHTML(html);
  else target.textContent = html;
}

// ── Conexión con la página (el evento input: módulo siguiente) ──────────
const source = document.querySelector('#review-source');
const preview = document.querySelector('#review-preview');
const pasteSource = document.querySelector('#paste-source');
const pastePreview = document.querySelector('#paste-preview');
document.querySelector('#paste-mode').textContent = canSanitize
  ? 'Limpio con setHTML(): sin scripts, sin atributos on… ni enlaces javascript:.'
  : 'Este navegador no tiene setHTML(): el HTML se muestra como texto.';
source.addEventListener('input', () => preview.replaceChildren(renderReview(source.value)));
pasteSource.addEventListener('input', () => renderPasted(pastePreview, pasteSource.value));

source.value = [
  '**Muy rico**, _sin duda_ el mejor café de la tienda.',
  'Lo preparo en prensa francesa.',
  '',
  '- Aroma a chocolate',
  '- Molienda pareja',
  '',
  '<script>alert("hola")<\/script> <img src="x" onerror="alert(2)"> ¿se ejecuta?',
].join('\n');
preview.replaceChildren(renderReview(source.value));
pasteSource.value = '<p>Hola <b onclick="alert(1)">mundo</b></p><script>alert(2)<\/script><a href="javascript:alert(3)">enlace</a>';
renderPasted(pastePreview, pasteSource.value);

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const count = (root, selector) => root.querySelectorAll(selector).length;
audit('bloques', [...preview.children].map((block) => block.localName).join(' '), 'p ul p');
audit('negritas, cursivas, saltos', `${count(preview, 'strong')} ${count(preview, 'em')} ${count(preview, 'br')}`, '1 1 1');
audit('elementos de la lista', count(preview, 'li'), 2);
audit('<script> e <img> creados', count(preview, 'script, img'), 0);
audit('se lee como texto', preview.lastElementChild.textContent.startsWith('<script>'), true);
audit('formato anidado', renderReview('**negrita y _cursiva_**').firstElementChild.innerHTML, '<strong>negrita y <em>cursiva</em></strong>');
console.log('HTML pegado →', canSanitize ? 'setHTML()' : 'como texto');
audit('pegado: scripts, atributos on… y javascript:', `${count(pastePreview, 'script')} ${count(pastePreview, '[onclick]')} ${count(pastePreview, '[href^="javascript:"]')}`, '0 0 0');
audit('pegado: el formato inofensivo se queda', canSanitize ? count(pastePreview, 'p b') : 1, 1);
```
