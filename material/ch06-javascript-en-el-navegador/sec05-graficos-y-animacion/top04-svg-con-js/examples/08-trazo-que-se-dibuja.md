---
example_description: "getTotalLength() mide un <path>; con stroke-dasharray igual a esa longitud y stroke-dashoffset de la longitud a 0, una transición de CSS «dibuja» la ruta. getPointAtLength() da el punto que hay a cierta distancia del principio"
example_tags: "javascript|svg|gettotallength|stroke-dasharray|stroke-dashoffset|animacion"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Ruta de la carrera de 10 km</h1>
  <svg viewBox="0 0 280 130" width="280" height="130" role="img" aria-label="Plano de la ruta: sale del parque, baja por la avenida y llega al estadio">
    <path d="M 20 20 H 140 V 110 H 260" fill="none" stroke="#e4e7eb" stroke-width="8"/>
    <path id="route" d="M 20 20 H 140 V 110 H 260" fill="none" stroke="#be123c" stroke-width="8" stroke-linejoin="round"/>
    <circle id="halfway" r="6" fill="#1f2933"/>
  </svg>
  <button id="draw" type="button" aria-pressed="false">Dibujar la ruta</button>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
svg {
  display: block;
  margin-bottom: 0.75rem;
  background: #ffffff;
}
/* Un solo trazo discontinuo tan largo como la ruta, desplazado su longitud entera: no se ve nada.
   Al llevar el desplazamiento a 0, el trazo «entra» desde el principio. */
#route {
  stroke-dasharray: var(--length);
  stroke-dashoffset: var(--length);
  transition: stroke-dashoffset 1.5s ease-in-out;
}
#route.is-drawn {
  stroke-dashoffset: 0;
}
@media (prefers-reduced-motion: reduce) {
  #route {
    transition: none;
  }
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
const route = document.querySelector('#route');
const routeLength = route.getTotalLength();              // 120 + 90 + 120, en unidades del viewBox
route.style.setProperty('--length', routeLength);
console.log('longitud de la ruta →', Math.round(routeLength * 100) / 100);

// El punto a mitad del recorrido: 120 a la derecha y 45 hacia abajo
const middle = route.getPointAtLength(routeLength / 2);
document.querySelector('#halfway').setAttribute('cx', middle.x);
document.querySelector('#halfway').setAttribute('cy', middle.y);
console.log(`a mitad del recorrido → (${Math.round(middle.x)}, ${Math.round(middle.y)})`);

const button = document.querySelector('#draw');
button.addEventListener('click', () => {
  const drawn = route.classList.toggle('is-drawn');
  button.setAttribute('aria-pressed', String(drawn));
  console.log(drawn ? '✏️ dibujando la ruta' : '↩️ ruta borrada');
});
console.log('Listo: pulsa «Dibujar la ruta»');
```
