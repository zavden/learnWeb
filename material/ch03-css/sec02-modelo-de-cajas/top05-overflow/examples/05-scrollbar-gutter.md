---
example_description: "Cuando aparece la barra de scroll el contenido se estrecha y salta; scrollbar-gutter: stable reserva su espacio de antemano"
example_tags: "css|overflow|scrollbar-gutter|layout-shift"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<div class="panel">
  <h3>Sin reservar</h3>
  <ul class="list"><li>Pedido 1041</li><li>Pedido 1042</li></ul>
</div>
<div class="panel stable">
  <h3>scrollbar-gutter: stable</h3>
  <ul class="list"><li>Pedido 1041</li><li>Pedido 1042</li></ul>
</div>
<p class="hint">En macOS las barras se superponen al contenido y no ocupan espacio, así que no verás diferencia salvo que actives «Mostrar barras de desplazamiento: siempre» en los ajustes del sistema. En Windows y Linux, cada lista nueva con scroll se estrecha unos 15px.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.panel {
  display: inline-block;
  vertical-align: top;
  width: 220px;
  height: 140px;
  overflow: auto;                /* la barra aparece solo si el contenido no cabe */
  margin-right: 16px;
  border: 2px solid #1d4ed8;
  background: #bfdbfe;
}

/* Reserva el hueco de la barra aunque no haya scroll: añadir elementos no mueve nada. */
.stable {
  scrollbar-gutter: stable;
}

.panel h3 {
  margin: 6px 10px;
}

.list {
  margin: 0;
  padding-left: 28px;
  text-align: right;             /* el texto alineado a la derecha delata el salto */
  padding-right: 10px;
}

.hint {
  max-width: 480px;
  color: #475569;
  font-size: 0.85rem;
}
```
