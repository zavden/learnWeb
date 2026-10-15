---
example_description: "Una galería de obras de dominio público: la obra del mes con dirección de arte (<picture>: un recorte vertical por debajo de 40rem, el cuadro apaisado desde ahí), rejilla de 1, 2 o 3 columnas con un sizes que la describe, miniaturas 4:3 recortadas por el punto de interés de cada obra, y una vista ampliada sin JavaScript (un popover con la imagen de 960px, que solo se descarga al abrirlo)"
example_tags: "css|profesional|responsive|picture|direccion-de-arte|srcset|sizes|object-fit|object-position|popover|galeria"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="intro">
  <h1>Paisajes, mares y cielos</h1>
  <p>Cuatro obras de la colección digital. Pulsa «Ampliar» para verlas enteras.</p>
</header>

<figure class="featured">
  <picture>
    <source media="(width < 40rem)" srcset="velasco-valle-de-mexico-vertical-480x600.jpg" width="480" height="600">
    <img src="velasco-valle-de-mexico-480.jpg" srcset="velasco-valle-de-mexico-480.jpg 480w, velasco-valle-de-mexico.jpg 960w" sizes="(width >= 60rem) 60rem, 100vw" alt="Nubes sobre el Valle de México y sus lagos; en primer plano, un cerro con nopales y un águila en vuelo" width="960" height="660">
  </picture>
  <figcaption><strong>Obra del mes.</strong> José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público. A 480px ves un recorte vertical (otro archivo); desde 40rem (640px), el cuadro apaisado.</figcaption>
</figure>

<ul class="gallery">
  <li class="artwork">
    <img class="artwork__thumb" src="velasco-valle-de-mexico-480.jpg" srcset="velasco-valle-de-mexico-480.jpg 480w, velasco-valle-de-mexico.jpg 960w" sizes="(width >= 60rem) 30vw, (width >= 30rem) 45vw, 90vw" alt="" width="480" height="330" style="--focus: 28% 55%">
    <h2 class="artwork__title"><cite>Valle de México</cite></h2>
    <p class="artwork__meta">José María Velasco, 1877</p>
    <button class="artwork__open" type="button" popovertarget="obra-velasco">Ampliar <span class="visually-hidden">Valle de México</span></button>
    <figure id="obra-velasco" class="viewer" popover>
      <img src="velasco-valle-de-mexico.jpg" alt="Un cerro cubierto de pasto en primer plano; al fondo, el valle con sus lagos y los volcanes bajo un cielo con nubes" width="960" height="660" loading="lazy">
      <figcaption><cite>Valle de México</cite>, José María Velasco, 1877. Óleo sobre tela. Dominio público. <button type="button" popovertarget="obra-velasco" popovertargetaction="hide">Cerrar</button></figcaption>
    </figure>
  </li>
  <li class="artwork">
    <img class="artwork__thumb" src="hokusai-gran-ola-480.jpg" srcset="hokusai-gran-ola-480.jpg 480w, hokusai-gran-ola.jpg 960w" sizes="(width >= 60rem) 30vw, (width >= 30rem) 45vw, 90vw" alt="" width="480" height="323" style="--focus: 30% 50%">
    <h2 class="artwork__title"><cite>La gran ola de Kanagawa</cite></h2>
    <p class="artwork__meta">Katsushika Hokusai, c. 1831</p>
    <button class="artwork__open" type="button" popovertarget="obra-hokusai">Ampliar <span class="visually-hidden">La gran ola de Kanagawa</span></button>
    <figure id="obra-hokusai" class="viewer" popover>
      <img src="hokusai-gran-ola.jpg" alt="Una ola enorme con crestas como garras a punto de caer sobre tres barcas; al fondo, pequeño, el monte Fuji nevado" width="960" height="646" loading="lazy">
      <figcaption><cite>La gran ola de Kanagawa</cite>, Katsushika Hokusai, c. 1831. Xilografía. Dominio público. <button type="button" popovertarget="obra-hokusai" popovertargetaction="hide">Cerrar</button></figcaption>
    </figure>
  </li>
  <li class="artwork">
    <img class="artwork__thumb" src="tierra-apolo-17-480.jpg" srcset="tierra-apolo-17-480.jpg 480w, tierra-apolo-17.jpg 960w" sizes="(width >= 60rem) 30vw, (width >= 30rem) 45vw, 90vw" alt="" width="480" height="480">
    <h2 class="artwork__title"><cite>La canica azul</cite></h2>
    <p class="artwork__meta">Tripulación del Apolo 17, NASA, 1972</p>
    <button class="artwork__open" type="button" popovertarget="obra-tierra">Ampliar <span class="visually-hidden">La canica azul</span></button>
    <figure id="obra-tierra" class="viewer" popover>
      <img src="tierra-apolo-17.jpg" alt="La Tierra entera, iluminada, con África, Arabia y la Antártida bajo remolinos de nubes" width="960" height="960" loading="lazy">
      <figcaption><cite>La canica azul</cite>, NASA, Apolo 17, 1972. Fotografía. Dominio público. <button type="button" popovertarget="obra-tierra" popovertargetaction="hide">Cerrar</button></figcaption>
    </figure>
  </li>
  <li class="artwork">
    <img class="artwork__thumb" src="pilares-de-la-creacion-480.jpg" srcset="pilares-de-la-creacion-480.jpg 480w, pilares-de-la-creacion.jpg 960w" sizes="(width >= 60rem) 30vw, (width >= 30rem) 45vw, 90vw" alt="" width="480" height="501" style="--focus: 50% 35%">
    <h2 class="artwork__title"><cite>Pilares de la creación</cite></h2>
    <p class="artwork__meta">NASA, ESA y Hubble Heritage Team, 2014</p>
    <button class="artwork__open" type="button" popovertarget="obra-pilares">Ampliar <span class="visually-hidden">Pilares de la creación</span></button>
    <figure id="obra-pilares" class="viewer" popover>
      <img src="pilares-de-la-creacion.jpg" alt="Tres columnas de gas y polvo oscuro que se elevan en una nebulosa verde y dorada" width="960" height="1002" loading="lazy">
      <figcaption><cite>Pilares de la creación</cite>, telescopio Hubble, 2014. Fotografía. Dominio público. <button type="button" popovertarget="obra-pilares" popovertargetaction="hide">Cerrar</button></figcaption>
    </figure>
  </li>
