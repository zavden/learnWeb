---
example_description: "El centro de avisos de un huerto comunitario: un popover que se despliega desde la campana (escala desde la esquina y fundido, también al cerrarse), avisos escalonados, un punto de «sin leer» que late tres veces al cargar y se apaga al marcar todo como leído, avisos que se archivan cerrando su hueco con interpolate-size y un estado vacío que aparece con @starting-style. Sin JavaScript"
example_tags: "css|profesional|popover|starting-style|interpolate-size|has|keyframes|notificaciones|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="bar">
  <span class="bar__brand">Huerto Comunitario de Ribera</span>
  <button type="button" class="bell" popovertarget="notifications">
    <span aria-hidden="true">🔔</span> Avisos
    <span class="bell__dot"><span class="visually-hidden">(hay avisos sin leer)</span></span>
  </button>
</header>

<section id="notifications" class="panel" popover aria-labelledby="notifications-title">
  <div class="panel__head">
    <h2 id="notifications-title">Avisos</h2>
    <label class="mark-all"><input type="checkbox" id="mark-read"> Marcar todo como leído</label>
  </div>
  <ul class="notes">
    <li class="note" style="--i: 0">
      <p><strong>Riego</strong> · Te toca regar el bancal 4 mañana a las 7:00.</p>
      <label class="archive"><input type="checkbox"> Archivar</label>
    </li>
    <li class="note" style="--i: 1">
      <p><strong>Cosecha</strong> · Los rábanos del bancal 2 están listos.</p>
      <label class="archive"><input type="checkbox"> Archivar</label>
    </li>
    <li class="note" style="--i: 2">
      <p><strong>Asamblea</strong> · El sábado a las 11:00, en el cobertizo.</p>
      <label class="archive"><input type="checkbox"> Archivar</label>
    </li>
  </ul>
  <p class="empty">No tienes avisos pendientes. 🌱</p>
</section>

<main class="page">
  <p>Abre «Avisos», marca todo como leído y archiva los tres para ver el estado vacío. Se cierra con Escape o pulsando fuera.</p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Centro de avisos
   - El panel es un popover: se abre y se cierra sin JavaScript. Crece desde
     la esquina de la campana (transform-origin) con scale y opacity; overlay
     y display con allow-discrete mantienen la salida en la capa superior.
   - Los avisos llegan escalonados (--i × 50 ms) solo al abrir.
   - El punto rojo «sin leer» lanza una onda (un ::after que crece y se
     desvanece) tres veces al cargar: llama la atención y se calla. Al marcar
     todo como leído, el punto y las marcas de cada aviso se funden.
   - Archivar: la casilla de cada aviso cierra su hueco (height de auto a 0
     con interpolate-size) y lo oculta con visibility.
   - Sin avisos (:has() comprueba que no quede ninguna casilla de archivar
     sin marcar), aparece el estado vacío con @starting-style.
   - --motion (0 o 1) multiplica distancias y escalas: con «reducir
     movimiento», todo se funde en su sitio y la onda no aparece.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  interpolate-size: allow-keywords;
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-alert: #be123c;
  --color-surface: #ffffff;
  --color-tint: #f0fdf4;
  --color-focus: #1d4ed8;
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --motion: 0;
}

@media (prefers-reduced-motion: no-preference) {
  :root {
    --motion: 1;
  }
}

/* ── Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f8fafc;
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  line-height: 1.45;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.page {
  padding: 1rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

/* ── Barra y campana ── */
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-brand);
  color: #ffffff;
}

.bar__brand {
  font-weight: 800;
}

.bell {
  position: relative;
  padding: 0.4rem 0.8rem;
  border: 1px solid #ffffff;
  border-radius: 999px;
  background: transparent;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.bell:focus-visible {
  outline-color: #fde047;
}

.bell__dot {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-brand);
  border-radius: 50%;
  background: var(--color-alert);
  transition: opacity 300ms, visibility 300ms;
}

/* La onda: un anillo que crece y se desvanece, tres veces. */
.bell__dot::after {
  content: "";
  position: absolute;
  inset: -2px;
  border: 2px solid var(--color-alert);
  border-radius: 50%;
  opacity: 0;
}

