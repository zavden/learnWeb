---
example_description: "display: flow-root crea una caja de bloque que encierra a sus hijos: el margen del título ya no se escapa del panel"
example_tags: "css|display|flow-root|bfc|margin"
example_stage: minimal
example_importance: important
---

# HTML

```html
<section class="panel">
  <h3 class="title">display: block</h3>
  <p class="text">El título toca el borde superior del verde: su margen de 24px se ha ESCAPADO del panel y ahora es el hueco blanco que hay encima.</p>
</section>

<section class="panel root">
  <h3 class="title">display: flow-root</h3>
  <p class="text">El margen del título queda DENTRO del panel: hay 24px de verde por encima del título.</p>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.panel {
  background: #bbf7d0;
  margin-bottom: 16px;
}

.title {
  margin-top: 24px;          /* queremos 24px de aire DENTRO del panel, encima del título */
  margin-bottom: 4px;
}

.text {
  margin: 0;
  padding-bottom: 12px;
}

/* Con display: block (el de section), el margen superior del primer hijo se une
   con el del padre y «sale» por arriba: es el colapso de márgenes (lección 3).

   display: flow-root es un bloque como cualquier otro hacia fuera, pero por dentro
   crea un CONTEXTO DE FORMATEO DE BLOQUE (BFC, por sus siglas en inglés): una frontera
   que nada atraviesa. Los márgenes de los hijos quedan dentro y, como verás en el módulo
   de flujo y posicionamiento, también los elementos flotantes. */
.root {
  display: flow-root;
}
```
