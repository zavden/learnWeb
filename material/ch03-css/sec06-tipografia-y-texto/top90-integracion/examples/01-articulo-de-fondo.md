---
example_description: "Un artículo de lectura larga con un sistema tipográfico completo: Literata con su cursiva, medida de 65ch, ritmo vertical en rlh, títulos equilibrados, párrafos sin huérfanas, guiones automáticos, letra capital y enlaces con subrayado a medida"
example_tags: "css|tipografia|font-face|rlh|text-wrap|initial-letter|hyphens|articulo"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<article class="article">
  <header class="article-header">
    <p class="kicker">Oficios</p>
    <h1>La masa madre, una herencia que se alimenta cada día</h1>
    <p class="byline">Por Lucía Herrera · <time datetime="2026-10-12">12 de octubre de 2026</time> · 6&nbsp;min de lectura</p>
  </header>

  <p class="opening">En muchas panaderías de barrio, la receta más valiosa no está escrita en ningún cuaderno: vive en un frasco. La masa madre es una mezcla de harina y agua que fermenta durante días gracias a las levaduras y las bacterias que hay en el aire, en la harina y en las manos de quien amasa. Cada frasco tiene su propio sabor, y por eso muchas familias lo heredan como se hereda una receta.</p>

  <h2>Cómo se empieza un fermento</h2>
  <p>Basta con mezclar 50&nbsp;g de harina integral con 50&nbsp;g de agua tibia, taparlo con un paño y esperar. Al tercer día aparecen burbujas; al quinto, un olor ácido que recuerda al yogur. A partir de ahí hay que <em>alimentarla</em>: tirar la mitad y añadir la misma cantidad de harina y de agua, cada día y a la misma hora.</p>

  <blockquote>
    <p>La masa madre no se fabrica: se cuida. Si un día te olvidas de ella, te lo perdona; si te olvidas una semana, empieza otra vez.</p>
    <footer>Rosa Martínez, panadera en Pátzcuaro</footer>
  </blockquote>

  <h2>Por qué sabe distinto</h2>
  <p>La fermentación lenta transforma los azúcares de la harina en ácidos y aromas que la levadura comercial, mucho más rápida, no llega a producir. El resultado es una miga más húmeda, una corteza más oscura y un pan que se conserva tierno durante más días. El <a href="/guias/fermentacion">capítulo sobre la fermentación</a> de nuestra guía explica cada etapa con fotografías.</p>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Artículo de fondo
   - Fuente: Literata, con un @font-face para la recta y otro para la cursiva
     (los em y la cita usan letras cursivas de verdad, no inclinadas).
   - Pauta: la raíz fija el renglón (17px × 1.5 = 25,5px = 1rlh) y todos los
     márgenes se miden en rlh, así que el texto cae siempre sobre la pauta.
   - Medida: el artículo no pasa de 65ch y se centra con margin-inline: auto.
   - Cortes: títulos con balance, párrafos con pretty y guiones automáticos
     (la página tiene lang="es").
   ────────────────────────────────────────────────────────────────────────── */
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

/* 106,25 % = 17px con la configuración por defecto, sin pisar la del usuario. */
html {
  font-size: 106.25%;
  line-height: 1.5;
}

body {
  margin: 0;
  color: #1e293b;
  font-family: Literata, Georgia, serif;
}

.article {
  max-inline-size: 65ch;
  margin-inline: auto;
  padding: 1rlh 1rem;
}

/* ─── Cabecera ─── */
.kicker,
.byline {
  margin: 0;
  font-family: system-ui, sans-serif;
  font-size: 0.8rem;
}

/* Etiqueta corta en mayúsculas: el HTML dice «Oficios»; un poco de aire. */
.kicker {
  color: #9a3412;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.article h1 {
  margin-block: 0.5rlh;
  font-size: 2.1rem;
  font-weight: 750;            /* fuente variable: cualquier peso entre 200 y 900 */
  line-height: 1.15;           /* sin unidad: los títulos grandes, más apretados */
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.byline {
  margin-block-end: 1rlh;
  color: #475569;
}

/* ─── Texto ─── */
.article p {
  margin-block: 0 1rlh;        /* un renglón en blanco entre párrafos */
  hyphens: auto;
  text-wrap: pretty;
}

.article h2 {
  margin-block: 1rlh 0;
  font-size: 1.3rem;
  line-height: 1rlh;           /* el título ocupa un renglón exacto de la pauta */
  text-wrap: balance;
}

/* Letra capital de tres líneas, alineada con la pauta por el navegador. */
.opening::first-letter {
  initial-letter: 3;
  margin-inline-end: 0.15em;
  color: #9a3412;
  font-weight: 700;
}

/* Cita: la barra donde empieza la línea (lógica) y la cursiva real de Literata. */
blockquote {
  margin: 0 0 1rlh;
  padding-inline-start: 1rem;
  border-inline-start: 3px solid #9a3412;
  font-style: italic;
}

blockquote p {
  margin-block-end: 0;
}

blockquote footer {
  font-family: system-ui, sans-serif;
  font-size: 0.8rem;
  font-style: normal;
}

/* Enlaces subrayados (están dentro del texto) con un trazo más fino y separado. */
a {
  color: #1d4ed8;
  text-decoration-color: #93c5fd;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.2em;
}

a:hover {
  text-decoration-color: currentColor;
}

a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
