---
example_description: "El segundo argumento de var() es un respaldo que se usa cuando la variable no existe; se pueden encadenar"
example_tags: "css|custom-properties|var|fallback"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="uses-missing"><code>var(--accent, #fed7aa)</code> → <code>--accent</code> no existe: usa el respaldo (naranja)</p>
<p class="uses-defined"><code>var(--success, #fed7aa)</code> → <code>--success</code> existe: usa su valor (verde)</p>
<p class="uses-chain"><code>var(--missing, var(--also-missing, #e9d5ff))</code> → respaldos encadenados (morado)</p>
<p class="uses-font"><code>var(--font, Georgia, serif)</code> → el respaldo es todo lo que va tras la primera coma</p>
```

# CSS

```css
:root {
  --success: #bbf7d0;
}

body {
  font-family: system-ui, sans-serif;
}

p {
  padding: 6px 8px;
}

.uses-missing {
  background: var(--accent, #fed7aa);
}

.uses-defined {
  background: var(--success, #fed7aa);
}

/* El respaldo puede ser otro var(), con su propio respaldo */
.uses-chain {
  background: var(--missing, var(--also-missing, #e9d5ff));
}

/* Todo lo que va después de la PRIMERA coma es el respaldo, comas incluidas:
   aquí el respaldo es «Georgia, serif». */
.uses-font {
  font-family: var(--font, Georgia, serif);
}
```
