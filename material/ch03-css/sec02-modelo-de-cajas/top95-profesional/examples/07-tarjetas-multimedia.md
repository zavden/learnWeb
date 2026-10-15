---
example_description: "Tarjetas de vídeo, pódcast y artículo con aspect-ratio (16/9, 1/1, 4/3), duración superpuesta con márgenes negativos, portadas con background-size: cover y una tira de fotos con scroll horizontal accesible"
example_tags: "css|profesional|aspect-ratio|background-size|overflow|multimedia"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="media-page">
  <h1>Esta semana en «Ciudad verde»</h1>

  <article class="media-card media-card--video">
    <a class="media-link" href="#">
      <span class="media-frame media-frame--video"></span>
      <span class="media-meta"><span class="duration">18:42</span></span>
      <span class="media-kind">Vídeo</span>
      <span class="media-title">Cómo convertimos un aparcamiento en un huerto de 40 parcelas</span>
    </a>
    <p class="media-byline">Por Javier Ruiz · 12 de noviembre</p>
  </article>

  <article class="media-card">
    <a class="media-link" href="#">
      <span class="media-frame media-frame--square"></span>
      <span class="media-meta"><span class="duration">42 min</span></span>
      <span class="media-kind">Pódcast</span>
      <span class="media-title">Episodio 37: el agua de la ciudad</span>
    </a>
    <p class="media-byline">Con Lucía Martín, ingeniera de la red de abastecimiento</p>
  </article>

  <article class="media-card">
    <a class="media-link" href="#">
      <img class="media-image" src="article-cover.svg" width="400" height="300" alt="">
      <span class="media-kind">Artículo</span>
      <span class="media-title">Los árboles de tu calle tienen ficha: así funciona el inventario municipal</span>
    </a>
    <p class="media-byline">Por Nuria Campos · 8 min de lectura</p>
  </article>

  <section class="gallery" aria-labelledby="gallery-title">
    <h2 id="gallery-title">Fotos de los lectores</h2>
    <div class="gallery-strip" role="region" aria-labelledby="gallery-title" tabindex="0">
      <ul class="gallery-list">
        <li><figure><img src="photo-1.svg" width="320" height="240" alt="Sierra azulada al amanecer desde un mirador"><figcaption>Mirador de la Peña</figcaption></figure></li>
        <li><figure><img src="photo-2.svg" width="320" height="240" alt="Sol naranja sobre un campo de cereal"><figcaption>Atardecer en Tierra de Campos</figcaption></figure></li>
        <li><figure><img src="photo-3.svg" width="320" height="240" alt="Colinas verdes después de la lluvia"><figcaption>Lomas de primavera</figcaption></figure></li>
        <li><figure><img src="photo-4.svg" width="320" height="240" alt="Ventana iluminada de color violeta en una fachada"><figcaption>Fachada del teatro</figcaption></figure></li>
        <li><figure><img src="photo-5.svg" width="320" height="240" alt="Tejado rojo en punta contra un cielo rosado"><figcaption>La ermita al anochecer</figcaption></figure></li>
      </ul>
    </div>
    <p class="gallery-hint">Desliza la tira o enfócala con <kbd>Tab</kbd> y usa las flechas.</p>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tarjetas multimedia
   - Cada formato reserva su hueco con aspect-ratio antes de que cargue nada
     (vídeo 16/9, pódcast 1/1, artículo 4/3): la página no salta al cargar.
   - Portadas decorativas como imágenes de fondo con background-size: cover (llenan
     la caja y recortan lo que sobra). La del artículo es un <img> con su proporción
     en los atributos width y height. (Recortar un <img> como cover es object-fit,
     del módulo de imágenes responsive.)
   - La duración se monta sobre la portada con un margen negativo: el mismo truco
     de flujo normal que las insignias de producto. Sin posicionamiento.
   - La tira de fotos: white-space: nowrap + inline-block + overflow-x: auto.
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
}

@layer tokens {
  :root {
    --color-bg: #0f172a;
    --color-surface: #1e293b;
    --color-text: #f1f5f9;
    --color-text-muted: #cbd5e1;
    --color-accent: #7dd3fc;
    --color-focus: #fde047;

    --radius: 14px;
    --meta-height: 2rem;
  }
}

