---
example_description: "De azul a amarillo, el degradado pasa por un gris sucio: con colores clásicos se mezcla en sRGB y el centro es #808080. in oklab lo aclara, in oklch mantiene la intensidad recorriendo el círculo de tonos, y longer hue lo recorre por el otro lado"
example_tags: "css|degradados|interpolacion|oklch|oklab|longer-hue|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Los mismos dos colores, <code>blue</code> y <code>yellow</code>, en cuatro espacios de color. La marca blanca es el centro (50 %).</p>

<p class="label">❌ <code>linear-gradient(to right, blue, yellow)</code>: en sRGB, el centro es gris puro (<code>#808080</code>)</p>
<div class="bar g-srgb"></div>

<p class="label"><code>(in oklab to right, …)</code>: más claro, pero todavía apagado (un azul grisáceo)</p>
<div class="bar g-oklab"></div>

<p class="label">✅ <code>(in oklch to right, …)</code>: el tono gira por el camino corto, por turquesa y verde</p>
<div class="bar g-oklch"></div>

<p class="label"><code>(in oklch longer hue to right, …)</code>: el camino largo, por magenta, rojo y naranja</p>
<div class="bar g-longer"></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 10px 0 4px;
  font-size: 0.72rem;
}

.bar {
  position: relative;
  max-width: 440px;
  height: 36px;
}

/* La marca del centro. */
.bar::after {
  content: "";
  position: absolute;
  top: -3px;
  bottom: -3px;
  left: calc(50% - 1px);
  width: 2px;
  background: #ffffff;
  box-shadow: 0 0 0 1px #1e293b;
}

/* 🐛 Con colores «clásicos» (nombres, hexadecimal, rgb(), hsl()), el navegador
   mezcla en sRGB, por compatibilidad con la web antigua: canal a canal y en
   línea recta. (0, 0, 255) y (255, 255, 0) se encuentran en (128, 128, 128):
   un gris sin rastro de color. Pasa con cualquier par de colores opuestos. */
.g-srgb { background-image: linear-gradient(to right, blue, yellow); }

/* «in <espacio>» elige dónde se mezcla (como en color-mix). Oklab es
   perceptual: la claridad avanza de forma regular, pero sigue cruzando por
   el centro del espacio, donde los colores pierden intensidad. Si un degradado
   tiene algún color moderno (oklch(), color()…), Oklab es el espacio por defecto. */
.g-oklab { background-image: linear-gradient(in oklab to right, blue, yellow); }

/* ✅ En oklch, la mezcla va por claridad, croma (intensidad) y TONO: el tono
   viaja de 264° (azul) a 110° (amarillo) por el camino corto, cruzando 187°
   (turquesa) con el croma intacto. */
.g-oklch { background-image: linear-gradient(in oklch to right, blue, yellow); }

/* longer hue da la vuelta por el otro lado: 264° → 360° → 110°. */
.g-longer { background-image: linear-gradient(in oklch longer hue to right, blue, yellow); }
```
