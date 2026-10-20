---
example_description: "Con box-sizing: content-box (el valor por defecto), width solo mide el contenido: padding y borde se suman por fuera"
example_tags: "css|modelo-de-cajas|width|content-box"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="ruler">regla: 200px</div>
<div class="box plain" data-measure>
  <code>width: 200px</code>, sin padding ni borde<br>
  ancho real: <output></output>
</div>
<div class="box padded" data-measure>
  <code>width: 200px</code> + <code>padding: 20px</code> + <code>border: 5px</code><br>
  ancho real: <output></output><br>
  = 5 + 20 + <strong>200</strong> + 20 + 5
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Una barra de 200px exactos para comparar a ojo */
.ruler {
  width: 200px;
  background: #334155;
  color: #ffffff;
  font-size: 0.8rem;
  text-align: center;
}

.box {
  width: 200px;              /* las dos cajas dicen lo mismo… */
  background: #bfdbfe;
  margin-top: 12px;
  font-size: 0.85rem;
}

/* …pero con box-sizing: content-box (el valor inicial), width es el ancho del
   CONTENIDO. El padding y el borde se AÑADEN por fuera:
   ancho visible = border-left + padding-left + width + padding-right + border-right */
.padded {
  padding: 20px;
  border: 5px solid #1d4ed8;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este fragmento solo mide
// el ancho real de cada caja (de borde a borde) y lo escribe en su <output>.
for (const box of document.querySelectorAll('[data-measure]')) {
  box.querySelector('output').textContent = box.getBoundingClientRect().width + 'px';
}
```
