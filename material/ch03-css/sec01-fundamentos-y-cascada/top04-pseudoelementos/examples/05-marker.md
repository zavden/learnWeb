---
example_description: "::marker da estilo a la viñeta o al número de una lista y solo admite unas pocas propiedades"
example_tags: "css|pseudoelementos|marker|listas"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<ol class="steps">
  <li>Abre el editor</li>
  <li>Escribe el HTML</li>
  <li>Añade el CSS</li>
</ol>
<ul class="checklist">
  <li>Selectores</li>
  <li>Pseudoclases</li>
  <li>Pseudoelementos</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* ::marker → la viñeta o el número que el navegador dibuja delante de cada <li> */
.steps li::marker {
  color: #2563eb;
  font-weight: bold;
  /* ❌ ::marker solo admite unas pocas propiedades (color, fuentes, content,
     white-space, animaciones…). Estas dos se ignoran sin ningún aviso: */
  background: #fde68a;
  padding: 4px;
}

/* content sustituye el marcador por el texto que quieras.
   (Si tu navegador no admite content en ::marker, la alternativa es
   poner  list-style-type: "✔ ";  en el ul.) */
.checklist li::marker {
  content: "✔ ";
  color: #16a34a;
}
```
