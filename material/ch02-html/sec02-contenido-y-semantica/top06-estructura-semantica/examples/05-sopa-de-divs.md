---
example_description: "Una página hecha solo con div se ve igual pero no tiene regiones: quien usa un lector de pantalla no puede saltar al contenido ni al menú"
example_tags: "html|semantica|div|landmarks|accesibilidad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<div id="divs">
  <div class="header"><div class="nav"><a href="#">Inicio</a> · <a href="#">Tienda</a></div></div>
  <div class="main"><div class="title">Ofertas de primavera</div><p>Semillas al 20 %.</p></div>
  <div class="footer">© 2026 La Huerta</div>
</div>

<hr>

<div id="semantic">
  <header><nav aria-label="Principal"><a href="#">Inicio</a> · <a href="#">Tienda</a></nav></header>
  <main><h1>Ofertas de primavera</h1><p>Semillas al 20 %.</p></main>
  <footer>© 2026 La Huerta</footer>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* 🐛 Con CSS, las dos versiones se ven casi iguales. La diferencia está en el árbol de
   accesibilidad: los div no tienen rol, así que no hay regiones ni títulos a los que saltar. */
.title,
h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 8px 0;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Contamos lo que un lector de pantalla
// puede usar para orientarse: regiones (landmarks) y títulos.
const LANDMARKS = 'header, nav, main, aside, footer, [role]';
for (const id of ['divs', 'semantic']) {
  const root = document.getElementById(id);
  console.log(`#${id} → regiones: ${root.querySelectorAll(LANDMARKS).length}, títulos: ${root.querySelectorAll('h1, h2, h3, h4, h5, h6').length}`);
}
```
