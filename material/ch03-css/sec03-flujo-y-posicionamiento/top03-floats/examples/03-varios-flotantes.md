---
example_description: "Varios flotantes se colocan uno junto a otro: con float: right el primero se va más a la derecha (se ven al revés) y el que no cabe baja a la fila siguiente"
example_tags: "css|float|orden"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="label"><code>float: left</code>: en el orden del HTML, de izquierda a derecha</p>
<div class="row">
  <span class="item is-left">1</span>
  <span class="item is-left">2</span>
  <span class="item is-left">3</span>
</div>

<p class="label"><code>float: right</code>: el 1 llega primero al borde derecho, así que se leen al revés</p>
<div class="row">
  <span class="item is-right">1</span>
  <span class="item is-right">2</span>
  <span class="item is-right">3</span>
</div>

<p class="label">En un contenedor de 220px solo caben dos: el 3 baja</p>
<div class="row is-narrow">
  <span class="item is-left">1</span>
  <span class="item is-left">2</span>
  <span class="item is-left">3</span>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

/* El contenedor encierra a sus flotantes (ejemplo 5). */
.row {
  display: flow-root;
  max-width: 420px;
  border: 1px dashed #64748b;
}

.is-narrow {
  width: 220px;
}

/* Los <span> son inline, pero un flotante siempre se convierte en BLOQUE:
   por eso aceptan width y height. */
.item {
  width: 96px;
  height: 32px;
  margin: 4px;
  background: #bfdbfe;
  border: 2px solid #1d4ed8;
  font-weight: bold;
  line-height: 32px;
  text-align: center;
}

/* Cada flotante se pega al borde de su lado… o al flotante anterior de ese lado. */
.is-left {
  float: left;
}

/* El 1 llega primero y se queda junto al borde derecho; el 2 se pone a su izquierda… */
.is-right {
  float: right;
}
```
