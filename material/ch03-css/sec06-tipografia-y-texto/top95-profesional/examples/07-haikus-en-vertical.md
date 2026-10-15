---
example_description: "Una antología de haikus de Matsuo Bashō: cada poema en japonés vertical (vertical-rl), con una línea lógica a su derecha y el sello del autor, y la traducción al español en horizontal debajo; rejilla adaptable sin media queries"
example_tags: "css|profesional|modos-de-escritura|writing-mode|japones|propiedades-logicas|poesia"
example_stage: professional
example_importance: useful
---

# HTML

```html
<main class="anthology">
  <header class="anthology-header">
    <p class="kicker">Antología</p>
    <h1>Tres haikus de Matsuo Bashō</h1>
    <p class="intro">El haiku japonés se escribe en vertical, de arriba abajo, y sus tres versos se leen de derecha a izquierda. Debajo de cada uno, una traducción libre al español.</p>
  </header>

  <div class="poems">
    <figure class="poem">
      <div class="poem-body">
        <blockquote class="poem-text" lang="ja"><p>古池や<br>蛙飛び込む<br>水の音</p></blockquote>
        <span class="seal" lang="ja" aria-hidden="true">芭蕉</span>
      </div>
      <figcaption>
        <p class="translation">Un viejo estanque;<br>se zambulle una rana:<br>el ruido del agua.</p>
        <p class="source">1686</p>
      </figcaption>
    </figure>

    <figure class="poem">
      <div class="poem-body">
        <blockquote class="poem-text" lang="ja"><p>閑さや<br>岩にしみ入る<br>蝉の声</p></blockquote>
        <span class="seal" lang="ja" aria-hidden="true">芭蕉</span>
      </div>
      <figcaption>
        <p class="translation">Qué silencio:<br>el canto de la cigarra<br>penetra en las rocas.</p>
        <p class="source"><cite>Oku no hosomichi</cite>, 1689</p>
      </figcaption>
    </figure>

    <figure class="poem">
      <div class="poem-body">
        <blockquote class="poem-text" lang="ja"><p>夏草や<br>兵どもが<br>夢の跡</p></blockquote>
        <span class="seal" lang="ja" aria-hidden="true">芭蕉</span>
      </div>
      <figcaption>
        <p class="translation">Hierbas de verano:<br>lo que queda de los sueños<br>de los guerreros.</p>
        <p class="source"><cite>Oku no hosomichi</cite>, 1689</p>
      </figcaption>
    </figure>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Haikus en vertical
   - Cada poema es vertical-rl: cada verso (separado con <br>, porque los
     saltos son parte del poema) es una columna, a la izquierda de la anterior.
     Su inline-size es el ALTO de la columna.
   - La línea de la derecha es border-block-start: en vertical-rl, el bloque
     empieza a la derecha. Escrita así, sería la de arriba en horizontal.
   - El sello del autor, también vertical, con las letras de pie (upright).
   - La página y las traducciones siguen en horizontal; las tarjetas, en una
     rejilla auto-fit con el mínimo protegido.
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
}

@layer tokens {
  :root {
    --font-latin: Georgia, serif;
    /* Mac: Hiragino Mincho; Windows: Yu Mincho; Linux y Android: Noto Serif JP. */
    --font-japanese: "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif;
    --color-paper: #fdfbf7;
    --color-ink: #1c1917;
    --color-muted: #57534e;
    --color-seal: #b91c1c;
    --color-rule: #d6d3d1;
  }
}

@layer base {
  body {
    padding: 16px;
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-latin);
    line-height: 1.5;
  }

  :lang(ja) {
    font-family: var(--font-japanese);
  }
}

@layer components {
  .anthology {
    max-inline-size: 48rem;
    margin-inline: auto;
  }

  .anthology-header {
    display: grid;
    gap: 6px;
    max-inline-size: 60ch;
    margin-block-end: 20px;
  }

  .kicker {
    color: var(--color-seal);
    font-family: system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .anthology-header h1 {
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 1.15;
    text-wrap: balance;
  }

  .intro {
    color: var(--color-muted);
    text-wrap: pretty;
  }

  .poems {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: 24px 16px;
  }

  .poem {
    display: grid;
    gap: 14px;
    justify-items: center;
    align-content: start;
  }

  /* Poema y sello en una fila: el sello, abajo a la izquierda del poema. */
  .poem-body {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  .poem-text {
    writing-mode: vertical-rl;
    inline-size: 10.5em;              /* el alto de las columnas */
    padding-block-start: 14px;        /* separación de la línea, a la derecha */
    border-block-start: 2px solid var(--color-rule);
    font-size: 1.35rem;
    line-height: 1.9;
    letter-spacing: 0.12em;
  }

  .seal {
    writing-mode: vertical-rl;
    text-orientation: upright;
    padding: 4px 2px;
    border: 2px solid var(--color-seal);
    border-radius: 4px;
    color: var(--color-seal);
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .poem figcaption {
    display: grid;
    gap: 4px;
    text-align: center;
  }

  .translation {
    font-style: italic;
    text-wrap: balance;
  }

  .source {
    color: var(--color-muted);
    font-family: system-ui, sans-serif;
    font-size: 0.75rem;
  }
}
```
