---
example_description: "clientWidth no incluye la barra de scroll: en una caja con una barra de 12 px, el ancho útil calculado con offsetWidth se pasa y aparece scroll horizontal. El ancho de la barra del sistema varía: 0 con barras superpuestas (macOS con trackpad), unos 15 px en Windows"
example_tags: "javascript|dom|clientwidth|offsetwidth|scrollbar|medidas|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<div class="box classic" id="classic">
  <p class="banner" id="banner">Envío gratis desde $500</p>
  <p>Café de Chiapas · Café de Veracruz · Café de Nayarit · Molinillo manual · Filtros de papel · Prensa francesa · Taza de barro</p>
</div>
<div class="box" id="system">
  <p>Con la barra de scroll de tu sistema: cambia de un ordenador a otro.</p>
  <p>Café de Chiapas · Café de Veracruz · Café de Nayarit · Molinillo manual</p>
</div>
```

# CSS

```css
.box {
  width: 200px;
  height: 90px;
  margin-bottom: 1rem;
  padding: 10px;
  border: 2px solid #64748b;
  overflow-y: scroll;
  font: 14px/1.4 system-ui, sans-serif;
}
.box p {
  margin: 0 0 0.5rem;
}
/* Una barra «clásica» de 12 px, que ocupa sitio en cualquier sistema.
   (::-webkit-scrollbar es una extensión de Chrome y Safari.) */
.classic::-webkit-scrollbar {
  width: 12px;
}
.classic::-webkit-scrollbar-track {
  background: #e2e8f0;
}
.classic::-webkit-scrollbar-thumb {
  background: #64748b;
  border-radius: 6px;
}
.banner {
  background: #fef3c7;
}
```

# JavaScript

```javascript
const box = document.querySelector('#classic');
const banner = document.querySelector('#banner');

console.log('offsetWidth →', box.offsetWidth); // 200 + 2×10 + 2×2
console.log('clientWidth →', box.clientWidth); // 200 + 2×10 − 12 de barra
console.log('barra de scroll →', box.offsetWidth - box.clientWidth - 2 * box.clientLeft, 'px');

// 🐛 Ancho útil calculado con offsetWidth (que incluye la barra):
const wrongWidth = box.offsetWidth - 2 * box.clientLeft - 20; // − bordes − padding
banner.style.width = `${wrongWidth}px`;
console.log(`🐛 banner de ${wrongWidth}px → ¿scroll horizontal? →`, box.scrollWidth > box.clientWidth);

// ✅ Con clientWidth (el interior visible, ya sin la barra):
const rightWidth = box.clientWidth - 20; // − padding
banner.style.width = `${rightWidth}px`;
console.log(`✅ banner de ${rightWidth}px → ¿scroll horizontal? →`, box.scrollWidth > box.clientWidth);

// La barra del SISTEMA varía: 0 px con barras superpuestas (macOS con
// trackpad), unos 15 px con barras clásicas (Windows, macOS con ratón).
const system = document.querySelector('#system');
console.log('barra del sistema (varía) →', system.offsetWidth - system.clientWidth - 2 * system.clientLeft, 'px');
// Igual en la ventana: innerWidth incluye la barra; documentElement.clientWidth, no.
console.log('barra de la ventana (varía) →', window.innerWidth - document.documentElement.clientWidth, 'px');
```
