---
example_description: "En un móvil, 100vh es el alto de la ventana SIN la barra de direcciones (viewport grande): una portada de 100vh esconde su botón bajo el borde mientras la barra se ve. 100svh mide la ventana pequeña. Dibujo simulado, porque en un escritorio las cuatro unidades valen lo mismo"
example_tags: "css|responsive|viewport|vh|svh|lvh|dvh|movil|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Simulación de un móvil al cargar la página, con la barra de direcciones visible (36px). La pantalla mide 280px: 244px de ventana pequeña + la barra.</p>
<div class="phones">
  <figure>
    <div class="phone">
      <div class="url-bar">huerto.mx</div>
      <section class="hero is-lvh"><h3>Cabañas en Valle de Bravo</h3><p>Desde 1&nbsp;800 MXN la noche</p><span class="cta">Reservar</span></section>
    </div>
    <figcaption>❌ <code>100vh</code> (= <code>100lvh</code>): 280px. «Reservar» queda bajo el borde.</figcaption>
  </figure>
  <figure>
    <div class="phone">
      <div class="url-bar">huerto.mx</div>
      <section class="hero is-svh"><h3>Cabañas en Valle de Bravo</h3><p>Desde 1&nbsp;800 MXN la noche</p><span class="cta">Reservar</span></section>
    </div>
    <figcaption>✅ <code>100svh</code>: 244px. Cabe con la barra visible.</figcaption>
  </figure>
</div>

<p class="caption">Y en esta vista previa, de verdad: cuatro barras de <code>20vh</code>, <code>20svh</code>, <code>20lvh</code> y <code>20dvh</code>. En un escritorio no hay barra que se esconda, así que miden lo mismo.</p>
<div class="bars" aria-hidden="true"><span class="vh">vh</span><span class="svh">svh</span><span class="lvh">lvh</span><span class="dvh">dvh</span></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption { margin: 8px 0; font-size: 0.72rem; }
.phones { display: flex; gap: 16px; }
figure { margin: 0; width: 170px; }
figcaption { margin-top: 4px; font-size: 0.7rem; }

/* El dibujo usa px: dentro de la vista previa, vh mediría la tarjeta. */
.phone {
  height: 280px;
  overflow: hidden;              /* lo que pasa del borde de la pantalla no se ve */
  border: 6px solid #1e293b;
  border-radius: 16px;
}

.url-bar {
  height: 36px;
  padding: 8px;
  box-sizing: border-box;
  background: #e2e8f0;
  font-size: 0.7rem;
  text-align: center;
}

.hero {
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  background: linear-gradient(#0c4a6e, #155e75);
  color: #ffffff;
  font-size: 0.75rem;
}

.hero h3 { margin: 0 0 6px; font-size: 1rem; }
.hero p { margin: 0; }
.cta { margin-top: auto; padding: 6px; border-radius: 6px; background: #fbbf24; color: #1e293b; font-weight: 700; text-align: center; }

/* 🐛 En Chrome para Android y Safari para iOS, vh mide el viewport GRANDE (sin
   barra), para que la página no salte al esconderse la barra al hacer scroll.
   Al cargar, la barra está visible: la portada mide 36px más que lo que se ve. */
.is-lvh { height: 280px; }       /* height: 100vh, o 100lvh */

/* ✅ svh: el viewport PEQUEÑO, con todas las barras visibles. Siempre cabe.
   dvh sigue a la barra en cada momento (y recoloca la página al hacer scroll);
   para «como mínimo, la pantalla», min-height: 100dvh (módulo de flexbox). */
.is-svh { height: 244px; }       /* height: 100svh */

.bars { display: flex; gap: 8px; align-items: end; }
.bars span { width: 48px; background: #c7d2fe; font-size: 0.7rem; text-align: center; }
.vh { height: 20vh; }
.svh { height: 20svh; }
.lvh { height: 20lvh; }
.dvh { height: 20dvh; }
```
