---
example_description: "El parser nunca da error: repara etiquetas cruzadas, sin cerrar o fuera de sitio"
example_tags: "parser|recuperacion-de-errores|dom"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Tres errores a propósito dentro de #demo:
     1. etiquetas cruzadas: <b> se cierra antes que <i>
     2. un párrafo sin cerrar con un elemento inventado (<caja>)
     3. una celda de tabla (<td>) fuera de cualquier tabla
     El navegador no muestra ningún error: aplica las reglas de recuperación del
     estándar (las mismas en todos los navegadores) y sigue leyendo. -->
<div id="demo">
  <p><b>negrita <i>negrita y cursiva</b> solo cursiva</i></p>
  <p>Párrafo sin cerrar con un <caja>elemento desconocido</caja>
  <td>celda huérfana</td>
</div>
```

# JavaScript

```javascript
// innerHTML (JavaScript) muestra el DOM que construyó el parser: compáralo con el HTML
console.log(document.querySelector('#demo').innerHTML);

// Un elemento desconocido no es un error: se crea como HTMLUnknownElement
console.log('<caja> es un →', document.querySelector('caja').constructor.name);
```
