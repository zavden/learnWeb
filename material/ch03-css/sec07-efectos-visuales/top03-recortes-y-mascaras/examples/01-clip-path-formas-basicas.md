---
example_description: "clip-path recorta un elemento con una forma: inset() con esquinas redondeadas, circle(), ellipse() y polygon(); lo que queda fuera de la forma no se pinta"
example_tags: "css|recortes|clip-path|circle|ellipse|polygon|inset"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Cajas de 140 × 140 con una foto de fondo. El cuadro discontinuo marca la caja completa; solo se pinta lo que queda dentro de la forma.</p>
<ul class="grid">
  <li><div class="frame"><div class="tile wave is-inset"></div></div><code>inset(12px round 20px)</code></li>
  <li><div class="frame"><div class="tile earth is-circle"></div></div><code>circle(44%)</code></li>
  <li><div class="frame"><div class="tile moon is-ellipse"></div></div><code>ellipse(30% 42% at 52% 36%)</code></li>
  <li><div class="frame"><div class="tile wave is-polygon"></div></div><code>polygon(50% 0, 100% 50%, 50% 100%, 0 50%)</code></li>
</ul>
<p class="credit">Hokusai, <cite>La gran ola de Kanagawa</cite> (c. 1831); NASA, Apolo 17 (1972) y Apolo 11 (1969). Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.frame {
  width: 140px;
  margin-bottom: 4px;
  outline: 1px dashed #94a3b8;
}

.tile {
  height: 140px;
  background-position: center;
  background-size: cover;
}

.wave  { background-image: url("hokusai-gran-ola.jpg"); }
.earth { background-image: url("tierra-apolo-17.jpg"); background-color: #000000; }
.moon  { background-image: url("aldrin-apolo-11.jpg"); }

/* inset(arriba derecha abajo izquierda round radio): un rectángulo metido hacia
   dentro, con la sintaxis de margin y, tras «round», la de border-radius. */
.is-inset { clip-path: inset(12px round 20px); }

/* circle(radio at centro). En un cuadrado, 50% es la mitad del lado. Aquí, el
   44 % coincide con el borde del planeta en la foto: el espacio negro desaparece. */
.is-circle { clip-path: circle(44%); }

/* ellipse(radio-x radio-y at centro): un óvalo, como el de un camafeo. */
.is-ellipse { clip-path: ellipse(30% 42% at 52% 36%); }

/* polygon(x y, x y, …): los vértices en orden, unidos con rectas. Los
   porcentajes son del ancho (x) y del alto (y) de la caja: un rombo. */
.is-polygon { clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
```
