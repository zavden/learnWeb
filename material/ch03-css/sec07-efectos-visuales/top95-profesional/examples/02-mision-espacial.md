---
example_description: "La portada de una exposición de fotografía espacial: cabecera sticky de cristal (backdrop-filter con @supports), portada con la nebulosa y un velo, un cielo de estrellas hecho con capas de radial-gradient y un abanico de tarjetas en 3D (preserve-3d) en el que la tarjeta con el ratón o el foco se adelanta con translateZ"
example_tags: "css|profesional|preserve-3d|perspective|backdrop-filter|radial-gradient|sticky"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <a class="site-header__brand" href="/planetario">Planetario</a>
  <nav aria-label="Principal">
    <ul class="site-header__nav">
      <li><a href="/planetario/exposiciones">Exposiciones</a></li>
      <li><a href="/planetario/funciones">Funciones</a></li>
    </ul>
  </nav>
</header>

<main>
  <section class="hero" aria-labelledby="hero-title">
    <p class="hero__kicker">Exposición temporal · Sala de la Bóveda</p>
    <h1 id="hero-title" class="hero__title">Fotografías que cambiaron el cielo</h1>
    <p class="hero__lead">Tres imágenes, de la Luna a una nebulosa a 6500 años luz, contadas por quienes las hicieron posibles.</p>
  </section>

  <section class="missions" aria-labelledby="missions-title">
    <h2 id="missions-title" class="missions__title">Las tres fotografías</h2>
    <p class="missions__hint">Pasa el ratón por una tarjeta o recórrelas con <kbd>Tab</kbd>.</p>
    <div class="deck">
      <ul class="deck__list">
        <li class="mission">
          <img src="aldrin-apolo-11.jpg" alt="Buzz Aldrin de pie en la Luna, con el traje espacial" width="300" height="300">
          <h3><a href="/planetario/exposiciones/cielo/apolo-11">Apolo 11</a></h3>
          <p>1969 · El primer alunizaje tripulado.</p>
        </li>
        <li class="mission">
          <img src="tierra-apolo-17.jpg" alt="La Tierra entera vista desde el espacio" width="300" height="300">
          <h3><a href="/planetario/exposiciones/cielo/apolo-17">Apolo 17</a></h3>
          <p>1972 · La Tierra entera, de camino a la Luna.</p>
        </li>
        <li class="mission">
          <img src="pilares-de-la-creacion.jpg" alt="Columnas de gas y polvo de la nebulosa del Águila" width="300" height="313">
          <h3><a href="/planetario/exposiciones/cielo/hubble">Hubble</a></h3>
          <p>2014 · Los Pilares de la creación.</p>
        </li>
      </ul>
    </div>
  </section>
</main>

<footer class="credits">
  <p>Imágenes: NASA (Apolo 11, 1969; Apolo 17, 1972) y NASA, ESA y Hubble Heritage Team (2014). Dominio público.</p>
</footer>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Fotografías que cambiaron el cielo
   - Cabecera sticky de cristal: fondo #0b1120 al 60 % + blur. Contraste en el
     peor caso (un píxel blanco detrás): rgb(109 112 121) frente al texto
     blanco, 4.9:1; el desenfoque, además, borra los detalles. @supports la
     vuelve casi opaca si el navegador no entiende backdrop-filter.
   - Portada: velo de abajo arriba sobre la foto (al menos 75 % bajo el texto).
   - Cielo: cuatro capas de radial-gradient con baldosas de tamaños primos
     entre sí (97, 131, 173, 211px), para que el patrón no se note repetido.
   - Abanico 3D: perspective en .deck, preserve-3d en la lista (sin fondo ni
     overflow: cualquiera de los dos estropearía el 3D) y cada tarjeta girada
     con la propiedad rotate. La tarjeta activa se adelanta con translate en
     z: en un espacio 3D manda la profundidad, no el z-index.
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
    --color-space: #0b1120;
    --color-text: #e2e8f0;
    --color-muted: #cbd5e1;
    --color-accent: #fbbf24;
    --space: 1rem;
  }
}

@layer base {
  body {
    background: var(--color-space);
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }

  a {
    color: inherit;
  }

  a:focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 3px;
  }
}

@layer components {
  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    justify-content: space-between;
    align-items: center;
    padding: 10px var(--space);
    background: rgb(11 17 32 / 0.6);
    backdrop-filter: blur(14px) saturate(1.3);
  }

  @supports not (backdrop-filter: blur(1px)) {
    .site-header {
      background: rgb(11 17 32 / 0.95);
    }
  }

  .site-header__brand {
    font-weight: 800;
    text-decoration: none;
  }

  .site-header__nav {
    display: flex;
    gap: 14px;
    padding: 0;
    list-style: none;
    font-size: 0.9rem;
  }

  /* La portada sube bajo la cabecera para que el cristal tenga algo detrás. */
  .hero {
    display: grid;
    align-content: end;
    gap: 6px;
    min-height: 340px;
    margin-top: -46px;
    padding: 70px var(--space) 28px;
    background-image:
      linear-gradient(to top, var(--color-space), rgb(11 17 32 / 0.75) 65%, rgb(11 17 32 / 0.2)),
      url("pilares-de-la-creacion.jpg");
    background-position: center, center 25%;
    background-size: auto, cover;
  }

  .hero__kicker {
    color: var(--color-accent);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .hero__title {
    font-size: 2rem;
    line-height: 1.1;
    text-wrap: balance;
  }

  .hero__lead {
    max-width: 38ch;
    color: var(--color-muted);
  }

  /* El cielo: puntos de 1 a 1.5px en baldosas de tamaños distintos. */
  .missions {
    padding: 28px var(--space) 36px;
    background-color: var(--color-space);
    background-image:
      radial-gradient(circle at 20% 30%, #ffffff 0 1px, transparent 1.5px),
      radial-gradient(circle at 70% 60%, #fde68a 0 1.2px, transparent 1.7px),
      radial-gradient(circle at 40% 80%, #bfdbfe 0 1px, transparent 1.5px),
      radial-gradient(circle at 85% 15%, #ffffff 0 1.5px, transparent 2px);
    background-size: 97px 97px, 131px 131px, 173px 173px, 211px 211px;
  }

  .missions__title {
    font-size: 1.4rem;
  }

  .missions__hint {
    margin-bottom: 18px;
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  /* El abanico. */
  .deck {
    perspective: 900px;
  }

  .deck__list {
    display: flex;
    justify-content: center;
    padding: 10px 0;
    list-style: none;
    transform-style: preserve-3d;
  }

  .mission {
    position: relative;
    flex: none;
    width: 150px;
    margin-inline: -18px;
    padding: 8px 8px 12px;
    border-radius: 10px;
    background: #1e293b;
    box-shadow: 0 10px 20px rgb(0 0 0 / 0.45);
    rotate: y 32deg;
  }

  .mission img {
    border-radius: 6px;
  }

  .mission h3 {
    margin-top: 8px;
    font-size: 1rem;
  }

  .mission h3 a {
    text-decoration: none;
  }

  /* El enlace cubre la tarjeta entera. */
  .mission h3 a::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 10px;
  }

  .mission p {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  /* La tarjeta activa se endereza y se adelanta 60px hacia ti: la profundidad
     la pone delante de sus vecinas. Cambio instantáneo (las transiciones
     llegan en el módulo de animación). */
  .mission:hover,
  .mission:focus-within {
    rotate: y 0deg;
    translate: 0 0 60px;
    outline: 2px solid var(--color-accent);
  }
}
```
