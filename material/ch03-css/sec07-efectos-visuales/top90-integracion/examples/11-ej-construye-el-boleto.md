---
exercise: true
exercise_title: "Construye el boleto"
exercise_instructions: "Dale a la matriz del boleto (la parte de la derecha) un fondo de rayas finas en diagonal con un degradado repetido; el texto tiene que seguir leyéndose (TODO 1) || Haz las dos muescas semicirculares del boleto, arriba y abajo de la línea de puntos, con una máscara de dos degradados radiales (TODO 2) || Dale al boleto una sombra que siga la forma de las muescas (TODO 3) || Gira el sello «Admite uno» unos −8° sin pisar ningún otro transform (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "repeating-linear-gradient(ángulo, color 0 4px, otro 4px 8px): dos tonos claros parecidos || Cada muesca es un radial-gradient «circle at X Y» transparente hasta 10px y negro después; cada capa ocupa la mitad del boleto (mask-size, mask-position, mask-repeat). La línea de puntos está a 120px del borde derecho: calc(100% - 120px) || La máscara se come la box-shadow; un filtro en el envoltorio ve la forma ya recortada || Hay una propiedad que se llama igual que la función"
exercise_solution_example: 11-ej-construye-el-boleto-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: construir un boleto de planetario con rayas en la matriz (repeating-linear-gradient), muescas con una máscara de dos radial-gradient, una sombra con drop-shadow en el envoltorio y un sello girado; un pequeño script comprueba cada paso"
example_tags: "css|ejercicio|mask-image|radial-gradient|repeating-linear-gradient|drop-shadow|rotate"
---

# HTML

```html
<div class="ticket-wrap">
  <article class="ticket">
    <div class="main">
      <p class="event">Planetario · Función nocturna</p>
      <h2>Una noche en la nebulosa del Águila</h2>
      <p class="when">Sábado 14 de noviembre · 19:00</p>
    </div>
    <div class="stub">
      <p class="seat">Fila F<br>Asiento 12</p>
      <p class="admit">Admite uno</p>
    </div>
  </article>
</div>

<ul class="checklist">
  <li>Rayas en la matriz: <output id="check-stripes">…</output></li>
  <li>Muescas con una máscara: <output id="check-notches">…</output></li>
  <li>Sombra con la forma del boleto: <output id="check-shadow">…</output></li>
  <li>Sello girado: <output id="check-stamp">…</output></li>
</ul>
```

# CSS

```css
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
  background: #e2e8f0;
}

/* TODO 3: una sombra que siga la forma del boleto (las muescas incluidas). */
.ticket-wrap {
  max-width: 420px;
  padding: 8px 0;
}

/* TODO 2: las muescas, arriba y abajo de la línea de puntos. */
.ticket {
  display: flex;
  border-radius: 10px;
  background: #ffffff;
}

.main {
  flex: 1;
  padding: 14px 16px;
}

.event {
  margin: 0;
  color: #6d28d9;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.main h2 {
  margin: 4px 0;
  font-size: 1.05rem;
}

.when {
  margin: 0;
  font-size: 0.85rem;
}

/* TODO 1: un fondo de rayas finas en diagonal. */
.stub {
  display: grid;
  align-content: space-between;
  width: 120px;
  padding: 14px 12px;
  box-sizing: border-box;
  border-left: 2px dashed #94a3b8;
  background-color: #f5f3ff;
  font-size: 0.85rem;
}

.seat {
  margin: 0;
  font-weight: 700;
}

/* TODO 4: gira el sello unos −8°. */
.admit {
  justify-self: start;
  margin: 8px 0 0;
  padding: 2px 6px;
  border: 2px solid #6d28d9;
  border-radius: 4px;
  color: #6d28d9;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.checklist {
  padding-inline-start: 1.2em;
  color: #475569;
  font-size: 0.8rem;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo lee los
// estilos calculados y escribe ✅ o ❌ en la lista (y en la consola).
// No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const stubImage = getComputedStyle(document.querySelector('.stub')).backgroundImage;
check('check-stripes', stubImage.includes('repeating-linear-gradient'),
  stubImage === 'none' ? 'background-image: none' : 'background-image con un degradado repetido');

const ticketMask = getComputedStyle(document.querySelector('.ticket')).maskImage;
const radialCount = ticketMask.split('radial-gradient').length - 1;
check('check-notches', radialCount >= 2, `mask-image con ${radialCount} radial-gradient`);

const wrapFilter = getComputedStyle(document.querySelector('.ticket-wrap')).filter;
check('check-shadow', wrapFilter.includes('drop-shadow'), `filter del envoltorio: ${wrapFilter}`);

const stamp = getComputedStyle(document.querySelector('.admit'));
check('check-stamp', stamp.rotate !== 'none' || stamp.transform !== 'none',
  `rotate: ${stamp.rotate} · transform: ${stamp.transform}`);
```
