---
example_description: "Tokens de movimiento en CSS puro (la versión sin Sass del ejemplo profesional del módulo de Sass): duraciones, curvas y distancias como custom properties en :root, y el movimiento reducido resuelto en un solo sitio poniendo las distancias a 0, sin tocar los fundidos. La tarjeta del vivero se levanta y un aviso entra"
example_tags: "css|easing|tokens|custom-properties|prefers-reduced-motion|transiciones|design-tokens"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">La tarjeta del vivero del módulo de efectos visuales, ahora animada: pasa el ratón o llega con <kbd>Tab</kbd>. Y marca «Programar riego» para ver entrar el aviso. Todas las duraciones, curvas y distancias salen de los tokens de <code>:root</code>.</p>
<div class="page">
  <article class="product">
    <div class="stage"><img class="plant" src="nopal.svg" alt="" width="96" height="112"></div>
    <h3><a href="/vivero/nopal-en-maceta">Nopal en maceta de barro</a></h3>
    <p class="price">$185</p>
  </article>
  <div class="side">
    <label class="control"><input type="checkbox" id="save"> Programar riego</label>
    <p class="toast">Riego programado para mañana a las 7:00.</p>
  </div>
</div>
```

# CSS

```css
/* ── Tokens ─────────────────────────────────────────────────────────────
   Ningún componente escribe «200ms» ni una cubic-bezier: usan nombres.
   Cambiar el ritmo de toda la interfaz es cambiar estas líneas. */
:root {
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slow: 400ms;

  --ease-standard: cubic-bezier(0.2, 0, 0, 1);    /* moverse por la pantalla */
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);       /* llegar: frena */
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);        /* irse: acelera */

  --distance-lift: -6px;                          /* cuánto sube una tarjeta */
  --distance-enter: 0.75rem;                      /* desde dónde entra un aviso */
  --scale-hover: 1.08;
}

/* Movimiento reducido en UN sitio. En el módulo de Sass, todas las duraciones
   pasaban a 1ms. Aquí, más fino: las DISTANCIAS y el zoom van a cero y los
   fundidos conservan su duración. «Reducir» no es «quitar»: el aviso sigue
   apareciendo con un fundido; solo deja de deslizarse. */
@media (prefers-reduced-motion: reduce) {
  :root {
    --distance-lift: 0px;
    --distance-enter: 0px;
    --scale-hover: 1;
  }
}

/* ── Página ────────────────────────────────────────────────────────────── */
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f1f5f9;
}

.caption {
  margin: 8px 0 12px;
  font-size: 0.72rem;
}

.page {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: start;
}

/* ── Tarjeta ───────────────────────────────────────────────────────────── */
.product {
  position: relative;
  width: 170px;
  padding-bottom: 12px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.15);
  transition:
    translate var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
}

.product:hover,
.product:focus-within {
  translate: 0 var(--distance-lift);
  box-shadow: 0 12px 24px rgb(15 23 42 / 0.18);
}

.stage {
  display: grid;
  place-items: center;
  height: 140px;
  border-radius: 12px 12px 0 0;
  background: radial-gradient(circle at 50% 70%, #fef9c3, #fde68a 45%, #fcd34d);
}

.plant {
  display: block;
  transform-origin: 50% 100%;
  transition: scale var(--duration-slow) var(--ease-standard);
}

.product:hover .plant,
.product:focus-within .plant {
  scale: var(--scale-hover);
}

.product h3 {
  margin: 10px 12px 2px;
  font-size: 0.9rem;
}

.product a {
  color: inherit;
  text-decoration: none;
}

.product a::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
}

.product a:focus-visible::after {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}

.price {
  margin: 0 12px;
  color: #166534;
  font-weight: 800;
}

/* ── Aviso ─────────────────────────────────────────────────────────────── */
.side {
  flex: 1 1 180px;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  background: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Al irse: acelera, más rápido. Al llegar: frena, más despacio. */
.toast {
  margin: 12px 0 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.85rem;
  opacity: 0;
  visibility: hidden;
  translate: 0 var(--distance-enter);
  transition:
    opacity var(--duration-fast) var(--ease-exit),
    translate var(--duration-fast) var(--ease-exit),
    visibility var(--duration-fast);
}

body:has(#save:checked) .toast {
  opacity: 1;
  visibility: visible;
  translate: 0 0;
  transition:
    opacity var(--duration-slow) var(--ease-enter),
    translate var(--duration-slow) var(--ease-enter),
    visibility var(--duration-slow);
}
```
