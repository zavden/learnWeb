---
example_description: "pre: el parser borra el primer salto de línea, pero no la indentación de tu código"
example_tags: "html|texto|pre|parser|espacios|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 1. El parser BORRA un salto de línea justo después de <pre>. Es una comodidad
     (puedes empezar el contenido en la línea siguiente), pero solo borra UNO:
     para dejar una línea en blanco arriba hacen falta dos saltos. -->
<pre id="one">
Sin línea en blanco encima (el salto se borró)</pre>
<pre id="two">

Con una línea en blanco encima (había dos saltos)</pre>

<!-- 🐛 2. La indentación, en cambio, NO se borra. Si sangras el contenido del pre
     para que cuadre con el resto del HTML, esos espacios se dibujan; y los del
     cierre </pre> crean una línea «vacía» al final. -->
<div>
  <div>
    <pre id="indented">
      def greet(name):
          return f"Hola, {name}"
    </pre>
  </div>
</div>

<!-- ✅ El contenido del pre va pegado al margen izquierdo del archivo, aunque rompa
     la indentación del resto -->
<div>
  <div>
    <pre id="fixed">
def greet(name):
    return f"Hola, {name}"
</pre>
  </div>
</div>
```

# CSS

```css
/* Fondo y contorno solo para ver dónde empieza y dónde acaba cada pre (CSS: capítulo 3) */
pre {
  background: #f1f5f9;
  outline: 1px solid #94a3b8;
}
```

# JavaScript

```javascript
// JSON.stringify enseña el texto de cada pre con sus \n y sus espacios a la vista
for (const pre of document.querySelectorAll('pre')) {
  console.log(`#${pre.id}`.padEnd(10), '→', JSON.stringify(pre.textContent));
}
```
