---
example_description: "Dos estados vacíos con ilustraciones hechas solo con CSS: círculos con patrones de degradados, iconos SVG como máscara que siguen el color del texto, un anillo discontinuo con repeating-conic-gradient y máscara, y piezas giradas; todo decorativo y con el mensaje en texto"
example_tags: "css|integracion|patrones|mask-image|repeating-conic-gradient|iconos|estados-vacios"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<div class="states">
  <section class="empty is-cart" aria-labelledby="cart-title">
    <div class="art" aria-hidden="true">
      <span class="confetti c1"></span><span class="confetti c2"></span><span class="confetti c3"></span>
      <span class="icon is-bag"></span>
    </div>
    <h2 id="cart-title">Tu carrito está vacío</h2>
    <p>Los productos que guardes aparecerán aquí.</p>
    <a class="button" href="/tienda">Ver la tienda</a>
  </section>

  <section class="empty is-search" aria-labelledby="search-title">
    <div class="art" aria-hidden="true">
      <span class="ring"></span>
      <span class="icon is-search"></span>
    </div>
    <h2 id="search-title">Sin resultados para «chile ancho»</h2>
    <p>Revisa la ortografía o prueba con una palabra más general.</p>
    <a class="button" href="/tienda/buscar">Nueva búsqueda</a>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.states {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  max-width: 440px;
}

.empty {
  padding: 16px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
}

.empty h2 {
  margin: 8px 0 4px;
  font-size: 1rem;
  text-wrap: balance;
}

.empty p {
  margin: 0 0 10px;
  color: #475569;
  font-size: 0.8rem;
}

/* La ilustración: un círculo con un patrón y piezas encima, en la misma
   celda de grid. Todo es decorativo (aria-hidden): el texto dice lo importante. */
.art {
  position: relative;
  display: grid;
  place-items: center;
  width: 110px;
  aspect-ratio: 1;
  margin-inline: auto;
  border-radius: 50%;
}

.art > * {
  grid-area: 1 / 1;
}

/* Carrito: lunares en baldosas de 12px sobre un círculo ámbar claro. */
.is-cart .art {
  background-color: #fef3c7;
  background-image: radial-gradient(circle, #fcd34d 0 2px, transparent 2.5px);
  background-size: 12px 12px;
}

/* Búsqueda: rayas finas en diagonal sobre azul claro. */
.is-search .art {
  background: repeating-linear-gradient(45deg, #dbeafe 0 6px, #eff6ff 6px 12px);
}

/* El icono: una caja del color del texto recortada por un SVG (máscara). */
.icon {
  width: 52px;
  height: 52px;
  background-color: currentColor;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.is-cart .icon {
  color: #b45309;
  mask-image: url("icon-bag.svg");
  rotate: -8deg;
}

.is-search .icon {
  color: #1d4ed8;
  mask-image: url("icon-search.svg");
}

/* Confeti: tres rectángulos girados alrededor de la bolsa. */
.confetti {
  width: 8px;
  height: 14px;
  border-radius: 2px;
}

.c1 { background: #db2777; translate: -40px -28px; rotate: 25deg; }
.c2 { background: #0e7490; translate: 38px -34px; rotate: -30deg; }
.c3 { background: #7c3aed; translate: 40px 26px; rotate: 60deg; }

/* Un anillo discontinuo: rayos alternos (repeating-conic) y una máscara
   radial que solo deja ver una corona de 6px junto al borde. */
.ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: repeating-conic-gradient(#1d4ed8 0 8deg, transparent 8deg 16deg);
  mask-image: radial-gradient(circle closest-side, transparent calc(100% - 6px), black calc(100% - 5.5px));
}

.button {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: #1e293b;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
