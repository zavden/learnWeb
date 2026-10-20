---
example_description: "Una escala de z-index con custom properties y isolation: isolate en el contenido principal: un z-index: 500 dentro de una tarjeta ya no puede tapar el menú de la cabecera"
example_tags: "css|z-index|isolation|custom-properties|arquitectura"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<div class="column">
  <p class="caption">❌ Sin aislar: la cinta «Oferta» (<code>z-index: 500</code>) tapa el menú (<code>z-index: 100</code>)</p>
  <header class="site-header">
    <details class="menu" open>
      <summary>Mi cuenta</summary>
      <ul class="menu-list"><li><a href="#">Pedidos</a></li><li><a href="#">Salir</a></li></ul>
    </details>
  </header>
  <main class="content">
    <article class="card"><span class="ribbon">Oferta</span>Saco de dormir −5 °C</article>
  </main>
</div>

<div class="column">
  <p class="caption">✅ <code>isolation: isolate</code> en <code>main</code>: lo de dentro no compite con la cabecera</p>
  <header class="site-header">
    <details class="menu" open>
      <summary>Mi cuenta</summary>
      <ul class="menu-list"><li><a href="#">Pedidos</a></li><li><a href="#">Salir</a></li></ul>
    </details>
  </header>
  <main class="content is-isolated">
    <article class="card"><span class="ribbon">Oferta</span>Saco de dormir −5 °C</article>
  </main>
</div>
```

# CSS

```css
/* Una ESCALA de z-index en un solo sitio: nadie escribe números sueltos en los componentes.
   Pocos niveles y separados, para poder intercalar alguno más adelante. */
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  min-height: 3.9em;
  margin: 0 0 4px;
  font-size: 0.75rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

.site-header {
  padding: 6px 8px;
  background: #1e3a8a;
  color: #ffffff;
}

.menu {
  position: relative;
}

.menu-list {
  position: absolute;
  z-index: var(--z-dropdown);
  top: 100%;
  left: 0;
  margin: 4px 0 0;
  padding: 4px 0;
  list-style: none;
  border: 1px solid #94a3b8;
  background: #ffffff;
}

.menu-list a {
  display: block;
  padding: 2px 12px;
  color: #1d4ed8;
}

.card {
  position: relative;
  margin-top: 8px;
  padding: 28px 10px 30px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f1f5f9;
  font-size: 0.85rem;
}

/* Alguien subió la cinta a 500 «para asegurarse» de que quedara sobre la foto de la tarjeta. */
.ribbon {
  position: absolute;
  z-index: 500;
  top: 6px;
  left: -6px;
  padding: 2px 10px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
}

/* ✅ isolation: isolate convierte main en un contexto de apilamiento: el 500 de la cinta solo
   cuenta dentro de main, y main entero compite con la cabecera como una capa 0.
   El menú (100) queda encima. Aislar las zonas grandes de la página y usar la escala
   evita la carrera de 999, 9999, 99999… */
.is-isolated {
  isolation: isolate;
}
```
