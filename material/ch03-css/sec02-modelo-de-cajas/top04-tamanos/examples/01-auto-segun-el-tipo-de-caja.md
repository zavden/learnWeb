---
example_description: "width: auto significa «llena el ancho disponible» en un bloque y «ajústate al contenido» en un inline-block; height: auto siempre es la altura del contenido"
example_tags: "css|modelo-de-cajas|width|height|auto"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="frame">
  <div class="block">Bloque con width: auto → ocupa toda la línea</div>
  <div class="inline-block">inline-block con width: auto → mide lo que su texto</div>
  <div class="block short">height: auto → la altura justa para su contenido</div>
  <div class="block tall">height: auto con más contenido → crece sola.<br>Segunda línea.<br>Tercera línea.</div>
</div>
<p id="sizes">…</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.frame {
  border: 2px dashed #94a3b8;
  padding: 8px;
  width: 520px;
}

.block,
.inline-block {
  background: #bfdbfe;          /* contenido (color de DevTools) */
  padding: 6px 10px;
  margin-bottom: 8px;
}

/* «auto» no es un valor fijo: es «calcula tú», y cada tipo de caja calcula distinto.
   Bloque: ancho = ancho del contenedor − márgenes − bordes − padding.
   inline-block: «shrink-to-fit», el ancho de su contenido (sin pasarse del disponible). */
.inline-block {
  display: inline-block;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Medimos el ancho real de cada caja.
const boxes = document.querySelectorAll('.block, .inline-block');
document.getElementById('sizes').textContent = [...boxes]
  .map((box, index) => `caja ${index + 1}: ${Math.round(box.getBoundingClientRect().width)}×${Math.round(box.getBoundingClientRect().height)}px`)
  .join(' · ');
```
