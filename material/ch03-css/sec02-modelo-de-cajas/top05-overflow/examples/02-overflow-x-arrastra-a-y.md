---
example_description: "overflow-x: hidden con overflow-y: visible no existe: el navegador convierte visible en auto y aparece una barra vertical inesperada"
example_tags: "css|overflow|overflow-x|scroll|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="frame bug">
  <div class="tooltip">Este globo sobresale hacia abajo</div>
  <p>❌ overflow-x: hidden; overflow-y: visible → el globo queda dentro de un scroll vertical</p>
</div>

<div class="frame fixed">
  <div class="tooltip">Este globo sobresale hacia abajo</div>
  <p>✅ overflow-x: clip → recorta en horizontal y deja visible el eje vertical</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.frame {
  width: 360px;
  height: 90px;
  margin-bottom: 110px;
  background: #bfdbfe;
  border: 2px solid #1d4ed8;
  font-size: 0.85rem;
}

.frame p {
  margin: 8px;
}

.tooltip {
  width: 200px;
  margin: 50px 0 0 8px;
  padding: 30px 8px;
  background: #fde68a;
  border: 2px solid #b45309;
}

/* 🐛 Si un eje es hidden/scroll/auto, el otro NO puede ser visible: el navegador lo
   convierte en auto. Resultado: un scroll vertical que nadie pidió. */
.bug {
  overflow-x: hidden;
  overflow-y: visible;   /* valor COMPUTADO: auto */
}

/* ✅ clip no crea un contenedor de scroll, así que sí se puede combinar con visible. */
.fixed {
  overflow-x: clip;
  overflow-y: visible;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Leemos el valor COMPUTADO de overflow-y.
for (const frame of document.querySelectorAll('.frame')) {
  frame.querySelector('p').append(` · overflow-y computado: ${getComputedStyle(frame).overflowY}`);
}
```
