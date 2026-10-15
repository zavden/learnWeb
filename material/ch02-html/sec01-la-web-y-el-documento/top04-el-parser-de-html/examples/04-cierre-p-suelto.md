---
example_description: "Un </p> huérfano crea un párrafo vacío (y un hueco misterioso)"
example_tags: "parser|p|etiqueta-huerfana|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 Casi todas las etiquetas de cierre sueltas se ignoran. </p> es la excepción:
     el parser crea un párrafo VACÍO en ese punto. Si tus párrafos tienen borde, relleno
     o fondo, ese párrafo fantasma se ve como un hueco que no viene de ningún sitio. -->
<div id="broken">
  <h2>❌ Con un &lt;/p&gt; huérfano</h2>
  </p>
  <p>Texto del artículo.</p>
</div>

<div id="fixed">
  <h2>✅ Sin él</h2>
  <p>Texto del artículo.</p>
</div>
```

# CSS

```css
/* Un borde en cada párrafo para que se vean todos, también los vacíos (CSS: capítulo 3) */
p {
  border: 1px dashed #b45309;
}
```

# JavaScript

```javascript
console.log('❌ #broken →', document.querySelector('#broken').innerHTML);
console.log('✅ #fixed  →', document.querySelector('#fixed').innerHTML);
```
