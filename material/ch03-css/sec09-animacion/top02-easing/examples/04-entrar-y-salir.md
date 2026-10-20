---
example_description: "Una curva para entrar y otra para salir: la cesta lateral de una tienda entra en 300 ms frenando (desaceleración) y sale en 200 ms acelerando, porque cada estado declara su propia transición y manda la del estado de llegada; con reducir movimiento, se funde en su sitio"
example_tags: "css|easing|cubic-bezier|entrada|salida|panel-lateral|prefers-reduced-motion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Abre y cierra la cesta. Entra rápida y frena al llegar; sale despacio y acelera al irse, en menos tiempo. Debajo, sus dos recorridos congelados cada 1/8 del tiempo.</p>
<label class="control"><input type="checkbox" id="cart"> Abrir la cesta</label>
<div class="shop">
  <header class="shop__bar">Vivero Los Nopales</header>
  <p class="shop__text">Suculentas, cactus y macetas de barro hechas a mano.</p>
  <aside class="drawer" aria-label="Tu cesta">
    <h3>Tu cesta</h3>
    <p>Nopal en maceta · $185</p>
    <p>Echeveria · $95</p>
    <p class="total">Total: $280</p>
  </aside>
</div>
<p class="label">Entrada: <code>300ms cubic-bezier(0, 0, 0.2, 1)</code>, los puntos se juntan al final (frena)</p>
<p class="strip is-enter"><span style="--t: 0"></span><span style="--t: 0.125"></span><span style="--t: 0.25"></span><span style="--t: 0.375"></span><span style="--t: 0.5"></span><span style="--t: 0.625"></span><span style="--t: 0.75"></span><span style="--t: 0.875"></span><span style="--t: 1"></span></p>
<p class="label">Salida: <code>200ms cubic-bezier(0.4, 0, 1, 1)</code>, los puntos se juntan al principio (arranca despacio y acelera)</p>
<p class="strip is-exit"><span style="--t: 0"></span><span style="--t: 0.125"></span><span style="--t: 0.25"></span><span style="--t: 0.375"></span><span style="--t: 0.5"></span><span style="--t: 0.625"></span><span style="--t: 0.75"></span><span style="--t: 0.875"></span><span style="--t: 1"></span></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* La «página»: el panel escondido a la derecha no debe crear scroll lateral
   (overflow: clip, de la lección de transformaciones). */
.shop {
  position: relative;
  height: 160px;
  margin-top: 10px;
  overflow: clip;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.8rem;
}

.shop__bar {
  padding: 8px 12px;
  background: #14532d;
  color: #ffffff;
  font-weight: 700;
}

.shop__text {
  margin: 12px;
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 180px;
  padding: 0 12px;
  background: #ffffff;
  box-shadow: -4px 0 12px rgb(15 23 42 / 0.2);
}

.drawer h3 { margin: 10px 0 6px; font-size: 0.9rem; }
.drawer p  { margin: 0 0 4px; }
.total     { font-weight: 700; }

/* Sin preferencia de movimiento reducido… o con ella: un fundido en su sitio.
   Cerrada, además, visibility: hidden (no se enfoca ni se lee). */
.drawer {
  opacity: 0;
  visibility: hidden;
  transition: opacity 200ms, visibility 200ms;
}

body:has(#cart:checked) .drawer {
  opacity: 1;
  visibility: visible;
}

/* Con movimiento: cada estado declara SU transición, y se usa la del estado
   de llegada (como en la lección anterior).
   - Cerrada (llegada al cerrar): sale acelerando en 200 ms. Lo que se va no
     necesita que lo sigas con la vista: rápido y sin frenar.
   - Abierta (llegada al abrir): entra frenando en 300 ms. Lo que llega debe
     posarse con suavidad donde vas a leerlo. */
@media (prefers-reduced-motion: no-preference) {
  .drawer {
    opacity: 1;
    translate: 100% 0;
    transition: translate 200ms cubic-bezier(0.4, 0, 1, 1), visibility 200ms;
  }

  body:has(#cart:checked) .drawer {
    translate: 0 0;
    transition: translate 300ms cubic-bezier(0, 0, 0.2, 1), visibility 300ms;
  }
}

/* Los recorridos congelados: 180px, como el ancho del panel. */
.strip {
  position: relative;
  width: 192px;
  height: 12px;
  margin: 0 0 6px;
  border-radius: 6px;
  background: #e2e8f0;
}

.strip span {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgb(29 78 216 / 0.45);
  animation: slide 1s both paused;
  animation-delay: calc(var(--t) * -1s);
}

.is-enter span { animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
.is-exit span  { animation-timing-function: cubic-bezier(0.4, 0, 1, 1); }

@keyframes slide {
  to { translate: 180px 0; }
}
```
