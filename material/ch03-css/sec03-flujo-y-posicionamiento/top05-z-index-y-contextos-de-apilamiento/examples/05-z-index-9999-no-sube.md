---
example_description: "Un menú con z-index: 9999 queda debajo de la sección siguiente porque compite dentro del contexto de su cabecera (z-index: 1), y la sección tiene z-index: 2"
example_tags: "css|z-index|stacking-context|desplegable|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="column">
  <p class="caption">❌ Menú <code>z-index: 9999</code> en una cabecera con <code>z-index: 1</code></p>
  <header class="site-header">
    <details class="menu" open>
      <summary>Categorías</summary>
      <ul class="menu-list"><li><a href="#">Mochilas</a></li><li><a href="#">Tiendas de campaña</a></li></ul>
    </details>
  </header>
  <section class="hero">Rebajas de otoño: hasta un 40 % en material de montaña</section>
</div>

<div class="column">
  <p class="caption">✅ La cabecera sube a <code>z-index: 3</code>, por encima de la sección</p>
  <header class="site-header is-raised">
    <details class="menu" open>
      <summary>Categorías</summary>
      <ul class="menu-list"><li><a href="#">Mochilas</a></li><li><a href="#">Tiendas de campaña</a></li></ul>
    </details>
  </header>
  <section class="hero">Rebajas de otoño: hasta un 40 % en material de montaña</section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  min-height: 2.6em;
  margin: 0 0 4px;
  font-size: 0.75rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

/* La cabecera tiene z-index: 1 (alguien lo puso para que quedara sobre un adorno).
   Posicionada y con z-index, crea un CONTEXTO DE APILAMIENTO. */
.site-header {
  position: relative;
  z-index: 1;
  padding: 6px 8px;
  background: #1e3a8a;
  color: #ffffff;
}

.menu {
  position: relative;               /* referencia del desplegable (sin z-index: no crea contexto) */
}

/* 🐛 z-index: 9999 solo ordena el menú DENTRO del contexto de la cabecera.
   Hacia fuera, la cabecera entera compite como una sola capa con su z-index: 1,
   y la sección (z-index: 2) se pinta encima de ella… y de todo lo que contiene. */
.menu-list {
  position: absolute;
  z-index: 9999;
  top: 100%;
  left: 0;
  margin: 4px 0 0;
  padding: 4px 0;
  list-style: none;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 6px 16px rgb(15 23 42 / 0.25);
}

.menu-list a {
  display: block;
  padding: 2px 12px;
  color: #1d4ed8;
  white-space: nowrap;
}

/* La sección también tiene z-index (2), por sus propias capas decorativas. */
.hero {
  position: relative;
  z-index: 2;
  min-height: 80px;
  padding: 10px;
  background: #fde68a;
  font-weight: bold;
}

/* ✅ No se arregla subiendo el 9999 a 99999: se arregla subiendo la CABECERA por encima de
   la sección (o quitando el z-index que sobra). Compara contextos, no números. */
.is-raised {
  z-index: 3;
}
```
