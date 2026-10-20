---
example_description: "height: 0 → auto no se anima: el panel se abre y se cierra de golpe. Tres paneles con la misma casilla: el roto, el arreglado con interpolate-size: allow-keywords (Chrome 129+) y el arreglado con grid-template-rows de 0fr a 1fr, que funciona en todos los navegadores"
example_tags: "css|transiciones|height-auto|interpolate-size|calc-size|grid|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Tres paneles de «Envío y devoluciones» que se abren con la misma casilla y tienen <code>transition</code> de 400 ms. Márcala y desmárcala. (Con «reducir movimiento», los tres se abren de golpe: es lo correcto.)</p>
<label class="control"><input type="checkbox" id="details"> Ver los detalles del envío</label>
<div class="cols">
  <section class="panel is-broken">
    <h3>❌ <code>height: 0</code> → <code>auto</code></h3>
    <div class="body"><p>Envío gratis desde $599. Llega en 2 a 4 días hábiles. Tienes 30 días para devolverlo.</p></div>
  </section>
  <section class="panel is-keywords">
    <h3>✅ <code>interpolate-size</code></h3>
    <div class="body"><p>Envío gratis desde $599. Llega en 2 a 4 días hábiles. Tienes 30 días para devolverlo.</p></div>
  </section>
  <section class="panel is-grid">
    <h3>✅ <code>0fr</code> → <code>1fr</code></h3>
    <div class="body"><div class="inner"><p>Envío gratis desde $599. Llega en 2 a 4 días hábiles. Tienes 30 días para devolverlo.</p></div></div>
  </section>
</div>
```

# CSS

```css
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

.cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  align-items: start;
  margin-top: 12px;
}

.panel {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}

.panel h3 {
  margin: 0;
  padding: 8px;
  font-size: 0.72rem;
}

.panel p {
  margin: 0;
  padding: 0 8px 8px;
  font-size: 0.75rem;
}

/* ❌ y ✅ 1: la caja se cierra con height: 0 y overflow: hidden. */
.is-broken .body,
.is-keywords .body {
  height: 0;
  overflow: hidden;
}

body:has(#details:checked) .is-broken .body,
body:has(#details:checked) .is-keywords .body {
  height: auto;
}

/* 🐛 auto no es un número: es «lo que mida el contenido», y el navegador no
   sabe calcular «el 40 % del camino entre 0 y auto». La transición no ocurre
   y el valor nuevo llega de golpe, al abrir y al cerrar. */

/* ✅ 1. interpolate-size: allow-keywords (Chrome 129+) permite interpolar
   entre una longitud y auto (o min-content, max-content, fit-content): el
   navegador mide el contenido y anima hasta esa medida. Se hereda, así que
   lo normal es ponerlo una vez en :root para toda la página. Otra vía, para
   una sola propiedad: height: calc-size(auto, size). */
.is-keywords {
  interpolate-size: allow-keywords;
}

/* ✅ 2. El truco de grid, que funciona en todos los navegadores: una sola
   fila que pasa de 0fr a 1fr (eso sí son números). El hijo necesita
   min-height: 0 y overflow: hidden para poder encoger hasta cero. */
.is-grid .body {
  display: grid;
  grid-template-rows: 0fr;
}

body:has(#details:checked) .is-grid .body {
  grid-template-rows: 1fr;
}

.is-grid .inner {
  min-height: 0;
  overflow: hidden;
}

@media (prefers-reduced-motion: no-preference) {
  .is-broken .body,
  .is-keywords .body {
    transition: height 400ms ease;
  }

  .is-grid .body {
    transition: grid-template-rows 400ms ease;
  }
}
```
