---
example_description: "<div /> no se cierra: la barra se ignora y el div se traga lo que viene después"
example_tags: "html|void|autocierre|parser|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 En HTML, «/>» NO cierra un elemento normal. Solo se tolera en los vacíos
     (br, img, input…), y ahí tampoco hace nada. En un div la barra se ignora: el div
     queda ABIERTO y se traga todo lo que viene después, hasta que algo lo cierre. -->
<section id="broken">
  <div class="spacer" />
  <p>❌ Este párrafo debía ir DESPUÉS de la caja vacía… y ha acabado DENTRO.</p>
</section>

<!-- ✅ Cierra siempre los elementos normales con su etiqueta de cierre -->
<section id="fixed">
  <div class="spacer"></div>
  <p>✅ Este párrafo sí va después de la caja.</p>
</section>
```

# CSS

```css
/* Borde y fondo solo para ver dónde empieza y dónde termina cada div (CSS: capítulo 3) */
.spacer {
  min-height: 24px;
  border: 2px dashed #b91c1c;
  background: #fee2e2;
}
```

# JavaScript

```javascript
// innerHTML (JavaScript) enseña el DOM que construyó el parser en cada sección
console.log('❌ #broken →', document.querySelector('#broken').innerHTML);
console.log('✅ #fixed  →', document.querySelector('#fixed').innerHTML);
```
