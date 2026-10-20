---
example_description: "Testimonios de un curso de panadería: comillas latinas colgadas fuera del margen con text-indent negativo (Chrome no tiene hanging-punctuation), comillas anidadas automáticas de q según lang, nombres en versalitas y en bdi, y valoraciones que no dependen de las estrellas"
example_tags: "css|profesional|tipografia|text-indent|comillas|q|font-variant-caps|bdi|testimonios"
example_stage: professional
example_importance: useful
---

# HTML

```html
<section class="testimonials" aria-labelledby="testimonials-title">
  <h2 id="testimonials-title">Lo que dicen quienes ya hornean en casa</h2>

  <ul class="quotes">
    <li class="quote-card">
      <blockquote>
        <p>«Nunca había hecho pan y a la tercera clase ya me salían las conchas mejor que las de la tienda.»</p>
      </blockquote>
      <p class="rating"><span aria-hidden="true">★★★★★</span> 5 de 5</p>
      <p class="author"><bdi>Rocío Pérez</bdi>, <span>Puebla</span></p>
    </li>

    <li class="quote-card">
      <blockquote>
        <p>«Lo mejor fue entender por qué pasa cada cosa: ahora, si el pan no crece, sé qué revisar antes de tirar la masa.»</p>
      </blockquote>
      <p class="rating"><span aria-hidden="true">★★★★★</span> 5 de 5</p>
      <p class="author"><bdi lang="ar">يوسف العلي</bdi>, <span>Monterrey</span></p>
    </li>

    <li class="quote-card">
      <blockquote>
        <p>«La maestra repetía <q>la masa avisa cuando está lista</q>, y tenía razón: aprendí a mirarla en lugar de mirar el reloj.»</p>
      </blockquote>
      <p class="rating"><span aria-hidden="true">★★★★☆</span> 4 de 5</p>
      <p class="author"><bdi>Marta Ibáñez</bdi>, <span>Querétaro</span></p>
    </li>
  </ul>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Testimonios
   - Puntuación colgada: el «» de apertura sale fuera del margen y el texto
     queda alineado por sus letras, como en los libros. Safari lo hace con
     hanging-punctuation; Chrome no la tiene, así que se cuelga a mano con un
     text-indent negativo del ancho del « (0,496 em en Literata).
   - Comillas anidadas: <q> elige las suyas según lang. En español, dentro de
     unas «» van “”: el navegador las pone solo.
   - Nombres en <bdi> (uno está escrito en árabe) y en versalitas
     (font-variant-caps: small-caps): las minúsculas se dibujan como
     mayúsculas pequeñas. Van en la fuente del sistema porque San Francisco
     trae versalitas de verdad; Literata no, y el navegador las sintetizaría.
   - La valoración se dice con texto («5 de 5»); las estrellas son decoración.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Literata";
  src: url("fonts/literata-italic.woff2") format("woff2");
  font-weight: 200 900;
  font-style: italic;
  font-display: swap;
}

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
    --font-text: Literata, Georgia, serif;
    --font-ui: system-ui, sans-serif;
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-accent: #9a3412;
    --color-card: #fff7ed;
    --color-star: #b45309;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: var(--font-ui);
    line-height: 1.5;
  }
}

@layer components {
  .testimonials h2 {
    margin-block-end: 16px;
    font-family: var(--font-text);
    font-size: 1.6rem;
    line-height: 1.2;
    text-align: center;
    text-wrap: balance;
  }

  .quotes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: 16px;
    padding: 0;
    list-style: none;
  }

  .quote-card {
    display: grid;
    grid-template-rows: 1fr auto auto;   /* la cita crece; valoración y autor, abajo */
    gap: 10px;
    padding-block: 20px 16px;
    padding-inline: 24px 20px;
    border-radius: 12px;
    background: var(--color-card);
  }

  /* El « cuelga fuera de la línea: la primera letra de la cita queda
     alineada con las demás líneas. El padding del lado donde empieza la línea
     (24px) deja sitio para la comilla. */
  .quote-card blockquote p {
    font-family: var(--font-text);
    font-size: 1.1rem;
    font-style: italic;
    line-height: 1.45;
    text-indent: -0.5em;
    text-wrap: pretty;
  }

  /* Las comillas de <q> salen del idioma (lang="es" en la página). */
  q {
    font-style: normal;
  }

  .rating {
    font-size: 0.8rem;
  }

  .rating span {
    color: var(--color-star);
    letter-spacing: 0.1em;
  }

  .author {
    padding-block-start: 8px;
    border-block-start: 1px solid #fed7aa;
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .author bdi {
    color: var(--color-text);
    font-size: 1rem;
    font-variant-caps: small-caps;
    font-weight: 600;
    letter-spacing: 0.03em;
  }
}
```
