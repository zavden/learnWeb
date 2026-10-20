---
example_description: "Con grid-auto-flow: dense la galería no tiene huecos, pero el tabulador y el lector de pantalla siguen el HTML: el foco salta entre filas (1, 2, 3, 4 abajo, 5 arriba…)"
example_tags: "css|grid|dense|accesibilidad|teclado|orden|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">⌨️ Haz clic en este texto y pulsa <kbd>Tab</kbd> varias veces. Sigue el recuadro amarillo del foco: ¿va en el orden en que se ven las fotos?</p>

<p class="caption">❌ La galería del ejemplo anterior con <code>dense</code>: se ve 1, 2, 3, 5 en la primera fila, pero el foco va 1, 2, 3, 4 (fila 2), 5 (vuelve arriba)…</p>
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
.caption {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.caption {
  color: #475569;
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

/* Un foco imposible de perder de vista. */
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

/* 🐛 dense recoloca los elementos para tapar huecos, pero solo cambia dónde se VEN.
   El tabulador, el lector de pantalla y la selección de texto siguen el orden del
   HTML: 1, 2, 3, 4, 5, 6… El foco salta de la fila 2 a la 1, de la 1 a la 3…
   Es el mismo problema que order en flexbox (WCAG 2.4.3, orden del foco).
   dense está bien cuando el orden no importa: una galería de fotos sin enlaces,
   un muro de logos. Si cada elemento es un enlace o se lee en secuencia, no lo uses,
   o usa reading-flow (siguiente ejemplo). */
```
