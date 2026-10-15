---
example_description: "El menú de un museo con anidamiento nativo: dentro de .nav-link, & es el selector de fuera; &:hover, &:focus-visible, &[aria-current] y &::after se pegan a él sin espacio, como en Sass, pero el navegador lee el anidamiento tal cual"
example_tags: "css|anidamiento|nesting|ampersand|pseudoclases|pseudoelementos"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Un menú escrito con anidamiento nativo, sin preprocesador. Pasa el ratón por los enlaces o recórrelos con <kbd>Tab</kbd>: el estado, el foco, la página actual y la raya de debajo están anidados dentro de <code>.nav-link</code>.</p>
<nav class="site-nav" aria-label="Principal">
  <a class="nav-link" href="/exposiciones" aria-current="page">Exposiciones</a>
  <a class="nav-link" href="/visita">Visita</a>
  <a class="nav-link" href="/coleccion">Colección</a>
  <a class="nav-link" href="/tienda">Tienda</a>
</nav>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0 12px;
  font-size: 0.72rem;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 8px 12px;
  border-bottom: 1px solid #cbd5e1;
}

.nav-link {
  position: relative;
  padding: 8px 4px;
  color: #334155;
  font-weight: 600;
  text-decoration: none;

  /* & es «el selector de fuera», aquí .nav-link. Pegado, sin espacio,
     &:hover significa .nav-link:hover: el MISMO elemento con el ratón encima. */
  &:hover {
    color: #1d4ed8;
  }

  &:focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Un atributo del mismo elemento: .nav-link[aria-current="page"].
     El estado «página actual» ya está en el HTML para los lectores de
     pantalla; el CSS solo lo lee. */
  &[aria-current="page"] {
    color: #1d4ed8;
  }

  /* Un pseudoelemento: .nav-link::after, la raya de debajo. */
  &::after {
    content: "";
    position: absolute;
    inset-inline: 4px;
    bottom: 2px;
    height: 3px;
    border-radius: 2px;
    background: transparent;
  }

  /* Y combinados: .nav-link[aria-current="page"]::after */
  &[aria-current="page"]::after {
    background: currentColor;
  }
}
```
