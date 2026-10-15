---
example_description: "Un elemento position: fixed dentro de un antepasado con transform deja de colocarse respecto a la ventana: se coloca respecto a ese antepasado y se desplaza con él"
example_tags: "css|position|fixed|transform|bloque-contenedor|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">Los dos botones tienen el mismo CSS: <code>position: fixed; right: 12px; bottom: 12px</code>.
  ↕ Desplaza la vista previa: el ✅ se queda en la esquina de la ventana; el ❌ se va con su panel.</p>

<section class="panel is-transformed">
  <h3>Panel con transform</h3>
  <p><code>translateX(0)</code></p>
  <a class="help" href="#">❌ Ayuda</a>
</section>

<section class="panel">
  <h3>Panel normal</h3>
  <p>Sin transform</p>
  <a class="help" href="#">✅ Ayuda</a>
</section>

<p class="filler">Contenido de relleno para que la página tenga scroll.</p>
<p class="filler">Sigue desplazando: el botón ✅ permanece en su esquina.</p>
<p class="filler">El botón ❌ ya se ha ido hacia arriba con su panel.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 8px;
  font-size: 0.8rem;
}

.panel {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
  padding: 6px 10px 36px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #f1f5f9;
}

.panel h3,
.panel p {
  margin: 0 0 2px;
  font-size: 0.85rem;
}

.help {
  position: fixed;
  right: 12px;
  bottom: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: bold;
  text-decoration: none;
}

/* 🐛 transform se estudia en el módulo de efectos visuales; translateX(0) no mueve nada.
   Pero cualquier transform distinto de none convierte la caja en el BLOQUE CONTENEDOR de
   sus descendientes fixed (y absolute): el botón ❌ ya no se coloca respecto a la ventana,
   sino respecto a este panel, y al desplazar la página se va con él.
   Lo mismo pasa con filter, backdrop-filter, perspective, will-change: transform
   y contain: paint o layout.
   Solución: saca el elemento fixed fuera de ese antepasado (por ejemplo, al final del body). */
.is-transformed {
  transform: translateX(0);
}

.filler {
  height: 160px;
  margin: 0;
  color: #475569;
  font-size: 0.85rem;
}
```
