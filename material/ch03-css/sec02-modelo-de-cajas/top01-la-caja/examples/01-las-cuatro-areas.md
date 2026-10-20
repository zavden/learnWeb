---
example_description: "Una caja con sus cuatro áreas pintadas con los colores de DevTools: contenido, relleno, borde y margen"
example_tags: "css|modelo-de-cajas|padding|border|margin"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="margin-zone">
  <div class="box">
    <div class="content">Contenido · 220 × 60 px</div>
  </div>
</div>
<ul class="legend">
  <li class="swatch-margin"><strong>margin: 24px</strong> · transparente: lo naranja es el fondo del PADRE</li>
  <li class="swatch-border"><strong>border: 8px</strong> · la línea, con su propio color</li>
  <li class="swatch-padding"><strong>padding: 20px</strong> · se pinta con el fondo de la caja</li>
  <li class="swatch-content"><strong>contenido</strong> · width: 220px, height: 60px</li>
</ul>
<p>Haz clic derecho en la caja → <em>Inspeccionar</em> → pestaña <strong>Computed</strong>: verás el mismo dibujo con los mismos colores.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Los colores imitan los de DevTools al inspeccionar una caja:
   azul = contenido, verde = padding, amarillo = borde, naranja = margen. */

.box {
  width: 220px;                 /* el ancho del CONTENIDO (lo verás en el ejemplo 4) */
  padding: 20px;                /* relleno: espacio DENTRO del borde */
  border: 8px solid #facc15;    /* borde */
  margin: 24px;                 /* margen: espacio FUERA del borde */
  background: #bbf7d0;          /* el fondo cubre contenido + padding (y sigue bajo el borde: lección 6) */
}

/* El hijo azul ocupa exactamente la zona de contenido de .box:
   mismo ancho (220px) y su alto (60px) es el alto del contenido. */
.content {
  height: 60px;
  background: #bfdbfe;
}

/* El padre, pintado de naranja, deja ver el margen de .box, que es transparente.
   Ancho: 24 + 8 + 20 + 220 + 20 + 8 + 24 = 324px, justo lo que ocupa la caja con su margen.
   (El borde discontinuo evita el «colapso de márgenes» de la lección 3.) */
.margin-zone {
  width: 324px;
  background: #fed7aa;
  border: 1px dashed #9a3412;
}

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-margin { background: #fed7aa; }
.swatch-border { background: #facc15; }
.swatch-padding { background: #bbf7d0; }
.swatch-content { background: #bfdbfe; }
```
