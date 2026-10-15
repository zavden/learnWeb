---
example_description: "Un selector de filtros fotográficos sin JavaScript: seis radios con su miniatura ya filtrada; :has() lee el elegido y aplica la misma receta (guardada en una custom property) a la foto grande y muestra su CSS. Los radios están ocultos visualmente con clip-path, pero se manejan con el teclado"
example_tags: "css|profesional|filter|has|radios|custom-properties|clip-path|accesibilidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="editor">
  <figure class="editor__preview">
    <img class="editor__photo" src="velasco-valle-de-mexico.jpg" alt="El valle de México visto desde un cerro, con los volcanes al fondo" width="960" height="660">
    <figcaption>José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</figcaption>
  </figure>

  <fieldset class="presets">
    <legend>Filtro</legend>
    <label class="preset"><input type="radio" name="preset" value="original" checked><img class="preset__thumb" src="velasco-valle-de-mexico.jpg" alt="" width="96" height="66">Original</label>
    <label class="preset"><input type="radio" name="preset" value="sepia"><img class="preset__thumb" src="velasco-valle-de-mexico.jpg" alt="" width="96" height="66">Sepia</label>
    <label class="preset"><input type="radio" name="preset" value="mono"><img class="preset__thumb" src="velasco-valle-de-mexico.jpg" alt="" width="96" height="66">Blanco y negro</label>
    <label class="preset"><input type="radio" name="preset" value="cold"><img class="preset__thumb" src="velasco-valle-de-mexico.jpg" alt="" width="96" height="66">Frío</label>
    <label class="preset"><input type="radio" name="preset" value="vivid"><img class="preset__thumb" src="velasco-valle-de-mexico.jpg" alt="" width="96" height="66">Intenso</label>
    <label class="preset"><input type="radio" name="preset" value="dusk"><img class="preset__thumb" src="velasco-valle-de-mexico.jpg" alt="" width="96" height="66">Atardecer</label>
  </fieldset>

  <p class="editor__code">CSS: <code class="recipe is-original">filter: none</code><code class="recipe is-sepia">filter: sepia(0.85) contrast(1.05)</code><code class="recipe is-mono">filter: grayscale(1) contrast(1.25)</code><code class="recipe is-cold">filter: hue-rotate(-25deg) saturate(0.8) brightness(1.05)</code><code class="recipe is-vivid">filter: saturate(1.8) contrast(1.15)</code><code class="recipe is-dusk">filter: sepia(0.4) hue-rotate(-20deg) saturate(1.6) brightness(0.9)</code></p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Selector de filtros
   - Cada receta se escribe UNA vez, en una custom property (--f-sepia…).
     La miniatura de cada opción y la foto grande usan la misma variable:
     lo que ves en el botón es lo que obtienes.
   - :has() lee qué radio está marcado desde el contenedor y aplica la receta
     a la foto grande y enseña su línea de CSS. Sin JavaScript.
   - Los radios son de verdad (se recorren con las flechas, el lector de
     pantalla los anuncia), pero están ocultos a la vista con la técnica
     «visualmente oculto»: clip-path: inset(50%) los recorta a nada sin
     quitarlos del documento. La opción elegida y la que tiene el foco del
     teclado se marcan en su etiqueta con :has().
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
    --f-original: none;
    --f-sepia: sepia(0.85) contrast(1.05);
    --f-mono: grayscale(1) contrast(1.25);
    --f-cold: hue-rotate(-25deg) saturate(0.8) brightness(1.05);
    --f-vivid: saturate(1.8) contrast(1.15);
    --f-dusk: sepia(0.4) hue-rotate(-20deg) saturate(1.6) brightness(0.9);
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-accent: #1d4ed8;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.4;
  }
}

@layer components {
  .editor {
    display: grid;
    gap: 12px;
    max-width: 40rem;
  }

  .editor__preview figcaption {
    margin-top: 4px;
    color: var(--color-muted);
    font-size: 0.75rem;
  }

  .editor__photo {
    border-radius: 8px;
  }

  .presets {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
    gap: 8px;
    padding: 0;
    border: 0;
  }

  .presets legend {
    margin-bottom: 6px;
    font-weight: 700;
  }

  .preset {
    display: grid;
    gap: 4px;
    padding: 4px;
    border: 2px solid transparent;
    border-radius: 8px;
    font-size: 0.75rem;
    text-align: center;
    cursor: pointer;
  }

  .preset__thumb {
    width: 100%;
    border-radius: 4px;
  }

  /* Visualmente oculto: sin tamaño visible, pero en el documento. */
  .preset input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .preset:has(:checked) {
    border-color: var(--color-accent);
    background: #eff6ff;
    font-weight: 700;
  }

  .preset:has(:focus-visible) {
    outline: 3px solid #b45309;
    outline-offset: 2px;
  }

  /* Las miniaturas, cada una con su receta. */
  .preset:has([value="sepia"]) .preset__thumb { filter: var(--f-sepia); }
  .preset:has([value="mono"])  .preset__thumb { filter: var(--f-mono); }
  .preset:has([value="cold"])  .preset__thumb { filter: var(--f-cold); }
  .preset:has([value="vivid"]) .preset__thumb { filter: var(--f-vivid); }
  .preset:has([value="dusk"])  .preset__thumb { filter: var(--f-dusk); }

  /* La foto grande, con la receta del radio marcado. */
  .editor:has([value="sepia"]:checked) .editor__photo { filter: var(--f-sepia); }
  .editor:has([value="mono"]:checked)  .editor__photo { filter: var(--f-mono); }
  .editor:has([value="cold"]:checked)  .editor__photo { filter: var(--f-cold); }
  .editor:has([value="vivid"]:checked) .editor__photo { filter: var(--f-vivid); }
  .editor:has([value="dusk"]:checked)  .editor__photo { filter: var(--f-dusk); }

  /* La línea de CSS de la receta elegida. */
  .editor__code {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .recipe {
    display: none;
    color: var(--color-text);
    font-family: Menlo, Consolas, monospace;
  }

  .editor:has([value="original"]:checked) .is-original,
  .editor:has([value="sepia"]:checked) .is-sepia,
  .editor:has([value="mono"]:checked) .is-mono,
  .editor:has([value="cold"]:checked) .is-cold,
  .editor:has([value="vivid"]:checked) .is-vivid,
  .editor:has([value="dusk"]:checked) .is-dusk {
    display: inline;
  }
}
```
