---
example_description: "Un texto justificado en una columna estrecha abre huecos enormes entre palabras; hyphens: auto parte las palabras largas con guion según las reglas del idioma (lang) y los huecos se cierran"
example_tags: "css|tipografia|hyphens|guiones|justify|lang"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Dos columnas justificadas de 150px con el mismo texto, en una página con <code>lang="es"</code>.</p>

<div class="pair">
  <section aria-label="Sin guiones">
    <p class="caption">❌ <code>hyphens: manual</code> (inicial): huecos entre palabras</p>
    <p class="column">La internacionalización de las panaderías artesanales mexicanas transformó considerablemente la distribución de los productos tradicionales.</p>
  </section>

  <section aria-label="Con guiones automáticos">
    <p class="caption">✅ <code>hyphens: auto</code>: palabras partidas por sílabas</p>
    <p class="column is-hyphenated">La internacionalización de las panaderías artesanales mexicanas transformó considerablemente la distribución de los productos tradicionales.</p>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.pair {
  display: flex;
  gap: 16px;
  align-items: start;
}

.pair > section {
  flex: none;
  inline-size: 150px;
}

.caption {
  margin: 0 0 4px;
  font-size: 0.7rem;
}

.column {
  margin: 0;
  outline: 1px dashed #4338ca;
  font-family: Georgia, serif;
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: justify;
}

/* hyphens: manual (el valor inicial) solo parte donde el HTML tiene un &shy;.
   Una palabra como «internacionalización» no cabe al final de la línea, pasa
   entera a la siguiente y deja un hueco que justify reparte entre las demás. */

/* ✅ hyphens: auto deja al navegador partir palabras con guion. Usa un
   diccionario del idioma del elemento: aquí, el lang="es" de la página. Sin lang,
   o con un idioma para el que el navegador no tiene diccionario, no hace nada.
   hyphenate-limit-chars: 6 3 3 (Chrome 109) evita partir palabras de menos de
   6 letras y dejar menos de 3 a cada lado del guion. */
.is-hyphenated {
  hyphens: auto;
  hyphenate-limit-chars: 6 3 3;
}
```
