---
example_description: "Un sistema de indicadores de carga coherente: barra indeterminada para la página, botón con spinner que solo aparece si la espera pasa de 300 ms, esqueletos con brillo para las listas y el contenido final, que entra con @starting-style. Cada estado se elige con un radio, así que nunca hay más de una animación infinita a la vez; todas son de transform u opacity, y con reducir movimiento se convierten en pulsos lentos"
example_tags: "css|profesional|carga|spinner|esqueletos|indeterminado|keyframes|infinite|role-status|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="demo">
  <fieldset class="states">
    <legend>Simular un estado</legend>
    <label><input type="radio" name="state" id="state-page"> Cargando la página</label>
    <label><input type="radio" name="state" id="state-save"> Guardando</label>
    <label><input type="radio" name="state" id="state-list"> Cargando la lista</label>
    <label><input type="radio" name="state" id="state-ready" checked> Listo</label>
  </fieldset>

  <div class="app">
    <div class="page-bar" role="progressbar" aria-label="Cargando la página"></div>
    <header class="app__head">
      <h1>Mis pedidos</h1>
      <button type="button" class="save">
        <span class="save__spinner" aria-hidden="true"></span>
        <span class="save__text is-idle">Guardar cambios</span>
        <span class="save__text is-busy">Guardando…</span>
      </button>
    </header>
    <div class="list">
      <div class="skeletons" aria-hidden="true">
        <div class="skeleton"></div>
        <div class="skeleton"></div>
      </div>
      <ul class="orders">
        <li><strong>Pedido 1042</strong> · Nopal y echeveria · En camino</li>
        <li><strong>Pedido 1038</strong> · Sustrato para cactus · Entregado</li>
      </ul>
    </div>
    <p class="status" role="status">
      <span class="is-page">Cargando la página…</span>
      <span class="is-save">Guardando los cambios…</span>
      <span class="is-list">Cargando tus pedidos…</span>
    </p>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Sistema de carga
   Una regla por tipo de espera, para que toda la aplicación se comporte igual:
   - Página: barra indeterminada arriba (un segmento que cruza la pista con
     translate). Se muestra solo mientras la página carga.
   - Acción (guardar): el botón no cambia de tamaño; su texto se cambia por
     «Guardando…» y el spinner aparece con un retardo de 300 ms: si la
     acción termina antes, nadie ve un parpadeo.
   - Lista: esqueletos con el tamaño del contenido final y un brillo que los
     barre (un ::after con translate).
   - Listo: el contenido entra con un fundido (@starting-style).
   Las cuatro esperas son infinitas por naturaleza (duran lo que dure la
   carga), pero los radios garantizan que solo hay una a la vez, y todas
   animan transform u opacity. Con «reducir movimiento», ninguna se desplaza
   ni gira: laten despacio (opacidad).
   El texto de estado (role="status") dice lo que pasa: el movimiento nunca
   es la única pista.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-accent: #15803d;
  --color-track: #e2e8f0;
  --color-surface: #ffffff;
  --color-focus: #1d4ed8;
  --delay-indicator: 300ms;
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

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.demo {
  max-width: 32rem;
  margin-inline: auto;
  padding: 1rem;
}

.states {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0 0 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.85rem;
}

.app {
  position: relative;
  overflow: clip;
  border-radius: 14px;
  background: var(--color-surface);
  box-shadow: 0 1px 4px rgb(15 23 42 / 0.15);
}

.app__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem 0.5rem;
}

.app h1 {
  margin: 0;
  font-size: 1.2rem;
}

/* ── Estado: texto ── */
.status {
  min-height: 1.5rem;
  margin: 0;
  padding: 0 1rem 0.75rem;
  color: var(--color-muted);
  font-size: 0.8rem;
}

.status span {
  display: none;
}