@layer base {
  /* Tema oscuro: color-scheme hace oscuras también las barras de scroll */
  :root {
    color-scheme: dark;
  }

  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }

  :where(kbd) {
    padding: 0 0.3em;
    border: 1px solid var(--color-text-muted);
    border-radius: 4px;
    font-size: 0.875em;
  }
}

@layer components {
  .media-page {
    width: min(100% - 2rem, 62rem);
    margin: 2rem auto;
  }

  .media-page h1 {
    margin-bottom: 1.5rem;
    font-size: clamp(1.5rem, 4vw, 2rem);
  }

  /* ─── Tarjeta ─── */
  .media-card {
    display: inline-block;
    vertical-align: top;                /* vertical-align llega en el módulo de flujo */
    width: min(100%, 18rem);
    margin: 0 1rem 1.5rem 0;
  }

  /* El vídeo, destacado: el doble de ancho mientras quepa */
  .media-card--video {
    width: min(100%, 37rem);
  }

  .media-link {
    display: block;
    border-radius: var(--radius);
    color: inherit;
    text-decoration: none;
  }

  /* Portadas: el hueco lo reserva aspect-ratio; el fondo pone la imagen y, debajo,
     un color por si tarda en cargar o falla. */
  .media-frame {
    display: block;
    border-radius: var(--radius);
    background-color: var(--color-surface);
    background-position: center;
    background-size: cover;
  }

  .media-frame--video {
    aspect-ratio: 16 / 9;
    background-image: url("play.svg"), url("video-cover.svg");
    background-repeat: no-repeat;
    background-size: clamp(3rem, 12%, 4.5rem), cover;   /* el icono crece con la tarjeta */
  }

  .media-frame--square {
    aspect-ratio: 1;
    background-image: url("podcast-cover.svg");
  }

  .media-image {
    width: 100%;
    border-radius: var(--radius);
    background: var(--color-surface);
  }

  /* Franja de alto fijo subida sobre la esquina inferior de la portada; margen negativo
     igual a su alto: no ocupa sitio. text-align: end lleva la duración a la derecha. */
  .media-meta {
    display: block;
    height: var(--meta-height);
    margin-top: calc(var(--meta-height) * -1);
    padding-inline: 0.5rem;
    text-align: end;
  }

  .duration {
    display: inline-block;
    padding: 0 0.4rem;
    border-radius: 6px;
    background: rgb(15 23 42 / 0.85);
    color: #ffffff;
    font-size: 0.8125rem;
    font-weight: 700;
  }

  .media-kind {
    display: block;
    margin-top: 0.75rem;
    color: var(--color-accent);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .media-title {
    display: block;
    margin-top: 0.125rem;
    font-size: 1.0625rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .media-card--video .media-title {
    font-size: clamp(1.125rem, 2.5vw, 1.375rem);
  }

  .media-link:hover .media-title {
    text-decoration: underline;
  }

  .media-byline {
    margin-top: 0.375rem;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  /* ─── Tira de fotos con scroll horizontal ─── */
  .gallery {
    margin-top: 1rem;
  }

  .gallery h2 {
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
  }

  /* Las cajas en línea no saltan de línea con white-space: nowrap: la fila entera
     se hace más ancha que el contenedor y overflow-x: auto la convierte en un área
     con scroll. tabindex="0" la hace desplazable con el teclado. */
  .gallery-strip {
    overflow-x: auto;
    padding: 0.25rem 0.25rem 0.75rem;
    border-radius: var(--radius);
  }

  .gallery-list {
    padding: 0;
    list-style: none;
    white-space: nowrap;
  }

  .gallery-list li {
    display: inline-block;
    vertical-align: top;
    width: 12rem;
    margin-right: 0.75rem;
    white-space: normal;                /* los pies de foto sí pueden partirse */
  }

  .gallery-list img {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 10px;
    background: var(--color-surface);
  }

  .gallery-list figcaption {
    margin-top: 0.375rem;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .gallery-hint {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }
}
```
