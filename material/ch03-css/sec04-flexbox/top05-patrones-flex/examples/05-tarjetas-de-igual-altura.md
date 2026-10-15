---
example_description: "Tarjetas de igual altura con el botón alineado abajo: la fila las estira y cada tarjeta es una columna flex con margin-top: auto en el botón"
example_tags: "css|flexbox|tarjetas|margin-auto|stretch|patrones"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">❌ Fila flex: las tarjetas ya miden lo mismo, pero cada botón queda donde acaba su texto</p>
<ul class="plans">
  <li class="plan"><h3>Semilla</h3><p class="price">99 MXN <small>al mes</small></p><ul class="features"><li>1 planta</li></ul><a class="button" href="/suscripcion/semilla">Elegir Semilla</a></li>
  <li class="plan"><h3>Brote</h3><p class="price">189 MXN <small>al mes</small></p><ul class="features"><li>2 plantas</li><li>Maceta de barro</li></ul><a class="button" href="/suscripcion/brote">Elegir Brote</a></li>
  <li class="plan"><h3>Jardín</h3><p class="price">349 MXN <small>al mes</small></p><ul class="features"><li>4 plantas</li><li>Maceta y abono</li><li>Asesoría por chat</li></ul><a class="button" href="/suscripcion/jardin">Elegir Jardín</a></li>
</ul>

<p class="label">✅ Cada tarjeta es además una columna flex, y el botón lleva <code>margin-top: auto</code></p>
<ul class="plans is-fixed">
  <li class="plan"><h3>Semilla</h3><p class="price">99 MXN <small>al mes</small></p><ul class="features"><li>1 planta</li></ul><a class="button" href="/suscripcion/semilla">Elegir Semilla</a></li>
  <li class="plan"><h3>Brote</h3><p class="price">189 MXN <small>al mes</small></p><ul class="features"><li>2 plantas</li><li>Maceta de barro</li></ul><a class="button" href="/suscripcion/brote">Elegir Brote</a></li>
  <li class="plan"><h3>Jardín</h3><p class="price">349 MXN <small>al mes</small></p><ul class="features"><li>4 plantas</li><li>Maceta y abono</li><li>Asesoría por chat</li></ul><a class="button" href="/suscripcion/jardin">Elegir Jardín</a></li>
</ul>
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

/* La fila de tarjetas: si no caben tres de 8rem, se parten en varias líneas. */
.plans {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 440px;
  margin: 0;
  padding: 6px;
  outline: 2px dashed #7c3aed;
  list-style: none;
  font-size: 0.8rem;
}

/* Alturas iguales GRATIS: align-items: stretch (por defecto) estira cada tarjeta
   hasta el alto de la más alta de su línea. */
.plan {
  flex: 1 1 8rem;
  box-sizing: border-box;      /* los 8rem de la base incluyen padding y borde */
  padding: 10px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  background: #ffffff;
}

.plan h3,
.plan p {
  margin: 0 0 4px;
}

.price {
  font-size: 1rem;
  font-weight: bold;
}

.price small {
  color: #475569;
  font-size: 0.75rem;
  font-weight: normal;
}

.features {
  margin: 0 0 10px;
  padding-left: 1.1em;
}

.button {
  display: block;
  padding: 6px;
  border-radius: 6px;
  background: #166534;
  color: #ffffff;
  text-align: center;
  text-decoration: none;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* ❌ Pero el contenido de cada tarjeta sigue en flujo normal: el botón va justo
   después de la lista, y cada lista mide distinto. */

/* ✅ La tarjeta es elemento flex de la fila Y contenedor flex de su contenido, en
   columna. El margen automático del botón se queda con todo el alto sobrante y lo
   empuja al fondo de la tarjeta (lección 2). Los tres botones, alineados. */
.is-fixed .plan {
  display: flex;
  flex-direction: column;
  outline: 2px dashed #7c3aed;
  outline-offset: -4px;
}

.is-fixed .button {
  margin-top: auto;
}
```
