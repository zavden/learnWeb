---
example_description: "Las funciones de una aplicación en una rejilla «bento»: piezas de distintos tamaños con span en filas y columnas, la principal a todo el ancho, dense sin riesgo para el orden de lectura y cifras decorativas superpuestas en las piezas"
example_tags: "css|profesional|grid|bento|span|dense|grid-auto-rows|capas"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="features">
  <header class="features-header">
    <p class="kicker">Huerto en Casa · la app</p>
    <h1>Todo lo que tu huerto necesita, en el bolsillo</h1>
  </header>

  <ul class="bento">
    <li class="tile is-hero">
      <h2>Un calendario de siembra para tu ciudad</h2>
      <p>Te dice qué sembrar cada semana según el clima de donde vives, de Mexicali a Mérida.</p>
    </li>
    <li class="tile is-tall is-dark">
      <p class="big" aria-hidden="true">−40 %</p>
      <h2>Menos agua</h2>
      <p>Con el sensor de humedad, riegas solo cuando la tierra lo pide.</p>
    </li>
    <li class="tile">
      <h2>Avisos de plagas</h2>
      <p>Fotos de lo que ves en las hojas y qué hacer.</p>
    </li>
    <li class="tile is-wide is-warm">
      <h2>Comunidad</h2>
      <p>Pregunta a 12 000 personas que cultivan en azoteas, balcones y patios.</p>
    </li>
    <li class="tile">
      <h2>Sin conexión</h2>
      <p>Las guías funcionan aunque no haya señal en la azotea.</p>
    </li>
    <li class="tile is-tall">
      <p class="big" aria-hidden="true">320</p>
      <h2>Fichas de plantas</h2>
      <p>Riego, luz, trasplante y compañeras de cultivo de cada una.</p>
    </li>
    <li class="tile">
      <h2>Diario del huerto</h2>
      <p>Anota cosechas y fotos.</p>
    </li>
  </ul>

  <p class="cta"><a href="/descargar">Descarga la app gratis</a></p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Rejilla «bento»
   - Columnas auto-fill de al menos 9rem y filas implícitas de al menos 8rem
     (crecen si el texto lo pide).
   - Tamaños: .is-hero ocupa toda la fila (1 / -1: funciona con cualquier
     número de columnas); .is-wide, dos columnas; .is-tall, dos filas.
   - span 2 en columnas exige al menos dos columnas: con una sola, crearía una
     columna implícita y la rejilla se saldría. Por eso min-width: dos
     columnas.
   - dense rellena los huecos. Aquí es seguro: las piezas no tienen enlaces ni
     se leen en secuencia (son ventajas sueltas), así que el orden visual
     distinto no confunde al teclado ni al lector de pantalla. El único enlace
     va fuera de la rejilla. (Si las piezas fueran enlaces, reading-flow.)
   - Cada pieza tiene tres filas: un hueco elástico (1fr), el título y el texto,
     que así quedan abajo. Las cifras grandes son una capa que ocupa la pieza
     entera (grid-row: 1 / -1, con filas explícitas) y se alinean arriba a la
     derecha: si la pieza es baja, el texto pasa por debajo sin desordenarse.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }
}

@layer tokens {
  :root {
    --color-text: #0f172a;
    --color-muted: #334155;
    --color-tile: #ecfdf5;
    --color-dark: #134e4a;
    --color-warm: #fef3c7;
    --color-brand: #0f766e;
    --color-big: #a7f3d0;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 1.25rem;
    --column: 9rem;
    --gap: 0.75rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.4;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .features {
    max-width: 60rem;
    margin-inline: auto;
    padding: var(--space-6) var(--space-4);
  }

  .features-header {
    margin-bottom: var(--space-6);
  }

  .kicker {
    color: var(--color-brand);
    font-weight: 700;
  }

  .features-header h1 {
    max-width: 30rem;
    font-size: clamp(1.6rem, 1.1rem + 2.5vw, 2.6rem);
    line-height: 1.1;
  }

  /* ─── La rejilla ─── */
  .bento {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--column)), 1fr));
    grid-auto-rows: minmax(8rem, auto);
    grid-auto-flow: dense;
    gap: var(--gap);
    min-width: calc(2 * var(--column) + var(--gap));
    padding: 0;
    list-style: none;
  }

  .is-hero {
    grid-column: 1 / -1;
  }

  .is-wide {
    grid-column: span 2;
  }

  .is-tall {
    grid-row: span 2;
  }

  /* Cada pieza: hueco elástico, título y texto. */
  .tile {
    display: grid;
    grid-template-rows: 1fr auto auto;
    padding: var(--space-4);
    border-radius: var(--radius);
    background: var(--color-tile);
  }

  .tile h2 {
    grid-row: 2;
    font-size: 1.05rem;
    line-height: 1.2;
  }

  .tile p:not(.big) {
    grid-row: 3;
    margin-top: var(--space-1);
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  /* Capa: toda la altura de la pieza, arriba a la derecha. */
  .big {
    grid-row: 1 / -1;
    grid-column: 1;
    justify-self: end;
    align-self: start;
    color: var(--color-brand);
    font-size: clamp(2rem, 1.4rem + 3vw, 3.2rem);
    font-weight: 900;
    line-height: 1;
  }

  .is-hero {
    background: var(--color-brand);
    color: #ffffff;
  }

  .is-hero h2 {
    max-width: 28rem;
    font-size: clamp(1.3rem, 1rem + 1.5vw, 1.8rem);
  }

  .is-hero p:not(.big) {
    max-width: 32rem;
    color: #ccfbf1;
  }

  .is-dark {
    background: var(--color-dark);
    color: #ffffff;
  }

  .is-dark p:not(.big) {
    color: #ccfbf1;
  }

  .is-dark .big {
    color: var(--color-big);
  }

  .is-warm {
    background: var(--color-warm);
  }

  .cta {
    margin-top: var(--space-6);
    text-align: center;
  }

  .cta a {
    display: inline-block;
    padding: var(--space-2) var(--space-6);
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }
}
```
