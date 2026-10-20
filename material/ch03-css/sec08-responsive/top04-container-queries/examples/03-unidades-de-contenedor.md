---
example_description: "Las unidades de contenedor miden el contenedor más cercano: 1cqi es el 1 % de su ancho (eje en línea). Un título con clamp(1rem, 0.5rem + 6cqi, 2rem) mide 20, 26 y 32px en contenedores de 200, 300 y 400px, con la misma ventana"
example_tags: "css|responsive|container-queries|cqi|cqw|cqb|unidades|tipografia-fluida"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Tres contenedores (borde morado) con el mismo título y la misma barra. El título usa <code>clamp(1rem, 0.5rem + 6cqi, 2rem)</code>; la barra, <code>width: 50cqi</code>; el relleno, <code>4cqi</code>.</p>
<div class="panel" style="width: 200px"><h3>Huevos rancheros</h3><div class="bar">50cqi = 100px</div><p>título: 8 + 12 = 20px</p></div>
<div class="panel" style="width: 300px"><h3>Huevos rancheros</h3><div class="bar">50cqi = 150px</div><p>título: 8 + 18 = 26px</p></div>
<div class="panel" style="width: 400px"><h3>Huevos rancheros</h3><div class="bar">50cqi = 200px</div><p>título: 8 + 24 = 32px (el máximo)</p></div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }

/* Cada panel es un contenedor. Su ancho de contenido (el que miden las
   unidades) es el width del atributo style: 200, 300 y 400px. */
.panel {
  container-type: inline-size;
  margin-bottom: 8px;
  outline: 2px dashed #7c3aed;
}

/* Unidades de contenedor:
     cqi / cqb  1 % del tamaño en línea / en bloque (ancho / alto en horizontal)
     cqw / cqh  1 % del ancho / alto
     cqmin / cqmax  la menor / la mayor de las dos
   cqb y cqh necesitan un contenedor de tipo size (con alto definido). */
.panel h3 {
  margin: 0;
  padding: 4cqi 4cqi 0;
  font-size: clamp(1rem, 0.5rem + 6cqi, 2rem);   /* la recta de la lección 3, con cqi */
}

.bar {
  width: 50cqi;
  margin: 4px 4cqi;
  background: #ddd6fe;
  font-size: 0.65rem;
  white-space: nowrap;
}

.panel p { margin: 0 4cqi 4cqi; font-size: 0.65rem; color: #475569; }
```
