---
example_description: "min(), max() y clamp() eligen un valor según el espacio disponible: anchos con tope y títulos fluidos sin media queries"
example_tags: "css|funciones|min|max|clamp"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<h2 class="title">Título con clamp(1.25rem, 6vw, 2.5rem)</h2>
<div class="card">width: min(100%, 360px) → como mucho 360px, y nunca más ancha que su contenedor</div>
<div class="panel">width: max(50%, 220px) → como poco 220px, aunque el 50 % sea menos</div>
<p>Estrecha y ensancha la vista previa y observa los tres.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* clamp(MÍNIMO, PREFERIDO, MÁXIMO): usa el preferido (6vw, que sigue al ancho de la
   ventana) pero sin bajar de 1.25rem ni pasar de 2.5rem. Tipografía fluida en una línea. */
.title {
  font-size: clamp(1.25rem, 6vw, 2.5rem);
}

/* min() se queda con el MENOR de sus valores → funciona como un TOPE máximo.
   Ancha: 360px < 100% → 360px.   Estrecha: 100% < 360px → 100%. */
.card {
  width: min(100%, 360px);
  background: #bbf7d0;
  padding: 8px 0;
}

/* max() se queda con el MAYOR → funciona como un SUELO mínimo. */
.panel {
  width: max(50%, 220px);
  background: #bfdbfe;
  padding: 8px 0;
  margin-top: 8px;
}
```
