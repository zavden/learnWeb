---
example_description: "Atributos por trozos de texto: ^= empieza por, $= termina en, *= contiene"
example_tags: "css|selectores|atributo|href"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="legend">Fondo verde ← <code>^="https"</code> · Contorno rojo ← <code>$=".pdf"</code> · Negrita ← <code>*="example"</code></div>
<ul>
  <li><a href="https://example.com/tienda">https://example.com/tienda</a></li>
  <li><a href="http://example.org/informe.pdf">http://example.org/informe.pdf</a></li>
  <li><a href="https://docs.example.net/guia.pdf">https://docs.example.net/guia.pdf</a></li>
  <li><a href="/descargas/manual.pdf">/descargas/manual.pdf</a></li>
  <li><a href="https://www.w3.org/Style/CSS/">https://www.w3.org/Style/CSS/</a></li>
</ul>
<p>Lee cada <code>href</code> y comprueba qué reglas lo marcan.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

li {
  margin: 8px 0;
}

/* ^= «empieza por» */
a[href^="https"] {
  background: #bbf7d0;
}

/* $= «termina en» */
a[href$=".pdf"] {
  outline: 2px solid #dc2626;
}

/* *= «contiene», en cualquier posición */
a[href*="example"] {
  font-weight: bold;
}
```
