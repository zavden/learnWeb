---
example_description: "offsetWidth redondea a enteros y mide la caja sin transformaciones: una barra de 120.75px da 121, y con scale(2) sigue dando 121. getBoundingClientRect() da el tamaño real en pantalla, con decimales y con las transformaciones aplicadas"
example_tags: "javascript|dom|offsetwidth|getboundingclientrect|transform|redondeo|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<div class="bar" id="exact">120.75px</div>
<div class="bar zoomed" id="zoomed">scale(2)</div>
```

# CSS

```css
.bar {
  width: 120.75px;
  height: 30px;
  margin-bottom: 40px;
  font: 14px/30px system-ui, sans-serif;
  background: #dbeafe;
}
.zoomed {
  transform: scale(2);
  transform-origin: left top;
}
```

# JavaScript

```javascript
const exact = document.querySelector('#exact');
const zoomed = document.querySelector('#zoomed');

// 🐛 offsetWidth es un ENTERO: redondea.
console.log('🐛 offsetWidth →', exact.offsetWidth);
console.log('✅ getBoundingClientRect().width →', exact.getBoundingClientRect().width);

// El error de 0.25 px se acumula: cuatro columnas de 120.75 px.
console.log('🐛 4 × offsetWidth →', 4 * exact.offsetWidth, 'px');
console.log('✅ 4 × rect.width →', 4 * exact.getBoundingClientRect().width, 'px');

// 🐛 offsetWidth mide la caja ANTES de las transformaciones…
console.log('🐛 offsetWidth con scale(2) →', zoomed.offsetWidth);
// ✅ …y getBoundingClientRect, lo que ocupa en pantalla.
console.log('✅ rect con scale(2) →', zoomed.getBoundingClientRect().width, '×', zoomed.getBoundingClientRect().height);

// ¿Cuál usar? offsetWidth para el tamaño de layout (sin transformar);
// getBoundingClientRect para lo que se ve: posiciones, choques, tooltips.
```
