---
example_description: ":first-child, :last-child y :only-child: la posición de un elemento entre sus hermanos"
example_tags: "css|pseudoclases|estructurales|first-child"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="legend">Barra verde ← <code>:first-child</code> · Línea roja debajo ← <code>:last-child</code> · Fondo morado ← <code>:only-child</code></div>
<ul>
  <li>Primero</li>
  <li>Segundo</li>
  <li>Tercero</li>
  <li>Último</li>
</ul>
<ul>
  <li>Hijo único: es primero, último y único a la vez</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

li {
  margin: 4px 0;
  padding: 2px 6px;
}

/* El primer hijo de su padre */
li:first-child {
  border-left: 6px solid #16a34a;
}

/* El último hijo de su padre */
li:last-child {
  border-bottom: 3px solid #dc2626;
}

/* El único hijo de su padre (equivale a :first-child:last-child) */
li:only-child {
  background: #ede9fe;
}

/* Solo cuentan los ELEMENTOS hermanos: el texto y los comentarios entre ellos no cuentan. */
```
