---
example_description: "reading-flow: grid-rows en el contenedor hace que el tabulador y el lector de pantalla recorran los elementos grid en el orden en que se ven, fila a fila, también con dense (Chrome 137+)"
example_tags: "css|grid|reading-flow|dense|accesibilidad|teclado"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="support is-missing">⚠️ Tu navegador no entiende <code>reading-flow</code>: aquí el foco seguirá el orden del HTML, como en el ejemplo anterior.</p>
<p class="support is-available">✅ Tu navegador entiende <code>reading-flow</code>.</p>

<p class="label">⌨️ Haz clic en este texto y pulsa <kbd>Tab</kbd> varias veces: ahora el foco recorre la galería fila a fila, como se ve.</p>

<p class="caption">La misma galería con <code>dense</code>, más <code>reading-flow: grid-rows</code></p>
<div class="gallery">
  <a href="/fotos/bosque">1 · Bosque</a>
  <a href="/fotos/rio">2 · Río</a>
  <a href="/fotos/volcan">3 · Volcán</a>
  <a class="wide" href="/fotos/valle">4 · Panorámica del valle</a>
  <a href="/fotos/cascada">5 · Cascada</a>
  <a class="wider" href="/fotos/costa">6 · Atardecer en la costa</a>
  <a href="/fotos/faro">7 · Faro</a>
  <a href="/fotos/dunas">8 · Dunas</a>
  <a class="wide" href="/fotos/lago">9 · Vista del lago</a>
  <a href="/fotos/canon">10 · Cañón</a>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption,
.support {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.caption {
  color: #475569;
}

.support {
  padding: 4px 8px;
  border-radius: 6px;
  background: #fef3c7;
}

/* @supports aplica sus reglas solo si el navegador entiende la declaración (se
   explica en el módulo de responsive). Aquí elige cuál de los dos avisos se ve. */
.is-available {
  display: none;
  background: #dcfce7;
}

@supports (reading-flow: grid-rows) {
  .is-missing { display: none; }
  .is-available { display: block; }
}

.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-flow: dense;
  gap: 8px;
  width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.75rem;
}

.gallery a {
  padding: 8px 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  color: #1e293b;
}

.gallery .wide,
.gallery .wider {
  border-color: #b45309;
  background: #fef3c7;
}

.gallery a:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
  background: #fef08a;
}

.wide {
  grid-column: span 2;
}

.wider {
  grid-column: span 3;
}

/* reading-flow va en el CONTENEDOR y cambia el orden de lectura de sus hijos
   directos (aquí, los enlaces de la galería). En grid:
   - grid-rows: el orden visual, fila a fila (en español, de izquierda a derecha);
   - grid-columns: el orden visual, columna a columna;
   - grid-order: el del HTML, pero respetando la propiedad order.
   Como en flexbox, llegó en Chrome 137 (2025) y un navegador que no la entienda la
   ignora y vuelve al orden del HTML: no sustituye a un HTML bien ordenado. */
.gallery {
  reading-flow: grid-rows;
}
```
