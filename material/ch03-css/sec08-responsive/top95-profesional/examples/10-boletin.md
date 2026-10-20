---
example_description: "La versión web del boletín mensual de un museo: una columna de lectura de 36rem centrada con min(), espacios y letra fluidos, tema claro u oscuro, noticias que ponen la foto al lado cuando su contenedor lo permite, y una hoja de impresión que quita la baja y los botones y escribe las direcciones de los enlaces"
example_tags: "css|profesional|responsive|boletin|print|light-dark|container-queries|clamp"
example_stage: professional
example_importance: useful
---

# HTML

```html
<div class="newsletter">
  <header class="newsletter__header">
    <p class="newsletter__issue">Cartas del museo · núm. 42 · octubre de 2026</p>
    <p class="newsletter__brand">Museo Nacional de Arte</p>
  </header>

  <main>
    <figure class="hero">
      <img src="velasco-valle-de-mexico-480.jpg" srcset="velasco-valle-de-mexico-480.jpg 480w, velasco-valle-de-mexico.jpg 960w" sizes="(width >= 40rem) 36rem, 100vw" alt="Pintura de un cerro y el Valle de México con sus lagos" width="960" height="660">
      <figcaption>José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</figcaption>
    </figure>

    <h1>Velasco vuelve a casa</h1>
    <p>Querida comunidad: este mes inauguramos la exposición que llevábamos tres años preparando. Sesenta paisajes del pintor del Valle de México, junto a fotografías tomadas hoy desde los mismos cerros.</p>
    <p><a class="button" href="https://munal.example/exposiciones/velasco">Reserva tu visita</a></p>

    <h2 class="section-title">También este mes</h2>
    <article class="item">
      <img src="hokusai-gran-ola-480.jpg" alt="" width="480" height="323">
      <div>
        <h3><a href="https://munal.example/talleres/grabado">Taller de grabado japonés</a></h3>
        <p>Cuatro sábados para aprender xilografía con la técnica de Hokusai. Plazas limitadas.</p>
      </div>
    </article>
    <article class="item">
      <img src="tierra-apolo-17-480.jpg" alt="" width="480" height="480">
      <div>
        <h3><a href="https://munal.example/charlas/canica-azul">Charla: la foto que cambió el mundo</a></h3>
        <p>El 22 de octubre, la historia de la «canica azul», con el Planetario Luis Enrique Erro.</p>
      </div>
    </article>
  </main>

  <footer class="newsletter__footer">
    <p>Museo Nacional de Arte · Tacuba 8, Centro Histórico, Ciudad de México</p>
    <p class="newsletter__links"><a href="/boletin/preferencias">Preferencias</a> · <a href="/boletin/baja">Darme de baja</a></p>
  </footer>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Boletín (versión web)
   - Una columna de lectura: width: min(100% - 2rem, 36rem) y margin-inline:
     auto. Sin media queries para el ancho.
   - Letra y espacios fluidos (lección 3). Tema con light-dark().
   - Cada noticia es un contenedor: con 26rem, la foto se pone a la izquierda
     en un cuadrado con object-fit; con menos, arriba en 2:1.
   - Las fotos de las noticias son decorativas (alt=""): el título dice lo
     mismo. La de la portada sí informa: alt y pie con el crédito.
   - Impresión: sin baja ni preferencias ni botones; los enlaces externos,
     con su dirección; nada partido entre dos hojas. (Un boletín de verdad
     se envía con un HTML de tablas y estilos en línea, porque los programas
     de correo entienden poco CSS; esta es la versión «ver en el navegador».)
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, print;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  img { display: block; max-width: 100%; height: auto; }
}

@layer tokens {
  :root {
    color-scheme: light dark;
    --color-page: light-dark(#f5f5f4, #0c0a09);
    --color-paper: light-dark(#ffffff, #1c1917);
    --color-text: light-dark(#1c1917, #f5f5f4);
    --color-muted: light-dark(#57534e, #a8a29e);
    --color-accent: light-dark(#7c2d12, #fdba74);
    --color-on-accent: light-dark(#ffffff, #1c1917);
    --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
  }
}

@layer base {
  body { padding-block: var(--space-s); background: var(--color-page); color: var(--color-text); font-family: Georgia, serif; font-size: var(--step-0); line-height: 1.6; }
  h1 { margin-block: var(--space-s) var(--space-xs); font-size: var(--step-3); line-height: 1.1; }
  h3 { font-size: var(--step-1); line-height: 1.2; }
  p + p { margin-top: var(--space-xs); }
  a { color: var(--color-accent); }
  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
}

@layer components {
  .newsletter {
    width: min(100% - 2rem, 36rem);
    margin-inline: auto;
    padding: var(--space-m);
    background: var(--color-paper);
  }

  .newsletter__header { display: grid; gap: 2px; padding-bottom: var(--space-xs); margin-bottom: var(--space-s); border-bottom: 1px solid currentColor; font-family: system-ui, sans-serif; }
  .newsletter__issue { color: var(--color-muted); font-size: var(--step--1); }
  .newsletter__brand { font-size: var(--step-1); font-weight: 700; }

  .hero figcaption { margin-top: 4px; color: var(--color-muted); font-family: system-ui, sans-serif; font-size: var(--step--1); }

  .button { display: inline-block; margin-top: var(--space-xs); padding: 0.5em 1.2em; border-radius: 999px; background: var(--color-accent); color: var(--color-on-accent); font-family: system-ui, sans-serif; font-weight: 700; text-decoration: none; }

  .section-title { margin: var(--space-m) 0 var(--space-xs); font-family: system-ui, sans-serif; font-size: var(--step--1); letter-spacing: 0.08em; text-transform: uppercase; }

  .item { container-type: inline-size; padding-block: var(--space-xs); border-top: 1px solid color-mix(in oklab, currentColor 25%, transparent); }
  .item img { width: 100%; aspect-ratio: 2 / 1; margin-bottom: 8px; object-fit: cover; }
  .item p { font-size: var(--step--1); }

  @container (width >= 26rem) {
    .item img { float: left; width: 8rem; aspect-ratio: 1; margin: 0 var(--space-s) 0 0; }
  }

  .newsletter__footer { margin-top: var(--space-m); padding-top: var(--space-xs); border-top: 1px solid currentColor; color: var(--color-muted); font-family: system-ui, sans-serif; font-size: var(--step--1); }
}

@layer print {
  @media print {
    :root { color-scheme: light; }
    body { padding: 0; background: none; font-size: 11pt; }
    .newsletter { width: auto; padding: 0; }
    .button, .newsletter__links { display: none; }
    .item { break-inside: avoid; }
    a[href^="http"]::after { content: " (" attr(href) ")"; color: var(--color-muted); font-size: 0.85em; }
  }
}
```
