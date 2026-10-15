---
example_description: "La rejilla de tarjetas del módulo de flexbox, otra vez: con flex-wrap la última tarjeta se estira; con repeat(auto-fill, minmax(9rem, 1fr)) todas miden lo mismo porque comparten columnas"
example_tags: "css|grid|flexbox|auto-fill|minmax|rejilla|responsive"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="label">↔ Estrecha o ensancha la vista previa (o ábrela con ↗): en las dos cambia el número de columnas, pero solo en la segunda la última tarjeta respeta la columna.</p>

<p class="caption">Flexbox (módulo anterior): <code>flex: 1 1 9rem</code> → la última línea reparte su espacio sola</p>
<ul class="products is-flex">
  <li><strong>Monstera</strong> 420 MXN</li>
  <li><strong>Pothos dorado</strong> 160 MXN</li>
  <li><strong>Sansevieria</strong> 240 MXN</li>
  <li><strong>Calathea</strong> 310 MXN</li>
  <li><strong>Helecho de Boston</strong> 190 MXN</li>
  <li><strong>Ficus lira</strong> 520 MXN</li>
  <li><strong>Peperomia</strong> 140 MXN</li>
</ul>

<p class="caption">Grid: <code>repeat(auto-fill, minmax(9rem, 1fr))</code> → las columnas son de la rejilla, no de cada línea</p>
<ul class="products is-grid">
  <li><strong>Monstera</strong> 420 MXN</li>
  <li><strong>Pothos dorado</strong> 160 MXN</li>
  <li><strong>Sansevieria</strong> 240 MXN</li>
  <li><strong>Calathea</strong> 310 MXN</li>
  <li><strong>Helecho de Boston</strong> 190 MXN</li>
  <li><strong>Ficus lira</strong> 520 MXN</li>
  <li><strong>Peperomia</strong> 140 MXN</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.products {
  gap: 8px;
  margin: 0;
  padding: 6px;
  list-style: none;
  font-size: 0.8rem;
}

.products li {
  padding: 10px;
  border-radius: 8px;
}

.products strong {
  display: block;
}

/* Flexbox, como en su lección de patrones (contenedor violeta, como en ese módulo).
   Cada línea hace sus propias cuentas: la última tiene una sola tarjeta y se la
   queda entera. */
.is-flex {
  display: flex;
  flex-wrap: wrap;
  outline: 2px dashed #7c3aed;
}

.is-flex li {
  flex: 1 1 9rem;
  border: 1px solid #4338ca;
  background: #e0e7ff;
}

/* ✅ Grid. auto-fill crea tantas columnas de al menos 9rem como quepan, y 1fr las
   estira por igual. Las filas que sobran usan LAS MISMAS columnas: la tarjeta suelta
   de la última fila ocupa una columna, igual que las de arriba.
   (Aquí auto-fit daría lo mismo: hay más tarjetas que columnas, así que no quedan
   pistas vacías que colapsar.) */
.is-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
}

.is-grid li {
  border: 1px solid #0f766e;
  background: #ccfbf1;
}
```
