---
example_description: "El mismo texto con line-height de 20, 30 y 40px: el área de contenido de la letra no cambia; lo que cambia es el interlineado que se reparte arriba y abajo"
example_tags: "css|contexto-inline|line-height|leading"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="legend"><span class="key key-line">franja</span> caja de línea (= <code>line-height</code>) ·
  <span class="key key-ink">amarillo</span> área de contenido de la letra (≈ 1,2 × <code>font-size</code>, según la fuente)</p>

<div class="column">
  <p class="lines lh-20"><span class="ink">Pan de pueblo</span><br><span class="ink">Horno de leña</span></p>
  <p class="caption"><code>line-height: 20px</code> (1)<br>el amarillo no cabe: se monta sobre la otra línea</p>
</div>

<div class="column">
  <p class="lines lh-30"><span class="ink">Pan de pueblo</span><br><span class="ink">Horno de leña</span></p>
  <p class="caption"><code>line-height: 30px</code> (1.5)<br>sobra un poco: mitad arriba, mitad abajo</p>
</div>

<div class="column">
  <p class="lines lh-40"><span class="ink">Pan de pueblo</span><br><span class="ink">Horno de leña</span></p>
  <p class="caption"><code>line-height: 40px</code> (2)<br>el mismo amarillo, más aire alrededor</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.legend,
.caption {
  font-size: 0.75rem;
}

.column {
  display: inline-block;
  vertical-align: top;               /* lección actual: alinea las columnas por arriba */
  width: 136px;
  margin-right: 8px;
}

.lines {
  margin: 0;
  font-size: 20px;
}

/* line-height fija el alto de cada caja de línea. La letra ocupa su ÁREA DE CONTENIDO
   (amarillo), que depende de la fuente y del font-size, NO de line-height.
   La diferencia, line-height − área de contenido, es el INTERLINEADO (leading):
   el navegador pone la mitad encima y la mitad debajo de la letra.
   Si line-height es menor que el área de contenido, el interlineado es negativo. */
.lh-20 { line-height: 20px; background: url("line-bands.svg") 0 0 / 100% 40px; }
.lh-30 { line-height: 30px; background: url("line-bands.svg") 0 0 / 100% 60px; }
.lh-40 { line-height: 40px; background: url("line-bands.svg") 0 0 / 100% 80px; }

/* El fondo de una caja EN LÍNEA pinta solo su área de contenido, no la línea entera. */
.ink {
  background: rgb(253 230 138 / 0.8);
}

.key {
  padding: 0 4px;
}

.key-line { background: #c7d2fe; }
.key-ink { background: #fde68a; }
```
