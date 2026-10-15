---
example_description: "// no es un comentario en CSS: fuera de un bloque se come la regla siguiente y dentro, la declaración siguiente"
example_tags: "css|errores|comentarios"
example_stage: common-error
example_importance: important
---

# HTML

```html
<h2 class="title">❌ .title debería ser verde: la regla que sigue a «// …» se ha perdido</h2>
<p class="box">❌ .box debería tener fondo amarillo: el «// …» se ha comido esa línea. El borde y el relleno sí están.</p>
<p class="box-fixed">✅ .box-fixed usa un comentario de verdad: borde, fondo amarillo y relleno.</p>
```

# CSS

```css
// Títulos en verde
.title { color: green; }
/* ❌ Arriba no hay ningún comentario: CSS no tiene comentarios con //.
   El navegador lee un único selector:  «// Títulos en verde .title»
   que es inválido → descarta la regla .title entera. */

.box {
  border: 2px solid #64748b;
  // fondo amarillo
  background: #fde68a;
  padding: 8px;
}
/* ❌ Dentro de un bloque, «// fondo amarillo» empieza una declaración basura que
   dura hasta el siguiente ;  → se lleva por delante  background: #fde68a;
   El border (antes) y el padding (después) sí se aplican. */

.box-fixed {
  border: 2px solid #64748b;
  /* fondo amarillo */
  background: #fde68a;
  padding: 8px;
}
/* ✅ La única forma de comentar en CSS: barra-asterisco … asterisco-barra. */
```
