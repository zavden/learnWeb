---
example_description: "Tres formas de crear un BFC y sus efectos secundarios: overflow recorta lo que sobresale, inline-block encoge la caja y flow-root no cambia nada más"
example_tags: "css|bfc|flow-root|overflow|inline-block"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="notice is-overflow">
  <span class="avatar" aria-hidden="true">LS</span>
  <h3>overflow: hidden</h3>
  <p>❌ Lucía Serrano comentó tu foto. El avatar que sobresale queda recortado.</p>
</div>

<div class="notice is-inline-block">
  <span class="avatar" aria-hidden="true">AM</span>
  <h3>display: inline-block</h3>
  <p>❌ Andrés Molina te sigue. La caja encoge.</p>
</div>

<div class="notice is-flow-root">
  <span class="avatar" aria-hidden="true">PN</span>
  <h3>display: flow-root</h3>
  <p>✅ Paula Navarro compartió una ruta. Sin efectos secundarios.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* Las tres tarjetas crean un BFC: el margen del título y el del avatar quedan dentro.
   Lo que cambia es lo que cada técnica hace ADEMÁS de eso. */
.notice {
  margin: 28px 0 0;
  padding: 0 12px 4px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #f1f5f9;
}

.notice h3 {
  margin: 4px 0 0;
  font-size: 0.9rem;
  font-family: ui-monospace, Menlo, Consolas, monospace;
}

.notice p {
  margin: 2px 0 4px;
  font-size: 0.85rem;
}

/* El avatar sube 20px por encima de la tarjeta con un margen negativo. */
.avatar {
  display: block;
  width: 36px;
  height: 36px;
  margin-top: -20px;
  border-radius: 50%;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: bold;
  line-height: 36px;
  text-align: center;
}

/* ❌ overflow: hidden crea el BFC… y recorta todo lo que sale del borde. */
.is-overflow {
  overflow: hidden;
}

/* ❌ inline-block crea el BFC… y la caja deja de llenar el ancho: mide su contenido. */
.is-inline-block {
  display: inline-block;
}

/* ✅ flow-root solo crea el BFC: sigue siendo un bloque de ancho completo y no recorta. */
.is-flow-root {
  display: flow-root;
}
```
