---
example_description: "Un <div> dentro de un <p> cierra el párrafo sin avisar"
example_tags: "parser|p|div|modelo-de-contenido|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- 🐛 Un p solo admite contenido de frase (texto, a, em, strong, span…). Si el parser
     encuentra un div (o ul, table, h2, otro p…) dentro de un párrafo, CIERRA el
     párrafo justo antes. El fondo amarillo del párrafo delata dónde terminó de verdad. -->
<div id="broken">
  <p class="note">❌ Nota: <div>este bloque iba dentro del párrafo</div> y esto también.</p>
</div>

<!-- ✅ Si el contenedor necesita bloques dentro, no puede ser un p: usa un div -->
<div id="fixed">
  <div class="note">✅ Nota: <div>este bloque sí queda dentro</div> y esto también.</div>
</div>
```

# CSS

```css
/* Fondo para ver qué abarca cada contenedor (CSS: capítulo 3) */
.note {
  background: #fef08a;
  padding: 4px;
}
```

# JavaScript

```javascript
// El DOM real: el p se cerró antes del div, el texto final quedó suelto y el </p>
// del final, que ya no tenía párrafo abierto, creó uno vacío (ejemplo siguiente)
console.log('❌ #broken →', document.querySelector('#broken').innerHTML);
console.log('✅ #fixed  →', document.querySelector('#fixed').innerHTML);
```
