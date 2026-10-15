---
example_description: "Tarjetas con flex-wrap y flex: 1 1 9rem: el número de columnas se adapta al ancho sin media queries, pero la tarjeta que queda sola en la última línea se estira; max-width lo limita"
example_tags: "css|flexbox|flex-wrap|flex-basis|responsive|rejilla|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">↔ Estrecha o ensancha la vista previa (o ábrela con ↗): las columnas se recolocan solas.</p>

<p class="caption">❌ <code>flex: 1 1 9rem</code>: la última línea reparte su espacio sola, y una tarjeta suelta ocupa la línea entera</p>
<ul class="products">
  <li><strong>Monstera</strong> 420 MXN</li>
  <li><strong>Pothos dorado</strong> 160 MXN</li>
  <li><strong>Sansevieria</strong> 240 MXN</li>
  <li><strong>Calathea</strong> 310 MXN</li>
  <li><strong>Helecho de Boston</strong> 190 MXN</li>
  <li><strong>Ficus lira</strong> 520 MXN</li>
  <li><strong>Peperomia</strong> 140 MXN</li>
</ul>

<p class="caption">✅ Con <code>max-width: 12rem</code>: la tarjeta suelta ya no ocupa la línea entera</p>
<ul class="products is-capped">
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
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 6px;
  outline: 2px dashed #7c3aed;
  list-style: none;
  font-size: 0.8rem;
}

/* El patrón «rejilla sin media queries»: base de 9rem, crece y encoge.
   - En cada línea caben tantas tarjetas de 9rem como permita el ancho.
   - Después, flex-grow reparte lo que sobra en ESA línea: llenan el ancho.
   Más ancho → más columnas; más estrecho → menos. Sin una sola @media. */
.products li {
  flex: 1 1 9rem;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #ffffff;
}

.products strong {
  display: block;
}

/* 🐛 Cada línea es independiente (lección 3): la última reparte su espacio entre las
   tarjetas que le han tocado. Si queda una sola, se lleva toda la línea y mide el
   doble o el triple que las demás. Flexbox no sabe de columnas: solo de líneas. */

/* ✅ Un max-width pone techo al crecimiento: el algoritmo congela la tarjeta en
   12rem (paso 4) y el resto de la línea se queda libre. No da columnas exactas
   (a veces la última mide un poco más que las otras); para eso está grid, en el
   próximo módulo, con repeat(auto-fill, minmax(9rem, 1fr)). */
.is-capped li {
  max-width: 12rem;
}
```
