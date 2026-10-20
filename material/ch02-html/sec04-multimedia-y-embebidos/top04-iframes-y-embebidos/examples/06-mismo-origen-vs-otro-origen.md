---
example_description: "La página anfitriona solo puede leer el contenido de un marco del mismo origen: contentDocument de un marco de otro origen es null"
example_tags: "html|iframe|contentDocument|mismo-origen|otro-origen|seguridad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<h1>¿Puede la página leer dentro del marco?</h1>

<!-- Marco A: un srcdoc sin sandbox hereda el origen de esta página → MISMO origen -->
<figure>
  <iframe id="same" title="Marco del mismo origen" width="260" height="70"
          srcdoc="<p style='font:14px system-ui;margin:.6rem'>Contenido del marco A</p>"></iframe>
  <figcaption>A · mismo origen</figcaption>
</figure>

<!-- Marco B: con sandbox (sin allow-same-origin) tiene un origen opaco → OTRO origen -->
<figure>
  <iframe id="cross" sandbox="allow-scripts" title="Marco de otro origen" width="260" height="70"
          srcdoc="<p style='font:14px system-ui;margin:.6rem'>Contenido del marco B</p>"></iframe>
  <figcaption>B · otro origen (sandbox)</figcaption>
</figure>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
}

h1 {
  font-size: 1.3rem;
}

figure {
  margin: 0 0 1rem;
}

iframe {
  display: block;
  border: 1px solid #64748b;
  border-radius: 8px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
// contentDocument es el documento que hay dentro del marco… si la política de mismo origen
// lo permite. Entre orígenes distintos, el navegador devuelve null: tu código no ve nada
// del otro sitio (ni él del tuyo). Es la regla que aísla a cada sitio del resto.
const same = document.getElementById('same');
const cross = document.getElementById('cross');

// Los marcos cargan su srcdoc de forma asíncrona: esperamos a que estén listos.
window.addEventListener('load', () => {
  const sameDoc = same.contentDocument;
  const crossDoc = cross.contentDocument;
  console.log('marco A (mismo origen) → contentDocument:', sameDoc ? 'lo leo' : 'null');
  console.log('   su texto:', sameDoc ? sameDoc.body.textContent.trim() : '(sin acceso)');
  console.log('marco B (otro origen) → contentDocument:', crossDoc ? 'lo leo' : 'null');
});
```
