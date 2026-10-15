---
example_description: "display con dos palabras: tipo exterior (block/inline) + tipo interior (flow/flow-root); inline flow-root es inline-block"
example_tags: "css|display|inline-block|flow-root"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<p>Cada pareja se escribe distinto y se comporta igual. A la derecha, el display COMPUTADO que da el navegador.</p>
<div class="pair">
  Texto <span class="box" style="display: inline-block">inline-block</span>
  y <span class="box" style="display: inline flow-root">inline flow-root</span> en la misma línea.
</div>
<div class="pair">
  <div class="box" style="display: block">block</div>
  <div class="box" style="display: block flow">block flow</div>
</div>
<div class="pair">
  <div class="box" style="display: flow-root">flow-root</div>
  <div class="box" style="display: block flow-root">block flow-root</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Exterior = cómo se comporta la caja entre sus HERMANOS:
     block  → línea propia;   inline → dentro de una línea de texto.
   Interior = cómo coloca a sus HIJOS:
     flow   → flujo normal;   flow-root → flujo normal en un BFC propio;
     flex / grid → los veremos en sus módulos (display: flex = block flex).
   Las palabras de siempre son atajos: inline-block = inline flow-root. */
.pair {
  border: 1px dashed #94a3b8;
  padding: 8px;
  margin-bottom: 8px;
}

.box {
  width: 220px;
  padding: 4px;
  margin: 4px;
  background: #dbeafe;
  border: 1px solid #2563eb;
  font-size: 0.85rem;
}

.box::after {
  content: " → " attr(data-computed);
  color: #475569;
}

/* Los display de cada caja van en su atributo style solo para leerlos junto al resultado. */
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Guarda el display computado de cada
// caja en un atributo data-computed, que el ::after del CSS muestra en pantalla.
for (const box of document.querySelectorAll('.box')) {
  box.dataset.computed = getComputedStyle(box).display;
}
```
