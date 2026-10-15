---
example_description: "El layout santo grial del módulo de grid, mobile-first: en pantallas estrechas todo va en una columna, y una sola media query redibujará las áreas en tres columnas desde 40rem"
example_tags: "css|responsive|grid|grid-template-areas|holy-grail|mobile-first|media-queries"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="caption">A 480px, una columna. Ensancha la vista previa o ábrela con ↗: desde 40rem (640px), cabecera, tres columnas y pie. Solo cambia <code>grid-template</code>.</p>
<div class="page">
  <header class="site-header"><strong>El Huerto en Casa</strong></header>
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

.caption {
  margin: 0 0 8px;
  font-size: 0.72rem;
}

/* Mobile-first: una sola columna, en el orden del HTML (el de lectura).
   minmax(0, 1fr) por la misma razón que en el módulo de grid: que nada largo
   ensanche la columna. */
.page {
  display: grid;
  grid-template:
    "header" auto
    "nav"    auto
    "main"   1fr
    "aside"  auto
    "footer" auto
    / minmax(0, 1fr);
  gap: 8px;
  min-height: 22rem;            /* en una página real, 100dvh */
  font-size: 0.8rem;
}

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

.site-main { background: #ffffff; }
.site-main h1 { margin: 0 0 6px; font-size: 1.1rem; }
.site-aside h2 { margin: 0 0 4px; font-size: 0.85rem; }
.site-main p,
.site-aside p { margin: 0; }

/* En móvil, el menú es una fila que se parte si no cabe (módulo de flexbox). */
.site-nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.page a { color: #0f5c55; }

.page a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}

/* La promesa del módulo de grid: una sola media query redibuja las áreas.
   Va al final, después de las reglas base (ejemplo 5). */
@media (width >= 40rem) {
  .page {
    grid-template:
      "header header header" auto
      "nav    main   aside"  1fr
      "footer footer footer" auto
      / 7rem minmax(0, 1fr) 7rem;
  }

  .site-nav ul {
    flex-direction: column;     /* el menú, vertical en su columna */
  }
}
```
