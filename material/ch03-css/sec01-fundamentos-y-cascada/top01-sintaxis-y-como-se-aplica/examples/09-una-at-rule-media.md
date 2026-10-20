---
example_description: "Una at-rule con bloque: @media aplica sus reglas solo cuando la vista previa mide 500px o más"
example_tags: "css|at-rule|media"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="status">Rojo: la vista previa mide <strong>menos de 500&nbsp;px</strong> de ancho.
  Verde: mide <strong>500&nbsp;px o más</strong>.</p>
<p>Cambia el ancho de la vista previa (o ábrela en grande) y mira cómo cambia el color.</p>
```

# CSS

```css
/* Regla normal: se aplica siempre */
.status {
  background: #fecaca;
  border: 2px solid #b91c1c;
  padding: 12px;
}

/* At-rule: empieza por @. Esta lleva una condición y un bloque con reglas dentro.
   Las reglas de dentro SOLO existen mientras se cumple la condición.
   (@media se estudia a fondo en el módulo de diseño responsive.) */
@media (width >= 500px) {
  .status {
    background: #bbf7d0;      /* misma especificidad que la regla de arriba y va después: gana */
    border-color: #15803d;
  }
}

/* Otras at-rules no llevan bloque y terminan en ; — por ejemplo:
   @import url("otra-hoja.css");   (tiene que ir al principio de la hoja) */
```
