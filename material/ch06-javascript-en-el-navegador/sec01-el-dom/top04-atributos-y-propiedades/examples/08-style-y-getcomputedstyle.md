---
example_description: "el.style solo lee y escribe el atributo style (estilos inline): con el color puesto en una regla CSS, style.color es ''. getComputedStyle da el valor final ya resuelto (rgb(…), px), y está vivo. Las variables CSS se cambian con style.setProperty"
example_tags: "javascript|dom|style|getcomputedstyle|css|variables-css|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<p class="price" id="price">$210.00</p>
<div class="track" role="img" aria-label="Pedido preparado al 50 %">
  <div class="bar" id="bar"></div>
</div>
```

# CSS

```css
.price {
  color: #b91c1c;
  font-size: 1.25rem;
}
.track {
  width: 300px;
  height: 12px;
  background: #e2e8f0;
}
.bar {
  width: var(--progress, 50%);
  height: 100%;
  background: #1d4ed8;
}
```

# JavaScript

```javascript
const price = document.querySelector('#price');

// 🐛 el.style es el atributo style="…" (estilos INLINE): tus reglas CSS no están ahí.
console.log('🐛 price.style.color →', JSON.stringify(price.style.color));
console.log('🐛 price.style.fontSize →', JSON.stringify(price.style.fontSize));

// ✅ getComputedStyle: el valor final, después de la cascada, ya RESUELTO.
const computed = getComputedStyle(price);
console.log('✅ color →', computed.color); // el #b91c1c, en rgb()
console.log('✅ fontSize →', computed.fontSize); // 1.25rem, en px
console.log("✅ getPropertyValue('font-size') →", computed.getPropertyValue('font-size'));
const bar = document.querySelector('#bar');
console.log('✅ ancho de la barra (50 % de 300px) →', getComputedStyle(bar).width);

// ESCRIBIR con style crea un estilo inline, que gana a tus reglas (salvo !important).
price.style.color = 'teal';
console.log('style.color →', price.style.color, "| atributo style →", price.getAttribute('style'));
// La declaración de getComputedStyle está VIVA: el objeto de antes ya cambió.
console.log('computed.color (el mismo objeto) →', computed.color);
// Para volver a lo que diga el CSS, vacía la propiedad inline:
price.style.color = '';
console.log("tras style.color = '' →", computed.color);

// Variables CSS: setProperty (con el nombre en CSS, guiones incluidos).
bar.style.setProperty('--progress', '80%');
console.log('--progress: 80% → ancho:', getComputedStyle(bar).width);
document.querySelector('.track').setAttribute('aria-label', 'Pedido preparado al 80 %');
// Es la forma limpia de que JS pase datos al CSS: JS cambia una variable,
// el CSS decide qué hacer con ella.
```
