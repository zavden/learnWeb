---
example_description: "El glosario de una escuela de panadería: definiciones justificadas con guiones automáticos en columnas estrechas, términos extranjeros con su propio lang, abreviaturas gramaticales en cursiva real, índice de letras y la entrada enlazada resaltada con :target"
example_tags: "css|profesional|tipografia|hyphens|lang|justify|dfn|glosario"
example_stage: professional
example_importance: useful
---

# HTML

```html
<main class="glossary">
  <header>
    <h1>Glosario del panadero</h1>
    <p class="intro">Las palabras que oirás en el obrador durante el primer mes del curso.</p>
    <nav class="letters" aria-label="Letras del glosario">
      <a href="#letra-a">A</a><a href="#letra-b">B</a><a href="#letra-c">C</a><a href="#letra-e">E</a><a href="#letra-g">G</a>
    </nav>
  </header>

  <section class="letter" aria-labelledby="letra-a">
    <h2 id="letra-a">A</h2>
    <dl>
      <div class="entry" id="autolisis">
        <dt><dfn>Autólisis</dfn> <abbr title="sustantivo femenino">s. f.</abbr></dt>
        <dd>Reposo de la harina con el agua, antes de añadir la levadura y la sal, para que el gluten empiece a formarse solo y la masa sea más fácil de trabajar.</dd>
      </div>
    </dl>
  </section>

  <section class="letter" aria-labelledby="letra-b">
    <h2 id="letra-b">B</h2>
    <dl>
      <div class="entry" id="bolillo">
        <dt><dfn>Bolillo</dfn> <abbr title="sustantivo masculino">s. m.</abbr></dt>
        <dd>Pan blanco de corteza crujiente y miga suave, con una <a href="#grena">greña</a> a lo largo. Es el más común en las panaderías de la Ciudad de México.</dd>
      </div>
      <div class="entry" id="brioche">
        <dt><dfn lang="fr">Brioche</dfn> <abbr title="sustantivo masculino">s. m.</abbr> <span class="origin">del francés</span></dt>
        <dd>Pan enriquecido con mantequilla, huevos y azúcar, de miga muy tierna y corteza dorada.</dd>
      </div>
    </dl>
  </section>

  <section class="letter" aria-labelledby="letra-c">
    <h2 id="letra-c">C</h2>
    <dl>
      <div class="entry" id="croissant">
        <dt><dfn lang="fr">Croissant</dfn> <abbr title="sustantivo masculino">s. m.</abbr> <span class="origin">del francés</span></dt>
        <dd>Pieza de masa hojaldrada y fermentada con forma de media luna. Se lamina varias veces con mantequilla fría para que las capas se separen en el horno.</dd>
      </div>
    </dl>
  </section>

  <section class="letter" aria-labelledby="letra-e">
    <h2 id="letra-e">E</h2>
    <dl>
      <div class="entry" id="esponja">
        <dt><dfn>Esponja</dfn> <abbr title="sustantivo femenino">s. f.</abbr></dt>
        <dd>Prefermento líquido de harina, agua y una pizca de levadura que se prepara horas antes de la masa definitiva para darle más sabor.</dd>
      </div>
    </dl>
  </section>

  <section class="letter" aria-labelledby="letra-g">
    <h2 id="letra-g">G</h2>
    <dl>
      <div class="entry" id="grena">
        <dt><dfn>Greña</dfn> <abbr title="sustantivo femenino">s. f.</abbr></dt>
        <dd>Corte que se hace en la superficie del pan justo antes de hornearlo, para que se abra por donde quiere el panadero y no por donde ceda la corteza.</dd>
      </div>
    </dl>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Glosario
   - Definiciones justificadas en columnas estrechas: sin guiones, el texto
     se llenaría de huecos. hyphens: auto parte por sílabas con el diccionario
     del idioma de la página (lang="es"); hyphenate-limit-chars no parte
     palabras de menos de 6 letras ni deja menos de 3 a cada lado.
   - Los términos extranjeros llevan su lang: el lector de pantalla los
     pronuncia en francés y, si se partieran, se partirían con reglas francesas.
   - Abreviaturas gramaticales en cursiva, con la cursiva real de Literata, y
     desarrolladas en su title.
   - Las entradas se enlazan entre sí (#grena) y la de destino se resalta con
     :target; scroll-margin deja aire por encima al saltar.
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
    --color-line: #e7e5e4;
    --color-highlight: #fef3c7;
    --color-focus: #1d4ed8;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: var(--font-text);
    line-height: 1.5;
  }

  a {
    color: var(--color-accent);
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.18em;
  }

  a:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .glossary {
    max-inline-size: 52rem;
    margin-inline: auto;
  }

  .glossary h1 {
    font-size: 1.9rem;
    line-height: 1.15;
    text-wrap: balance;
  }

  .intro {
    margin-block: 4px 12px;
    color: var(--color-muted);
  }

  /* Índice de letras: casillas iguales con la letra centrada. */
  .letters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-block-end: 16px;
    font-family: var(--font-ui);
  }

  .letters a {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    border: 1px solid var(--color-line);
    border-radius: 6px;
    font-weight: 700;
    text-decoration: none;
  }

  /* Cada letra: la inicial grande a un lado y sus entradas en columnas. */
  .letter {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr);
    gap: 12px;
    padding-block: 12px;
    border-block-start: 1px solid var(--color-line);
  }

  .letter h2 {
    color: var(--color-accent);
    font-size: 2.2rem;
    font-weight: 300;
    line-height: 1;
    scroll-margin-block-start: 12px;
  }

  .letter dl {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
    gap: 12px 20px;
  }

  .entry {
    padding: 4px 6px;
    border-radius: 6px;
    scroll-margin-block-start: 12px;
  }

  .entry:target {
    background: var(--color-highlight);
  }

  .entry dt {
    font-size: 1.05rem;
  }

  dfn {
    font-style: normal;
    font-weight: 700;
  }

  .entry abbr {
    color: var(--color-muted);
    font-size: 0.9em;
    font-style: italic;
    text-decoration: none;
  }

  .origin {
    color: var(--color-muted);
    font-family: var(--font-ui);
    font-size: 0.75rem;
  }

  .entry dd {
    margin: 0;
    font-size: 0.95rem;
    hyphens: auto;
    hyphenate-limit-chars: 6 3 3;
    text-align: justify;
  }
}
```
