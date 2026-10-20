---
example_description: "La ficha de un pódcast con aspect-ratio en todas partes: el hueco del vídeo (16/9), miniaturas 4/3 con background-size: cover, un avatar redondo y una cita cuadrada que crece si el texto no cabe"
example_tags: "css|aspect-ratio|background-size|border-radius|inline-block"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="episode">
  <!-- Fachada del reproductor: el hueco del vídeo existe antes de que cargue nada -->
  <a class="player" href="#"><span class="player-label">Ver el episodio en vídeo · 42 min</span></a>

  <h2 class="episode-title">Episodio 37: El agua de la ciudad</h2>
  <p class="episode-meta">
    <img class="avatar" src="avatar.svg" width="160" height="160" alt="">
    Con <strong>Lucía Martín</strong>, ingeniera de la red de abastecimiento
  </p>

  <blockquote class="quote-card">
    <p>«Cada vez que abres el grifo, el agua ha recorrido unos 40 km desde el embalse.»</p>
  </blockquote>
  <blockquote class="quote-card">
    <p>«Una ciudad pierde por fugas cerca del 20 % del agua que potabiliza. Encontrarlas es como buscar una aguja bajo el asfalto, así que escuchamos las tuberías por la noche, cuando nadie gasta.»</p>
  </blockquote>

  <h3 class="more-title">Más episodios</h3>
  <ul class="thumbs">
    <li><a href="#"><span class="thumb"></span>36 · El ruido</a></li>
    <li><a href="#"><span class="thumb"></span>35 · Los árboles de la calle</a></li>
    <li><a href="#"><span class="thumb"></span>34 · La basura que no vemos</a></li>
  </ul>
</article>
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
}

.episode {
  max-width: 36rem;
}

/* 16/9 a partir del ancho: el alto se calcula aunque la caja esté vacía (lección 4).
   Dos capas de fondo con el atajo background (lección 6): el icono centrado encima
   («posición / tamaño» y repetición) y el color debajo, siempre en la última capa. */
.player {
  display: block;
  aspect-ratio: 16 / 9;
  padding: 0.75rem;
  border-radius: 12px;
  background: url("play.svg") center / 4rem no-repeat, #0f172a;
  color: #ffffff;
}

.player-label {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  background: rgb(15 23 42 / 0.8);
  font-size: 0.875rem;
}

/* El foco rodea toda la fachada sin cambiar su tamaño */
.player:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}

.episode-title {
  margin: 1rem 0 0.5rem;
}

/* Avatar: cuadrado por aspect-ratio y redondo por border-radius: 50% (lección 6).
   La imagen ya es cuadrada; aspect-ratio lo garantiza aunque cambien sus atributos. */
.avatar {
  display: inline-block;
  vertical-align: middle;          /* vertical-align llega en el módulo de flujo; centra el avatar con el texto */
  width: 2.5rem;
  height: auto;
  aspect-ratio: 1;
  margin-right: 0.4rem;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #b45309;   /* doble anillo con dos sombras */
}

/* Citas cuadradas: aspect-ratio es un MÍNIMO. Si el texto no cabe en el cuadrado,
   la caja crece en alto en lugar de desbordar (compara la segunda). */
.quote-card {
  display: inline-block;
  vertical-align: top;             /* alinea las dos citas por arriba */
  width: min(100%, 13rem);
  aspect-ratio: 1;
  margin: 0.5rem 0.75rem 0.5rem 0;
  padding: 1rem;
  border-radius: 16px 16px 16px 4px;
  background: #fef3c7;
  color: #78350f;
}

.quote-card p {
  margin: 0;
}

.more-title {
  margin: 1.5rem 0 0.5rem;
}

.thumbs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.thumbs li {
  display: inline-block;
  vertical-align: top;
  width: 9rem;
  margin: 0 0.5rem 0.75rem 0;
}

.thumbs a {
  display: block;
  color: #1d4ed8;
  font-size: 0.9rem;
}

.thumbs a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* Miniatura decorativa (el texto del enlace ya dice qué es): una imagen cuadrada
   dentro de una caja 4/3. cover la escala hasta llenar la caja y recorta lo que sobra. */
.thumb {
  display: block;
  aspect-ratio: 4 / 3;
  margin-bottom: 0.35rem;
  border-radius: 8px;
  background: url("cover.svg") center / cover;
}
```
