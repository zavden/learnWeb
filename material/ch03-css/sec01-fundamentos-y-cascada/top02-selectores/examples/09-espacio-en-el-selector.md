---
example_description: "Un espacio cambia el significado: .card .featured busca dentro, .card.featured exige las dos clases a la vez"
example_tags: "css|selectores|compuesto|descendiente"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="legend">Fondo amarillo ← <code>.card .featured</code> (con espacio) · Contorno verde ← <code>.card.featured</code> (sin espacio)</div>

<article class="card featured">
  ❌ <code>class="card featured"</code>: querías el fondo amarillo, pero <code>.card .featured</code> no me encuentra.
  Solo me encuentra <code>.card.featured</code> (contorno verde).
</article>

<article class="card">
  <code>class="card"</code> con un hijo:
  <span class="featured">span.featured → este SÍ es «un .featured dentro de un .card»</span>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.card {
  border: 1px solid #94a3b8;
  padding: 8px;
  margin: 8px 0;
}

/* ❌ Con espacio = combinador descendiente: «un .featured DENTRO de un .card».
      La primera tarjeta no tiene ningún .featured dentro → no coincide. */
.card .featured {
  background: #fde68a;
}

/* ✅ Sin espacio = selector compuesto: «un elemento que es .card Y .featured a la vez». */
.card.featured {
  outline: 3px solid #16a34a;
}

/* Truco: léelos de derecha a izquierda.
   .card .featured → «un .featured… que tenga algún ancestro .card»
   .card.featured  → «un .featured… que además sea .card» */
```
