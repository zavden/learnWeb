---
example_description: "Un artículo largo con medida de lectura de 65ch, imagen y cita que se salen de la columna solo cuando hay sitio (clamp con vw y %), aviso destacado, tabla con scroll y notas al pie resaltadas con una sombra"
example_tags: "css|profesional|articulo|max-width|margin|clamp"
example_stage: professional
example_importance: critical
---

# HTML

```html
<header class="site-header">
  <p class="wrapper site-name"><a href="#">Consumo claro</a> · guías para entender tus facturas</p>
</header>

<main>
  <article class="article">
    <header class="wrapper article-header">
      <p class="category">Energía</p>
      <h1>Por qué tu factura de la luz tiene tres precios</h1>
      <p class="deck">Punta, llano y valle: qué significan, a qué horas se aplica cada uno y cuánto puedes ahorrar moviendo la lavadora unas horas.</p>
      <p class="byline">
        <img class="byline-avatar" src="avatar-nuria.svg" width="160" height="160" alt="">
        Por <strong>Nuria Campos</strong> · <time datetime="2026-11-10">10 de noviembre de 2026</time> · 7 min de lectura
      </p>
    </header>

    <figure class="wrapper">
      <img class="breakout" src="hero-wide.svg" width="1200" height="500" alt="Valle de montaña con un sendero entre prados y cumbres al fondo">
      <figcaption>Las centrales hidroeléctricas de montaña ayudan a cubrir los picos de consumo de la tarde.</figcaption>
    </figure>

    <div class="wrapper flow prose">
      <p>Si tienes contratada la tarifa regulada, cada kilovatio hora que gastas no cuesta lo mismo a todas horas. Desde 2021, el día se divide en tres periodos con precios distintos, y la diferencia entre el más caro y el más barato puede ser del doble.</p>
      <p>La idea es sencilla: la red eléctrica se dimensiona para el momento de máximo consumo. Si una parte de ese consumo se desplaza a las horas tranquilas, hace falta menos infraestructura y la energía resulta más barata para todos.<sup><a class="note-ref" href="#note-1" id="ref-1">1</a></sup></p>

      <h2>Los tres periodos</h2>
      <p>De lunes a viernes laborables, los periodos se reparten así. Los fines de semana y los festivos nacionales, todas las horas son valle.</p>

      <div class="table-scroll" role="region" aria-labelledby="periods-caption" tabindex="0">
        <table class="periods">
          <caption id="periods-caption">Periodos horarios en la península (días laborables)</caption>
          <thead>
            <tr><th scope="col">Periodo</th><th scope="col">Horario</th><th scope="col">Horas al día</th><th scope="col">Precio orientativo</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Punta</th><td>10:00 – 14:00 y 18:00 – 22:00</td><td>8</td><td>0,24 €/kWh</td></tr>
            <tr><th scope="row">Llano</th><td>8:00 – 10:00, 14:00 – 18:00 y 22:00 – 24:00</td><td>8</td><td>0,17 €/kWh</td></tr>
            <tr><th scope="row">Valle</th><td>0:00 – 8:00</td><td>8</td><td>0,12 €/kWh</td></tr>
          </tbody>
        </table>
      </div>

      <p>Los precios cambian cada hora en la tarifa regulada; los de la tabla son una media para que te hagas una idea de la proporción.</p>

      <blockquote class="pull-quote breakout-soft">
        <p>Poner la lavadora a las once de la noche en lugar de a las siete de la tarde cuesta lo mismo en esfuerzo y la mitad en energía.</p>
      </blockquote>

      <h2>Qué electrodomésticos conviene mover</h2>
      <p>No todo se puede desplazar: la nevera funciona a todas horas y nadie va a cenar a las tres de la madrugada. Pero hay aparatos que gastan mucho, funcionan solos y casi siempre tienen programador: la lavadora, el lavavajillas, la secadora, el termo eléctrico y el cargador del coche.</p>

      <aside class="callout" aria-label="Consejo">
        <p class="callout-title">Antes de programar de madrugada</p>
        <p>Comprueba que la lavadora no hace demasiado ruido para tus vecinos y no dejes la secadora funcionando mientras duermes si el fabricante lo desaconseja.</p>
      </aside>

      <h2>¿Cuánto se ahorra de verdad?</h2>
      <p>En un hogar medio, los aparatos que se pueden programar suponen alrededor de una cuarta parte del consumo. Moverlos del periodo punta al valle ahorra entre 60 y 90 euros al año, según la potencia contratada y lo que uses cada aparato.<sup><a class="note-ref" href="#note-2" id="ref-2">2</a></sup></p>
      <p>Es poco comparado con cambiar de tarifa o de compañía, pero es gratis y se hace una sola vez: programar el electrodoméstico y olvidarte.</p>
    </div>

    <footer class="wrapper article-footer">
      <h2 class="footnotes-title">Notas</h2>
      <ol class="footnotes">
        <li id="note-1">Red Eléctrica publica cada día la curva de demanda en tiempo real; el pico suele estar entre las 20:00 y las 21:00. <a href="#ref-1" aria-label="Volver a la referencia 1">↩</a></li>
        <li id="note-2">Cálculo para un consumo de 3000 kWh al año y una potencia de 4,6 kW. <a href="#ref-2" aria-label="Volver a la referencia 2">↩</a></li>
      </ol>

      <section class="author" aria-label="Sobre la autora">
        <img class="author-avatar" src="avatar-nuria.svg" width="160" height="160" alt="">
        <p class="author-name">Nuria Campos</p>
        <p class="author-bio">Ingeniera industrial. Escribe sobre energía doméstica y lleva diez años explicando facturas a sus vecinos.</p>
      </section>
    </footer>
  </article>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Artículo con medida legible
   - La columna (.wrapper): width: min(100% − 2rem, 65ch) + margin-inline: auto.
     Unos 65 caracteres por línea en pantallas grandes y 1rem libre a cada lado
     en las pequeñas.
   - Salirse de la columna sin desbordar: dentro de .wrapper, 100% es el ancho de
     la columna, así que (100vw − 100%) / 2 es el espacio libre a cada lado. Un
     margen negativo de clamp(0px, ese espacio − 1rem, máximo) saca la imagen y la
     cita solo cuando hay sitio. Ojo: 100vw incluye la barra de scroll clásica
     (≈ 15px): por eso se resta un rem de margen de seguridad.
   - Ritmo vertical con márgenes en una sola dirección (.flow > * + *).
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
    --color-bg: #fffdf7;
    --color-surface: #ffffff;
    --color-text: #292524;
    --color-text-muted: #57534e;
    --color-border: #e7e5e4;
    --color-brand: #b45309;
    --color-brand-strong: #92400e;
    --color-brand-soft: #fef3c7;
    --color-callout: #ecfdf5;
    --color-callout-border: #047857;
    --color-focus: #b45309;

    --measure: 65ch;
    --gutter: 1rem;
    --flow-space: 1.25em;
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
    font-size: 1.125rem;
    line-height: 1.65;
  }

  :where(a) {
    color: var(--color-brand-strong);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  :where(h1, h2) {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.2;
  }
}

@layer components {
  /* ─── Columna ─── */
  .wrapper {
    width: min(100% - 2 * var(--gutter), var(--measure));
    margin-inline: auto;
  }

  .site-header {
    padding-block: 0.75rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 0.9375rem;
    color: var(--color-text-muted);
  }

  .site-name a {
    color: var(--color-text);
    font-weight: 800;
    text-decoration: none;
  }

  /* ─── Cabecera del artículo ─── */
  .article-header {
    padding-block: clamp(1.5rem, 6vw, 3.5rem) 1.5rem;
  }

  .category {
    display: inline-block;
    margin-bottom: 0.75rem;
    padding: 0.125rem 0.625rem;
    border-radius: 999px;
    background: var(--color-brand-soft);
    color: var(--color-brand-strong);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .article-header h1 {
    font-size: clamp(2rem, 6vw, 3rem);
  }

  .deck {
    margin-top: 0.75rem;
    color: var(--color-text-muted);
    font-size: clamp(1.125rem, 2.5vw, 1.3125rem);
  }

  .byline {
    margin-top: 1.25rem;
    color: var(--color-text-muted);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 0.9375rem;
  }

  .byline-avatar {
    display: inline-block;
    width: 2.25rem;
    aspect-ratio: 1;
    margin-right: 0.375rem;
    border-radius: 50%;
    vertical-align: middle;             /* vertical-align llega en el módulo de flujo */
  }

  /* ─── Salir de la columna cuando hay sitio ─── */
  /* Hasta 8rem por cada lado. En un móvil, el espacio libre es justo el gutter (1rem),
     clamp() da 0px y la imagen se queda en la columna: nunca desborda. */
  .breakout {
    --bleed: clamp(0px, (100vw - 100%) / 2 - var(--gutter), 8rem);
    width: calc(100% + 2 * var(--bleed));
    max-width: none;                    /* el reset la limitaba al 100 % */
    margin-inline: calc(var(--bleed) * -1);
    border-radius: 12px;
  }

  figcaption {
    margin-top: 0.5rem;
    color: var(--color-text-muted);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 0.875rem;
  }

  /* ─── Texto ─── */
  .prose {
    padding-block: 2rem 1rem;
  }

  .flow > * + * {
    margin-top: var(--flow-space);
  }

  /* Más aire antes de cada sección que después: el título «pertenece» a lo que sigue */
  .flow > h2 {
    margin-top: 2.25em;
    font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  }

  .flow > h2 + * {
    margin-top: 0.5em;
  }

  /* Cita destacada: sale de la columna como mucho 4rem por lado, con la misma fórmula.
     Como es un bloque con width: auto, los márgenes negativos la ensanchan solos. */
  .breakout-soft {
    margin-inline: calc(clamp(0px, (100vw - 100%) / 2 - var(--gutter), 4rem) * -1);
  }

  .pull-quote {
    padding: 1.25rem 1.5rem;
    border-left: 6px solid var(--color-brand);
    border-radius: 0 12px 12px 0;
    background: var(--color-brand-soft);
    color: var(--color-brand-strong);
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-style: italic;
    line-height: 1.4;
  }

  /* Aviso: se espacia por dentro con padding; nada se escapa de él */
  .callout {
    padding: 1rem 1.25rem;
    border: 1px solid var(--color-callout-border);
    border-left-width: 6px;
    border-radius: 10px;
    background: var(--color-callout);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 1rem;
  }

  .callout > * + * {
    margin-top: 0.375rem;
  }

  .callout-title {
    font-weight: 700;
  }

  /* ─── Tabla con scroll horizontal ─── */
  .table-scroll {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-surface);
  }

  .periods {
    width: 100%;
    min-width: 34rem;                   /* en un móvil, el contenedor se desplaza; la página no */
    border-collapse: collapse;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 0.9375rem;
  }

  .periods caption {
    padding: 0.75rem 1rem 0.25rem;
    font-weight: 700;
    text-align: start;
  }

  .periods th,
  .periods td {
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--color-border);
    text-align: start;
  }

  /* Las notas al pie, resaltadas al llegar desde su llamada (:target, módulo 1).
     La sombra de extensión agranda el resaltado sin mover el texto. */
  .note-ref {
    padding-inline: 0.125em;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-weight: 700;
    text-decoration: none;
  }

  .article-footer {
    padding-block: 1.5rem 3rem;
    border-top: 1px solid var(--color-border);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 0.9375rem;
  }

  .footnotes-title {
    font-size: 1.125rem;
  }

  .footnotes {
    margin-top: 0.5rem;
    padding-left: 1.5rem;
    color: var(--color-text-muted);
  }

  .footnotes li + li {
    margin-top: 0.5rem;
  }

  .footnotes li:target {
    border-radius: 4px;
    background: var(--color-brand-soft);
    box-shadow: 0 0 0 0.375rem var(--color-brand-soft);
    color: var(--color-text);
  }

  /* ─── Autora ─── */
  .author {
    margin-top: 2rem;
    padding: 1.25rem;
    border-radius: 14px;
    background: var(--color-surface);
    box-shadow: 0 1px 2px rgb(41 37 36 / 0.06), 0 8px 24px rgb(41 37 36 / 0.08);
  }

  .author-avatar {
    width: 3.5rem;
    aspect-ratio: 1;
    margin-bottom: 0.5rem;
    border-radius: 50%;
  }

  .author-name {
    font-weight: 700;
  }

  .author-bio {
    color: var(--color-text-muted);
  }
}
```
