---
example_description: "Una cabecera sticky deja de pegarse si entre ella y el contenedor que hace scroll hay un antepasado con overflow: hidden; overflow: clip recorta sin romperla"
example_tags: "css|position|sticky|overflow|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">↕ Desplaza las tres listas. La cabecera azul de cada una tiene <code>position: sticky; top: 0</code>.</p>

<div class="column">
  <p class="caption">✅ Sin <code>overflow</code> en el envoltorio</p>
  <div class="scroller" tabindex="0" role="region" aria-label="Pedidos, ejemplo correcto">
    <div class="orders">
      <h3>Pedidos de hoy</h3>
      <ul><li>#1184 · Paula</li><li>#1183 · Andrés</li><li>#1182 · Lucía</li><li>#1181 · Hugo</li><li>#1180 · Elena</li><li>#1179 · Marta</li></ul>
    </div>
  </div>
</div>

<div class="column">
  <p class="caption">❌ Envoltorio con <code>overflow: hidden</code></p>
  <div class="scroller" tabindex="0" role="region" aria-label="Pedidos, ejemplo con overflow hidden">
    <div class="orders is-hidden">
      <h3>Pedidos de hoy</h3>
      <ul><li>#1184 · Paula</li><li>#1183 · Andrés</li><li>#1182 · Lucía</li><li>#1181 · Hugo</li><li>#1180 · Elena</li><li>#1179 · Marta</li></ul>
    </div>
  </div>
</div>

<div class="column">
  <p class="caption">✅ Envoltorio con <code>overflow: clip</code></p>
  <div class="scroller" tabindex="0" role="region" aria-label="Pedidos, ejemplo con overflow clip">
    <div class="orders is-clip">
      <h3>Pedidos de hoy</h3>
      <ul><li>#1184 · Paula</li><li>#1183 · Andrés</li><li>#1182 · Lucía</li><li>#1181 · Hugo</li><li>#1180 · Elena</li><li>#1179 · Marta</li></ul>
    </div>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(33.3% - 10px);
  margin-right: 6px;
}

.caption {
  min-height: 2.6em;
  margin: 0 0 4px;
  font-size: 0.75rem;
}

/* El contenedor que hace scroll (tabindex: también con el teclado). */
.scroller {
  height: 110px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
}

/* El envoltorio de la lista, con esquinas redondeadas. */
.orders {
  margin: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.orders h3 {
  position: sticky;
  top: 0;
  margin: 0;
  padding: 2px 8px;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.8rem;
}

.orders ul {
  margin: 0;
  padding: 0 8px;
  list-style: none;
  font-size: 0.8rem;
}

.orders li {
  padding: 3px 0;
}

/* 🐛 Una caja sticky se pega dentro de su contenedor de scroll MÁS CERCANO.
   overflow: hidden (también auto o scroll) convierte el envoltorio en un contenedor
   de scroll… que nunca se desplaza, porque mide lo mismo que su contenido. La cabecera
   se «pega» dentro de él (ya está arriba del todo) y se va con él cuando se desplaza
   la lista de verdad. Alguien puso overflow: hidden solo para recortar las esquinas. */
.is-hidden {
  overflow: hidden;
}

/* ✅ overflow: clip también recorta (esquinas incluidas), pero NO crea un contenedor de
   scroll: la cabecera vuelve a pegarse en la lista que se desplaza. */
.is-clip {
  overflow: clip;
}
```
