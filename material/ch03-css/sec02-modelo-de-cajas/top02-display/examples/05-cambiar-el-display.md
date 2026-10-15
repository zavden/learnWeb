---
example_description: "El display es solo CSS: una lista puede ser un menú horizontal (li inline) y un enlace, una fila entera clicable (a block)"
example_tags: "css|display|navegacion|list-item"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<nav class="top-menu" aria-label="Principal">
  <ul>
    <li><a href="#">Inicio</a></li>
    <li><a href="#">Recetas</a></li>
    <li><a href="#">Contacto</a></li>
  </ul>
</nav>

<nav class="side-menu" aria-label="Categorías">
  <ul>
    <li><a href="#">Desayunos</a></li>
    <li><a href="#">Platos de cuchara</a></li>
    <li><a href="#">Postres</a></li>
  </ul>
</nav>
<p class="hint">En el menú lateral, pasa el ratón por la fila entera: todo es enlace, no solo el texto.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

ul {
  margin: 0;
  padding: 0;
}

/* 1) Menú horizontal: los li pasan de list-item (bloque con viñeta) a inline.
      Al dejar de ser list-item pierden el marcador: no hace falta list-style: none.
      La estructura sigue siendo una lista para los lectores de pantalla. */
.top-menu li {
  display: inline;
  margin-right: 16px;
}

.top-menu {
  background: #1e3a8a;
  padding: 12px;
  margin-bottom: 16px;
}

.top-menu a {
  color: #ffffff;
}

/* 2) Menú vertical: el enlace (inline por defecto) pasa a block, así su caja ocupa
      toda la fila y el padding vertical sí cuenta. Resultado: una zona de clic
      grande y cómoda, no solo las letras. */
.side-menu {
  width: 240px;
  border: 1px solid #cbd5e1;
}

/* Aquí los li siguen siendo list-item: la viñeta se quita con list-style. */
.side-menu li {
  list-style: none;
}

.side-menu a {
  display: block;
  padding: 10px 12px;
  color: #0f172a;
  text-decoration: none;
}

.side-menu a:hover,
.side-menu a:focus-visible {
  background: #dbeafe;
}

.hint {
  color: #475569;
  font-size: 0.85rem;
}
```
