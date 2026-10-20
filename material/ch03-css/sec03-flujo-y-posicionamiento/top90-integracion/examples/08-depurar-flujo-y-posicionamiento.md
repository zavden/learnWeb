---
example_description: "Una agenda cultural con cinco errores, uno por lección (enlace partido, hueco bajo la imagen, padre que colapsa, insignia sin referencia y menú atrapado), la misma página arreglada y una tabla con síntoma, causa y arreglo"
example_tags: "css|depurar|flow-root|baseline|float|position|z-index"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<div class="demo demo--broken">
  <p class="demo-label">❌ Cinco errores</p>
  <header class="site-header">
    <span class="logo">Agenda Ribera</span>
    <details class="city" open>
      <summary>Ciudad</summary>
      <ul class="city-menu"><li><a href="#">Logroño</a></li><li><a href="#">Haro</a></li><li><a href="#">Calahorra</a></li></ul>
    </details>
  </header>
  <section class="events">
    <article class="event">
      <span class="badge">Gratis</span>
      <a class="event-link" href="#">
        <div class="event-photo"><img src="event-concert.svg" width="320" height="180" alt="Escenario iluminado con público"></div>
        <h3>Concierto en el claustro</h3>
        <p>Sábado 18 · 21:00 · Cuarteto Iregua</p>
      </a>
      <div class="program"><img class="program-thumb" src="icon-clock.svg" width="24" height="24" alt=""><p class="program-text">Duración: 90 minutos</p></div>
    </article>
  </section>
</div>

<div class="demo demo--fixed">
  <p class="demo-label">✅ Los cinco arreglados</p>
  <header class="site-header">
    <span class="logo">Agenda Ribera</span>
    <details class="city" open>
      <summary>Ciudad</summary>
      <ul class="city-menu"><li><a href="#">Logroño</a></li><li><a href="#">Haro</a></li><li><a href="#">Calahorra</a></li></ul>
    </details>
  </header>
  <section class="events">
    <article class="event">
      <span class="badge">Gratis</span>
      <a class="event-link" href="#">
        <div class="event-photo"><img src="event-concert.svg" width="320" height="180" alt="Escenario iluminado con público"></div>
        <h3>Concierto en el claustro</h3>
        <p>Sábado 18 · 21:00 · Cuarteto Iregua</p>
      </a>
      <div class="program"><img class="program-thumb" src="icon-clock.svg" width="24" height="24" alt=""><p class="program-text">Duración: 90 minutos</p></div>
    </article>
  </section>
</div>

<table class="report">
  <caption>Qué pasaba y cómo se arregla</caption>
  <thead><tr><th scope="col">Síntoma</th><th scope="col">Causa</th><th scope="col">Arreglo</th></tr></thead>
  <tbody>
    <tr><td>El menú «Ciudad» queda debajo de la lista de eventos</td><td>Su <code>z-index: 9999</code> solo vale dentro de la cabecera (z-index 1), y la lista tiene 2</td><td>Subir la cabecera a 3 (lección 5)</td></tr>
    <tr><td>«Gratis» aparece en la esquina de la demo</td><td>La tarjeta no está posicionada: la insignia busca el antepasado posicionado más cercano</td><td><code>position: relative</code> en la tarjeta (lección 4)</td></tr>
    <tr><td>El borde del enlace sale en dos trozos</td><td>Un <code>&lt;a&gt;</code> inline que contiene bloques se parte en dos</td><td><code>display: block</code> en el enlace (lección 1)</td></tr>
    <tr><td>Franja amarilla bajo la foto</td><td>La imagen es inline y deja el hueco de los descendentes</td><td><code>display: block</code> en la imagen (lección 2)</td></tr>
    <tr><td>El recuadro de duración no envuelve al icono</td><td>El recuadro solo tiene flotantes y mide 0</td><td><code>display: flow-root</code> (lecciones 1 y 3)</td></tr>
  </tbody>
</table>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.4;
}

/* Cada demo es la referencia de lo que tenga «perdido» dentro (position: relative sin
   z-index: no crea contexto de apilamiento). */
.demo {
  position: relative;
  display: inline-block;
  vertical-align: top;
  width: min(100%, 17rem);
  margin: 0 0.75rem 1rem 0;
  padding: 1.75rem 0.5rem 0.5rem;
  border: 1px dashed #94a3b8;
}

.demo-label {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: bold;
}

/* ─── Cabecera con menú ─── */
.site-header {
  position: relative;
  z-index: 1;
  padding: 0.4rem 0.6rem;
  background: #1e3a8a;
  color: #ffffff;
}

.logo {
  font-weight: bold;
}

.city {
  display: inline-block;
  position: relative;
  margin-left: 0.75rem;
}

.city-menu {
  position: absolute;
  z-index: 9999;
  top: 100%;
  left: 0;
  margin: 0.25rem 0 0;
  padding: 0.25rem 0;
  list-style: none;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  background: #ffffff;
}

.city-menu a {
  display: block;
  padding: 0.1rem 0.8rem;
  color: #1d4ed8;
}

/* ─── Lista de eventos ─── */
.events {
  position: relative;
  z-index: 2;                        /* por las capas decorativas de la sección */
  padding-top: 0.5rem;
  background: #f1f5f9;
}

.event {
  margin: 0.5rem;
  background: #ffffff;
}

.badge {
  position: absolute;
  top: 0.4rem;
  left: 0.4rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: #166534;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
}

.event-link {
  border: 2px solid #1d4ed8;
  color: #1e293b;
  text-decoration: none;
}

.event-link h3,
.event-link p {
  margin: 0.25rem 0.5rem;
  font-size: 0.9rem;
}

.event-photo {
  background: #facc15;               /* amarillo: lo que asome bajo la foto es el hueco */
}

.event-photo img {
  width: 100%;
  height: auto;
}

.program {
  margin: 0.5rem;
  padding: 0.25rem;
  border: 1px solid #cbd5e1;
  background: #fef9c3;
}

.program-thumb {
  float: left;
  width: 1.5rem;
  height: auto;
  margin-right: 0.5rem;
}

.program-text {
  float: left;
  margin: 0;
  font-size: 0.85rem;
}

/* ─── Los cinco arreglos ─── */
.demo--fixed .site-header { z-index: 3; }                    /* lección 5 */
.demo--fixed .event { position: relative; }                  /* lección 4 */
.demo--fixed .event-link { display: block; }                 /* lección 1 */
.demo--fixed .event-photo img { display: block; }            /* lección 2 */
.demo--fixed .program { display: flow-root; }                /* lecciones 1 y 3 */

/* ─── Tabla resumen ─── */
.report {
  max-width: 36rem;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.report caption {
  margin-bottom: 0.25rem;
  font-weight: bold;
  text-align: start;
}

.report th,
.report td {
  padding: 0.3rem 0.5rem;
  border: 1px solid #cbd5e1;
  text-align: start;
  vertical-align: top;
}
```
