---
example_description: "El seguimiento de un pedido como línea de tiempo: marcadores absolute centrados en la primera línea de cada paso, tramos de raya que unen cada marcador con el siguiente y la lista aislada para que los marcadores queden encima"
example_tags: "css|profesional|position|z-index|isolation|line-height|linea-de-tiempo"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="tracking">
  <header class="tracking-header">
    <p class="order-id">Pedido 2026-1184</p>
    <h1 class="tracking-title">Llega el jueves 15 de octubre</h1>
    <p class="tracking-status"><span class="status">En reparto</span> Entrega entre las 10:00 y las 14:00</p>
  </header>

  <ol class="timeline" aria-label="Estado del pedido">
    <li class="step is-done">
      <h2 class="step-title">Pedido confirmado</h2>
      <p class="step-meta"><time datetime="2026-10-12T09:41">Lunes 12 · 9:41</time></p>
    </li>
    <li class="step is-done">
      <h2 class="step-title">Preparado en el almacén</h2>
      <p class="step-text">Martorell (Barcelona). Dos bultos.</p>
      <p class="step-meta"><time datetime="2026-10-13T16:20">Martes 13 · 16:20</time></p>
    </li>
    <li class="step is-done">
      <h2 class="step-title">En el centro de reparto de Zaragoza</h2>
      <p class="step-meta"><time datetime="2026-10-14T23:05">Miércoles 14 · 23:05</time></p>
    </li>
    <li class="step is-current" aria-current="step">
      <h2 class="step-title">En reparto</h2>
      <p class="step-text">Tu paquete va en la furgoneta 12 junto con otras 38 entregas. Te avisaremos por SMS cuando falten tres paradas.</p>
      <p class="step-meta"><time datetime="2026-10-15T08:12">Jueves 15 · 8:12</time></p>
    </li>
    <li class="step">
      <h2 class="step-title">Entregado</h2>
      <p class="step-text">Si no estás en casa, lo dejaremos en el punto de recogida de la calle Mayor, 8.</p>
    </li>
  </ol>

  <p class="help">¿Algún problema? <a href="#">Habla con nosotros</a></p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Seguimiento de pedido
   - Cada paso es la referencia (relative) de su marcador (::before) y del tramo
     de raya que lo une con el siguiente (::after), ambos absolute.
   - Los marcadores se centran en la PRIMERA línea del título: top = (alto de línea −
     tamaño del marcador) / 2, con un line-height fijo en el título.
   - Orden de pintado: el tramo (::after) va después del marcador en el HTML y se
     pintaría encima. Los marcadores llevan z-index: 1 y la lista, isolation, para
     que ese 1 no salga de ella.
   - El paso actual lleva aria-current="step": el estilo se cuelga del atributo.
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
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-line: #cbd5e1;
    --color-done: #15803d;
    --color-current: #1d4ed8;
    --color-focus: #1d4ed8;

    --marker: 1.25rem;                   /* tamaño de los marcadores */
    --title-lh: 1.75rem;                 /* alto de línea del título de cada paso */
    --rail: 2.75rem;                     /* columna de la izquierda, donde va la raya */
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-focus);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .tracking {
    width: min(100% - 2rem, 36rem);
    margin: 1.5rem auto 3rem;
    padding: 1.5rem;
    border-radius: 16px;
    background: var(--color-surface);
    box-shadow: 0 1px 3px rgb(15 23 42 / 0.12);
  }

  .tracking-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-line);
  }

  .order-id {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  .tracking-title {
    margin-block: 0.25rem;
    font-size: clamp(1.4rem, 4vw, 1.8rem);
    line-height: 1.2;
  }

  /* Insignia inline-block, alineada con la línea base del texto que la sigue. */
  .status {
    display: inline-block;
    margin-right: 0.4rem;
    padding: 0 0.6rem;
    border-radius: 999px;
    background: #dbeafe;
    color: #1e40af;
    font-size: 0.85rem;
    font-weight: 700;
  }

  /* ─── La línea de tiempo ─── */
  .timeline {
    isolation: isolate;
    padding: 0 0 0 var(--rail);
    list-style: none;
  }

  .step {
    position: relative;
    padding-bottom: 1.5rem;
  }

  .step:last-child {
    padding-bottom: 0;
  }

  .step-title {
    font-size: 1rem;
    line-height: var(--title-lh);
  }

  .step-text {
    color: var(--color-text);
    font-size: 0.95rem;
  }

  .step-meta {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  /* Marcador: un círculo centrado en la raya (horizontal) y en la primera línea del
     título (vertical). left es negativo porque el paso empieza después de la columna. */
  .step::before {
    content: "";
    position: absolute;
    top: calc((var(--title-lh) - var(--marker)) / 2);
    left: calc(var(--rail) / -2 - var(--marker) / 2);
    z-index: 1;
    width: var(--marker);
    height: var(--marker);
    border: 2px solid var(--color-line);
    border-radius: 50%;
    background: var(--color-surface);
  }

  /* Tramo de raya: del centro de este marcador al centro del siguiente (= todo el alto
     del paso, empezando a media línea del título). El último paso no tiene tramo. */
  .step:not(:last-child)::after {
    content: "";
    position: absolute;
    top: calc(var(--title-lh) / 2);
    left: calc(var(--rail) / -2 - 1px);
    width: 2px;
    height: 100%;
    background: var(--color-line);
  }

  .step.is-done::after {
    background: var(--color-done);
  }

  .step.is-done::before {
    border-color: var(--color-done);
    background: var(--color-done) url("icon-check-white.svg") center / 0.8rem no-repeat;
  }

  .step.is-done .step-title {
    color: var(--color-text-muted);
    font-weight: 600;
  }

  /* Paso actual: marcador más grande, con un anillo hecho con box-shadow
     (no ocupa sitio, así que no descoloca nada). */
  .step[aria-current="step"]::before {
    border-color: var(--color-current);
    background: var(--color-current);
    box-shadow: 0 0 0 5px #dbeafe;
  }

  .step[aria-current="step"] .step-title {
    color: var(--color-current);
    font-size: 1.15rem;
  }

  .step[aria-current="step"] .step-text {
    margin-top: 0.25rem;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    background: #eff6ff;
  }

  .help {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-line);
    color: var(--color-text-muted);
  }
}
```