body:has(#state-page:checked) .status .is-page,
body:has(#state-save:checked) .status .is-save,
body:has(#state-list:checked) .status .is-list {
  display: inline;
}

/* ── Página: barra indeterminada ── */
.page-bar {
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  overflow: hidden;
  background: var(--color-track);
  opacity: 0;
  visibility: hidden;             /* fuera de la página para los lectores mientras no carga */
  transition: opacity 200ms, visibility 200ms;
}

.page-bar::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 35%;
  background: var(--color-accent);
  translate: -100% 0;
}

@keyframes indeterminate {
  to { translate: 300% 0; }
}

body:has(#state-page:checked) .page-bar {
  opacity: 1;
  visibility: visible;
}

/* ── Acción: botón con spinner ── */
.save {
  position: relative;
  display: inline-grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-brand);
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* Los dos textos en la misma celda: el botón mide lo que el más largo. */
.save__text {
  grid-area: 1 / 2;
  transition: opacity 150ms, visibility 150ms;
}

.save__text.is-busy,
body:has(#state-save:checked) .save__text.is-idle {
  opacity: 0;
  visibility: hidden;
}

body:has(#state-save:checked) .save__text.is-busy {
  opacity: 1;
  visibility: visible;
}

.save__spinner {
  grid-area: 1 / 1;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgb(255 255 255 / 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  opacity: 0;
}

/* ── Lista: esqueletos ── */
.list {
  display: grid;
  padding: 0.5rem 1rem;
}

.skeletons,
.orders {
  grid-area: 1 / 1;
}

.skeletons {
  display: none;
}

.skeleton {
  position: relative;
  height: 2.6rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  border-radius: 8px;
  background:
    linear-gradient(var(--color-track) 0 0) 0.75rem 0.7rem / 55% 0.6rem no-repeat,
    linear-gradient(var(--color-track) 0 0) 0.75rem 1.6rem / 35% 0.5rem no-repeat,
    #f8fafc;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, rgb(255 255 255 / 0.9) 50%, transparent 70%);
  translate: -100% 0;
}

@keyframes sweep {
  to { translate: 100% 0; }
}

.orders {
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: 1;
  transition: opacity 250ms, display 250ms allow-discrete;
}

.orders li {
  min-height: 2.6rem;
  margin-bottom: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: #f0fdf4;
  font-size: 0.85rem;
}

body:has(#state-list:checked) .skeletons {
  display: block;
}

body:has(#state-list:checked) .orders {
  display: none;
  opacity: 0;
}

@starting-style {
  .orders {
    opacity: 0;
  }
}

/* ── Animaciones: con movimiento ── */
@keyframes spin {
  to { rotate: 1turn; }
}

@keyframes appear {
  to { opacity: 1; }
}

@keyframes pulse {
  50% { opacity: 0.45; }
}

@media (prefers-reduced-motion: no-preference) {
  body:has(#state-page:checked) .page-bar::before {
    animation: indeterminate 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  /* Dos animaciones: aparecer tras 300 ms (una vez) y girar (sin fin). */
  body:has(#state-save:checked) .save__spinner {
    animation:
      appear 150ms linear var(--delay-indicator) forwards,
      spin 0.9s linear infinite;
  }

  body:has(#state-list:checked) .skeleton::after {
    animation: sweep 1.4s linear infinite;
  }
}

/* ── Animaciones: con «reducir movimiento», pulsos lentos ── */
@media (prefers-reduced-motion: reduce) {
  .page-bar::before {
    width: 100%;
    translate: none;
  }

  body:has(#state-page:checked) .page-bar::before {
    animation: pulse 2s ease-in-out infinite;
  }

  body:has(#state-save:checked) .save__spinner {
    border-color: #ffffff;
    animation:
      appear 150ms linear var(--delay-indicator) forwards,
      pulse 2s ease-in-out infinite;
  }

  body:has(#state-list:checked) .skeleton {
    animation: pulse 2s ease-in-out infinite;
  }
}
```
