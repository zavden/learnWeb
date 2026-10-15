---
example_description: "La galería de un concurso de fotografía: fotos inline-block alineadas por arriba, pies superpuestos con position, un botón de voto y una cinta en las esquinas, un botón de reproducir centrado y un anillo de foco en toda la foto con :has(:focus-visible)"
example_tags: "css|profesional|position|inset|inline-block|has|galeria"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="contest">
  <header class="contest-header">
    <h1>Paisajes de otoño</h1>
    <p>Las seis fotografías finalistas del concurso. Vota tu favorita antes del 31 de octubre.</p>
  </header>

  <ul class="gallery">
    <li class="tile">
      <figure class="photo">
        <a class="photo-link" href="#"><img src="photo-5.svg" width="400" height="300" alt="Hayedo con las hojas cobrizas y un sendero entre los troncos"></a>
        <span class="ribbon">Ganadora del jurado</span>
        <button class="vote" type="button" aria-pressed="false" aria-label="Votar «Hayedo de Tejera Negra»"><img src="icon-heart.svg" width="24" height="24" alt=""></button>
        <figcaption class="caption"><strong>Hayedo de Tejera Negra</strong> Elena Prieto · Guadalajara</figcaption>
      </figure>
    </li>
    <li class="tile">
      <figure class="photo">
        <a class="photo-link" href="#"><img src="photo-3.svg" width="400" height="300" alt="Montaña cubierta de niebla al atardecer"><span class="play" aria-hidden="true"></span></a>
        <span class="duration">Vídeo · 0:42</span>
        <button class="vote" type="button" aria-pressed="false" aria-label="Votar «Niebla en el Moncayo»"><img src="icon-heart.svg" width="24" height="24" alt=""></button>
        <figcaption class="caption"><strong>Niebla en el Moncayo</strong> Iván Ruiz · Zaragoza</figcaption>
      </figure>
    </li>
    <li class="tile">
      <figure class="photo">
        <a class="photo-link" href="#"><img src="photo-1.svg" width="400" height="300" alt="Lago de montaña al amanecer con el sol sobre las cumbres"></a>
        <button class="vote" type="button" aria-pressed="true" aria-label="Votar «Lago de Sanabria al alba»"><img src="icon-heart.svg" width="24" height="24" alt=""></button>
        <figcaption class="caption"><strong>Lago de Sanabria al alba</strong> Carmen Ortiz · Zamora</figcaption>
      </figure>
    </li>
    <li class="tile">
      <figure class="photo">
        <a class="photo-link" href="#"><img src="photo-4.svg" width="400" height="300" alt="Colinas de viñedos amarillos bajo un cielo claro"></a>
        <button class="vote" type="button" aria-pressed="false" aria-label="Votar «Viñedos de La Rioja»"><img src="icon-heart.svg" width="24" height="24" alt=""></button>
        <figcaption class="caption"><strong>Viñedos de La Rioja</strong> Hugo Castillo · Logroño</figcaption>
      </figure>
    </li>
    <li class="tile">
      <figure class="photo">
        <a class="photo-link" href="#"><img src="photo-2.svg" width="400" height="300" alt="Bosque de castaños rojizos en una ladera"></a>
        <button class="vote" type="button" aria-pressed="false" aria-label="Votar «Castaños del Bierzo»"><img src="icon-heart.svg" width="24" height="24" alt=""></button>
        <figcaption class="caption"><strong>Castaños del Bierzo</strong> Laura Benítez · León</figcaption>
      </figure>
    </li>
    <li class="tile">
      <figure class="photo">
        <a class="photo-link" href="#"><img src="photo-6.svg" width="400" height="300" alt="Marisma al atardecer con el cielo malva reflejado en el agua"></a>
        <button class="vote" type="button" aria-pressed="false" aria-label="Votar «Marismas de Doñana»"><img src="icon-heart.svg" width="24" height="24" alt=""></button>
        <figcaption class="caption"><strong>Marismas de Doñana</strong> Emilio Sáez · Huelva</figcaption>
      </figure>
    </li>
  </ul>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Galería con pies superpuestos
   - Fotos inline-block alineadas por arriba que pasan a la fila siguiente
     como palabras; el espacio en blanco entre ellas se compensa con el margen.
   - Cada foto es la referencia (relative) de sus piezas: cinta, botón de voto,
     duración del vídeo, botón de reproducir centrado y pie de foto abajo.
   - isolation en cada foto: sus z-index son internos y no pueden tapar nada
     de fuera (un menú, una ventana…).
   - :has(:focus-visible) dibuja el anillo de foco alrededor de toda la foto cuando
     el enlace o el botón de voto tienen el foco del teclado.
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

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: #fafaf9;
    --color-text: #1c1917;
    --color-text-muted: #57534e;
    --color-overlay: rgb(15 23 42 / 0.78);
    --color-accent: #9a3412;
    --color-focus: #1d4ed8;

    --tile-width: 16rem;
    --radius: 10px;
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .contest {
    width: min(100% - 2rem, 54rem);
    margin: 1.5rem auto 3rem;
  }

  .contest-header {
    max-width: 40rem;
    margin-bottom: 1.25rem;
  }

  .contest-header h1 {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }

  .contest-header p {
    color: var(--color-text-muted);
  }

  /* ─── Rejilla de fotos con inline-block ─── */
  .gallery {
    padding: 0;
    list-style: none;
  }

  .tile {
    display: inline-block;
    vertical-align: top;
    width: min(100%, var(--tile-width));
    margin: 0 0.75rem 1rem 0;
  }

  /* ─── Una foto ─── */
  .photo {
    position: relative;
    isolation: isolate;
    overflow: clip;                      /* recorta las esquinas sin crear scroll */
    border-radius: var(--radius);
    background: #d6d3d1;
  }

  /* El anillo va en la foto entera cuando algo de dentro tiene el foco del teclado. Con
     overflow: clip, un outline del enlace quedaría recortado; el de la figura se dibuja fuera. */
  .photo:has(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }

  .photo-link:focus-visible,
  .vote:focus-visible {
    outline: none;                       /* ya lo dibuja la figura */
  }

  .photo-link img {
    width: 100%;
  }

  /* El pie: una franja abajo, de lado a lado (left + right estiran la caja). */
  .caption {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 0.5rem 0.75rem;
    background: var(--color-overlay);
    color: #ffffff;
    font-size: 0.8rem;
    line-height: 1.35;
  }

  .caption strong {
    display: block;
    font-size: 0.95rem;
  }

  /* Botón de voto en la esquina superior derecha. */
  .vote {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 1;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.55rem;
    border: 0;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
  }

  /* El estado lo cambiaría el JavaScript del concurso; la tercera foto ya está votada. */
  .vote[aria-pressed="true"] {
    background: #fee2e2;
    box-shadow: inset 0 0 0 2px #b91c1c;
  }

  /* Cinta que sobresale por la izquierda: la foto recorta lo que salga de ella,
     así que la cinta empieza dentro y se apoya en el borde. */
  .ribbon {
    position: absolute;
    top: 0.75rem;
    left: 0;
    z-index: 1;
    padding: 0.2rem 0.75rem 0.2rem 0.6rem;
    border-radius: 0 999px 999px 0;
    background: var(--color-accent);
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .duration {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 1;
    padding: 0.1rem 0.5rem;
    border-radius: 6px;
    background: var(--color-overlay);
    color: #ffffff;
    font-size: 0.8rem;
  }

  /* El botón de reproducir se centra sobre la foto: inset: 0 + tamaño + margin: auto.
     Su referencia es la figura (el enlace no está posicionado). */
  .play {
    position: absolute;
    inset: 0;
    width: 3.5rem;
    height: 3.5rem;
    margin: auto;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.9) url("play.svg") 55% center / 1.5rem no-repeat;
  }
}
```