@keyframes ripple {
  from { opacity: 0.9; scale: 1; }
  to   { opacity: 0; scale: 2.6; }
}

@media (prefers-reduced-motion: no-preference) {
  .bell__dot::after {
    animation: ripple 1.2s var(--ease-enter) 600ms 3;
  }
}

body:has(#mark-read:checked) .bell__dot {
  opacity: 0;
  visibility: hidden;
}

/* ── Panel ── */
.panel {
  inset: auto;
  top: 3.6rem;
  right: 1rem;
  width: min(22rem, 100vw - 2rem);
  margin: 0;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 18px 40px rgb(15 23 42 / 0.25);
  transform-origin: top right;
  opacity: 0;
  scale: calc(1 - var(--motion) * 0.06);
  transition:
    opacity 180ms,
    scale 180ms,
    overlay 180ms allow-discrete,
    display 180ms allow-discrete;
}

.panel:popover-open {
  opacity: 1;
  scale: 1;
  transition:
    opacity 250ms var(--ease-enter),
    scale 250ms var(--ease-enter),
    overlay 250ms allow-discrete,
    display 250ms allow-discrete;
}

@starting-style {
  .panel:popover-open {
    opacity: 0;
    scale: calc(1 - var(--motion) * 0.06);
  }
}

.panel__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.25rem 1rem;
  margin-bottom: 0.5rem;
}

.panel h2 {
  margin: 0;
  font-size: 1.1rem;
}

.mark-all {
  font-size: 0.8rem;
}

/* ── Avisos ── */
.notes {
  margin: 0;
  padding: 0;
  list-style: none;
}

.note {
  position: relative;
  height: auto;
  overflow: clip;
  border-radius: 10px;
  background: var(--color-tint);
  opacity: 1;
  transition: opacity 200ms, visibility 250ms;
}

/* Con movimiento, el hueco del aviso archivado se cierra con suavidad; con
   «reducir movimiento», se cierra al instante y el aviso solo se funde. */
@media (prefers-reduced-motion: no-preference) {
  .note {
    transition:
      opacity 200ms,
      visibility 250ms,
      height 250ms var(--ease-standard),
      margin 250ms var(--ease-standard);
  }
}

.note + .note {
  margin-top: 0.5rem;
}

.note p {
  margin: 0;
  padding: 0.6rem 0.75rem 0.25rem 1.6rem;
  font-size: 0.85rem;
}

/* La marca de «sin leer» de cada aviso. */
.note::before {
  content: "";
  position: absolute;
  top: 0.95rem;
  left: 0.65rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-alert);
  transition: opacity 300ms;
}

body:has(#mark-read:checked) .note::before {
  opacity: 0;
}

.archive {
  display: block;
  padding: 0 0.75rem 0.6rem 1.6rem;
  color: var(--color-muted);
  font-size: 0.8rem;
}

/* Archivado: el hueco se cierra y el aviso deja de leerse. */
.note:has(.archive :checked) {
  height: 0;
  margin-top: 0;
  opacity: 0;
  visibility: hidden;
}

/* Entrada escalonada al abrir el panel: el retardo es el de opacity, la
   primera de la lista (el resto, sin retardo). */
.panel:popover-open .note {
  transition-delay: calc(var(--i) * 50ms), 0s, 0s, 0s;
}

@starting-style {
  .panel:popover-open .note {
    opacity: 0;
  }
}

/* ── Estado vacío ── */
.empty {
  display: none;
  margin: 0.5rem 0 0;
  color: var(--color-muted);
  text-align: center;
  opacity: 1;
  transition: opacity 300ms 200ms;
}

/* «Ningún aviso sin archivar»: no queda ninguna casilla de archivar sin
   marcar. (Un :has() no puede ir dentro de otro: por eso se pregunta por
   las casillas y no por los avisos.) */
.panel:not(:has(.archive input:not(:checked))) .empty {
  display: block;
}

@starting-style {
  .panel:not(:has(.archive input:not(:checked))) .empty {
    opacity: 0;
  }
}
```
