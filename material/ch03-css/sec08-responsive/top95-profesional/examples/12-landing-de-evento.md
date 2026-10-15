---
example_description: "La página de una noche de observación en un planetario, siempre oscura (color-scheme: dark): cabecera pegada de cristal con @supports de reserva, portada con image-set() y alto en svh, letra y espacios fluidos, un programa que pasa de lista a tabla por contenedor y actividades en una rejilla auto-fit"
example_tags: "css|profesional|responsive|image-set|svh|clamp|container-queries|supports|color-scheme|evento"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="topbar">
  <a class="topbar__brand" href="/">Planetario Luis Enrique Erro</a>
  <nav aria-label="Secciones"><a href="#programa">Programa</a> · <a href="#actividades">Actividades</a> · <a href="#preguntas">Preguntas</a></nav>
</header>

<main>
  <section class="hero" aria-labelledby="hero-title">
    <p class="hero__date"><time datetime="2026-11-21T19:00-06:00">Sábado 21 de noviembre · 19:00 a 1:00</time></p>
    <h1 id="hero-title">Noche de las estrellas</h1>
    <p class="hero__text">Telescopios en el jardín, charlas bajo la cúpula y la Luna creciente sobre la Ciudad de México. Entrada libre con registro.</p>
    <a class="hero__cta" href="/registro">Regístrate gratis</a>
  </section>

  <section id="programa" class="schedule" aria-labelledby="schedule-title">
    <h2 id="schedule-title">Programa</h2>
    <ol class="schedule__list">
      <li><time datetime="19:00">19:00</time> <span class="schedule__what">Apertura de los telescopios</span> <span class="schedule__where">Jardín</span></li>
      <li><time datetime="20:00">20:00</time> <span class="schedule__what">Charla: cómo se hicieron los Pilares de la creación</span> <span class="schedule__where">Cúpula</span></li>
      <li><time datetime="21:30">21:30</time> <span class="schedule__what">Paseo por la Luna con binoculares</span> <span class="schedule__where">Explanada</span></li>
      <li><time datetime="23:00">23:00</time> <span class="schedule__what">Lluvia de estrellas Leónidas (si el cielo lo permite)</span> <span class="schedule__where">Azotea</span></li>
    </ol>
  </section>

  <section id="actividades" class="activities" aria-labelledby="activities-title">
    <h2 id="activities-title">Actividades</h2>
    <ul class="activities__grid">
      <li class="activity"><img src="tierra-apolo-17-480.jpg" alt="" width="480" height="480"><h3>La Tierra desde fuera</h3><p>Una sala con las fotos de las misiones Apolo. Para todas las edades.</p></li>
      <li class="activity"><img src="aldrin-apolo-11-480.jpg" alt="" width="480" height="483" style="--focus: 50% 15%"><h3>Camina por la Luna</h3><p>Simulador de baja gravedad. Mayores de 8 años.</p></li>
      <li class="activity"><img src="pilares-de-la-creacion-480.jpg" alt="" width="480" height="501" style="--focus: 50% 35%"><h3>Taller de astrofotografía</h3><p>Trae tu móvil: te enseñamos a fotografiar la Luna con un telescopio.</p></li>
    </ul>
    <p class="credit">Fotografías: NASA y ESA, dominio público.</p>
  </section>

  <section id="preguntas" class="faq" aria-labelledby="faq-title">
    <h2 id="faq-title">Preguntas</h2>
    <details><summary>¿Y si está nublado?</summary><p>Las charlas y los talleres se hacen igual; los telescopios apuntarán a lo que deje ver el cielo.</p></details>
    <details><summary>¿Puedo llevar mi telescopio?</summary><p>Sí: hay un espacio en la explanada para aficionados. Llega antes de las 19:30.</p></details>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Noche de las estrellas
   - Siempre oscura: color-scheme: dark (un solo esquema) hace que los
     controles nativos y los <details> se dibujen en oscuro.
   - Cabecera pegada de cristal: fondo al 70 % + blur. Sin desenfoque, el
     fondo sube al 95 % (@supports not): legible sobre cualquier foto.
   - Portada: image-set() de 480/960px con una reserva url(), velo de al
     menos el 70 % (6.7:1 en el peor caso con el texto claro) y alto mínimo
     clamp(18rem, 80svh, 40rem): la llamada a la acción se ve al cargar.
   - Programa: un contenedor; por debajo de 32rem, cada actividad en dos
     líneas (hora y lugar arriba); desde 32rem, tres columnas alineadas
     (hora, qué, dónde) con subgrid.
   - Actividades: rejilla auto-fit sin consultas; fotos 3:2 con su punto de
     interés. Desplazamiento suave solo sin «reducir movimiento».
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  img { display: block; max-width: 100%; height: auto; }
}

