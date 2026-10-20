---
example_description: "Un precio y un botón que solo aparecen con :hover no existen para quien usa el dedo, y para quien llega con el teclado el botón enfocado es invisible. La información va siempre a la vista; lo que se revela al pasar el ratón, solo dentro de @media (hover: hover) y también con :focus-within"
example_tags: "css|responsive|hover|pointer|tactil|focus-within|accesibilidad|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Pasa el ratón por las tarjetas y después recórrelas con <kbd>Tab</kbd>. En un móvil (↗ + modo dispositivo con un teléfono) no hay ratón que pase por encima.</p>
<div class="cards">
  <article class="card is-hover-only">
    <div class="photo" aria-hidden="true">🪴</div>
    <h3>Maceta de barro bruñido</h3>
    <div class="details"><p class="price">380 MXN</p><button type="button">Añadir al carrito</button></div>
    <p class="verdict">❌ Precio y botón solo con <code>:hover</code>. Con <kbd>Tab</kbd>, el foco cae en un botón invisible.</p>
  </article>
  <article class="card is-progressive">
    <div class="photo"><span aria-hidden="true">🪴</span><button type="button" class="quick-view">Vista rápida</button></div>
    <h3>Maceta de barro bruñido</h3>
    <div class="details"><p class="price">380 MXN</p><button type="button">Añadir al carrito</button></div>
    <p class="verdict">✅ Precio y botón siempre visibles. Solo «Vista rápida» espera al ratón, y aparece también con el foco.</p>
  </article>
</div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }
.cards { display: flex; flex-wrap: wrap; gap: 12px; }
.card { flex: 1 1 12rem; padding: 10px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.8rem; }
.card h3 { margin: 6px 0; font-size: 0.9rem; }
.photo { display: grid; place-items: center; position: relative; height: 70px; border-radius: 8px; background: #fde68a; font-size: 2rem; }
.details { display: flex; gap: 8px; align-items: center; }
.price { margin: 0; font-weight: 700; }
.verdict { margin: 8px 0 0; font-size: 0.7rem; }
button { padding: 4px 8px; border: 0; border-radius: 6px; background: #1d4ed8; color: #ffffff; font: inherit; }
button:focus-visible { outline: 3px solid #b45309; outline-offset: 2px; }

/* 🐛 Escondido hasta el :hover. Con el dedo no hay hover (al tocar, a veces se
   activa y se queda pegado), y opacity: 0 no quita el botón del orden de Tab:
   el foco llega a un botón que no se ve. */
.is-hover-only .details { opacity: 0; }
.is-hover-only:hover .details { opacity: 1; }

/* ✅ Lo importante, siempre visible. Lo accesorio (un atajo que repite lo que
   hay en la ficha) se esconde solo donde existe el hover… */
.quick-view { position: absolute; inset: auto 6px 6px auto; background: #1e293b; font-size: 0.7rem; }

@media (hover: hover) and (pointer: fine) {
  .is-progressive .quick-view { opacity: 0; }

  /* …y vuelve con el ratón encima o con el foco dentro de la tarjeta. */
  .is-progressive:hover .quick-view,
  .is-progressive:focus-within .quick-view { opacity: 1; }
}
```
