---
example_description: "Un sistema tipográfico completo con custom properties: escala fluida con clamp(), medida en ch, ritmo en lh y detalles con pseudoelementos"
example_tags: "css|profesional|tipografia|unidades|custom-properties"
example_stage: professional
example_importance: important
---

# HTML

```html
<article class="prose">
  <p class="kicker">Historia de la tecnología</p>
  <h1>Breve historia de la imprenta</h1>
  <p class="lead">Durante siglos, copiar un libro exigía meses de trabajo a mano. La imprenta de tipos móviles convirtió esos meses en días y cambió para siempre la forma de difundir el conocimiento.</p>

  <h2>Antes de Gutenberg</h2>
  <p>En China ya se imprimía con bloques de madera tallados siglos antes que en Europa. Hacia el año 1040, el artesano Bi Sheng fabricó los primeros <dfn>tipos móviles</dfn>: piezas de cerámica, una por carácter, que se podían recombinar para componer textos distintos.</p>
  <p>El problema era la escritura: el chino tiene miles de caracteres, y componer una página exigía localizar cientos de piezas diferentes.</p>

  <h2>La prensa de Maguncia</h2>
  <p>Hacia 1450, Johannes Gutenberg reunió en Maguncia tres ideas que funcionaban juntas:</p>
  <ul>
    <li>tipos metálicos fundidos en serie con un molde ajustable,</li>
    <li>una tinta grasa que se adhería al metal,</li>
    <li>y una prensa adaptada de las que se usaban para el vino.</li>
  </ul>
  <blockquote>
    <p>Con un alfabeto de pocas decenas de letras, cada pieza podía reutilizarse una y otra vez.</p>
  </blockquote>

  <h3>La imprenta llega a la península</h3>
  <p>El primer libro impreso en España del que se conserva ejemplar es el <cite>Sinodal de Aguilafuente</cite>, publicado en Segovia en 1472 por Juan Párix. En pocas décadas había talleres en Valencia, Barcelona, Zaragoza y Sevilla.</p>

  <p class="note"><small>Las fechas de este artículo son aproximadas: la mayoría de los primeros impresos no indicaban el año de publicación.</small></p>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Sistema tipográfico
   Todas las decisiones de texto viven en tokens; los elementos solo los leen.
   - Tamaños: escala de razón 1,25 con clamp() (crece con el ancho, con límites).
   - Medida: 65ch, la longitud de línea cómoda para leer.
   - Ritmo: los espacios entre bloques se miden en lh (una línea de texto).
   Nota: line-height y otras propiedades de texto se estudian en el módulo de
   tipografía; aquí se usan de forma básica.
   ────────────────────────────────────────────────────────────────────────── */
@layer tokens, base, prose;

@layer tokens {
  :root {
    --font-body: Charter, "Bitstream Charter", Georgia, "Times New Roman", serif;
    --font-heading: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

    --step--1: clamp(0.84rem, 0.82rem + 0.1vw, 0.9rem);
    --step-0: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);
    --step-1: clamp(1.25rem, 1.15rem + 0.45vw, 1.4rem);
    --step-2: clamp(1.5rem, 1.3rem + 1vw, 1.95rem);
    --step-3: clamp(1.9rem, 1.5rem + 2vw, 2.75rem);

    --leading-body: 1.6;          /* sin unidad: cada elemento lo multiplica por SU letra */
    --leading-heading: 1.15;
    --measure: 65ch;

    --color-text: oklch(25% 0.03 260);
    --color-text-muted: oklch(45% 0.03 260);
    --color-accent: oklch(45% 0.12 40);
    --color-bg: oklch(98.5% 0.005 80);
  }
}

@layer base {
  body {
    margin: 0;
    padding: 2rem 1rem;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: var(--step-0);
    line-height: var(--leading-body);
  }

  :where(h1, h2, h3) {
    font-family: var(--font-heading);
    line-height: var(--leading-heading);
    text-wrap: balance;           /* reparte el título en líneas parecidas (si se admite) */
  }

  :where(h1) { font-size: var(--step-3); }
  :where(h2) { font-size: var(--step-2); }
  :where(h3) { font-size: var(--step-1); }
}

@layer prose {
  .prose {
    max-width: var(--measure);
    margin-inline: auto;          /* centra la columna (modelo de cajas) */
  }

  /* Ritmo vertical: una línea de texto entre bloques; los títulos, más aire arriba */
  .prose :where(p, ul, blockquote) {
    margin-block: 0 1lh;
  }

  .prose :where(h2, h3) {
    margin-block: 1.5lh 0.5lh;
  }

  .kicker {
    margin: 0;
    font-family: var(--font-heading);
    font-size: var(--step--1);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
  }

  .prose h1 {
    margin-block: 0.25em 0.5em;
  }

  .lead {
    font-size: var(--step-1);
    line-height: 1.45;
    color: var(--color-text-muted);
  }

  /* Letra capital en el primer párrafo después del primer h2 */
  .prose h2:first-of-type + p::first-letter {
    font-family: var(--font-heading);
    font-size: 2.6em;
    font-weight: 700;
    line-height: 1;
    color: var(--color-accent);
  }

  .prose li::marker {
    color: var(--color-accent);
  }

  .prose blockquote {
    margin-inline: 0;
    padding-inline-start: 1.25rem;
    border-left: 3px solid var(--color-accent);
    font-size: var(--step-1);
    font-style: italic;
  }

  /* Comillas españolas generadas: el HTML contiene solo la cita */
  .prose blockquote p::before { content: "«"; }
  .prose blockquote p::after  { content: "»"; }

  .prose dfn {
    font-style: italic;
    font-weight: 600;
  }

  .note {
    border-top: 1px solid color-mix(in oklch, var(--color-text) 20%, transparent);
    padding-top: 0.5lh;
    color: var(--color-text-muted);
  }

  ::selection {
    background: color-mix(in oklch, var(--color-accent) 25%, white);
  }
}
```
