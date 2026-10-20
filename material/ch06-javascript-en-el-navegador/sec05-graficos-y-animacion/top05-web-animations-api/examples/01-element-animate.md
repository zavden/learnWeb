---
example_description: "element.animate(fotogramas, opciones) crea y arranca una animación como las de @keyframes, desde JavaScript, y devuelve un objeto Animation. Pausada y llevada a currentTime = 500, se puede «congelar» a mitad y leer los valores con getComputedStyle"
example_tags: "javascript|web-animations|animate|keyframes|animation|currenttime"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Aviso de envío</h1>
  <div class="track">
    <p id="toast" class="toast">📦 Tu pedido salió del almacén</p>
  </div>
  <button id="replay" type="button">Reproducir</button>
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
.track {
  padding: 0.5rem 0;
  overflow: hidden;
}
.toast {
  width: max-content;
  margin: 0;
  padding: 0.5rem 0.8rem;
  border-radius: 0.5rem;
  background: #1f2933;
  color: #ffffff;
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
const toast = document.querySelector('#toast');
// Los mismos fotogramas que un @keyframes: una lista de estados (el primero es el 0 %, el último el 100 %)
const keyframes = [
  { translate: '240px', opacity: 0 },
  { translate: '0px', opacity: 1 },
];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; // matchMedia: módulo siguiente
const options = {
  duration: 1000,                     // ms (en CSS: 1s)
  easing: 'linear',                   // lineal para comprobar la mitad exacta (en una interfaz: 'ease-out')
  fill: 'none',                       // al terminar, el elemento vuelve a su estilo (lección de keyframes)
};
if (reduce) keyframes.forEach((frame) => delete frame.translate); // con «reducir movimiento», solo el fundido

const animation = toast.animate(keyframes, options);  // empieza YA
console.log('animate() devuelve →', animation.constructor.name, '· playState:', animation.playState);

// Congelar un fotograma: pausar y saltar a los 500 ms. Con easing lineal, es la mitad exacta.
animation.pause();
animation.currentTime = 500;
const style = getComputedStyle(toast);
console.log(`congelado en 500 ms → translate: ${style.translate} · opacity: ${style.opacity}`);
console.log('progreso →', animation.effect.getComputedTiming().progress);

document.querySelector('#replay').addEventListener('click', () => {
  animation.currentTime = 0;
  animation.play();                   // el mismo objeto se puede volver a reproducir
  console.log('▶ reproduciendo');
});
console.log('Listo: pulsa «Reproducir»');
```
