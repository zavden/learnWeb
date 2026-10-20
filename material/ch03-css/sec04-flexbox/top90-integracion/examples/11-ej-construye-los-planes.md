---
exercise: true
exercise_title: "Construye la tabla de planes"
exercise_instructions: "Centra el icono, el título y el texto del encabezado con flexbox (TODO 1) || Pon los tres planes en una fila que se pueda partir, con 10px de separación y una base de 8rem que crezca (TODO 2) || Convierte cada plan en una columna y lleva su botón al fondo (TODO 3) || Lleva la etiqueta «Popular» al final de la línea del nombre (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "En una columna, el eje que centra en horizontal es el cruzado. Y text-align sigue haciendo falta para las líneas del texto || Contenedor: display, flex-wrap y gap. Cada plan: el atajo flex con tres valores || Un plan puede ser a la vez elemento flex de la fila y contenedor flex de su contenido || Un margen automático se queda con todo el espacio libre de su lado, en cualquiera de los dos ejes"
exercise_solution_example: 11-ej-construye-los-planes-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: construir con flexbox una tabla de tres planes de suscripción (encabezado centrado, fila que se parte, tarjetas en columna con el botón abajo y una etiqueta empujada a la derecha)"
example_tags: "css|ejercicio|flexbox|centrar|flex-wrap|margin-auto|tarjetas"
---

# HTML

```html
<section class="pricing" aria-labelledby="pricing-title">
  <header class="pricing-header">
    <span class="pricing-icon" aria-hidden="true">🌱</span>
    <h2 id="pricing-title">Suscripción de plantas</h2>
    <p>Una planta nueva cada mes, con su guía de cuidados. Cancela cuando quieras.</p>
  </header>

  <ul class="plans">
    <li class="plan">
      <div class="plan-top"><h3>Semilla</h3></div>
      <p class="price"><strong>99</strong> MXN al mes</p>
      <ul class="features"><li>1 planta pequeña</li><li>Guía de cuidados</li></ul>
      <a class="button" href="/suscripcion/semilla">Elegir Semilla</a>
    </li>
    <li class="plan is-featured">
      <div class="plan-top"><h3>Brote</h3><span class="badge">Popular</span></div>
      <p class="price"><strong>189</strong> MXN al mes</p>
      <ul class="features"><li>2 plantas medianas</li><li>Maceta de barro</li><li>Guía de cuidados</li></ul>
      <a class="button" href="/suscripcion/brote">Elegir Brote</a>
    </li>
    <li class="plan">
      <div class="plan-top"><h3>Jardín</h3></div>
      <p class="price"><strong>349</strong> MXN al mes</p>
      <ul class="features"><li>4 plantas</li><li>Macetas y abono</li><li>Asesoría por chat</li><li>Envío prioritario</li></ul>
      <a class="button" href="/suscripcion/jardin">Elegir Jardín</a>
    </li>
  </ul>
</section>

<ul class="checklist">
  <li>Encabezado centrado: <output id="check-center">…</output></li>
  <li>Tres planes en una fila, del mismo ancho: <output id="check-row">…</output></li>
  <li>Botones alineados al fondo: <output id="check-buttons">…</output></li>
  <li>«Popular» al final de su línea: <output id="check-badge">…</output></li>
</ul>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: 0.8rem;
}

.pricing {
  max-width: 440px;
}

/* TODO 1: icono, título y texto, centrados en horizontal y apilados en columna. */
.pricing-header {
  margin-bottom: 12px;
}

.pricing-icon {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dcfce7;
  font-size: 1.3rem;
  line-height: 40px;
  text-align: center;
}

.pricing-header h2 {
  margin: 4px 0;
  font-size: 1.2rem;
}

.pricing-header p {
  margin: 0;
  color: #475569;
}

/* TODO 2: los tres planes, en una fila que se pueda partir en varias líneas. */
.plans {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* TODO 2 (sigue): cada plan parte de 8rem, crece y encoge. */
/* TODO 3: cada plan, una columna con su botón al fondo. */
.plan {
  padding: 10px;
  border: 2px solid #cbd5e1;
  border-radius: 10px;
}

.plan.is-featured {
  border-color: #166534;
}

/* La línea del nombre ya es una fila flex. */
.plan-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.plan-top h3 {
  margin: 0;
  font-size: 0.95rem;
}

/* TODO 4: la etiqueta, al final de la línea del nombre. */
.badge {
  padding: 0 6px;
  border-radius: 999px;
  background: #166534;
  color: #ffffff;
  font-size: 0.7rem;
}

.price {
  margin: 4px 0;
}

.price strong {
  font-size: 1.4rem;
}

.features {
  margin: 0 0 10px;
  padding-left: 1.1em;
}

.button {
  padding: 6px;
  border-radius: 6px;
  background: #166534;
  color: #ffffff;
  text-align: center;
  text-decoration: none;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.checklist {
  padding-left: 1.2em;
  color: #475569;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide las cajas y
// escribe ✅ o ❌ en la lista (y en la consola). No hace falta tocarlo: se vuelve a
// ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const box = (selector) => document.querySelector(selector).getBoundingClientRect();
const boxes = (selector) => [...document.querySelectorAll(selector)].map((element) => element.getBoundingClientRect());
const center = (rect) => (rect.left + rect.right) / 2;
const spread = (values) => Math.max(...values) - Math.min(...values);

const offset = Math.abs(center(box('.pricing-icon')) - center(box('.pricing-header')));
check('check-center', offset <= 1, `icono a ${offset.toFixed(1)}px del centro`);

const plans = boxes('.plan');
const sameTop = spread(plans.map((rect) => rect.top)) <= 1;
const sameWidth = spread(plans.map((rect) => rect.width)) <= 1;
check('check-row', sameTop && sameWidth, `${sameTop ? 'en la misma fila' : 'en filas distintas'}, ${sameWidth ? 'mismo ancho' : 'anchos distintos'}`);

const buttonsSpread = spread(boxes('.button').map((rect) => rect.bottom));
check('check-buttons', buttonsSpread <= 1, `diferencia de ${buttonsSpread.toFixed(1)}px entre botones`);

const badgeGap = box('.plan-top:has(.badge)').right - box('.badge').right;
check('check-badge', Math.abs(badgeGap) <= 1, `a ${badgeGap.toFixed(1)}px del final`);
```
