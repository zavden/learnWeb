---
example_description: "La red de seguridad de movimiento reducido, en la capa reset: con prefers-reduced-motion: reduce, todas las animaciones y transiciones duran 0.01ms. Por qué 0.01ms y no none: la transición sigue ocurriendo (en un instante) y transitionend llega; con transition: none no llega nunca y el código que lo espera no se ejecuta. Se simula con unos radios"
example_tags: "css|arquitectura|reset|prefers-reduced-motion|transiciones|transitionend|accesibilidad|javascript"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<fieldset class="simulator">
  <legend>Simular la preferencia del sistema</legend>
  <label><input type="radio" name="motion" value="none" checked> Sin reducir</label>
  <label><input type="radio" name="motion" value="net"> Reducir: red de 0.01ms</label>
  <label><input type="radio" name="motion" value="off"> Reducir: red con none</label>
</fieldset>
<button class="order-button" type="button">Mostrar u ocultar el aviso</button>
<p class="toast">Pedido 1042 enviado. Te avisaremos cuando salga.</p>
<ol class="log" aria-live="polite"></ol>
```

# CSS

```css
@layer reset, components;

@layer reset {
  /* ── LA RED DE SEGURIDAD ───────────────────────────────────────────────
     Si el sistema pide reducir el movimiento, TODO dura casi nada: también
     las animaciones de componentes que olvidaron su media query y las del
     CSS de terceros.
     - 0.01ms y no none ni 0s: la transición (o la animación) sigue
       OCURRIENDO, solo que en un instante. El elemento llega a su estado
       final, animation-fill-mode se respeta, y transitionend y
       animationend llegan. Con none (o 0s en una transición) no hay
       transición: el evento no llega nunca.
     - animation-iteration-count: 1 para que una animación infinita no
       parpadee en bucle a 0.01ms por vuelta.
     - scroll-behavior: auto, para que los anclas salten sin deslizar.
     - !important en la capa MÁS BAJA: por la inversión de !important, es
       la declaración más fuerte de todo el CSS de la página. Ningún
       componente puede saltársela, ni con !important. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* La misma red, activada con el radio «Reducir: red de 0.01ms»… */
  :root:has(input[value="net"]:checked) *,
  :root:has(input[value="net"]:checked) *::before,
  :root:has(input[value="net"]:checked) *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* …y la versión equivocada, con el radio «Reducir: red con none». */
  :root:has(input[value="off"]:checked) *,
  :root:has(input[value="off"]:checked) *::before,
  :root:has(input[value="off"]:checked) *::after {
    animation: none !important;
    transition: none !important;
  }
}

@layer components {
  body {
    font-family: system-ui, sans-serif;
    color: #1e293b;
    background: #ffffff;
  }

  .simulator {
    display: grid;
    gap: 2px;
    margin-bottom: 10px;
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .order-button {
    padding: 6px 14px;
    border: 0;
    border-radius: 999px;
    background: #15803d;
    color: #ffffff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .order-button:focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }

  /* El aviso entra con un fundido y una subida de 0.75rem. (En un proyecto
     real, la subida iría dentro de prefers-reduced-motion: no-preference,
     como en el módulo de animación; aquí la red de seguridad se encarga.) */
  .toast {
    width: fit-content;
    padding: 8px 12px;
    border-radius: 8px;
    background: #1e293b;
    color: #ffffff;
    font-size: 0.85rem;
    opacity: 0;
    translate: 0 0.75rem;
    visibility: hidden;                /* oculto también al lector de pantalla */
    transition: opacity 300ms, translate 300ms, visibility 300ms;
  }

  .toast.is-visible {
    opacity: 1;
    translate: 0 0;
    visibility: visible;
  }

  .log {
    padding-left: 1.2em;
    font-size: 0.8rem;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). Un código habitual: algo
// espera a que el aviso termine de entrar (transitionend) para seguir, por
// ejemplo, para mover el foco o programar que se cierre.
const toast = document.querySelector('.toast');
const button = document.querySelector('.order-button');
const log = document.querySelector('.log');
let clicks = 0;
let lastEnded = 0;

function write(text) {
  const item = document.createElement('li');
  item.textContent = text;
  log.append(item);
  console.log(text);
}

toast.addEventListener('transitionend', (event) => {
  if (event.propertyName !== 'opacity') return; // una vez por propiedad: nos basta una
  lastEnded = clicks;
  const state = toast.classList.contains('is-visible') ? 'ya se ve' : 'ya se ocultó';
  write(`transitionend (opacity): el aviso ${state}; el código que esperaba puede seguir.`);
});

button.addEventListener('click', () => {
  clicks += 1;
  const thisClick = clicks;
  toast.classList.toggle('is-visible');
  setTimeout(() => {
    if (lastEnded < thisClick) {
      write('⚠️ 1 s después: no llegó ningún transitionend. El código que lo esperaba no se ejecutó.');
    }
  }, 1000);
});

write('Listo: elige una opción y pulsa «Mostrar u ocultar el aviso».');
```
