---
example_description: "Elegir el título por su tamaño rompe el índice: niveles que saltan y títulos que no lo son"
example_tags: "html|texto|titulos|estructura|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 Quien escribió esto quería «un título más pequeño» y usó h4; y para que
     «¡Envío gratis!» se viera grande, usó un h2. En pantalla parece correcto,
     pero el índice del documento queda roto. -->
<div id="broken">
  <h1>❌ Cafetera italiana de acero</h1>
  <h4>Características</h4>
  <p>Seis tazas, apta para inducción.</p>
  <h2>¡Envío gratis!</h2>
  <h4>Opiniones</h4>
  <p>«El café sale cremoso y se limpia en un minuto.»</p>
</div>

<!-- ✅ El nivel lo decide la estructura; el tamaño, el CSS. El aviso destacado no es
     una sección: es un párrafo con una clase. -->
<div id="fixed">
  <h1>✅ Cafetera italiana de acero</h1>
  <p class="promo">¡Envío gratis!</p>
  <h2 class="small-heading">Características</h2>
  <p>Seis tazas, apta para inducción.</p>
  <h2 class="small-heading">Opiniones</h2>
  <p>«El café sale cremoso y se limpia en un minuto.»</p>
</div>
```

# CSS

```css
/* El tamaño se cambia con CSS, no cambiando de etiqueta (CSS: capítulo 3) */
.small-heading {
  font-size: 1rem;
}

.promo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #b91c1c;
}
```

# JavaScript

```javascript
// Imprime el índice de títulos de un contenedor, sangrado según el nivel
function printOutline(container) {
  for (const heading of container.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const level = Number(heading.tagName[1]);
    console.log('  '.repeat(level - 1) + heading.tagName.toLowerCase(), '→', heading.textContent);
  }
}

console.log('❌ #broken: salta de h1 a h4, y la oferta parece una sección');
printOutline(document.querySelector('#broken'));
console.log('✅ #fixed: dos secciones al mismo nivel');
printOutline(document.querySelector('#fixed'));
```
