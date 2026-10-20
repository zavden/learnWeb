---
example_description: "Los tres selectores básicos: de tipo (p), de clase (.warning) y de id (#page-title)"
example_tags: "css|selectores|clase|id"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="legend">Barra azul ← <code>p</code> · Fondo amarillo ← <code>.warning</code> · Texto rojo ← <code>#page-title</code></div>

<h2 id="page-title"><code>&lt;h2 id="page-title"&gt;</code> → coincide con <code>#page-title</code></h2>
<p><code>&lt;p&gt;</code> → coincide con <code>p</code></p>
<p class="warning"><code>&lt;p class="warning"&gt;</code> → coincide con <code>p</code> y con <code>.warning</code></p>
<div class="warning"><code>&lt;div class="warning"&gt;</code> → coincide con <code>.warning</code>, pero no con <code>p</code></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.legend {
  color: #475569;
}

/* SELECTOR DE TIPO: todos los elementos <p> */
p {
  border-left: 6px solid #2563eb;
  padding-left: 8px;
}

/* SELECTOR DE CLASE (punto): cualquier elemento con «warning» en su atributo class */
.warning {
  background: #fde68a;
}

/* SELECTOR DE ID (almohadilla): el elemento con id="page-title" (solo debe haber uno) */
#page-title {
  color: #b91c1c;
}

/* Cada regla toca una propiedad distinta: no compiten, se suman.
   Por eso el <p class="warning"> tiene la barra azul Y el fondo amarillo. */
```
