---
example_description: "overflow: hidden puesto «para arreglar algo» recorta también las sombras, los menús desplegables y los globos que sobresalen"
example_tags: "css|overflow|hidden|recorte|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="card clipped">
  <h3>❌ overflow: hidden</h3>
  <button class="menu-button">Opciones ▾</button>
  <ul class="menu"><li>Editar</li><li>Duplicar</li><li>Eliminar</li></ul>
</div>

<div class="card">
  <h3>✅ sin overflow: hidden</h3>
  <button class="menu-button">Opciones ▾</button>
  <ul class="menu"><li>Editar</li><li>Duplicar</li><li>Eliminar</li></ul>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.card {
  display: inline-block;
  vertical-align: top;
  width: 220px;
  height: 110px;
  margin-right: 24px;
  padding: 0 12px;
  border-radius: 12px;
  background: white;
  border: 1px solid #cbd5e1;
}

/* 🐛 overflow: hidden recorta TODO lo que se sale del borde de la caja, incluido el menú.
   Pasa mucho cuando se añade para «contener» algo (floats, márgenes, un border-radius
   sobre una imagen) y meses después alguien añade un desplegable dentro. */
.clipped {
  overflow: hidden;
}

.menu {
  width: 140px;
  margin: 6px 0 0;
  padding: 4px 0;
  list-style: none;
  background: white;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.2);   /* la sombra también se recorta */
}

.menu li {
  padding: 6px 12px;
}
```
