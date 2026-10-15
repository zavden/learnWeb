---
example_description: "Así se maquetaban las columnas antes de flexbox y grid: floats al 33 %, un clearfix y dos problemas clásicos (la columna que cae y las alturas desiguales)"
example_tags: "css|float|layout|clearfix|codigo-antiguo"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<p class="label">⚠️ <code>box-sizing: content-box</code>: 3 × (33,33 % + relleno) no cabe en el 100 %; la tercera columna cae</p>
<div class="columns clearfix">
  <section class="column"><h3>Envíos</h3><p>En 24-48 h a toda la península.</p></section>
  <section class="column"><h3>Devoluciones</h3><p>Tienes 30 días para devolver cualquier pedido. Te enviamos la etiqueta por correo.</p></section>
  <section class="column"><h3>Pago</h3><p>Tarjeta, Bizum o transferencia.</p></section>
</div>

<p class="label">⚠️ Con <code>border-box</code> caben, pero cada columna mide lo que su texto: los fondos no igualan</p>
<div class="columns clearfix is-border-box">
  <section class="column"><h3>Envíos</h3><p>En 24-48 h a toda la península.</p></section>
  <section class="column"><h3>Devoluciones</h3><p>Tienes 30 días para devolver cualquier pedido. Te enviamos la etiqueta por correo.</p></section>
  <section class="column"><h3>Pago</h3><p>Tarjeta, Bizum o transferencia.</p></section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 10px 0 4px;
  font-size: 0.8rem;
}

/* Entre 2005 y 2015, las columnas de casi toda la web se hacían así: cada columna flota
   a la izquierda con un ancho en %, y el contenedor lleva un clearfix para no colapsar. */
.columns {
  max-width: 460px;
  border: 1px dashed #64748b;
}

.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

.column {
  float: left;
  width: 33.333%;
  padding: 6px;
  border-right: 2px solid #ffffff;
  background: #bfdbfe;
}

.column h3 {
  margin: 0 0 4px;
  font-size: 0.85rem;
}

.column p {
  margin: 0;
  font-size: 0.8rem;
}

/* El arreglo del primer problema es el reset que ya conoces del módulo anterior. */
.is-border-box .column {
  box-sizing: border-box;
}

/* El segundo no tiene arreglo limpio con floats: cada flotante mide su contenido.
   Se hacían trucos (fondos pintados en el contenedor, márgenes negativos enormes…).
   Hoy, columnas = flexbox o grid (módulos 4 y 5), que igualan alturas sin trucos.
   Reconoce este patrón cuando lo veas en código antiguo, pero no lo uses en uno nuevo. */
```