</ul>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Galería de arte
   - Rejilla mobile-first: una columna; desde 30rem, dos; desde 60rem, tres.
     El sizes de cada miniatura cuenta lo mismo (90vw, 45vw, 30vw): el
     navegador elige entre 480 y 960px sin esperar al CSS.
   - Miniaturas: una caja 4:3 con object-fit: cover, recortada por el punto
     de interés de cada obra (--focus). Las miniaturas son decorativas
     (alt=""): el título está justo debajo, y la descripción completa, en la
     vista ampliada.
   - Obra del mes: DIRECCIÓN DE ARTE con <picture>. Por debajo de 40rem, el
     navegador usa el <source>: OTRO ARCHIVO, un recorte vertical de 480 × 600
     (nubes, valle, cerro y águila), con sus propios width y height para que
     el hueco reservado tenga su proporción. Desde 40rem, el <img> con su
     srcset (cambio de RESOLUCIÓN: el mismo encuadre en 480 o 960px). La
     condición del <source> y la media query del CSS se reparten los anchos
     sin solaparse (< 40rem, >= 40rem): en ancho, una franja 21:9 recortada
     con object-position para no gastar tanta altura.
   - Vista ampliada: un <figure popover> que abre «Ampliar». Centrado por el
     navegador, con su ::backdrop oscurecido; la imagen grande lleva
     loading="lazy" y, como el popover está oculto, no se descarga hasta que
     se abre. Dentro, object-fit: contain: la obra entera, sin recortes, en
     el espacio que deje la ventana (svh).
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  img { display: block; max-width: 100%; height: auto; }
  button { font: inherit; }
}

@layer tokens {
  :root {
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-accent: #0f766e;
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  }
}

@layer base {
  body { padding: var(--space-s-l); background: #fafaf9; color: var(--color-text); font-family: system-ui, sans-serif; line-height: 1.4; }
  h1 { font-family: Georgia, serif; font-size: clamp(1.5rem, 1.1rem + 2vw, 2.4rem); }
  :focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
}

@layer components {
  .intro { margin-bottom: var(--space-s); }

  .featured { margin-bottom: var(--space-s); }
  .featured img { width: 100%; border-radius: 10px; }
  .featured figcaption { margin-top: 6px; color: var(--color-muted); font-size: 0.85rem; }

  @media (width >= 40rem) {
    .featured img { aspect-ratio: 21 / 9; object-fit: cover; object-position: 50% 55%; }
  }
  .intro p { color: var(--color-muted); }

  .gallery { display: grid; gap: var(--space-s); padding: 0; list-style: none; }

  @media (width >= 30rem) {
    .gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (width >= 60rem) {
    .gallery { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  .artwork { display: grid; gap: 2px; align-content: start; }
  .artwork__thumb { width: 100%; aspect-ratio: 4 / 3; margin-bottom: 6px; border-radius: 8px; object-fit: cover; object-position: var(--focus, 50% 50%); }
  .artwork__title { font-family: Georgia, serif; font-size: 1.05rem; font-weight: 400; }
  .artwork__meta { color: var(--color-muted); font-size: 0.85rem; }

  .artwork__open,
  .viewer button {
    justify-self: start;
    margin-top: 4px;
    padding: 4px 12px;
    border: 2px solid var(--color-accent);
    border-radius: 999px;
    background: #ffffff;
    color: var(--color-accent);
    font-weight: 700;
  }

  @media (any-pointer: coarse) {
    .artwork__open, .viewer button { min-height: 44px; }
  }

  .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

  /* La vista ampliada. El popover abierto va en la capa superior, centrado
     por el navegador (inset: 0 y margin: auto son sus estilos de serie). */
  .viewer {
    max-width: min(60rem, 100vw - 2rem);
    padding: 12px;
    border: 0;
    border-radius: 12px;
    background: #1c1917;
    color: #f5f5f4;
  }

  .viewer::backdrop { background: rgb(12 10 9 / 0.75); }

  .viewer img {
    width: auto;
    max-height: calc(100svh - 9rem);   /* deja sitio al pie y a los márgenes */
    margin-inline: auto;
    object-fit: contain;
  }

  .viewer figcaption { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; justify-content: space-between; margin-top: 8px; font-size: 0.85rem; }
  .viewer button { margin: 0; }
}
```
