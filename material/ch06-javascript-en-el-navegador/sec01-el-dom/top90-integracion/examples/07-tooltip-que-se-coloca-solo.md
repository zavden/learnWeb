---
example_description: "Un tooltip que se coloca solo: mide el botón con getBoundingClientRect, mide el propio tooltip y elige debajo o encima según el espacio que queda en la ventana, sin salirse por los lados (clientWidth, sin la barra de scroll); lee todo antes de escribir la posición"
example_tags: "javascript|dom|integracion|tooltip|getboundingclientrect|aria|medidas|scroll"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="product">
  <p class="price">Precio: $549.00
    <button type="button" class="info" aria-label="Más información sobre el precio" aria-expanded="false"
      data-tip="Incluye IVA. El envío es gratis en pedidos de más de $500.">ⓘ</button>
  </p>
  <h1>Molinillo manual de acero</h1>
  <p>Muelas cónicas, 18 niveles de molienda y una manivela que se pliega para guardarlo.</p>
  <div class="spacer" aria-hidden="true"></div>
  <p class="warranty">Garantía de 2 años
    <button type="button" class="info" aria-label="Más información sobre la garantía" aria-expanded="false"
      data-tip="Cubre las muelas y la manivela. No cubre golpes ni caídas.">ⓘ</button>
  </p>
</main>
<div class="tooltip" id="tooltip" role="tooltip" hidden></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.info {
  padding: 0 0.4rem;
  font: inherit;
  border: 1px solid #64748b;
  border-radius: 999px;
  background: #ffffff;
}
.info:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.spacer {
  height: 900px;
}
.tooltip {
  position: absolute; /* coordenadas del documento: las calcula el script */
  max-width: 16rem;
  padding: 0.5rem 0.75rem;
  color: #ffffff;
  background: #1e293b;
  border-radius: 0.375rem;
}
```

# JavaScript

```javascript
const GAP = 8;
const tooltip = document.querySelector('#tooltip');
let openButton = null;

function placeTooltip(button) {
  // Escrituras previas: el texto decide el tamaño del tooltip.
  tooltip.textContent = button.dataset.tip;
  tooltip.hidden = false;

  // TODAS las lecturas (un solo layout forzado).
  const target = button.getBoundingClientRect();
  const tipWidth = tooltip.offsetWidth;
  const tipHeight = tooltip.offsetHeight;
  const viewportHeight = window.innerHeight;
  const viewportWidth = document.documentElement.clientWidth; // sin la barra de scroll
  const { scrollX, scrollY } = window;

  // Cálculos, sin tocar el DOM.
  const spaceBelow = viewportHeight - target.bottom;
  const placement = spaceBelow >= tipHeight + GAP || target.top < spaceBelow ? 'below' : 'above';
  const top = placement === 'below' ? target.bottom + GAP : target.top - GAP - tipHeight;
  const centered = target.left + target.width / 2 - tipWidth / 2;
  const left = Math.min(Math.max(centered, GAP), viewportWidth - tipWidth - GAP);

  // TODAS las escrituras.
  tooltip.style.top = `${top + scrollY}px`; // de la ventana al documento
  tooltip.style.left = `${left + scrollX}px`;
  tooltip.dataset.placement = placement;
  button.setAttribute('aria-expanded', 'true');
  button.setAttribute('aria-describedby', 'tooltip');
  openButton = button;
  return placement;
}

function closeTooltip() {
  tooltip.hidden = true;
  openButton?.setAttribute('aria-expanded', 'false');
  openButton?.removeAttribute('aria-describedby');
  openButton = null;
}

// Comprobaciones al cargar
const [priceButton, warrantyButton] = document.querySelectorAll('.info');
console.log('precio → se coloca:', placeTooltip(priceButton));
console.log('¿debajo del botón? →', tooltip.getBoundingClientRect().top >= priceButton.getBoundingClientRect().bottom);

window.scrollTo(0, document.documentElement.scrollHeight); // al final: el botón queda abajo del todo
console.log('garantía → se coloca:', placeTooltip(warrantyButton));
const tipRect = tooltip.getBoundingClientRect();
console.log('¿encima del botón? →', tipRect.bottom <= warrantyButton.getBoundingClientRect().top);
console.log('¿cabe a lo ancho? →', tipRect.left >= 0 && tipRect.right <= document.documentElement.clientWidth);
console.log('aria-expanded →', warrantyButton.getAttribute('aria-expanded'), '| aria-describedby →', warrantyButton.getAttribute('aria-describedby'));
closeTooltip();
window.scrollTo(0, 0);

// Pulsa los ⓘ (los eventos se estudian en el módulo siguiente).
for (const button of [priceButton, warrantyButton]) {
  button.addEventListener('click', () => {
    const wasOpen = openButton === button;
    closeTooltip();
    if (!wasOpen) placeTooltip(button);
  });
}
```
