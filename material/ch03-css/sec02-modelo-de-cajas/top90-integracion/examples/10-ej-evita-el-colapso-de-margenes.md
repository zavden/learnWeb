---
exercise: true
exercise_title: "Evita el colapso de márgenes"
exercise_instructions: "Haz que la cabecera contenga el margen de su título, sin cambiar su aspecto (TODO 1) || Da al aviso 1rem de relleno por los cuatro lados y quita el margen de su párrafo (TODO 2) || Haz que el separador vacío deje 48px con una altura en lugar de márgenes (TODO 3) || Haz que cada tarjeta contenga el margen de su título (TODO 4) || Comprueba que las cuatro medidas de la lista marcan ✅"
exercise_hints: "Un margen solo colapsa si toca a otro: algo tiene que interponerse, o el padre tiene que crear su propio contexto de formato || display: flow-root contiene los márgenes de los hijos sin añadir nada visible || Una caja vacía sin altura, relleno ni borde deja que sus dos márgenes se fundan en uno || Las medidas dependen unas de otras: el margen que se escapa de una tarjeta también cuenta en el hueco que hay encima de ella"
exercise_solution_example: 10-ej-evita-el-colapso-de-margenes-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
example_description: "Ejercicio: cuatro colapsos de márgenes (cabecera, aviso, separador vacío y tarjetas) que un pequeño script mide en directo mientras los arreglas"
example_tags: "css|ejercicio|margin|colapso|flow-root|padding"
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

/* TODO 1: el margen del h1 atraviesa la cabecera y aparece como una franja blanca
   ENCIMA del azul. Haz que la cabecera lo contenga sin añadirle relleno ni borde. */
.site-header {
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

/* TODO 2: el margen del párrafo se escapa del aviso y el texto toca su borde de arriba.
   Usa relleno en el aviso (1rem) y quita el margen del párrafo. */
.notice {
  border-left: 4px solid #b45309;
  background: #fef3c7;
}

.notice p {
  margin: 1rem 0;
}

/* TODO 3: este separador vacío debería dejar 24 + 24 = 48px,
   pero sus dos márgenes colapsan entre sí y solo deja 24px. */
.spacer {
  margin: 1.5rem 0;
}

/* TODO 4: el margen del título se escapa de cada tarjeta: el texto toca el borde de arriba. */
.card {
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
