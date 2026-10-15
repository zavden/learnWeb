---
example_description: "Fuera de font-size, em se mide con la fuente del propio elemento: un botón cuyo relleno y borde crecen con su texto"
example_tags: "css|unidades|em|componentes"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p>Los tres botones comparten la misma regla <code>.btn</code>; solo cambia su <code>font-size</code>.</p>
<p>
  <button type="button" class="btn small">Pequeño</button>
  <button type="button" class="btn">Normal</button>
  <button type="button" class="btn big">Grande</button>
</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* En font-size, em se refiere a la fuente del PADRE.
   En cualquier OTRA propiedad (padding, border, border-radius, margin…), em se refiere
   a la fuente del PROPIO elemento. Así, relleno, borde y esquinas crecen con el texto. */
.btn {
  font-size: 1rem;
  padding: 0.5em 1em;          /* 8px 16px a 16px; 12.8px 25.6px a 25.6px… */
  border: 0.1em solid #1e3a8a;
  border-radius: 0.4em;
  background: #dbeafe;
  color: #1e3a8a;
}

.small {
  font-size: 0.8rem;
}

.big {
  font-size: 1.6rem;
}
```
