---
example_description: "Centrado con flexbox en tres piezas reales: un estado vacío centrado en su panel, un botón de icono y un contador con la cifra en el centro exacto"
example_tags: "css|flexbox|centrar|align-items|justify-content|patrones"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Un estado vacío: el grupo entero, centrado en los dos ejes del panel</p>
<section class="empty" aria-labelledby="empty-title">
  <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18l-2 13H5L3 6Zm5 0a4 4 0 0 1 8 0" fill="#dcfce7" stroke="#166534" stroke-width="1.6" stroke-linejoin="round"/></svg>
  <h3 id="empty-title">Tu carrito está vacío</h3>
  <p>Las plantas que guardes aparecerán aquí.</p>
  <a class="button" href="/plantas">Ver plantas</a>
</section>

<p class="label">Un botón de icono y un contador: el dibujo y la cifra, en el centro exacto de su caja</p>
<div class="toolbar">
  <button class="icon-button" type="button" aria-label="Favoritos">
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
  </button>
  <a class="inbox" href="/mensajes">Mensajes <span class="count">7</span></a>
  <a class="inbox" href="/pedidos">Pedidos <span class="count">12</span></a>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

/* El estado vacío: una COLUMNA centrada en los dos ejes. En una columna,
   justify-content centra en vertical (eje principal) y align-items en horizontal. */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 400px;
  min-height: 190px;
  outline: 2px dashed #7c3aed;
  background: #f8fafc;
  font-size: 0.8rem;
  text-align: center;          /* flex centra las cajas; text-align, sus líneas */
}

.empty h3,
.empty p {
  margin: 0;
}

.button {
  margin-top: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  background: #166534;
  color: #ffffff;
  text-decoration: none;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
}

/* Un botón cuadrado con un icono dentro: inline-flex + centrado en los dos ejes.
   Sin flex, el icono quedaría en la línea base del texto (módulo de flujo). */
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid #64748b;    /* borde de control: contraste ≥ 3:1 */
  border-radius: 50%;
  background: #ffffff;
  color: #b91c1c;
  outline: 2px dashed #7c3aed;
  outline-offset: 2px;
}

.inbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1d4ed8;
}

/* El contador: un círculo que crece con la cifra (min-width, no width) y la cifra en
   el centro exacto, sin ajustar line-height a ojo. */
.count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;      /* el padding cuenta dentro de los 20px */
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: bold;
}

a:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
