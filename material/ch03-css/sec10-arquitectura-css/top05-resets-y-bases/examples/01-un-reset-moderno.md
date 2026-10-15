---
example_description: "Un reset moderno comentado línea a línea, en la capa más baja: box-sizing, márgenes a cero (salvo dialog y popover), medios de bloque que no desbordan, controles con la letra de la página, text-wrap, text-size-adjust, interpolate-size, scrollbar-gutter y scroll-margin para :target. Aplicado a una ficha de museo"
example_tags: "css|arquitectura|reset|box-sizing|imagenes|formularios|text-wrap|layer"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<main class="page">
  <h1>Valle de México, el paisaje que José María Velasco pintó desde un cerro</h1>
  <figure>
    <img src="velasco-valle-de-mexico-480.jpg" alt="El valle de México desde lo alto de un cerro: el lago de Texcoco, los volcanes al fondo bajo una gran nube y un águila que vuela sobre la ladera" width="480" height="330">
    <figcaption>José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</figcaption>
  </figure>
  <p>El valle se abre desde lo alto de un cerro: un camino blanco lo cruza hacia el lago de Texcoco, y al fondo asoman los volcanes. <a href="#horario">Ver el horario de la sala</a>.</p>
  <ul role="list" class="facts">
    <li>Óleo sobre tela, 1877</li>
    <li>Museo Nacional de Arte (MUNAL), Ciudad de México</li>
  </ul>
  <form class="alerts" action="/avisos" method="post">
    <label for="topic">Avísame de</label>
    <select id="topic" name="topic">
      <option>visitas guiadas a esta sala</option>
      <option>talleres de paisaje</option>
    </select>
    <button type="submit">Suscribirme</button>
  </form>
  <h2 id="horario">Horario de la sala</h2>
  <p>Martes a domingo, de 10:00 a 18:00.</p>
</main>
```

# CSS

```css
@layer reset, base;

/* ── EL RESET ──────────────────────────────────────────────────────────
   En la capa más baja: cualquier regla de base o de componente le gana,
   esté donde esté en el archivo. Solo neutraliza lo que molesta de la
   hoja del navegador y arregla valores por defecto incómodos. */
@layer reset {
  /* 1. width y height incluyen el relleno y el borde (módulo de cajas). */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* 2. Fuera los márgenes del navegador: los 8px del body, los de h1, p,
     figure, ul… La base pondrá los que quiera, a propósito. */
  * {
    margin: 0;
  }

  /* 2b. …salvo el margin: auto con el que el navegador centra los
     diálogos y los popovers (ejemplo 4). */
  :where(dialog, [popover]) {
    margin: auto;
  }

  /* 3. Safari en iPhone agranda la letra al girar a horizontal. */
  html {
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
  }

  /* 4. Con barras de scroll clásicas (Windows, o macOS con «mostrar
     siempre»), reserva su hueco: la página no salta de lado cuando el
     contenido crece y aparece la barra. Con las barras superpuestas de
     macOS no hace nada. */
  html {
    scrollbar-gutter: stable;
  }

  /* 5. Animar hasta height: auto (módulo de animación), solo si el
     usuario no pide reducir el movimiento. */
  @media (prefers-reduced-motion: no-preference) {
    html {
      interpolate-size: allow-keywords;
    }
  }

  /* 6. Interlineado legible y un body tan alto como la ventana. */
  body {
    min-height: 100dvh;
    line-height: 1.5;
  }

  /* 7. Imágenes y vídeos: de bloque (sin el hueco de la línea base),
     nunca más anchos que su caja y con su proporción (módulo responsive). */
  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }

  img,
  video {
    height: auto;
  }

  /* 8. Los controles no heredan la letra: el navegador les pone la del
     sistema a 13.33px. Que usen la de la página. */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  /* 9. Títulos repartidos en líneas parejas; párrafos sin una palabra
     sola en la última línea; y palabras larguísimas (una URL) que se
     parten antes que desbordar. */
  h1,
  h2,
  h3 {
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  p,
  h1,
  h2,
  h3 {
    overflow-wrap: break-word;
  }

  /* 10. Sin viñetas, solo en las listas que lo piden con role="list"
     (ejemplo 6). */
  :where(ul, ol)[role="list"] {
    padding: 0;
    list-style: none;
  }

  /* 11. Al saltar a un ancla, deja aire por encima. */
  :target {
    scroll-margin-block: 5ex;
  }
}

/* ── LA BASE: tus valores por defecto ──────────────────────────────────── */
@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: #1c1917;
    background: #ffffff;
  }

  .page {
    display: grid;
    gap: 12px;
    max-width: 34rem;
    padding: 16px;
  }

  h1 {
    font-size: 1.4rem;
    line-height: 1.2;
  }

  h2 {
    font-size: 1.1rem;
  }

  figcaption {
    margin-top: 4px;
    color: #57534e;
    font-size: 0.8rem;
  }

  a {
    color: #9a3412;
  }

  .facts {
    display: grid;
    gap: 2px;
    font-size: 0.9rem;
  }

  .alerts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}
```
