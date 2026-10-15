---
example_description: "srcset con anchos (480w, 960w, 1920w) y sizes: el navegador calcula qué archivo necesita según el ancho que ocupará la imagen"
example_tags: "html|imagenes|srcset|sizes|responsive"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<img id="hero"
     src="mountain-960.svg"
     srcset="mountain-480.svg 480w, mountain-960.svg 960w, mountain-1920.svg 1920w"
     sizes="(min-width: 900px) 50vw, 100vw"
     width="960" height="640"
     alt="Valle de montaña al amanecer">

<p id="report">…</p>
<p class="hint">Abre el ejemplo con el botón ↗ y estrecha la ventana o usa el modo dispositivo de DevTools; recarga para ver otra elección. Ojo: Chrome no baja a un archivo menor si ya tiene uno mayor en caché.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

img {
  max-width: 100%;
  height: auto;
}

.hint {
  color: #475569;
  font-size: 0.9rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
// sizes dice cuánto ocupará la imagen: «la mitad del viewport si este mide 900px o más; si no, todo».
// El navegador multiplica ese ancho por devicePixelRatio y elige el archivo más pequeño que lo cubra.
const hero = document.getElementById('hero');
function report() {
  const slot = window.innerWidth >= 900 ? window.innerWidth / 2 : window.innerWidth;
  document.getElementById('report').textContent =
    `viewport ${window.innerWidth}px · hueco ≈ ${Math.round(slot)}px × ${window.devicePixelRatio} = ` +
    `${Math.round(slot * window.devicePixelRatio)}px necesarios → eligió ${hero.currentSrc.split('/').pop()}`;
}
hero.complete ? report() : hero.addEventListener('load', report);
```
