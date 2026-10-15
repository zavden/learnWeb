---
example_description: "Una tabla de ventas por sucursal: cifras tabulares alineadas al final, signo menos tipográfico, nombres largos recortados con puntos suspensivos dentro de enlaces, cabeceras en mayúsculas espaciadas y subrayados a medida"
example_tags: "css|tipografia|tablas|tabular-nums|text-overflow|letter-spacing|text-decoration"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<table class="sales">
  <caption>Ventas de octubre por sucursal</caption>
  <thead>
    <tr>
      <th scope="col" class="col-name">Sucursal</th>
      <th scope="col" class="col-num col-pieces">Piezas</th>
      <th scope="col" class="col-num col-income">Ingresos</th>
      <th scope="col" class="col-num col-change">Variación</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row"><a class="branch" href="/sucursales/roma-norte">Panadería La Espiga, colonia Roma Norte</a></th>
      <td>12,480</td><td>$187,200.00</td><td class="is-up">+8.4&nbsp;%</td>
    </tr>
    <tr>
      <th scope="row"><a class="branch" href="/sucursales/coyoacan">Coyoacán</a></th>
      <td>9,115</td><td>$136,725.50</td><td class="is-down">−2.1&nbsp;%</td>
    </tr>
    <tr>
      <th scope="row"><a class="branch" href="/sucursales/santa-maria-la-ribera">Santa María la Ribera, junto al Kiosco Morisco</a></th>
      <td>7,061</td><td>$105,915.00</td><td class="is-up">+11.0&nbsp;%</td>
    </tr>
    <tr>
      <th scope="row"><a class="branch" href="/sucursales/tlalpan">Tlalpan</a></th>
      <td>4,890</td><td>$73,350.00</td><td class="is-down">−0.7&nbsp;%</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Total</th>
      <td>33,546</td><td>$503,190.50</td><td class="is-up">+4.6&nbsp;%</td>
    </tr>
  </tfoot>
</table>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tabla de ventas
   - Cifras: tabular-nums (todas del mismo ancho) y text-align: end, así las
     unidades, los decimales y los porcentajes caen en columna. El signo menos
     es U+2212 (−), que mide lo mismo que el +; el guion (-) es más corto.
   - Formato mexicano (coma de millares, punto decimal) y un espacio de no
     separación antes del %: el signo nunca empieza una línea.
   - Nombres: table-layout: fixed reparte el ancho según la primera fila, y el
     enlace se recorta en una línea con «…». El nombre completo sigue en el
     DOM (lector de pantalla) y en la página de cada sucursal.
   ────────────────────────────────────────────────────────────────────────── */
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.sales {
  inline-size: 100%;
  max-inline-size: 36rem;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 0.8125rem;
}

.sales caption {
  margin-block-end: 6px;
  font-size: 1rem;
  font-weight: 700;
  text-align: start;
}

/* Con table-layout: fixed, los anchos de la primera fila mandan. */
.col-name   { inline-size: 34%; }
.col-pieces { inline-size: 17%; }
.col-income { inline-size: 29%; }
.col-change { inline-size: 20%; }

.sales th,
.sales td {
  padding: 6px 8px;
  border-block-end: 1px solid #cbd5e1;
  text-align: start;
}

/* Cabeceras de columna: texto normal en el HTML, mayúsculas pequeñas con aire. */
.sales thead th {
  color: #475569;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sales td,
.sales .col-num {
  font-variant-numeric: tabular-nums;
  text-align: end;
}

.sales tbody th {
  font-weight: 400;
}

/* Recorte en una línea: las tres propiedades juntas, en un bloque con ancho. */
.branch {
  display: block;
  overflow: hidden;
  color: #1d4ed8;
  text-decoration-color: #93c5fd;
  text-decoration-thickness: 0.08em;
  text-overflow: ellipsis;
  text-underline-offset: 0.2em;
  white-space: nowrap;
}

.branch:hover {
  text-decoration-color: currentColor;
}

.branch:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}

.is-up   { color: #15803d; }
.is-down { color: #b91c1c; }

.sales tfoot th,
.sales tfoot td {
  border-block-end: 0;
  border-block-start: 2px solid #1e293b;
  font-weight: 700;
}
```
