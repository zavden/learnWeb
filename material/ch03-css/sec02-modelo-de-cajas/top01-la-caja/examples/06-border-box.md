---
example_description: "Con box-sizing: border-box, width mide de borde a borde: al añadir padding la caja no crece, encoge el contenido"
example_tags: "css|modelo-de-cajas|box-sizing|border-box"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="ruler">regla: 240px</div>
<div class="box" style="padding: 0"><div class="content">sin padding → contenido <output></output></div></div>
<div class="box" style="padding: 0 30px"><div class="content">30px a cada lado → contenido <output></output></div></div>
<div class="box" style="padding: 0 70px"><div class="content">70px a cada lado → contenido <output></output></div></div>
<p>Las tres cajas miden <strong>240px</strong>, como la regla: el verde (padding) se come el azul (contenido).</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.ruler {
  width: 240px;
  background: #334155;
  color: #ffffff;
  font-size: 0.8rem;
  text-align: center;
  margin-bottom: 8px;
}

/* Con border-box, width y height incluyen padding y borde:
   contenido = 240 − padding izquierdo − padding derecho (− bordes, aquí 0).
   (El padding de cada caja va en su atributo style solo para leerlo junto al resultado.) */
.box {
  box-sizing: border-box;
  width: 240px;
  background: #bbf7d0;        /* verde = padding */
  margin-bottom: 8px;
}

.content {
  background: #bfdbfe;        /* azul = contenido */
  font-size: 0.8rem;
}

/* El reset que verás al principio de casi cualquier hoja profesional:
     *, *::before, *::after { box-sizing: border-box; }
   Así «width: 300px» significa «300px en pantalla» en todos los elementos. */

/* Límite: el contenido no puede bajar de 0. Si el padding + el borde suman más que
   width, la caja crece lo justo para que quepan (prueba padding: 0 130px). */
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Mide el ancho del hijo azul
// (que ocupa la zona de contenido de su caja) y lo escribe en el <output>.
for (const content of document.querySelectorAll('.content')) {
  content.querySelector('output').textContent = content.getBoundingClientRect().width + 'px';
}
```
