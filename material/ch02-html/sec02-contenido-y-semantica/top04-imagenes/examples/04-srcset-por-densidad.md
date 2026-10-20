---
example_description: "srcset con descriptores 1x y 2x: el navegador elige el archivo según la densidad de píxeles de la pantalla (devicePixelRatio)"
example_tags: "html|imagenes|srcset|retina|devicePixelRatio"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<img id="badge"
     src="badge-1x.svg"
     srcset="badge-1x.svg 1x, badge-2x.svg 2x"
     width="120" height="120"
     alt="Insignia de alumno destacado">

<p id="report">…</p>
<p class="hint">En una pantalla Retina (devicePixelRatio 2) verás «2x»; con zoom del navegador al 50 % en una pantalla normal puede cambiar la elección.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.hint {
  color: #475569;
  font-size: 0.9rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. currentSrc dice qué archivo eligió el navegador.
const badge = document.getElementById('badge');
function report() {
  document.getElementById('report').textContent =
    `devicePixelRatio = ${window.devicePixelRatio} → archivo elegido: ${badge.currentSrc.split('/').pop()}`;
}
badge.complete ? report() : badge.addEventListener('load', report);
```
