---
example_description: "height: 50% no hace nada si el padre tiene height: auto, porque el porcentaje necesita una altura definida de la que calcularse"
example_tags: "css|modelo-de-cajas|height|porcentaje|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="parent auto">
  <div class="child">❌ height: 50% (padre con height: auto)</div>
</div>

<div class="parent fixed">
  <div class="child">✅ height: 50% (padre con height: 200px)</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.parent {
  width: 320px;
  margin-bottom: 16px;
  background: #bbf7d0;          /* el padre en verde */
  border: 2px solid #15803d;
}

.child {
  height: 50%;
  background: #bfdbfe;
  padding: 6px;
}

/* 🐛 Un porcentaje de altura se calcula sobre la altura del bloque contenedor.
   Si esa altura es auto, depende del contenido… que depende del hijo: sería circular.
   Por eso el navegador trata height: 50% como height: auto. */
.auto {
  /* height: auto (valor por defecto) */
}

/* ✅ Con una altura definida en el padre, el 50% sí tiene de qué calcularse: 100px. */
.fixed {
  height: 200px;
}

/* Los porcentajes de WIDTH sí funcionan siempre: el ancho del padre no depende de sus hijos. */
```
