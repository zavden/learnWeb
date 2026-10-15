---
example_description: "El layout «santo grial» con grid-template: cabecera y pie a todo el ancho, menú, contenido y barra lateral de la misma altura, y el pie abajo aunque haya poco contenido"
example_tags: "css|grid|grid-template|grid-template-areas|holy-grail|layout"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<div class="page">
  <header class="site-header">
    <strong>El Huerto en Casa</strong>
  </header>

  <nav class="site-nav" aria-label="Secciones">
    <ul>
      <li><a href="/guias">Guías</a></li>
      <li><a href="/plantas">Plantas</a></li>
      <li><a href="/tienda">Tienda</a></li>
    </ul>
  </nav>

  <main class="site-main">
    <h1>Tomates en maceta</h1>
    <p>Elige una maceta de al menos 20 litros con agujeros. Siembra en primavera y pon un tutor cuando la planta mida un palmo.</p>
  </main>

  <aside class="site-aside">
    <h2>Te puede interesar</h2>
    <p><a href="/guias/albahaca">Albahaca junto a los tomates</a></p>
  </aside>

  <footer class="site-footer">© 2026 El Huerto en Casa</footer>
</div>
```

# CSS

```css
body {
  margin: 8px;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* El esqueleto entero en una declaración: cada cadena es una fila con su altura
   al final; tras la barra, las columnas. En una página real, min-height: 100dvh
   (aquí, 22rem para que quepa en la tarjeta).
   - auto / 1fr / auto: cabecera y pie a su medida; el centro se queda el resto,
     así que el pie baja al fondo aunque haya poco contenido.
   - 7rem minmax(0, 1fr) 7rem: menú y barra lateral fijos; el contenido, lo que
     sobre, y sin mínimo automático (un <pre> o una URL no lo ensancharán). */
.page {
  display: grid;
  grid-template:
    "header header header" auto
    "nav    main   aside"  1fr
    "footer footer footer" auto
    / 7rem minmax(0, 1fr) 7rem;
  gap: 8px;
  min-height: 22rem;
  font-size: 0.8rem;
}

/* Cada pieza, en su área. El HTML sigue en orden de lectura: cabecera, menú,
   contenido, barra lateral y pie. */
.site-header { grid-area: header; }
.site-nav    { grid-area: nav; }
.site-main   { grid-area: main; }
.site-aside  { grid-area: aside; }
.site-footer { grid-area: footer; }

.page > * {
  padding: 8px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.site-main {
  background: #ffffff;
}

.site-main h1 {
  margin: 0 0 6px;
  font-size: 1.1rem;
}

.site-aside h2 {
  margin: 0 0 4px;
  font-size: 0.85rem;
}

.site-main p,
.site-aside p {
  margin: 0;
}

.site-nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.page a {
  color: #0f5c55;
}

.page a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}
```
