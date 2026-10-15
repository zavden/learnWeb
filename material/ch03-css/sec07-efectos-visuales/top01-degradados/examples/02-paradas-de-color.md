---
example_description: "Las paradas de color deciden dónde está cada color: con posiciones, el degradado solo ocurre entre ellas; dos paradas en el mismo punto hacen un borde nítido (parada dura), y una posición menor que la anterior se ajusta a ella"
example_tags: "css|degradados|paradas-de-color|parada-dura|linear-gradient"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Todas las barras miden 400px; la regla de abajo sirve para comprobar cada posición.</p>

<p class="label"><code>#1d4ed8, #f59e0b</code> → sin posiciones: 0 % y 100 %</p>
<div class="bar s1"></div>

<p class="label"><code>#1d4ed8 25%, #f59e0b 75%</code> → azul liso hasta 100px, ámbar liso desde 300px</p>
<div class="bar s2"></div>

<p class="label"><code>#1d4ed8, 20%, #f59e0b</code> → pista: la mezcla al 50 % cae en 80px, no en 200px</p>
<div class="bar s3"></div>

<p class="label"><code>#1d4ed8 50%, #f59e0b 50%</code> → parada dura: un borde nítido en 200px</p>
<div class="bar s4"></div>

<p class="label"><code>#1d4ed8 0 40%, #f59e0b 40% 70%, #dc2626 70%</code> → franjas: bordes en 160 y 280px</p>
<div class="bar s5"></div>

<p class="label"><code>#16a34a 62%, #e2e8f0 0</code> → el <code>0</code> se ajusta al 62 %: una barra de progreso</p>
<div class="bar s6" role="img" aria-label="Progreso: 62 %"></div>

<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 8px 0 3px;
  font-size: 0.72rem;
}

.bar {
  width: 400px;
  height: 22px;
}

.ruler {
  display: block;
  margin-top: 4px;
}

/* Cada parada es «color posición». Sin posición, la primera va al 0 %, la
   última al 100 % y las del medio se reparten a partes iguales. */
.s1 { background-image: linear-gradient(to right, #1d4ed8, #f59e0b); }

/* Antes de la primera parada y después de la última, el color es liso. */
.s2 { background-image: linear-gradient(to right, #1d4ed8 25%, #f59e0b 75%); }

/* Una posición sola entre dos colores es una PISTA (color hint): dice dónde
   está la mezcla a partes iguales. El cambio se concentra al principio. */
.s3 { background-image: linear-gradient(to right, #1d4ed8, 20%, #f59e0b); }

/* Dos colores en la misma posición: la transición mide 0px. Es una parada dura. */
.s4 { background-image: linear-gradient(to right, #1d4ed8 50%, #f59e0b 50%); }

/* Un color con DOS posiciones ocupa todo ese tramo: «#f59e0b 40% 70%» es lo
   mismo que «#f59e0b 40%, #f59e0b 70%». Así se escriben franjas y banderas. */
.s5 { background-image: linear-gradient(to right, #1d4ed8 0 40%, #f59e0b 40% 70%, #dc2626 70%); }

/* Si una parada tiene una posición MENOR que la anterior, se ajusta a la
   anterior. Por eso «0» significa «aquí mismo»: no hay que repetir el 62 %. */
.s6 { background-image: linear-gradient(to right, #16a34a 62%, #e2e8f0 0); }
```
