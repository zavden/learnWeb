---
example_description: "Un tema oscuro sin JavaScript: :has() con una casilla marcada redefine las variables de :root y :hover las de una tarjeta"
example_tags: "css|custom-properties|temas|has|hover"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p><label><input type="checkbox" id="dark-toggle"> Tema oscuro</label></p>
<article class="card">
  <h3>Una tarjeta</h3>
  <p>Con <a href="#">un enlace</a>. Pasa el ratón por encima: la tarjeta cambia su propio <code>--accent</code>.</p>
</article>
```

# CSS

```css
/* Tema claro (por defecto) */
:root {
  --bg: #ffffff;
  --text: #0f172a;
  --surface: #f1f5f9;
  --accent: #1d4ed8;
}

/* Tema oscuro: SOLO cambian los valores de las variables.
   :has() (lección de pseudoclases) → «la raíz que contiene una casilla #dark-toggle marcada». */
:root:has(#dark-toggle:checked) {
  --bg: #0f172a;
  --text: #e2e8f0;
  --surface: #1e293b;
  --accent: #93c5fd;
  color-scheme: dark;            /* controles nativos en oscuro (lección de color) */
}

/* El resto del CSS no sabe nada de temas: solo usa variables */
body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
}

.card {
  background: var(--surface);
  border-left: 6px solid var(--accent);
  padding: 4px 12px;
}

.card a {
  color: var(--accent);
}

/* Un estado también puede cambiar una variable, solo para ese elemento y sus hijos */
.card:hover {
  --accent: #f59e0b;
}
```
