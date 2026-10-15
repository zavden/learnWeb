---
example_description: "minmax(12rem, 1fr) se desborda en un contenedor más estrecho que 12rem (una columna lateral, un móvil pequeño); min(100%, 12rem) baja el mínimo al ancho del contenedor"
example_tags: "css|grid|minmax|min|auto-fit|desbordamiento|responsive|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">La misma lista de plantas en una columna lateral de <strong>11rem</strong> (176px), más estrecha que el mínimo de 12rem (192px).</p>

<div class="sidebars">
  <section class="sidebar" aria-label="Más vendidas, versión con el error">
    <p class="caption">❌ <code>minmax(12rem, 1fr)</code></p>
    <ul class="list is-broken">
      <li>Monstera · 420 MXN</li>
      <li>Pothos · 160 MXN</li>
    </ul>
  </section>

  <section class="sidebar" aria-label="Más vendidas, versión corregida">
    <p class="caption">✅ <code>minmax(min(100%, 12rem), 1fr)</code></p>
    <ul class="list is-guarded">
      <li>Monstera · 420 MXN</li>
      <li>Pothos · 160 MXN</li>
    </ul>
  </section>
</div>
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
  font-size: 0.75rem;
}

.sidebars {
  display: flex;
  gap: 32px;
}

/* La columna lateral: 11rem de ancho. */
.sidebar {
  width: 11rem;
  padding: 0;
  border: 1px solid #94a3b8;
  background: #f1f5f9;
}

.list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  outline: 2px dashed #0f766e;
  list-style: none;
  font-size: 0.8rem;
}

.list li {
  padding: 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.is-broken li {
  border-color: #b45309;
  background: #fef3c7;
}

/* 🐛 auto-fit busca cuántas columnas de 12rem caben… y siempre hay al menos una,
   aunque no quepa. Su mínimo es 12rem (192px) y el contenedor mide 176px: la
   columna se sale 16px por la derecha, y en una página entera eso es scroll
   horizontal. Pasa en cualquier móvil más estrecho que el mínimo que elegiste. */
.is-broken {
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}

/* ✅ min(100%, 12rem) devuelve el menor de los dos: con sitio de sobra, 12rem;
   en un contenedor más estrecho, el 100 % del contenedor. La columna nunca es
   más ancha que la lista. (min() es una función de CSS que viste con las
   unidades: elige el valor menor en el momento del layout.) */
.is-guarded {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
}
```
