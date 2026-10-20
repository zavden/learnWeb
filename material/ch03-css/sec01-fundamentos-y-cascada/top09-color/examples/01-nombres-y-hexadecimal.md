---
example_description: "Colores con nombre y en hexadecimal: #RRGGBB, la forma corta #RGB y la versión con alfa #RRGGBBAA"
example_tags: "css|color|hexadecimal"
example_stage: minimal
example_importance: important
---

# HTML

```html
<ul class="swatches">
  <li class="named"><code>tomato</code> · un color con nombre</li>
  <li class="hex6"><code>#1e40af</code> · rojo 1e, verde 40, azul af</li>
  <li class="hex3"><code>#f80</code> · forma corta de <code>#ff8800</code></li>
  <li class="hex8"><code>#1e40af80</code> · el mismo azul con alfa 80 (≈ 50 %)</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.swatches {
  list-style: none;
  padding: 0;
}

.swatches li {
  padding: 8px;
  margin: 6px 0;
}

/* Hay 148 nombres de color: tomato, navy, rebeccapurple, transparent… */
.named {
  background: tomato;
}

/* #RRGGBB: cada pareja de cifras hexadecimales (00-ff = 0-255) es un canal:
   1e = 30 de rojo, 40 = 64 de verde, af = 175 de azul. */
.hex6 {
  background: #1e40af;
  color: #ffffff;
}

/* #RGB: cada cifra se duplica → #f80 = #ff8800 */
.hex3 {
  background: #f80;
}

/* #RRGGBBAA: la cuarta pareja es el alfa (00 = transparente, ff = opaco).
   80 en hexadecimal = 128 ≈ 50 %: se ve el blanco de detrás a través del azul. */
.hex8 {
  background: #1e40af80;
}
```
