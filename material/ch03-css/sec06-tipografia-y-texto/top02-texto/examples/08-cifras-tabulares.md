---
example_description: "Las cifras proporcionales de Literata desalinean una columna de precios; font-variant-numeric: tabular-nums las hace del mismo ancho, y diagonal-fractions convierte 1/2 en una fracción"
example_tags: "css|tipografia|font-variant-numeric|tabular-nums|fracciones|tablas"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<table class="prices">
  <caption>Los mismos precios, alineados a la derecha. Mira si los dígitos forman columnas</caption>
  <thead>
    <tr>
      <th scope="col">Pieza</th>
      <th scope="col">❌ Cifras de la fuente</th>
      <th scope="col">✅ <code>tabular-nums</code></th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Bolillo</th><td>$4.50</td><td class="is-tabular">$4.50</td></tr>
    <tr><th scope="row">Oreja</th><td>$11.10</td><td class="is-tabular">$11.10</td></tr>
    <tr><th scope="row">Concha</th><td>$18.00</td><td class="is-tabular">$18.00</td></tr>
    <tr><th scope="row">Rosca</th><td>$111.00</td><td class="is-tabular">$111.00</td></tr>
    <tr><th scope="row">Polvorón</th><td>$145.00</td><td class="is-tabular">$145.00</td></tr>
  </tbody>
</table>

<p class="caption">Fracciones: el texto es «1/2» y «3/4»; <code>diagonal-fractions</code> las dibuja con la forma que trae la fuente</p>
<p class="recipe">1/2 taza de azúcar · 3/4 de taza de leche</p>
<p class="recipe is-fraction">1/2 taza de azúcar · 3/4 de taza de leche</p>
```

# CSS

```css
@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-display: swap;
}

body {
  font-family: Literata, Georgia, serif;
  color: #1e293b;
}

.prices {
  border-collapse: collapse;
  font-size: 1.25rem;
}

.prices caption,
.caption {
  margin: 10px 0 4px;
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
  text-align: start;
}

.prices th,
.prices td {
  padding: 2px 10px;
  border-bottom: 1px solid #cbd5e1;
  font-weight: 400;
  text-align: start;
}

.prices thead th {
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Las cantidades se alinean al final de la línea, para que las unidades caigan
   una debajo de otra. */
.prices td {
  text-align: end;
}

/* ❌ En Literata, como en muchas fuentes de texto, cada cifra tiene su ancho: el 1
   es mucho más estrecho que el 0 o el 4. En una frase queda bien; en una columna,
   las decenas y las centenas no caen una debajo de otra. */

/* ✅ Las cifras tabulares miden todas lo mismo y forman columnas. Funciona si la
   fuente las trae (la característica OpenType «tnum»); si no, no cambia nada.
   Úsalas en tablas, precios, marcadores y relojes que cambian. */
.is-tabular {
  font-variant-numeric: tabular-nums;
}

.recipe {
  margin: 0;
  font-size: 1.25rem;
}

/* diagonal-fractions usa la característica «frac» de la fuente: el número de
   antes de la barra, pequeño y arriba; el de después, abajo. El texto sigue
   siendo «1/2»: se copia y se lee igual. */
.is-fraction {
  font-variant-numeric: diagonal-fractions;
}
```
