---
example_description: "La animación de una View Transition se cambia con CSS en sus pseudoelementos: el paso actual de un proceso de compra (con view-transition-name) sale hacia la izquierda con ::view-transition-old y el siguiente entra por la derecha con ::view-transition-new, con @keyframes propios"
example_tags: "css|view-transitions|view-transition-old|view-transition-new|view-transition-group|keyframes|javascript"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Pulsa «Siguiente paso»: el paso actual se va hacia la izquierda y el siguiente entra por la derecha. Con «reducir movimiento», los pasos se funden en su sitio.</p>
<div class="checkout">
  <section class="step">
    <h3>Paso 1 de 3 · Cesta</h3>
    <p>Nopal en maceta · $185<br>Echeveria · $95</p>
  </section>
  <section class="step" hidden>
    <h3>Paso 2 de 3 · Envío</h3>
    <p>Calle Durango 112, Roma Norte, Ciudad de México.<br>Llega el jueves.</p>
  </section>
  <section class="step" hidden>
    <h3>Paso 3 de 3 · Pago</h3>
    <p>Tarjeta terminada en 4242.<br>Total: $280 (envío gratis).</p>
  </section>
  <button type="button" onclick="nextStep()">Siguiente paso</button>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.checkout {
  max-width: 340px;
  padding: 12px;
  overflow: clip;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

.step {
  min-height: 90px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f0fdf4;
  font-size: 0.85rem;
}

.step h3 {
  margin: 0 0 6px;
  font-size: 0.9rem;
}

.step p {
  margin: 0;
}

button {
  margin-top: 10px;
  padding: 6px 12px;
  border: 0;
  border-radius: 8px;
  background: #14532d;
  color: #ffffff;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* Durante la transición, el navegador construye un árbol de pseudoelementos
   encima de la página, colgado de :root:
     ::view-transition
     ├─ ::view-transition-group(root)            la página entera
     │  └─ ::view-transition-image-pair(root)
     │     ├─ ::view-transition-old(root)        foto de antes
     │     └─ ::view-transition-new(root)        foto de después
     └─ ::view-transition-group(checkout-step)   el paso, aparte
        └─ ::view-transition-image-pair(checkout-step)
           ├─ ::view-transition-old(checkout-step)
           └─ ::view-transition-new(checkout-step)
   Por defecto, cada group viaja y cambia de tamaño, y old y new se funden.
   Son pseudoelementos normales: se les cambia la animación con CSS.
   (Solo el paso visible tiene caja: los ocultos, con hidden, no se fotografían,
   así que el nombre no se repite.) */
@media (prefers-reduced-motion: no-preference) {
  .step {
    view-transition-name: checkout-step;
  }

  /* Las fotos se dibujan por encima de toda la página: el overflow de
     .checkout no las recorta. Que no se salgan de la caja del paso. */
  ::view-transition-group(checkout-step) {
    overflow: clip;
  }

  ::view-transition-old(checkout-step) {
    animation: slide-out 250ms cubic-bezier(0.4, 0, 1, 1) both;
  }

  ::view-transition-new(checkout-step) {
    animation: slide-in 300ms cubic-bezier(0, 0, 0.2, 1) both;
  }
}

@keyframes slide-out {
  to {
    opacity: 0;
    translate: -60px 0;
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    translate: 60px 0;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). querySelectorAll devuelve los tres
// pasos, y la propiedad hidden de cada uno es su atributo hidden de HTML.
const steps = document.querySelectorAll('.step');
let current = 0;

function nextStep() {
  const update = () => {
    steps[current].hidden = true;
    current = (current + 1) % steps.length;
    steps[current].hidden = false;
  };

  if (!document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(update);
}
```