@layer tokens {
  :root {
    color-scheme: dark;
    --color-sky: #050816;
    --color-panel: #111833;
    --color-text: #e2e8f0;
    --color-muted: #a5b4fc;
    --color-star: #fde68a;
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-2: clamp(1.44rem, 1.2534rem + 0.933vw, 1.9531rem);
    --step-5: clamp(2.4883rem, 2.006rem + 2.4116vw, 3.8147rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
    --space-m-xl: clamp(1.5rem, 0.6818rem + 4.0909vw, 3.75rem);
  }
}

@layer base {
  @media (prefers-reduced-motion: no-preference) {
    html { scroll-behavior: smooth; }
  }

  body { background: var(--color-sky); color: var(--color-text); font-family: system-ui, sans-serif; font-size: var(--step-0); line-height: 1.5; }
  h2 { margin-bottom: var(--space-s); font-size: var(--step-2); }
  h3 { font-size: var(--step-1); }
  a { color: var(--color-star); }
  :focus-visible { outline: 3px solid var(--color-star); outline-offset: 3px; }
  section[id] { scroll-margin-top: 4rem; }
}

@layer components {
  .topbar {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    align-items: center;
    justify-content: space-between;
    padding: 10px var(--space-m-xl);
    background: rgb(5 8 22 / 0.7);
    backdrop-filter: blur(10px);
    font-size: 0.9rem;
  }

  @supports not (backdrop-filter: blur(1px)) {
    .topbar { background: rgb(5 8 22 / 0.95); }
  }

  .topbar__brand { color: var(--color-text); font-weight: 700; text-decoration: none; }

  .hero {
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: var(--space-s);
    min-height: clamp(18rem, 80svh, 40rem);
    padding: var(--space-m-xl);
    background-color: var(--color-sky);
    background-image:
      linear-gradient(rgb(5 8 22 / 0.7), rgb(5 8 22 / 0.9)),
      url("pilares-de-la-creacion-480.jpg");
    background-image:
      linear-gradient(rgb(5 8 22 / 0.7), rgb(5 8 22 / 0.9)),
      image-set("pilares-de-la-creacion-480.jpg" 1x, "pilares-de-la-creacion.jpg" 2x);
    background-size: cover;
    background-position: 50% 30%;
  }

  .hero__date { color: var(--color-star); font-weight: 700; }
  .hero h1 { max-inline-size: 12ch; font-family: Georgia, serif; font-size: var(--step-5); line-height: 1; text-wrap: balance; }
  .hero__text { max-inline-size: 42ch; }
  .hero__cta { align-self: start; padding: 0.7em 1.4em; border-radius: 999px; background: var(--color-star); color: var(--color-sky); font-weight: 700; text-decoration: none; }

  .schedule, .activities, .faq { padding: var(--space-m) var(--space-m-xl); }

  .schedule { container: schedule / inline-size; }
  .schedule__list { display: grid; gap: 10px; padding: 0; list-style: none; }

  /* Base: hora y lugar en la primera línea; qué, en la segunda. */
  .schedule__list li { display: grid; grid-template-columns: auto 1fr; gap: 0 12px; padding: 10px; border-radius: 10px; background: var(--color-panel); }
  .schedule__list time { color: var(--color-star); font-weight: 700; font-variant-numeric: tabular-nums; }
  .schedule__where { grid-row: 1; grid-column: 2; color: var(--color-muted); font-size: 0.85em; }
  .schedule__what { grid-column: 1 / -1; }

  /* Con sitio: tres columnas alineadas entre filas (subgrid). */
  @container schedule (width >= 32rem) {
    .schedule__list { grid-template-columns: auto 1fr auto; column-gap: 16px; }
    .schedule__list li { grid-column: 1 / -1; grid-template-columns: subgrid; align-items: baseline; }
    .schedule__what { grid-column: 2; }
    .schedule__where { grid-row: auto; grid-column: 3; }
  }

  .activities__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: var(--space-s); padding: 0; list-style: none; }
  .activity { padding-bottom: var(--space-s); border-radius: 12px; background: var(--color-panel); overflow: clip; }
  .activity img { width: 100%; aspect-ratio: 3 / 2; margin-bottom: 10px; object-fit: cover; object-position: var(--focus, 50% 50%); }
  .activity h3, .activity p { padding-inline: var(--space-s); }
  .activity p { color: var(--color-muted); font-size: 0.9em; }
  .credit { margin-top: 8px; color: var(--color-muted); font-size: 0.8rem; }

  .faq details { padding: 10px 0; border-bottom: 1px solid #334155; }
  .faq summary { cursor: pointer; font-weight: 700; }
  .faq details p { margin-top: 6px; color: var(--color-muted); }
}
```
