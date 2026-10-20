---
example_description: "Varias imágenes de fondo separadas por comas se apilan: la primera queda encima; el color va siempre al fondo de la pila"
example_tags: "css|fondos|multicapa|background"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<header class="hero">
  <h1>Huerto urbano</h1>
  <p>Tres capas: hoja (arriba), puntos (en medio) y color (abajo).</p>
</header>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Cada propiedad background-* acepta una lista separada por comas: la posición N de cada
   lista corresponde a la capa N. La PRIMERA capa se pinta ENCIMA de las demás. */
.hero {
  max-width: 520px;
  padding: 24px;
  border-radius: 16px;
  background-image: url("leaf.svg"), url("dots.svg");
  background-repeat: no-repeat, repeat;
  background-position: right 16px bottom 16px, 0 0;
  background-size: 96px, auto;
  background-color: #dcfce7;     /* el color solo puede ir en la última capa (siempre al fondo) */
  color: #14532d;
}

.hero h1 {
  margin-top: 0;
}

/* Los degradados (linear-gradient…) también son «imágenes» y se apilan igual:
   los verás en el módulo de efectos visuales. */
```
