---
example_description: "Un transform en @keyframes sustituye la lista entera: la nota con transform: rotate(-4deg) que entra con scale() se ve recta durante la animación y se tuerce de golpe al terminar. Con las propiedades sueltas (rotate en la nota, scale en los keyframes) no se pisan; animation-composition: add es la otra salida"
example_tags: "css|animaciones|keyframes|transform|rotate|scale|animation-composition|congelar|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Notas que se «pegan» en el tablero creciendo desde ×0.6. Cada fila tiene la nota congelada a mitad de animación y la nota en vivo. Marca la casilla para pegarlas (0,6 s; con «reducir movimiento», las notas en vivo no se animan).</p>
<label class="control"><input type="checkbox" id="play"> Pegar las notas</label>

<p class="label">❌ <code>transform: rotate(-4deg)</code> y keyframes con <code>transform: scale()</code>: recta mientras crece, torcida de golpe al final</p>
<div class="board is-broken"><p class="note is-frozen">Llamar al vivero</p><p class="note is-live">Llamar al vivero</p></div>

<p class="label">✅ <code>rotate: -4deg</code> y keyframes con <code>scale</code>: cada propiedad a lo suyo</p>
<div class="board is-split"><p class="note is-frozen">Llamar al vivero</p><p class="note is-live">Llamar al vivero</p></div>

<p class="label">✅ <code>animation-composition: add</code>: el <code>scale()</code> de los keyframes se añade detrás del <code>rotate()</code></p>
<div class="board is-added"><p class="note is-frozen">Llamar al vivero</p><p class="note is-live">Llamar al vivero</p></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.board {
  display: flex;
  gap: 40px;
  padding: 12px 20px;
  background: #d6b88f;                 /* corcho */
}

.note {
  width: 110px;
  margin: 0;
  padding: 12px 8px;
  background: #fef08a;
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.25);
  font-size: 0.78rem;
}

.note.is-frozen::after {
  content: " (congelada al 50 %)";
  font-size: 0.65rem;
}

/* ❌ (y ✅ 2) La nota está girada con transform, y los keyframes también usan transform. */
.is-broken .note,
.is-added .note {
  transform: rotate(-4deg);
}

@keyframes stick-transform {
  from { transform: scale(0.6); }
  to   { transform: scale(1); }
}

/* 🐛 Mientras dura la animación, su valor de transform SUSTITUYE al de la
   regla (una animación gana a las declaraciones normales en la cascada, y
   transform es una sola propiedad con una lista): scale(0.8) en lugar de
   rotate(-4deg). Al terminar, la animación deja de aplicarse y vuelve el giro
   de golpe. Con fill-mode forwards sería peor: se quedaría recta para siempre. */

/* ✅ 1. Propiedades sueltas: la nota gira con rotate y la animación toca scale. */
.is-split .note {
  rotate: -4deg;
}

@keyframes stick-scale {
  from { scale: 0.6; }
  to   { scale: 1; }
}

/* ✅ 2. animation-composition: add (Chrome 112+). En vez de sustituir, la
   animación SE SUMA al valor de la regla; en listas de transform, «sumar» es
   añadir sus funciones detrás: rotate(-4deg) scale(0.8). Va DESPUÉS del
   atajo animation, como cualquier longhand (ejemplo 05). */

/* Congeladas al 50 % del tiempo (0,3 s de 0,6 s), lineales: escala 0.8. */
.is-broken .is-frozen {
  animation: stick-transform 600ms linear -300ms both paused;
}

.is-split .is-frozen {
  animation: stick-scale 600ms linear -300ms both paused;
}

.is-added .is-frozen {
  animation: stick-transform 600ms linear -300ms both paused;
  animation-composition: add;
}

/* En vivo: con movimiento, al marcar la casilla. */
@media (prefers-reduced-motion: no-preference) {
  body:has(#play:checked) .is-broken .is-live {
    animation: stick-transform 600ms ease-out;
  }

  body:has(#play:checked) .is-split .is-live {
    animation: stick-scale 600ms ease-out;
  }

  body:has(#play:checked) .is-added .is-live {
    animation: stick-transform 600ms ease-out;
    animation-composition: add;
  }
}
```
