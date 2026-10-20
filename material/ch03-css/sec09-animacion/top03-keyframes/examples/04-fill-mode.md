---
example_description: "animation-fill-mode: sin él, una animación de salida termina y el aviso reaparece de golpe (vuelve a su estado sin animar), y una de entrada con retardo enseña el aviso durante la espera antes de hacerlo desaparecer y fundirlo. forwards conserva el último fotograma; backwards aplica el primero durante el retardo; both, las dos cosas"
example_tags: "css|animaciones|animation-fill-mode|forwards|backwards|both|animation-delay|congelar|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Cada fila tiene una copia congelada en el momento del problema (el recuadro discontinuo marca dónde está el aviso cuando es invisible) y otra en vivo. Marca la casilla para reproducir las cuatro.</p>
<label class="control"><input type="checkbox" id="play"> Reproducir</label>

<h3>Salida: el aviso se funde en 0,6 s</h3>
<p class="label">❌ <code>animation: toast-out 600ms</code> · al terminar, reaparece</p>
<div class="row is-out"><span class="slot is-frozen-end"><span class="toast">Archivo borrado</span></span><span class="slot is-live"><span class="toast">Archivo borrado</span></span></div>
<p class="label">✅ <code>animation: toast-out 600ms forwards</code> · se queda invisible</p>
<div class="row is-out is-forwards"><span class="slot is-frozen-end"><span class="toast">Archivo borrado</span></span><span class="slot is-live"><span class="toast">Archivo borrado</span></span></div>

<h3>Entrada tras 1 s de espera: el aviso aparece en 0,6 s</h3>
<p class="label">❌ <code>animation: toast-in 600ms 1s</code> · se ve durante la espera, desaparece y entra</p>
<div class="row is-in"><span class="slot is-frozen-wait"><span class="toast">Copia guardada</span></span><span class="slot is-live"><span class="toast">Copia guardada</span></span></div>
<p class="label">✅ <code>animation: toast-in 600ms 1s backwards</code> · invisible durante la espera</p>
<div class="row is-in is-backwards"><span class="slot is-frozen-wait"><span class="toast">Copia guardada</span></span><span class="slot is-live"><span class="toast">Copia guardada</span></span></div>
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
  margin: 6px 0 4px;
  font-size: 0.72rem;
}

h3 {
  margin: 14px 0 4px;
  font-size: 0.85rem;
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

.row {
  display: flex;
  gap: 12px;
}

.slot {
  display: block;
  width: 150px;
  padding: 3px;
  border: 1px dashed #64748b;
  border-radius: 10px;
  font-size: 0.7rem;
}

.slot::before {
  display: block;
  margin-bottom: 3px;
}

.is-frozen-end::before  { content: "congelado: terminada"; }
.is-frozen-wait::before { content: "congelado: en la espera"; }
.is-live::before        { content: "en vivo"; }

/* El estado SIN animación del aviso: visible. */
.toast {
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.8rem;
}

@keyframes toast-out {
  to { opacity: 0; }
}

@keyframes toast-in {
  from { opacity: 0; }
}

/* 🐛 Por defecto (fill-mode: none), una animación SOLO se aplica mientras
   corre. Antes de empezar (durante el retardo) y después de terminar, el
   elemento tiene su estado sin animar: aquí, visible.
   - Salida: al terminar, el aviso vuelve a opacity: 1 de golpe.
   - Entrada con retardo: durante la espera el aviso se ve; al empezar, salta
     a opacity: 0 (el from) y se funde.
   ✅ forwards: después de terminar, se queda en el último fotograma.
   ✅ backwards: durante el retardo, ya está en el primer fotograma.
   ✅ both: las dos. Es el valor que casi siempre quieres. */
.is-out .toast {
  animation: toast-out 600ms paused;
}

.is-out.is-forwards .toast {
  animation-fill-mode: forwards;
}

.is-in .toast {
  animation: toast-in 600ms 1s paused;
}

.is-in.is-backwards .toast {
  animation-fill-mode: backwards;
}

/* Congeladas (técnica del ejemplo anterior):
   - «terminada»: retardo de −600ms, la duración entera → ya ha acabado;
   - «en la espera»: el retardo positivo de 1 s y en pausa → el reloj no pasa
     de 0 y la animación está esperando. */
.is-out .is-frozen-end .toast {
  animation-delay: -600ms;
}

/* En vivo: sin animación hasta que marcas la casilla; al marcarla, empieza
   desde el principio (desmarca y vuelve a marcar para repetir). */
.is-live .toast {
  animation-name: none;
}

body:has(#play:checked) .is-out .is-live .toast {
  animation-name: toast-out;
  animation-play-state: running;
}

body:has(#play:checked) .is-in .is-live .toast {
  animation-name: toast-in;
  animation-play-state: running;
}
```
