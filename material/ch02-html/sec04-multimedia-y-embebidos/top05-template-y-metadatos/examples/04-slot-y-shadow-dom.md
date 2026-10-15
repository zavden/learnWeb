---
example_description: "Adelanto de Web Components: un <template shadowrootmode=\"open\"> crea un shadow DOM al vuelo y un <slot> proyecta dentro el contenido que escribes en el elemento"
example_tags: "html|template|slot|shadow-dom|web-components"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Slot y shadow DOM</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 1rem; }
    h1 { font-size: 1.3rem; }
    info-card { display: block; max-width: 360px; }
  </style>
</head>
<body>
  <h1>Un hueco para el contenido: slot</h1>

  <!-- Adelanto de Web Components (capítulo 6). Un <template shadowrootmode="open"> dentro de
       un elemento crea su "shadow DOM" durante el propio parseo (shadow DOM declarativo, que
       Chrome admite). El <slot> es un hueco donde se proyecta el contenido "de luz": el que
       escribes fuera del template pero dentro del elemento. -->
  <info-card>
    <template shadowrootmode="open">
      <style>
        .box { border: 1px solid #64748b; border-radius: 8px; padding: 1rem; }
        h2 { margin: 0 0 .5rem; font-size: 1.1rem; color: #047857; }
        ::slotted(p) { margin: 0; color: #334155; }
      </style>
      <div class="box">
        <h2>Ficha del huerto</h2>
        <slot>Sin contenido</slot>
      </div>
    </template>

    <!-- Contenido de luz: se coloca en el <slot> de arriba -->
    <p>Parcela A-12, 4 m², con riego por goteo.</p>
  </info-card>

  <p>El borde, el título verde y la caja salen del shadow DOM; el texto, de la página.</p>

  <script>
    const card = document.querySelector('info-card');
    console.log('¿el elemento tiene shadow root? →', card.shadowRoot ? 'sí (open)' : 'no');
    const slot = card.shadowRoot.querySelector('slot');
    console.log('contenido proyectado en el slot →', slot.assignedNodes().map((node) => node.textContent.trim()).filter(Boolean).join(' '));
  </script>
</body>
</html>
```
