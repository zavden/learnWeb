---
example_stage: final-solution
example_description: "Solución: rayas con repeating-linear-gradient en la matriz, dos capas de máscara radial (una por mitad) para las muescas, drop-shadow en el envoltorio y la propiedad rotate en el sello"
example_tags: "css|solucion|mask-image|radial-gradient|repeating-linear-gradient|drop-shadow|rotate"
console: true
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

/* ✅ 3: la máscara del boleto también recortaría una box-shadow. El filtro
   va en el envoltorio, que ve el boleto ya recortado: la sombra entra en las
   muescas. */
.ticket-wrap {
  max-width: 420px;
  padding: 8px 0;
  filter: drop-shadow(0 4px 6px rgb(15 23 42 / 0.3));
}

/* ✅ 2: dos capas de máscara, una para la mitad de arriba y otra para la de
   abajo (51 % cada una, para que se solapen y no quede una raya en medio).
   Cada una es opaca salvo un círculo de 10px centrado en su borde, justo en
   la línea de puntos, a 120px del borde derecho. Las capas se suman: el
   boleto se ve entero menos las dos muescas. */
.ticket {
  display: flex;
  border-radius: 10px;
  background: #ffffff;
  mask-image:
    radial-gradient(circle at calc(100% - 120px) 0, transparent 10px, black 10.5px),
    radial-gradient(circle at calc(100% - 120px) 100%, transparent 10px, black 10.5px);
  mask-position: top, bottom;
  mask-repeat: no-repeat;
  mask-size: 100% 51%;
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

/* ✅ 1: rayas de 4px en dos violetas claros: se ven, y el texto oscuro
   sigue por encima de 10:1 sobre los dos (el sello, por encima de 5:1). */
.stub {
  display: grid;
  align-content: space-between;
  width: 120px;
  padding: 14px 12px;
  box-sizing: border-box;
  border-left: 2px dashed #94a3b8;
  background-color: #f5f3ff;
  background-image: repeating-linear-gradient(-45deg, #ede9fe 0 4px, #ddd6fe 4px 8px);
  font-size: 0.85rem;
}

.seat {
  margin: 0;
  font-weight: 700;
}

/* ✅ 4: la propiedad rotate, que no pisa ningún transform. */
.admit {
  rotate: -8deg;
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
