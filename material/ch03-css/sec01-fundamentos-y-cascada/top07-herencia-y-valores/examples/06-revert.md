---
example_description: "revert recupera el estilo del navegador: un reset quita las viñetas de todas las listas y revert las devuelve en el artículo"
example_tags: "css|valores|revert|reset"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<nav>
  <ul>
    <li>Inicio</li>
    <li>Blog</li>
  </ul>
</nav>
<article class="prose">
  <p>En el artículo, las listas recuperan sus viñetas y su sangría:</p>
  <ul>
    <li>Primera idea</li>
    <li>Segunda idea</li>
  </ul>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Un reset típico: ninguna lista tiene viñetas ni sangría */
ul {
  list-style: none;
  padding: 0;
}

/* revert → «el valor que daría la hoja del navegador», como si tu regla no existiera.
   Para un ul: viñetas (disc) y padding-inline-start: 40px. */
.prose ul {
  list-style: revert;
  padding: revert;
}

/* Con initial no funcionaría: el valor inicial de padding es 0. */
```
