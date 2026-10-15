---
example_description: "Un reportaje de revista: letra capitular, retrato redondo rodeado con shape-outside, una ficha y una cita flotantes, secciones con clear y una columna de lectura que contiene sus flotantes"
example_tags: "css|profesional|float|shape-outside|clear|flow-root|tipografia"
example_stage: professional
example_importance: important
---

# HTML

```html
<article class="feature">
  <header class="feature-header">
    <p class="kicker">Oficios</p>
    <h1 class="feature-title">El barro que no se rompe</h1>
    <p class="standfirst">Marta Ibáñez lleva veinte años en un taller de Talavera de la Reina. Restaura azulejos del siglo XVII por la mañana y por la tarde enseña a tornear a quien quiera aprender.</p>
    <p class="byline">Texto: Lucía Serrano · Fotos: Andrés Molina · <time datetime="2026-10-04">4 de octubre de 2026</time></p>
  </header>

  <div class="feature-body">
    <p class="has-drop-cap">Marta abre el taller a las ocho, antes de que el sol caliente la nave. Lo primero que hace cada día es tocar el barro de la víspera: si está demasiado seco, ya no sirve para el torno y acabará en el cubo del reciclado. «El barro avisa», dice, «pero solo si lo escuchas a tiempo».</p>

    <img class="portrait" src="portrait-ceramist.svg" width="240" height="240" alt="Retrato de Marta Ibáñez con el pelo recogido y un delantal de trabajo">

    <p>Llegó a la cerámica por accidente. Estudiaba Química en Madrid cuando su abuela le pidió que arreglara un plato de la familia, un plato azul y blanco con un ciervo en el centro. Tardó tres semanas en encontrar quien le enseñara a hacerlo y, cuando terminó, había decidido que no volvería a la facultad.</p>

    <aside class="fact-box" aria-labelledby="fact-title">
      <h2 class="fact-title" id="fact-title">Talavera en cifras</h2>
      <dl class="facts">
        <div class="fact"><dt>Talleres activos</dt><dd>23</dd></div>
        <div class="fact"><dt>Patrimonio UNESCO</dt><dd>desde 2019</dd></div>
        <div class="fact"><dt>Temperatura del horno</dt><dd>980 °C</dd></div>
        <div class="fact"><dt>Colores tradicionales</dt><dd>5</dd></div>
      </dl>
    </aside>

    <p>Hoy restaura piezas para museos y para particulares. En la mesa del fondo esperan tres azulejos de un convento de Toledo, numerados con lápiz por detrás para no perder el orden del panel. Cada uno lleva días de trabajo: limpiar, consolidar, rellenar las faltas con una pasta del mismo tono y, solo al final, reintegrar el dibujo.</p>

    <blockquote class="pull-quote">
      <p>«Una pieza restaurada tiene que poder contarte que lo está, si te acercas.»</p>
    </blockquote>

    <p>Esa es su regla: la restauración debe verse de cerca y desaparecer a un metro. Por eso nunca imita las grietas ni el desgaste, y deja una pequeña firma en el reverso con la fecha de la intervención. «Dentro de cien años, alguien querrá saber qué es original y qué es mío.»</p>

    <h2 class="section-title">Un taller abierto</h2>

    <figure class="figure">
      <img src="workshop.svg" width="320" height="240" alt="Interior del taller con tres jarrones de barro rojo sobre una mesa y una ventana al fondo">
      <figcaption>Las piezas se secan una semana en la estantería antes de entrar en el horno.</figcaption>
    </figure>

    <p>Por las tardes, el taller se llena. Cuarenta alumnos por trimestre, de todas las edades, pasan por el torno. Marta les pide lo mismo que se pide a sí misma: paciencia con el barro y ninguna prisa por el resultado. El primer cuenco, explica, siempre sale torcido, y está bien que así sea.</p>

    <p class="sign-off">El taller abre al público los sábados de 10:00 a 14:00 en la calle de los Alfares, 12.</p>
  </div>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Reportaje de revista
   - Columna de lectura de min(100% - 2rem, 42rem) que es un BFC (flow-root):
     contiene sus flotantes y ningún contenido posterior se mete a su lado.
   - Flotantes con anchos en min(): ocupan como mucho una fracción de la columna,
     así que en una pantalla estrecha el texto no se queda sin sitio.
   - El texto rodea el retrato siguiendo su forma (shape-outside).
   - Cada sección empieza por debajo de los flotantes anteriores (clear).
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

  /* Las imágenes, de bloque: sin el hueco de la línea base (lección 2). */
  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@layer tokens {
  :root {
    --color-bg: #fffbf5;
    --color-text: #1e293b;
    --color-text-muted: #57534e;
    --color-accent: #9a3412;
    --color-accent-soft: #ffedd5;
    --color-border: #e7e5e4;

    --font-serif: Georgia, "Times New Roman", serif;
    --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

    --measure: 42rem;
    --gap: 1.25rem;
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-serif);
    line-height: 1.65;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .feature {
    width: min(100% - 2rem, var(--measure));
    margin: clamp(1rem, 4vw, 3rem) auto;
  }

  /* ─── Cabecera ─── */
  .feature-header {
    margin-bottom: 2rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--color-border);
  }

  .kicker {
    color: var(--color-accent);
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 700;
  }

  .feature-title {
    margin-block: 0.25rem 0.75rem;
    font-size: clamp(2rem, 6vw, 3rem);
    line-height: 1.1;
  }

  .standfirst {
    font-size: 1.2rem;
    line-height: 1.5;
  }

  .byline {
    margin-top: 0.75rem;
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    font-size: 0.85rem;
  }

  /* ─── Cuerpo: un BFC que contiene sus flotantes ─── */
  .feature-body {
    display: flow-root;
  }

  .feature-body > p {
    margin-bottom: 1.1rem;
  }

  /* Capitular: la primera letra flota y el texto la rodea (lección 3).
     line-height < 1 para que su caja mida poco más que la letra. */
  .has-drop-cap::first-letter {
    float: left;
    margin: 0.06em 0.1em 0 0;
    color: var(--color-accent);
    font-size: 4.1em;
    font-weight: 700;
    line-height: 0.8;
  }

  /* Retrato redondo: border-radius lo pinta redondo; shape-outside hace que el TEXTO
     siga esa curva en lugar del cuadrado de la imagen. shape-margin deja aire alrededor. */
  .portrait {
    float: left;
    width: min(40%, 11rem);
    margin: 0.25rem var(--gap) 0.5rem 0;
    border-radius: 50%;
    shape-outside: circle(50%);
    shape-margin: 0.75rem;
  }

  /* Ficha: un flotante a la derecha (un flotante ya es un BFC: contiene el margen de su título). */
  .fact-box {
    float: right;
    width: min(45%, 15rem);
    margin: 0.25rem 0 1rem var(--gap);
    padding: 1rem;
    border-top: 4px solid var(--color-accent);
    background: var(--color-accent-soft);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .fact-title {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .fact {
    padding-block: 0.35rem;
    border-bottom: 1px solid #fed7aa;
  }

  .fact:last-child {
    border-bottom: 0;
  }

  .facts dt {
    color: var(--color-text-muted);
  }

  .facts dd {
    font-size: 1.15rem;
    font-weight: 700;
  }

  /* Cita destacada a la izquierda. Su texto más grande cambia el interlineado
     solo dentro de la cita: las líneas del párrafo que la rodea no se mueven. */
  .pull-quote {
    float: left;
    width: min(42%, 14rem);
    margin: 0.4rem var(--gap) 0.75rem 0;
    padding-block: 0.75rem;
    border-block: 3px solid var(--color-accent);
    color: var(--color-accent);
    font-size: 1.3rem;
    font-style: italic;
    line-height: 1.3;
  }

  /* Cada sección empieza por debajo de todos los flotantes anteriores. */
  .section-title {
    clear: both;
    margin: 2rem 0 0.75rem;
    font-family: var(--font-sans);
    font-size: 1.35rem;
  }

  .figure {
    margin-bottom: 1.25rem;
  }

  .figure img {
    width: 100%;
    border-radius: 6px;
  }

  .figure figcaption {
    margin-top: 0.4rem;
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    font-size: 0.85rem;
  }

  .sign-off {
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    font-size: 0.9rem;
  }
}
```
