---
example_description: "Un reportaje de una revista cultural con notas al pie: Literata con su cursiva, medida de 65ch, ritmo vertical en rlh, letra capital, siglas en versalitas, llamadas de nota con ida y vuelta y la nota activa resaltada con :target"
example_tags: "css|profesional|tipografia|font-face|rlh|initial-letter|notas|target|versalitas"
example_stage: professional
example_importance: important
---

# HTML

```html
<article class="feature">
  <header class="feature-header">
    <p class="kicker">Crónica</p>
    <h1>Los cronistas que caminaron la ciudad antes de los mapas</h1>
    <p class="dek">Una nueva edición rescata doce relatos de viajeros que recorrieron la capital entre 1820 y 1890, y que hoy sirven para reconstruir calles que ya no existen.</p>
    <p class="byline">Texto de Andrés Villalobos · <time datetime="2026-10-09">9 de octubre de 2026</time></p>
  </header>

  <p class="opening">Antes de que la ciudad tuviera planos fiables, la mejor manera de conocerla era leer a quienes la habían caminado. Los viajeros del siglo XIX anotaban todo: el nombre de cada puente, el precio del pulque, la hora a la que cerraban las garitas. La colección que publica ahora el <abbr title="Archivo Histórico de la Ciudad">AHC</abbr> reúne esos cuadernos por primera vez<sup class="ref"><a id="ref-1" href="#nota-1" aria-label="Nota 1">1</a></sup>.</p>

  <h2>Una ciudad de agua</h2>
  <p>Casi todos los cronistas coinciden en lo mismo: la ciudad se recorría tanto en canoa como a pie. Por el canal de la Viga llegaban cada mañana las flores y las verduras de Xochimilco, y los viajeros describen con asombro las chinampas, <em>jardines que flotan</em> sobre el lago<sup class="ref"><a id="ref-2" href="#nota-2" aria-label="Nota 2">2</a></sup>.</p>
  <p>Esas descripciones, cruzadas con los registros de aduanas, han permitido fechar el cierre de varios embarcaderos con una precisión de pocos años.</p>

  <figure class="pull">
    <blockquote>
      <p>Se entra en la ciudad como en un sueño: por agua, entre flores, y sin saber dónde termina el lago y dónde empiezan las calles.</p>
    </blockquote>
    <figcaption>Cuaderno anónimo de 1838, incluido en el primer tomo</figcaption>
  </figure>

  <h2>Cómo leerlos hoy</h2>
  <p>Los editores han conservado la ortografía de cada cuaderno y han añadido notas que explican los términos en desuso. El primer tomo, dedicado a los viajeros ingleses y franceses, llega a las librerías el 4 de noviembre.</p>

  <footer class="notes">
    <h2 class="notes-title">Notas</h2>
    <ol>
      <li id="nota-1"><cite>Cronistas de la ciudad, 1820-1890</cite>, 3 tomos, edición de Marta Lozano. <a class="back" href="#ref-1" aria-label="Volver al texto de la nota 1">↩</a></li>
      <li id="nota-2">Las chinampas son parcelas de cultivo construidas sobre el lago con capas de lodo y vegetación, sujetas con árboles; algunas siguen en uso en Xochimilco. <a class="back" href="#ref-2" aria-label="Volver al texto de la nota 2">↩</a></li>
    </ol>
  </footer>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Reportaje con notas
   - Literata, recta y cursiva, con una pila de reserva parecida (Georgia).
   - La raíz fija el renglón: 17px × 1.5 = 25,5px = 1rlh. Márgenes y
     separaciones se miden en rlh y el texto cae siempre sobre la pauta.
   - El artículo no pasa de 65ch; títulos con balance, párrafos con pretty y
     guiones automáticos (lang="es" en la página).
   - Las llamadas de nota son enlaces de ida y vuelta; la nota a la que se
     salta se resalta con :target.
   - Siglas en versalitas (font-variant-caps) para que no griten en el texto.
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
    --color-link: #1d4ed8;
    --color-line: #d6d3d1;
    --color-highlight: #fef3c7;
  }
}

@layer base {
  html {
    font-size: 106.25%;          /* 17px, respetando la preferencia del usuario */
    line-height: 1.5;
  }

  body {
    padding: 1rlh 1rem;
    color: var(--color-text);
    font-family: var(--font-text);
  }

  a {
    color: var(--color-link);
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.2em;
  }

  a:focus-visible {
    outline: 3px solid var(--color-link);
    outline-offset: 2px;
  }

  abbr {
    font-variant-caps: all-small-caps;
    letter-spacing: 0.04em;
    text-decoration: none;
  }
}

@layer components {
  .feature {
    max-inline-size: 65ch;
    margin-inline: auto;
  }

  /* ─── Cabecera ─── */
  .kicker,
  .byline {
    font-family: var(--font-ui);
    font-size: 0.8rem;
  }

  .kicker {
    color: var(--color-accent);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .feature h1 {
    margin-block: 0.5rlh;
    font-size: 2.2rem;
    font-weight: 750;
    line-height: 1.12;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }

  .dek {
    margin-block-end: 0.5rlh;
    color: var(--color-muted);
    font-size: 1.15rem;
    font-style: italic;
    text-wrap: pretty;
  }

  .byline {
    margin-block-end: 1rlh;
    color: var(--color-muted);
  }

  /* ─── Texto ─── */
  .feature > p {
    margin-block-end: 1rlh;
    hyphens: auto;
    text-wrap: pretty;
  }

  .feature h2 {
    margin-block: 1rlh 0;
    font-size: 1.3rem;
    line-height: 1rlh;
    text-wrap: balance;
  }

  .opening::first-letter {
    initial-letter: 3;
    margin-inline-end: 0.12em;
    color: var(--color-accent);
    font-weight: 700;
  }

  /* Llamada de nota: sup sube la cifra; line-height: 0 evita que agrande la
     línea (lección del contexto inline). */
  .ref {
    line-height: 0;
    font-family: var(--font-ui);
    font-size: 0.7em;
    font-variant-numeric: tabular-nums;
  }

  .ref a {
    padding-inline: 0.15em;
    text-decoration: none;
  }

  /* ─── Cita destacada ─── */
  .pull {
    margin-block: 0 1rlh;
    padding-block: 0.5rlh;
    border-block: 1px solid var(--color-line);
  }

  .pull blockquote {
    font-size: 1.35rem;
    font-style: italic;
    line-height: 1.35;
    text-wrap: balance;
  }

  .pull figcaption {
    margin-block-start: 0.5rlh;
    color: var(--color-muted);
    font-family: var(--font-ui);
    font-size: 0.8rem;
  }

  /* ─── Notas ─── */
  .notes {
    margin-block-start: 1rlh;
    padding-block-start: 0.5rlh;
    border-block-start: 1px solid var(--color-line);
    font-size: 0.85rem;
  }

  .notes .notes-title {
    margin: 0 0 0.25rlh;
    font-family: var(--font-ui);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .notes ol {
    padding-inline-start: 1.5em;
  }

  .notes li {
    margin-block-end: 0.25rlh;
    hyphens: auto;
  }

  .notes li::marker {
    font-variant-numeric: tabular-nums;
  }

  /* La nota a la que se ha saltado con su llamada, resaltada. */
  .notes li:target {
    background: var(--color-highlight);
  }

  .back {
    text-decoration: none;
  }
}
```
