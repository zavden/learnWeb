---
example_description: "header, nav, main, aside y footer forman el esqueleto de una página; cada uno es una región (landmark) a la que se puede saltar"
example_tags: "html|semantica|landmarks|header|main|footer"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<header>
  <p class="brand">La Huerta Urbana</p>
  <nav aria-label="Principal">
    <a href="#">Inicio</a> · <a href="#">Recetas</a> · <a href="#">Tienda</a>
  </nav>
</header>

<main>
  <h1>Cómo cultivar tomates en el balcón</h1>
  <p>Con una maceta de 20 litros y seis horas de sol al día puedes cosechar desde julio.</p>
</main>

<aside>
  <h2>Te puede interesar</h2>
  <p>Calendario de siembra por meses.</p>
</aside>

<footer>
  <p>© 2026 La Huerta Urbana · <a href="#">Contacto</a></p>
</footer>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 640px;
}

/* Solo para ver las regiones: cada elemento enseña su nombre en una etiqueta. */
header, nav, main, aside, footer {
  display: block;
  position: relative;
  margin: 18px 0;
  padding: 18px 10px 8px;
  border: 2px dashed #64748b;
}

header::before, nav::before, main::before, aside::before, footer::before {
  position: absolute;
  top: -11px;
  left: 8px;
  padding: 0 6px;
  background: #1e293b;
  color: white;
  font: 600 0.75rem/1.6 ui-monospace, monospace;
}

header::before { content: "<header> → banner"; }
nav::before    { content: "<nav> → navigation"; }
main::before   { content: "<main> → main"; }
aside::before  { content: "<aside> → complementary"; }
footer::before { content: "<footer> → contentinfo"; }
```
