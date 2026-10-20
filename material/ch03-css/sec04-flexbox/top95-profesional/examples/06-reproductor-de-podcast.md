---
example_description: "La página de un podcast: ficha del programa que se apila en pantallas estrechas, lista de episodios como media objects con el botón de reproducir a la derecha y una barra de reproducción sticky con progreso que se reparte en dos líneas"
example_tags: "css|profesional|flexbox|podcast|media-object|sticky|flex-wrap|reproductor"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="page">
  <header class="show">
    <img class="show-cover" src="cover-raices.svg" alt="" width="128" height="128">
    <div class="show-text">
      <p class="show-kind">Podcast · Jardinería</p>
      <h1>Raíces</h1>
      <p class="show-host">Con Marta García y Luis Gómez</p>
      <p class="show-description">Cada martes, una planta, un error común y una persona que vive de cultivar. Grabado en Guadalajara.</p>
      <div class="show-actions">
        <a class="button is-primary" href="/podcast/raices/seguir">Seguir</a>
        <a class="button" href="/podcast/raices/rss">RSS</a>
      </div>
    </div>
  </header>

  <main class="episodes-section" aria-labelledby="episodes-title">
    <h2 id="episodes-title">Episodios</h2>
    <ol class="episodes">
      <li class="episode is-playing">
        <img src="cover-raices.svg" alt="" width="56" height="56">
        <div class="episode-text">
          <p class="episode-meta"><time datetime="2026-10-13">13 oct.</time> · 42 min</p>
          <h3><a href="/podcast/raices/48">48. Suculentas en interior: por qué se estiran y cómo evitarlo</a></h3>
          <p class="episode-summary">Hablamos con Ana Torres, que cultiva más de 200 especies en un departamento de la colonia Americana, sobre luz, riego y el error que comete casi todo el mundo en invierno.</p>
        </div>
        <button class="play" type="button" aria-label="Pausar el episodio 48">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/></svg>
        </button>
      </li>
      <li class="episode">
        <img src="cover-raices.svg" alt="" width="56" height="56">
        <div class="episode-text">
          <p class="episode-meta"><time datetime="2026-10-06">6 oct.</time> · 37 min</p>
          <h3><a href="/podcast/raices/47">47. Compost en la azotea sin olores</a></h3>
          <p class="episode-summary">Tres cajas, lombrices californianas y una regla de oro: por cada parte de restos verdes, dos de cartón.</p>
        </div>
        <button class="play" type="button" aria-label="Reproducir el episodio 47">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
        </button>
      </li>
      <li class="episode">
        <img src="cover-ciudad.svg" alt="" width="56" height="56">
        <div class="episode-text">
          <p class="episode-meta"><time datetime="2026-09-29">29 sep.</time> · 51 min · Episodio especial con el podcast Ciudad viva</p>
          <h3><a href="/podcast/raices/46">46. Árboles de banqueta: quién los planta y quién los cuida</a></h3>
          <p class="episode-summary">Un recorrido por las avenidas de Guadalajara con una ingeniera forestal del ayuntamiento.</p>
        </div>
        <button class="play" type="button" aria-label="Reproducir el episodio 46">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
        </button>
      </li>
    </ol>
  </main>

  <section class="player" aria-label="Reproductor">
    <div class="now-playing">
      <img src="cover-raices.svg" alt="" width="44" height="44">
      <div class="now-playing-text">
        <p class="now-playing-title">48. Suculentas en interior: por qué se estiran y cómo evitarlo</p>
        <p class="now-playing-show">Raíces</p>
      </div>
    </div>
    <div class="controls">
      <button class="control" type="button" aria-label="Retroceder 15 segundos">−15</button>
      <button class="control is-main" type="button" aria-label="Pausar">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/></svg>
      </button>
      <button class="control" type="button" aria-label="Avanzar 30 segundos">+30</button>
    </div>
    <div class="progress">
      <span class="time">12:07</span>
      <input type="range" min="0" max="2520" value="727" aria-label="Posición en el episodio" aria-valuetext="12 minutos 7 segundos de 42 minutos">
      <span class="time">42:00</span>
    </div>
  </section>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Página de podcast
   - La página es una columna de 100dvh como mínimo: la lista de episodios
     crece (flex: 1) y la barra de reproducción queda siempre al final.
   - La barra es sticky abajo (bottom: 0): acompaña al lector mientras baja y
     ocupa su propio hueco al final, sin tapar el último episodio.
   - Ficha del programa: media object que se apila (portada rígida y texto con
     base de 14rem). Episodios: media object con el botón de reproducir a la
     derecha, rígido y alineado arriba.
   - Barra: tres piezas que se reparten en líneas. Lo que suena (base 12rem,
     título recortado), los controles (rígidos) y el progreso (base 16rem). En
     una pantalla estrecha, el progreso baja a su propia línea.
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

  img,
  svg {
    display: block;
    flex: none;
  }

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #e2e8f0;
    --color-surface: #ffffff;
    --color-soft: #f0fdf4;
    --color-brand: #166534;
    --color-brand-dark: #14532d;
    --color-player: #0f172a;
    --color-player-muted: #cbd5e1;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 0.5rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.45;
  }

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    max-width: 52rem;
    margin-inline: auto;
  }

  /* ─── Ficha del programa ─── */
  .show {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-6) var(--space-4) var(--space-4);
    background: var(--color-soft);
  }

  .show-cover {
    border-radius: var(--radius);
  }

  .show-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1 1 14rem;
  }

  .show-kind,
  .show-host {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .show h1 {
    font-size: 2rem;
    line-height: 1.1;
  }

  .show-description {
    max-width: 36rem;
  }

  .show-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  .button {
    padding: var(--space-1) var(--space-4);
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    color: var(--color-brand);
    font-weight: 700;
    text-decoration: none;
  }

  .button.is-primary {
    background: var(--color-brand);
    color: #ffffff;
  }

  /* ─── Episodios ─── */
  .episodes-section {
    flex: 1;
    padding: var(--space-4);
  }

  .episodes-section h2 {
    margin-bottom: var(--space-2);
    font-size: 1.25rem;
  }

  .episodes {
    padding: 0;
    list-style: none;
  }

  /* Portada rígida, texto flexible y botón rígido, todos alineados arriba. */
  .episode {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding-block: var(--space-3);
    border-bottom: 1px solid var(--color-border);
  }

  .episode img {
    border-radius: var(--radius);
  }

  .episode-text {
    flex: 1;
    min-width: 0;
  }

  .episode-meta {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .episode h3 {
    font-size: 1rem;
    line-height: 1.3;
  }

  .episode h3 a {
    text-decoration: none;
  }

  .episode h3 a:hover {
    text-decoration: underline;
  }

  /* Resumen recortado a dos líneas (módulo del modelo de cajas). */
  .episode-summary {
    display: -webkit-box;
    overflow: hidden;
    color: var(--color-muted);
    font-size: 0.9rem;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .is-playing h3 a {
    color: var(--color-brand);
  }

  /* El botón: un círculo con el icono en el centro exacto. */
  .play {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid var(--color-brand);
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-brand);
    cursor: pointer;
  }

  .is-playing .play {
    background: var(--color-brand);
    color: #ffffff;
  }

  /* ─── Barra de reproducción ─── */
  .player {
    position: sticky;
    bottom: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--color-player);
    color: #ffffff;
  }

  .now-playing {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1 1 12rem;
    min-width: 0;
  }

  .now-playing img {
    border-radius: 0.25rem;
  }

  .now-playing-text {
    min-width: 0;
  }

  .now-playing-title {
    overflow: hidden;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .now-playing-show {
    color: var(--color-player-muted);
    font-size: 0.8rem;
  }

  .controls {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--space-2);
  }

  .control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
  }

  .control.is-main {
    width: 2.75rem;
    height: 2.75rem;
    background: #ffffff;
    color: var(--color-player);
  }

  /* Tiempo, barra que ocupa el resto y duración. */
  .progress {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 1 1 16rem;
    min-width: 0;
  }

  .progress input {
    flex: 1;
    min-width: 0;
  }

  .time {
    flex: none;
    color: var(--color-player-muted);
    font-size: 0.75rem;
  }

  .player :focus-visible {
    outline-color: #93c5fd;
  }
}
```
