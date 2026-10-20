---
example_description: "El cartel de un festival de música: fondo, sol y montañas como capas en la misma celda que el contenido, cabezas de cartel a todo el ancho y los tres días en columnas auto-fit que se apilan solas"
example_tags: "css|profesional|grid|capas|grid-area|auto-fit|place-items|cartel"
example_stage: professional
example_importance: useful
---

# HTML

```html
<main class="poster" aria-labelledby="festival-title">
  <div class="sky" aria-hidden="true"></div>
  <div class="sun" aria-hidden="true"></div>
  <svg class="mountains" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 100 L0 60 L60 20 L110 55 L170 10 L240 60 L300 30 L360 65 L400 40 L400 100 Z"/></svg>

  <div class="content">
    <header class="poster-header">
      <p class="dates"><time datetime="2026-11-20">20</time>, <time datetime="2026-11-21">21</time> y <time datetime="2026-11-22">22 de noviembre de 2026</time></p>
      <h1 id="festival-title">Festival del Cañón</h1>
      <p class="venue">Parque La Huasteca · Santa Catarina, Nuevo León</p>
    </header>

    <ul class="headliners" aria-label="Cabezas de cartel">
      <li>Los Cenzontles Eléctricos</li>
      <li>Marea Alta</li>
      <li>Sonido Desierto</li>
    </ul>

    <div class="days">
      <section class="day" aria-labelledby="day-1">
        <h2 id="day-1">Viernes 20</h2>
        <ul><li>Los Cenzontles Eléctricos</li><li>Niña Volcán</li><li>Trío Garambullo</li><li>DJ Tepache</li></ul>
      </section>
      <section class="day" aria-labelledby="day-2">
        <h2 id="day-2">Sábado 21</h2>
        <ul><li>Marea Alta</li><li>Las Huizacheras</li><li>Colectivo Nopal</li><li>Banda Sierra Madre</li></ul>
      </section>
      <section class="day" aria-labelledby="day-3">
        <h2 id="day-3">Domingo 22</h2>
        <ul><li>Sonido Desierto</li><li>Cumbia del Río</li><li>Ana Lluvia</li><li>Coro Infantil de Santa Catarina</li></ul>
      </section>
    </div>

    <footer class="tickets">
      <p>Abono de tres días: <strong>1 450 MXN</strong> · Día suelto: <strong>650 MXN</strong></p>
      <a class="buy" href="/boletos">Comprar boletos</a>
    </footer>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Cartel de festival
   - .poster es una rejilla de UNA celda con cuatro capas: el cielo, el sol, las
     montañas y el contenido. Todas en grid-area: 1 / 1; cada una se coloca con
     la alineación de grid (el sol arriba a la derecha, las montañas abajo). El
     cartel mide lo que el contenido: si los días se apilan, crece, y las capas
     de fondo con él. Las capas decorativas llevan aria-hidden.
   - Las capas se pintan en el orden del HTML: el contenido, el último, encima.
     Por eso el sol es de un naranja oscuro: el título y las fechas pueden caer
     sobre él en pantallas estrechas y deben seguir leyéndose (contraste ≥ 4.5:1).
   - Contenido: cabecera centrada, cabezas de cartel (flex que se parte) y los
     tres días en columnas auto-fit de al menos 9rem.
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
    --color-night: #1e1b4b;
    --color-sky: #312e81;
    --color-sun: #7c2d12;         /* oscuro: el texto que pase por encima se lee */
    --color-mountain: #0f172a;
    --color-text: #ffffff;
    --color-gold: #fde047;
    --color-pink: #f9a8d4;
    --color-focus: #fde047;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-night);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.35;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }
}

@layer components {
  /* ─── Una celda, cuatro capas ─── */
  .poster {
    display: grid;
    max-width: 48rem;
    margin-inline: auto;
    overflow: hidden;
  }

  .poster > * {
    grid-area: 1 / 1;
  }

  .sky {
    background: var(--color-sky);
  }

  .sun {
    justify-self: end;
    align-self: start;
    width: 9rem;
    height: 9rem;
    margin: var(--space-6) var(--space-4) 0 0;
    border-radius: 50%;
    background: var(--color-sun);
  }

  .mountains {
    align-self: end;
    width: 100%;
    height: 6rem;
    fill: var(--color-mountain);
  }

  /* ─── El contenido ─── */
  .content {
    display: grid;
    gap: var(--space-6);
    padding: var(--space-6) var(--space-4) 7rem;
  }

  .poster-header {
    display: grid;
    justify-items: center;
    gap: var(--space-1);
    text-align: center;
  }

  .dates {
    color: var(--color-gold);
    font-weight: 700;
  }

  .poster-header h1 {
    font-size: clamp(2.2rem, 1.2rem + 5vw, 4.2rem);
    font-weight: 900;
    line-height: 0.95;
  }

  .venue {
    color: var(--color-pink);
  }

  .headliners {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-1) var(--space-4);
    padding: 0;
    list-style: none;
    font-size: clamp(1.2rem, 0.9rem + 1.6vw, 1.9rem);
    font-weight: 800;
    text-align: center;
  }

  .headliners li + li::before {
    content: "·" / "";
    margin-right: var(--space-4);
    color: var(--color-gold);
  }

  .days {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
    gap: var(--space-4);
  }

  .day {
    padding: var(--space-3);
    border-top: 3px solid var(--color-gold);
    background: rgb(30 27 75 / 0.85);
  }

  .day h2 {
    margin-bottom: var(--space-2);
    color: var(--color-gold);
    font-size: 1rem;
  }

  .day ul {
    display: grid;
    gap: var(--space-1);
    padding: 0;
    list-style: none;
  }

  .day li:first-child {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .tickets {
    display: grid;
    place-items: center;
    gap: var(--space-3);
    text-align: center;
  }

  .buy {
    padding: var(--space-2) var(--space-6);
    border-radius: 999px;
    background: var(--color-gold);
    color: var(--color-night);
    font-weight: 800;
    text-decoration: none;
  }
}
```
