---
example_description: "Una ficha de producto con tres botones (Descripción, Cuidados, Envío) que cambian el panel visible dentro de una View Transition: el panel con nombre cambia de altura con suavidad, el texto viejo se va y el nuevo sube con keyframes propios, y el botón activo funde su color. Adelanto de JavaScript: startViewTransition, aria-pressed y hidden"
example_tags: "css|integracion|view-transitions|view-transition-name|view-transition-old|view-transition-new|aria-pressed|javascript"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="info" aria-labelledby="info-title">
  <h2 id="info-title">Nopal en maceta de barro</h2>
  <div class="switcher" role="group" aria-label="Información del producto">
    <button type="button" aria-pressed="true" aria-controls="panel-description" onclick="showPanel(this)">Descripción</button>
    <button type="button" aria-pressed="false" aria-controls="panel-care" onclick="showPanel(this)">Cuidados</button>
    <button type="button" aria-pressed="false" aria-controls="panel-shipping" onclick="showPanel(this)">Envío</button>
  </div>
  <div id="panel-description" class="panel">
    <p>Nopal joven de unos 25 cm en una maceta de barro de Tonalá hecha a mano. Cada maceta es distinta.</p>
  </div>
  <div id="panel-care" class="panel" hidden>
    <p>Sol directo al menos 6 horas.</p>
    <p>Riego cada 10 o 15 días en verano y una vez al mes en invierno.</p>
    <p>Abono para cactus de marzo a septiembre.</p>
  </div>
  <div id="panel-shipping" class="panel" hidden>
    <p>Envío gratis desde $599. Llega en 2 a 4 días hábiles, en una caja ventilada.</p>
  </div>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────
   Información con View Transition
   - El cambio de panel (hidden) ocurre dentro de startViewTransition.
   - El panel visible se llama «info-panel» (los ocultos no tienen caja,
     así que el nombre no se repite): su grupo cambia de altura con
     suavidad, y su texto sale y entra con keyframes propios.
   - El resto de la página (los botones) se funde con la transición por
     defecto de la raíz.
   - Movimiento reducido: sin nombre; la página entera se funde.
   ────────────────────────────────────────────────────────────────────── */
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.info {
  max-width: 360px;
}

.info h2 {
  margin: 0 0 10px;
  font-size: 1.05rem;
}

.switcher {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: #e2e8f0;
}

.switcher button {
  flex: 1;
  padding: 6px 8px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #1e293b;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.switcher button[aria-pressed="true"] {
  background: #14532d;
  color: #ffffff;
}

.switcher button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.panel {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f0fdf4;
  font-size: 0.9rem;
}

.panel p {
  margin: 0 0 6px;
}

.panel p:last-child {
  margin-bottom: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .panel {
    view-transition-name: info-panel;
  }

  ::view-transition-group(info-panel) {
    animation-duration: 300ms;
    animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  /* Por defecto, las dos fotos se estiran al tamaño del grupo; con
     height: 100% y la anchura fija, el texto no se deforma. */
  ::view-transition-old(info-panel),
  ::view-transition-new(info-panel) {
    height: 100%;
    object-fit: none;
    object-position: top left;
  }

  ::view-transition-old(info-panel) {
    animation: panel-out 150ms ease-in both;
  }

  ::view-transition-new(info-panel) {
    animation: panel-in 250ms cubic-bezier(0, 0, 0.2, 1) 100ms both;
  }
}

@keyframes panel-out {
  to { opacity: 0; }
}

@keyframes panel-in {
  from {
    opacity: 0;
    translate: 0 8px;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). onclick="showPanel(this)" pasa el botón
// pulsado. setAttribute cambia aria-pressed y la propiedad hidden oculta o muestra cada panel.
function showPanel(button) {
  const update = () => {
    for (const other of document.querySelectorAll('.switcher button')) {
      const isCurrent = other === button;
      other.setAttribute('aria-pressed', String(isCurrent));
      document.getElementById(other.getAttribute('aria-controls')).hidden = !isCurrent;
    }
  };

  if (!document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(update);
}
```
