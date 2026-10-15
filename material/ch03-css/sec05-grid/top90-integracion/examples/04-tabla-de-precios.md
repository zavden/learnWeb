---
example_description: "Tres planes de suscripción con subgrid: nombre, precio, ventajas y botón alineados entre columnas aunque las listas midan distinto; la etiqueta «Más elegido» comparte celda con el nombre; las columnas se adaptan con auto-fit y min()"
example_tags: "css|grid|subgrid|auto-fit|min|capas|precios"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="pricing" aria-labelledby="pricing-title">
  <h2 id="pricing-title">Elige tu caja de plantas</h2>
  <ul class="plans">
    <li class="plan">
      <h3>Básica</h3>
      <p class="price"><strong>0 MXN</strong> <span>al mes</span></p>
      <ul class="perks">
        <li>Guía mensual por correo</li>
        <li>Recordatorios de riego</li>
      </ul>
      <a class="button" href="/suscripcion/basica">Empezar gratis</a>
    </li>
    <li class="plan is-featured">
      <h3>Huerto</h3>
      <p class="badge">Más elegido</p>
      <p class="price"><strong>89 MXN</strong> <span>al mes</span></p>
      <ul class="perks">
        <li>Todo lo de la Básica</li>
        <li>Una planta de temporada al mes</li>
        <li>Sustrato y abono incluidos</li>
        <li>Chat con una experta</li>
      </ul>
      <a class="button" href="/suscripcion/huerto">Elegir Huerto</a>
    </li>
    <li class="plan">
      <h3>Invernadero</h3>
      <p class="price"><strong>199 MXN</strong> <span>al mes</span></p>
      <ul class="perks">
        <li>Todo lo de Huerto</li>
        <li>Tres plantas al mes</li>
        <li>Visita anual a domicilio</li>
      </ul>
      <a class="button" href="/suscripcion/invernadero">Elegir Invernadero</a>
    </li>
  </ul>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tabla de precios
   - Columnas: auto-fit con un mínimo de 8.5rem protegido con min(). Con tres
     planes no sobran pistas; auto-fit evita huecos si un día hay solo dos.
   - Cada plan ocupa 4 filas (nombre, precio, ventajas y botón) y las comparte
     con los otros planes gracias a subgrid: los precios y los botones quedan a
     la misma altura aunque las listas de ventajas midan distinto.
   - La etiqueta «Más elegido» va en la misma celda que el nombre (1 / 1)
     y se pega a la esquina con justify-self.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  margin: 8px;
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.pricing h2 {
  margin: 0 0 10px;
  font-size: 1.2rem;
  text-align: center;
}

.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 8.5rem), 1fr));
  gap: 16px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.plan {
  display: grid;
  grid-row: span 4;
  grid-template-rows: subgrid;
  row-gap: 8px;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.85rem;
}

.plan > * {
  margin: 0;
}

/* Nombre y etiqueta, los dos en la celda 1 / 1. Ojo: con solo grid-row: 1, la
   colocación automática buscaría para la etiqueta otra COLUMNA libre en esa fila
   y crearía una columna implícita. Con fila y columna, se superponen. */
.plan h3 {
  grid-area: 1 / 1;
  font-size: 1rem;
}

.badge {
  grid-area: 1 / 1;
  justify-self: end;
  align-self: start;
  padding: 1px 8px;
  border-radius: 999px;
  background: #0f766e;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: bold;
}

.is-featured {
  border: 2px solid #0f766e;
  background: #f0fdfa;
}

/* Importe grande y «al mes» pequeño, sobre la misma línea base. */
.price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
}

.price strong {
  font-size: 1.4rem;
}

.price span {
  color: #475569;
}

.perks {
  padding-left: 1.1em;
}

.perks li + li {
  margin-top: 4px;
}

/* El botón ocupa su fila a lo ancho y se queda abajo. */
.button {
  align-self: end;
  padding: 6px 8px;
  border: 2px solid #0f766e;
  border-radius: 999px;
  color: #0f5c55;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
}

.is-featured .button {
  background: #0f766e;
  color: #ffffff;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
