---
example_description: "Cuatro reglas eligen el mismo párrafo: gana la de mayor especificidad (a,b,c), aunque esté escrita la primera"
example_tags: "css|especificidad|cascada|selectores"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p id="intro" class="lead">¿De qué color es mi fondo? Las cuatro reglas me eligen a mí.</p>
<ul class="legend">
  <li class="swatch-green"><code>#intro</code> → (1, 0, 0)</li>
  <li class="swatch-red"><code>p.lead</code> → (0, 1, 1)</li>
  <li class="swatch-yellow"><code>.lead</code> → (0, 1, 0)</li>
  <li class="swatch-gray"><code>p</code> → (0, 0, 1)</li>
</ul>
<div class="hint">Prueba: borra la regla <code>#intro</code> y mira quién gana ahora. Después, borra <code>p.lead</code>.</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Las cuatro reglas eligen el MISMO párrafo y declaran la MISMA propiedad (background).
   Están escritas de MÁS a MENOS específica a propósito: si decidiera el orden,
   ganaría la última (gris). Pero la especificidad se compara ANTES que el orden.
   (a, b, c) = (ids, clases/atributos/pseudoclases, tipos/pseudoelementos) */

#intro { background: #bbf7d0; }   /* (1,0,0): un id */
p.lead { background: #fecaca; }   /* (0,1,1): una clase y un tipo */
.lead  { background: #fde68a; }   /* (0,1,0): una clase */
p      { background: #e2e8f0; }   /* (0,0,1): un tipo */

/* Base: estas reglas declaran OTRAS propiedades, así que no compiten con las de arriba */
#intro {
  padding: 8px;
}

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-green { background: #bbf7d0; }
.swatch-red { background: #fecaca; }
.swatch-yellow { background: #fde68a; }
.swatch-gray { background: #e2e8f0; }
```
