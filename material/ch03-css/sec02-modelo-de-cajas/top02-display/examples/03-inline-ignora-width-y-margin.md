---
example_description: "En un elemento inline, width, height y margin-top no hacen nada, y el padding vertical se pinta encima de las otras líneas"
example_tags: "css|display|inline|inline-block|margin"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="text">❌ <code>display: inline</code> (el valor de un span).
  Esta oferta de zapatillas de montaña lleva una etiqueta de precio, <span class="tag">−20 %</span>,
  que debería respetar <code>width: 120px</code> y <code>height: 40px</code> y separarse 30px de la línea de arriba. No lo hace:
  el ancho, el alto y el margen superior se ignoran, y su relleno vertical invade
  las líneas vecinas sin apartarlas.</p>

<p class="text">✅ <code>display: inline-block</code>.
  Esta oferta de zapatillas de montaña lleva una etiqueta de precio, <span class="tag fixed">−20 %</span>,
  que ahora sí respeta <code>width</code> y <code>height</code> y se separa 30px de la línea de arriba: la línea entera
  crece para dejarle sitio, pero la etiqueta sigue dentro del párrafo.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.text {
  max-width: 460px;
  background: #f1f5f9;
}

/* 🐛 En una caja INLINE:
   - width y height se ignoran: su tamaño lo decide el texto que contiene.
   - margin-top y margin-bottom no apartan nada (izquierda y derecha, sí).
   - padding y border verticales SE PINTAN, pero no empujan las líneas:
     el naranja invade el texto de arriba y de abajo.
   Ninguna declaración es inválida: simplemente no se aplican a este tipo de caja. */
.tag {
  width: 120px;
  height: 40px;
  margin-top: 30px;
  margin-inline: 8px;
  padding-block: 12px;
  background: rgb(251 146 60 / 0.85);
  font-weight: bold;
}

/* ✅ inline-block: sigue dentro de la línea (no rompe el párrafo), pero por dentro
   es una caja de bloque: respeta width, height, márgenes y relleno. */
.fixed {
  display: inline-block;
}
```
