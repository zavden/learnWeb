---
example_stage: final-solution
example_description: "Solución: flow-root en la cabecera y en las tarjetas, relleno en lugar de márgenes en el aviso y altura en lugar de márgenes en el separador"
example_tags: "css|solucion|margin|colapso|flow-root|padding"
---

# HTML

```html
<header class="site-header">
  <h1>Biblioteca municipal</h1>
</header>

<main class="page">
  <section class="notice">
    <p>Del 1 al 15 de agosto la biblioteca abre solo por las mañanas, de 9:00 a 14:00.</p>
  </section>

  <div class="spacer"></div>

  <article class="card">
    <h2>Club de lectura</h2>
    <p>Primer jueves de cada mes, a las 19:00, en la sala 2.</p>
  </article>
  <article class="card">
    <h2>Taller de escritura</h2>
    <p>Martes y viernes, de 17:30 a 19:00. Plazas limitadas.</p>
  </article>
</main>

<ul class="checklist">
  <li>Hueco blanco encima de la cabecera: <output id="gap-header">…</output></li>
  <li>Relleno del aviso por encima del texto: <output id="gap-notice">…</output></li>
  <li>Separación entre el aviso y la primera tarjeta: <output id="gap-spacer">…</output></li>
  <li>Distancia del borde de la tarjeta a su título: <output id="gap-card">…</output></li>
</ul>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1e293b;
}

/* ✅ 1: flow-root crea un contexto de formato propio: el margen del h1 se queda
   dentro y el azul empieza en el borde de la ventana. (padding-top o border-top
   también lo evitarían, pero cambiarían el aspecto de la cabecera.) */
.site-header {
  display: flow-root;
  padding-inline: 1rem;
  background: #1e3a8a;
  color: #ffffff;
}

.site-header h1 {
  margin: 1.25rem 0;
  font-size: 1.75rem;
}

.page {
  max-width: 36rem;
  padding: 1.5rem 1rem;
}

/* ✅ 2: los componentes se espacian POR DENTRO con padding. Sin márgenes en el
   párrafo, no hay nada que pueda escaparse. */
.notice {
  padding: 1rem;
  border-left: 4px solid #b45309;
  background: #fef3c7;
}

.notice p {
  margin: 0;
}

/* ✅ 3: una altura no colapsa. (Mejor aún, en un HTML que sí puedas cambiar:
   quitar el div vacío y poner margin-bottom: 3rem en el aviso.) */
.spacer {
  height: 3rem;
  margin: 0;
}

/* ✅ 4: igual que la cabecera. Fíjate en que este arreglo también cambia la medida
   del separador: antes, el margen escapado de la primera tarjeta se sumaba a él. */
.card {
  display: flow-root;
  margin: 0 0 1rem;
  padding: 0 1rem 1rem;
  border-radius: 8px;
  background: #e0e7ff;
}

.card h2 {
  margin: 1rem 0 0.25rem;
  font-size: 1.125rem;
}

.card p {
  margin: 0;
}

.checklist {
  max-width: 36rem;
  margin: 0 1rem;
  color: #475569;
}

.checklist output {
  font-weight: 700;
  color: #1e293b;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide distancias
// entre cajas y las escribe en la lista, con ✅ cuando coinciden con el objetivo.
// No hace falta tocarlo: se vuelve a ejecutar cada vez que cambias el CSS.
function report(id, measured, target) {
  const value = Math.round(measured);
  const mark = value === target ? '✅' : '❌';
  document.getElementById(id).textContent = `${value}px (objetivo: ${target}px) ${mark}`;
}

const header = document.querySelector('.site-header');
const notice = document.querySelector('.notice');
const firstCard = document.querySelector('.card');
const topOf = (element) => element.getBoundingClientRect().top + window.scrollY;
const bottomOf = (element) => element.getBoundingClientRect().bottom + window.scrollY;

report('gap-header', topOf(header), 0);
report('gap-notice', topOf(notice.querySelector('p')) - topOf(notice), 16);
report('gap-spacer', topOf(firstCard) - bottomOf(notice), 48);
report('gap-card', topOf(firstCard.querySelector('h2')) - topOf(firstCard), 16);
```
