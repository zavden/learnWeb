---
example_description: "El pie de página pegado abajo: la página es una columna flex de alto mínimo y el contenido principal crece con flex: 1, así que el pie nunca queda flotando a media pantalla"
example_tags: "css|flexbox|footer|columna|flex-grow|patrones"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Dos páginas con poco contenido, de 230px de alto como mínimo</p>

<div class="column">
  <p class="caption">❌ Flujo normal: el pie va justo después del contenido</p>
  <div class="page">
    <header class="page-header">Vivero Xochi</header>
    <main class="page-main">
      <h3>Pedido confirmado</h3>
      <p>Te avisaremos cuando salga.</p>
    </main>
    <footer class="page-footer">© 2026 · Aviso de privacidad</footer>
  </div>
</div>

<div class="column">
  <p class="caption">✅ Columna flex y <code>flex: 1</code> en <code>main</code></p>
  <div class="page is-flex">
    <header class="page-header">Vivero Xochi</header>
    <main class="page-main">
      <h3>Pedido confirmado</h3>
      <p>Te avisaremos cuando salga.</p>
    </main>
    <footer class="page-footer">© 2026 · Aviso de privacidad</footer>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 0 0 4px;
  font-size: 0.8rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: 200px;
  margin-right: 8px;
}

.caption {
  min-height: 2.6em;
  font-size: 0.75rem;
}

/* Cada .page hace de <body>: en una página real, las reglas de .page van en el body
   con min-height: 100dvh (el alto de la ventana) en lugar de 230px, y margin: 0. */
.page {
  min-height: 230px;
  outline: 1px solid #94a3b8;
  font-size: 0.8rem;
}

.page-header,
.page-footer {
  padding: 6px 8px;
  background: #166534;
  color: #ffffff;
}

.page-header {
  font-weight: bold;
}

.page-main {
  padding: 4px 8px;
  background: #f0fdf4;
}

.page-main h3 {
  margin: 4px 0;
  font-size: 0.9rem;
}

.page-main p {
  margin: 0;
}

/* ❌ En el flujo normal, cada bloque mide lo que su contenido: con poco contenido,
   el pie queda a media página y debajo sobra un hueco vacío. */

/* ✅ La página es una COLUMNA flex. La cabecera y el pie miden lo suyo; main, con
   flex: 1, se queda con todo el alto que sobre y empuja el pie hasta abajo (el fondo
   verde claro de main lo deja ver). Si el contenido crece, la página crece con él:
   es un min-height, no un height.
   Alternativa equivalente: margin-top: auto en el pie (lección 2). */
.is-flex {
  display: flex;
  flex-direction: column;
  outline: 2px dashed #7c3aed;
}

.is-flex .page-main {
  flex: 1;
}
```
