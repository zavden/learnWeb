---
example_description: "Cualquier overflow distinto de visible (y de clip) crea un nuevo contexto de formato: el margen del hijo deja de escaparse y el espaciado cambia"
example_tags: "css|overflow|bfc|margin|colapso|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<section class="panel">
  <h3 class="title">Sin overflow: el margin-top del título se escapa por arriba</h3>
</section>
<section class="panel scrollable">
  <h3 class="title">Con overflow: auto (añadido «solo para el scroll»): el margen queda dentro</h3>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 8px;
  background: #fed7aa;          /* el naranja que asoma es margen */
}

.panel {
  background: #bfdbfe;
  margin-bottom: 12px;
}

.title {
  margin: 32px 12px 12px;
  font-size: 1rem;
}

/* 🐛 overflow: auto (o hidden, o scroll) convierte el panel en un nuevo contexto de formato
   de bloque (BFC): los márgenes de sus hijos ya no colapsan con los suyos, así que el panel
   «crece» 32px por arriba. Quien añadió overflow para tener scroll no esperaba este cambio. */
.scrollable {
  overflow: auto;
}

/* Si lo que quieres es contener márgenes, dilo explícitamente con display: flow-root
   (lección de márgenes); si quieres scroll, cuenta con este efecto secundario. */
```
