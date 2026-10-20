---
example_description: "transform no se aplica a los elementos en línea normales (span, a, em…): el sello girado dentro de una frase no gira. Con display: inline-block, sí; las imágenes en línea y los SVG ya son cajas atómicas"
example_tags: "css|transformaciones|transform|inline|inline-block|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ Un <code>&lt;span&gt;</code> con <code>transform: rotate(-6deg)</code> dentro de una frase: no gira (ni se mueve, ni escala)</p>
<p class="offer">Envío <span class="stamp">gratis</span> en pedidos de más de 500 pesos.</p>

<p class="caption">✅ El mismo <code>span</code> con <code>display: inline-block</code>: ahora es una caja que se puede transformar</p>
<p class="offer">Envío <span class="stamp is-box">gratis</span> en pedidos de más de 500 pesos.</p>

<p class="caption">Un emoji de saludo: el <code>span</code> no gira; con <code>inline-block</code>, sí. Una imagen en línea gira sin más.</p>
<p class="offer">
  <span class="wave">👋</span>
  <span class="wave is-box">👋</span>
  <img class="wave" src="tierra-apolo-17.jpg" alt="La Tierra" width="28" height="28">
</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 4px;
  font-size: 0.72rem;
}

.offer {
  margin: 0;
  font-size: 1.1rem;
}

.stamp {
  padding: 2px 8px;
  border: 2px solid #b91c1c;
  border-radius: 4px;
  color: #b91c1c;
  font-weight: 800;
  text-transform: uppercase;
  transform: rotate(-6deg);
}

/* 🐛 Solo se pueden transformar las cajas «transformables»: bloques, cajas
   atómicas en línea (inline-block, imágenes, SVG, controles de formulario),
   elementos de flex y de grid, celdas de tabla… Un elemento en línea normal
   puede partirse en varias líneas: ¿qué caja se giraría? La especificación
   dice que ninguna: la declaración es válida, pero no tiene ningún efecto. */

/* ✅ inline-block lo convierte en una sola caja que sigue dentro de la línea. */
.is-box {
  display: inline-block;
}

.wave {
  transform: rotate(25deg);
}

img.wave {
  border-radius: 50%;
  vertical-align: middle;
}
```
