---
example_description: "En un contenedor sin altura definida, una fila de 1fr no tiene espacio que repartir (mide su contenido) y las filas en porcentaje se calculan sobre el alto del propio contenido, y el texto se sale"
example_tags: "css|grid|grid-template-rows|fr|porcentajes|height|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">Cada recuadro gris mide 170px de alto: es el hueco que el panel debería llenar.</p>

<div class="cases">
  <div class="case">
    <p class="caption">❌ <code>auto 1fr auto</code> sin altura: el pie no baja</p>
    <div class="frame">
      <div class="panel">
        <header>Pedido 1042</header>
        <p>3 productos · llega el jueves</p>
        <footer>Total: 830 MXN</footer>
      </div>
    </div>
  </div>

  <div class="case">
    <p class="caption">✅ Lo mismo con <code>height: 100%</code></p>
    <div class="frame">
      <div class="panel is-full">
        <header>Pedido 1042</header>
        <p>3 productos · llega el jueves</p>
        <footer>Total: 830 MXN</footer>
      </div>
    </div>
  </div>

  <div class="case">
    <p class="caption">❌ <code>50% 50%</code> sin altura: el texto se sale</p>
    <div class="frame">
      <div class="panel is-percent">
        <header>Pedido 1042</header>
        <p>3 productos de la tienda de Monterrey; llega el jueves entre 9 y 14 h.</p>
      </div>
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

.label,
.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

/* Los tres casos en fila, con flexbox. */
.cases {
  display: flex;
  gap: 8px;
  max-width: 464px;
}

.case {
  flex: 1;
  min-width: 0;
}

/* El hueco de 170px que queremos llenar (un bloque normal, no un contenedor grid). */
.frame {
  height: 170px;
  border: 1px dashed #64748b;
  background: #f1f5f9;
}

.panel {
  display: grid;
  grid-template-rows: auto 1fr auto;
  outline: 2px dashed #0f766e;
  font-size: 0.75rem;
}

.panel > * {
  margin: 0;
  padding: 4px 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.panel p {
  background: #ffffff;
}

/* 🐛 1fr reparte el espacio LIBRE del contenedor. Pero .panel tiene height: auto:
   su alto sale de sus filas, y las filas no tienen ningún alto del que sacar espacio
   libre. Sin espacio libre, la fila 1fr mide lo que su contenido y el pie queda
   pegado debajo, a media altura del hueco. (Las columnas no tienen este problema:
   el ancho de un bloque casi nunca depende de su contenido.) */

/* ✅ Con un alto definido (aquí, el 100 % de un padre de 170px; también valdría
   height o min-height en px, rem o dvh), sí hay espacio libre: la fila 1fr se lo
   queda y el pie baja al fondo. */
.is-full {
  height: 100%;
}

/* 🐛 Un porcentaje de fila se calcula sobre el alto del contenedor. Sin altura
   definida, el navegador hace dos pasadas: primero mide el panel como si las filas
   fueran auto (el alto de su contenido) y después da a cada fila el 50 % de ESE alto.
   La cabecera, corta, cabe en su mitad; el párrafo, más largo, no: su texto se sale
   del panel por abajo. Solución: un alto definido, o filas auto/fr en lugar de %. */
.is-percent {
  grid-template-rows: 50% 50%;
}
```
