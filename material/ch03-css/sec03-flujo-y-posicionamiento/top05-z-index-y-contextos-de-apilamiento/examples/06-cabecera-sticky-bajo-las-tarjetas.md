---
example_description: "Al hacer scroll, las tarjetas con position: relative pasan por encima de una cabecera sticky sin z-index; con z-index: 1 la cabecera queda encima"
example_tags: "css|z-index|sticky|stacking-context|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">↕ Desplaza las dos listas y mira qué pasa cuando las tarjetas llegan a la cabecera.</p>

<div class="column">
  <p class="caption">❌ Cabecera <code>sticky</code> sin <code>z-index</code></p>
  <div class="scroller" tabindex="0" role="region" aria-label="Rutas, cabecera sin z-index">
    <h3 class="list-header">Rutas cerca de ti</h3>
    <article class="route"><span class="badge">Nueva</span>Ruta del Cares</article>
    <article class="route"><span class="badge">Fácil</span>Hayedo de Montejo</article>
    <article class="route"><span class="badge">Nueva</span>Lagos de Covadonga</article>
    <article class="route"><span class="badge">Difícil</span>Pico Almanzor</article>
  </div>
</div>

<div class="column">
  <p class="caption">✅ Cabecera <code>sticky</code> con <code>z-index: 1</code></p>
  <div class="scroller" tabindex="0" role="region" aria-label="Rutas, cabecera con z-index">
    <h3 class="list-header is-raised">Rutas cerca de ti</h3>
    <article class="route"><span class="badge">Nueva</span>Ruta del Cares</article>
    <article class="route"><span class="badge">Fácil</span>Hayedo de Montejo</article>
    <article class="route"><span class="badge">Nueva</span>Lagos de Covadonga</article>
    <article class="route"><span class="badge">Difícil</span>Pico Almanzor</article>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  font-size: 0.8rem;
}

.caption {
  margin: 0 0 4px;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

.scroller {
  height: 120px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
}

.list-header {
  position: sticky;
  top: 0;
  margin: 0;
  padding: 6px 8px;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.85rem;
}

/* Cada tarjeta es relative para colocar su insignia en la esquina (lección 4). */
.route {
  position: relative;
  margin: 6px;
  padding: 18px 8px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f1f5f9;
  font-size: 0.85rem;
}

.badge {
  position: absolute;
  top: 2px;
  right: 6px;
  font-size: 0.7rem;
  font-weight: bold;
  color: #166534;
}

/* 🐛 Una caja sticky crea un contexto de apilamiento y, sin z-index, se pinta como capa 0
   en el orden del HTML. Las tarjetas también están posicionadas (capa 0) y van DESPUÉS en
   el HTML: se pintan encima de la cabecera cuando pasan por debajo de ella.
   (Si las tarjetas no estuvieran posicionadas, se pintarían antes y no pasaría.) */

/* ✅ Cualquier z-index positivo la pone por encima de las cajas posicionadas con auto. */
.is-raised {
  z-index: 1;
}
```
