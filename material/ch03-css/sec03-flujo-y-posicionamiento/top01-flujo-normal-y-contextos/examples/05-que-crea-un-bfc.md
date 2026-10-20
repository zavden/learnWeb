---
example_description: "Una prueba visual de qué crea un BFC: si el margen del título se escapa de la caja azul, esa caja no crea un contexto de formato de bloque"
example_tags: "css|bfc|flow-root|overflow|inline-block|float"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="legend">Cada caja azul empieza con un título con <code>margin-top: 16px</code>.
  <strong>Naranja encima del título</strong>: el margen se escapó, no hay BFC.
  <strong>Azul encima del título</strong>: el margen quedó dentro, la caja crea un BFC.</p>

<div class="slot"><div class="test"><h3><code>display: block</code> · sin BFC</h3></div></div>
<div class="slot"><div class="test is-flow-root"><h3><code>display: flow-root</code> · BFC</h3></div></div>
<div class="slot"><div class="test is-overflow-auto"><h3><code>overflow: auto</code> · BFC</h3></div></div>
<div class="slot"><div class="test is-overflow-clip"><h3><code>overflow: clip</code> · sin BFC</h3></div></div>
<div class="slot"><div class="test is-inline-block"><h3><code>display: inline-block</code> · BFC</h3></div></div>
<div class="slot"><div class="test is-float"><h3><code>float: left</code> · BFC</h3></div></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.legend {
  font-size: 0.85rem;
}

/* Cada prueba vive en una ranura naranja (el color del margen en DevTools).
   La ranura es inline-block, así que es un BFC: lo que se escape de la caja azul
   se queda dentro de la ranura y se ve naranja. */
.slot {
  display: inline-block;
  vertical-align: top;             /* lección 2 */
  width: calc(50% - 8px);
  margin: 0 4px 8px 0;
  background: #fed7aa;
}

.test {
  background: #bfdbfe;
}

.test h3 {
  margin: 16px 8px 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* ❌ Un bloque normal: el margen del h3 colapsa con el de la caja y sale por arriba. */

/* ✅ La forma explícita de pedir un BFC. */
.is-flow-root {
  display: flow-root;
}

/* ✅ overflow distinto de visible crea un contenedor de scroll, y con él un BFC. */
.is-overflow-auto {
  overflow: auto;
}

/* ❌ clip recorta, pero NO crea un contenedor de scroll ni un BFC. */
.is-overflow-clip {
  overflow: clip;
}

/* ✅ inline-block = «en línea por fuera, flow-root por dentro». */
.is-inline-block {
  display: inline-block;
  width: 100%;
  vertical-align: top;             /* evita el hueco de la línea base (lección 2) */
}

/* ✅ Un flotante (lección 3) siempre crea un BFC. */
.is-float {
  float: left;
  width: 100%;
}
```
