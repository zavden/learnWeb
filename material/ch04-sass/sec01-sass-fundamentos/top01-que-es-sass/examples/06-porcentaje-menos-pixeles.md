---
example_description: "Sass no puede calcular 100% − 240px: el porcentaje solo se conoce en el navegador. Error de compilación; la solución es calc()"
example_tags: "sass|scss|compilar|calc|unidades|error"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="layout">
  <nav class="sidebar" aria-label="Secciones">Menú lateral (240px)</nav>
  <main class="content">
    <p>❌ Esta página sale sin estilos: el CSS no se pudo generar.</p>
    <p>Lee el error de Sass y luego corrige la línea marcada con 🐛.</p>
  </main>
</div>
```

# SCSS

```scss
$sidebar: 240px;

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.sidebar {
  float: left;
  width: $sidebar;
  padding: 16px;
  box-sizing: border-box;
  background: #e0e7ff;
}

.content {
  float: left;
  // 🐛 Sass intenta hacer esta resta AL COMPILAR, pero ¿cuánto es 100%?
  // Depende del ancho del padre, y eso solo lo sabe el navegador al pintar.
  // Sass no puede restar % y px → «100% and 240px have incompatible units».
  width: 100% - $sidebar;

  // ✅ Solución: deja la cuenta para el navegador con calc().
  // Sass mete el valor de la variable y copia calc() al CSS:
  //   width: calc(100% - $sidebar);   →   width: calc(100% - 240px);
  padding: 16px;
  box-sizing: border-box;
}

// (Hoy este diseño se haría con flexbox o grid; aquí importa la resta.)
```
