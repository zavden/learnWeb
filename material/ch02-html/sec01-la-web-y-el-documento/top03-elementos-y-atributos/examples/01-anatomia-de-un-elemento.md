---
example_description: "Etiqueta de apertura, contenido y cierre; atributos nombre=\"valor\""
example_tags: "html|etiquetas|atributos|sintaxis"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Un elemento = etiqueta de apertura + contenido + etiqueta de cierre:

       <a href="#more" title="Ir al final">un enlace</a>
        │ └──────────────┬───────────────┘ └───┬───┘└┬─┘
        │            atributos             contenido cierre
        └ nombre del elemento                                       -->
<p>Un párrafo con <a href="#more" title="Ir al final">un enlace</a> y una palabra <strong>importante</strong>.</p>

<!-- Ni las etiquetas ni los nombres de atributo distinguen mayúsculas: esto es un p
     normal. La convención es escribirlo todo en minúsculas. -->
<P CLASS="note">Párrafo escrito con etiquetas en MAYÚSCULAS.</P>

<!-- Los valores pueden ir entre comillas dobles, simples o, si no tienen espacios
     ni caracteres especiales, sin comillas. Usa comillas dobles siempre. -->
<p id='more' title=Final>Comillas simples y valor sin comillas.</p>
```

# JavaScript

```javascript
// outerHTML (JavaScript) muestra cómo quedó cada elemento en el DOM:
// el parser lo ha normalizado todo a minúsculas y comillas dobles.
console.log(document.querySelector('.note').outerHTML);
console.log(document.querySelector('#more').outerHTML);
```
