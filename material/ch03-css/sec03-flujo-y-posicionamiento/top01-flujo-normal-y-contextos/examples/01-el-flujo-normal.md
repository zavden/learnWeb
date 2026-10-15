---
example_description: "El flujo normal: las cajas de bloque se apilan hacia abajo y el contenido en línea avanza hacia la derecha y salta de línea"
example_tags: "css|flujo-normal|block|inline"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="legend">
  <span class="key key-block">azul</span> cajas de bloque: se apilan ↓ (dirección de bloque) ·
  <span class="key key-inline">amarillo</span> cajas en línea: avanzan → y saltan de línea (dirección inline)
</p>

<article class="post">
  <h2 class="block">Ruta por la sierra de Guadarrama</h2>
  <p class="block">Salimos de <span class="inline">Cercedilla</span> a las ocho y subimos por la <span class="inline">Calzada Romana</span> hasta el <span class="inline">puerto de la Fuenfría</span>: unas dos horas de subida tranquila entre pinos.</p>
  <p class="block">La vuelta, por el <span class="inline">camino Schmid</span>, tiene las mejores vistas del valle.</p>
</article>

<p class="hint">Estrecha la vista previa: los bloques siguen uno debajo de otro y los trozos amarillos se parten entre líneas, como las palabras.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* Nada de esto cambia el layout: solo pinta las cajas para verlas.
   Sin flexbox, grid, floats ni position, TODO se coloca con el flujo normal:
   - los bloques, uno debajo de otro, en el orden del HTML, ocupando todo el ancho;
   - dentro de cada bloque, el texto y las cajas en línea forman líneas de izquierda a derecha. */
.block {
  margin: 0 0 8px;
  padding: 4px 8px;
  background: #bfdbfe;
  outline: 1px dashed #1d4ed8;
}

h2.block {
  font-size: 1.15rem;
}

.inline {
  background: #fde68a;
}

.legend,
.hint {
  font-size: 0.85rem;
  color: #475569;
}

.key {
  padding: 0 4px;
  color: #1e293b;
}

.key-block { background: #bfdbfe; }
.key-inline { background: #fde68a; }
```
