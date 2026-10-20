---
example_description: "Del esqueleto de carga al contenido: mientras carga, un brillo barre las tarjetas de relleno con un ::after que se desplaza con translate; al llegar los datos, los esqueletos se funden y salen (display con allow-discrete) y las publicaciones entran una detrás de otra (@starting-style y transition-delay escalonado), en la misma celda de grid para que nada salte"
example_tags: "css|integracion|esqueletos|starting-style|allow-discrete|transition-delay|escalonado|grid|prefers-reduced-motion"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Al principio, la zona está «cargando» (el brillo da 6 pasadas). Marca la casilla para simular que llegan los datos; desmárcala para volver a cargar.</p>
<label class="control"><input type="checkbox" id="loaded"> Datos recibidos</label>
<section class="feed" aria-labelledby="feed-title">
  <h2 id="feed-title">Novedades de la comunidad</h2>
  <p class="status is-loading">Cargando publicaciones…</p>
  <p class="status is-ready">3 publicaciones nuevas</p>
  <div class="feed__cell">
    <div class="skeletons" aria-hidden="true">
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    </div>
    <ul class="posts">
      <li class="post" style="--i: 0"><strong>Marta</strong> · Taller de barro el sábado a las 11:00</li>
      <li class="post" style="--i: 1"><strong>Joaquín</strong> · Mis tomates ya tienen flor 🍅</li>
      <li class="post" style="--i: 2"><strong>Lucía</strong> · ¿Alguien cambia esquejes de pothos?</li>
    </ul>
  </div>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────
   Del esqueleto al contenido
   - Esqueletos y publicaciones comparten la misma celda de grid: al
     cambiar uno por otro, la página no salta.
   - Cargando: el brillo es un ::after que se desplaza con translate (solo
     composite) 6 veces; en una página real duraría lo que la carga.
   - Datos recibidos: los esqueletos salen con un fundido (display con
     allow-discrete) y cada publicación entra 90 ms después de la anterior
     (@starting-style + transition-delay calculado con --i). El texto de
     estado cambia con visibility, para que solo se lea el actual.
   - Movimiento reducido: sin barrido ni desplazamientos; fundidos.
   ────────────────────────────────────────────────────────────────────── */
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
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

.feed {
  display: grid;
  max-width: 360px;
  margin-top: 12px;
}

.feed h2 {
  margin: 0;
  font-size: 1rem;
}

/* Los dos textos de estado, en la misma fila. */
.status {
  grid-row: 2;
  grid-column: 1;
  margin: 2px 0 10px;
  color: #475569;
  font-size: 0.8rem;
  transition: opacity 200ms, visibility 200ms;
}

.status.is-ready,
body:has(#loaded:checked) .status.is-loading {
  opacity: 0;
  visibility: hidden;
}

body:has(#loaded:checked) .status.is-ready {
  opacity: 1;
  visibility: visible;
}

.feed__cell {
  display: grid;
}

.skeletons,
.posts {
  grid-area: 1 / 1;
  display: grid;
  gap: 8px;
}

/* ── Esqueletos ── */
.skeleton {
  position: relative;
  height: 44px;
  overflow: hidden;
  border-radius: 10px;
  background:
    radial-gradient(circle 14px at 24px 22px, #e2e8f0 98%, transparent) no-repeat,
    linear-gradient(#e2e8f0 0 0) 48px 12px / 60% 9px no-repeat,
    linear-gradient(#e2e8f0 0 0) 48px 26px / 40% 8px no-repeat,
    #f8fafc;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, rgb(255 255 255 / 0.85) 50%, transparent 70%);
  translate: -100% 0;
}

@keyframes sweep {
  to { translate: 100% 0; }
}

.skeletons {
  transition: opacity 250ms, display 250ms allow-discrete;
}

body:has(#loaded:checked) .skeletons {
  display: none;
  opacity: 0;
}

/* ── Publicaciones ── */
.posts {
  display: none;
  margin: 0;
  padding: 0;
  list-style: none;
}

body:has(#loaded:checked) .posts {
  display: grid;
}

.post {
  min-height: 44px;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 10px;
  background: #f0fdf4;
  font-size: 0.85rem;
  opacity: 0;
  transition: opacity 250ms;
}

body:has(#loaded:checked) .post {
  opacity: 1;
  transition-delay: calc(var(--i) * 90ms);
}

@starting-style {
  body:has(#loaded:checked) .post {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .skeleton::after {
    animation: sweep 1.4s linear 6;
  }

  .post {
    translate: 0 8px;
    transition: opacity 250ms, translate 250ms cubic-bezier(0, 0, 0.2, 1);
  }

  body:has(#loaded:checked) .post {
    translate: 0 0;
  }

  @starting-style {
    body:has(#loaded:checked) .post {
      translate: 0 8px;
    }
  }
}
```
