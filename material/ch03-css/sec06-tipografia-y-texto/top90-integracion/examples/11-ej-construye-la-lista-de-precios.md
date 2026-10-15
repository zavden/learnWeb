---
exercise: true
exercise_title: "Construye la lista de precios"
exercise_instructions: "Haz que todas las cifras de los precios midan lo mismo de ancho, para que formen columnas (TODO 1) || Alinea los precios, y su cabecera, al final de la celda (TODO 2) || Recorta los nombres largos en una sola línea terminada en «…» (TODO 3) || Pon las cabeceras de columna en mayúsculas pequeñas con un poco de aire entre letras, medido en em y sin tocar el HTML (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "Es una de las propiedades font-variant-*: la de los números || Ni left ni right: el valor que sigue la dirección del texto || Hacen falta tres propiedades juntas, y el span tiene que comportarse como un bloque || text-transform para las mayúsculas; letter-spacing entre 0.04em y 0.15em"
exercise_solution_example: 11-ej-construye-la-lista-de-precios-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: dar forma tipográfica a una lista de precios sin estilos de texto (cifras tabulares, alineación al final, recorte con puntos suspensivos y cabeceras en mayúsculas espaciadas), con un script que mide el resultado en directo"
example_tags: "css|ejercicio|tipografia|tabular-nums|text-align|text-overflow|letter-spacing"
---

# HTML

```html
<table class="prices">
  <caption>Panadería La Espiga · lista de precios</caption>
  <thead>
    <tr>
      <th scope="col" class="col-product">Producto</th>
      <th scope="col" class="col-weight">Peso</th>
      <th scope="col" class="col-price">Precio</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><span class="product">Concha de vainilla</span></td><td>90&nbsp;g</td><td class="price"><data value="18.5">$18.50</data></td></tr>
    <tr><td><span class="product">Mantecada</span></td><td>60&nbsp;g</td><td class="price"><data value="11.1">$11.10</data></td></tr>
    <tr><td><span class="product">Caja surtida de seis piezas</span></td><td>540&nbsp;g</td><td class="price"><data value="111">$111.00</data></td></tr>
    <tr><td><span class="product">Pan de muerto grande</span></td><td>450&nbsp;g</td><td class="price"><data value="145">$145.00</data></td></tr>
    <tr><td><span class="product">Pastel de tres leches para doce personas con fresas</span></td><td>2&nbsp;kg</td><td class="price"><data value="860">$860.00</data></td></tr>
  </tbody>
</table>

<ul class="checklist">
  <li>Cifras del mismo ancho: <output id="check-digits">…</output></li>
  <li>Precios alineados al final: <output id="check-align">…</output></li>
  <li>Nombres largos recortados con «…»: <output id="check-ellipsis">…</output></li>
  <li>Cabeceras en mayúsculas con aire: <output id="check-headers">…</output></li>
</ul>
```

# CSS

```css
@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

body {
  color: #1e293b;
  font-family: Literata, Georgia, serif;
}

/* El esqueleto de la tabla ya está hecho: anchos fijos por columna. */
.prices {
  inline-size: 100%;
  max-inline-size: 24rem;
  border-collapse: collapse;
  table-layout: fixed;
}

.prices caption {
  margin-block-end: 6px;
  font-weight: 700;
  text-align: start;
}

.col-product { inline-size: 55%; }
.col-weight  { inline-size: 20%; }
.col-price   { inline-size: 25%; }

/* Base de las celdas con especificidad cero (:where, lección de especificidad):
   cualquier regla con una clase, como .price, la sobrescribe. */
:where(.prices th, .prices td) {
  padding: 4px 8px;
  border-block-end: 1px solid #cbd5e1;
  text-align: start;
}

/* TODO 4: cabeceras en mayúsculas pequeñas, con aire entre letras (en em). */
.prices th {
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
}

/* TODO 1: cifras del mismo ancho. */
/* TODO 2: alineadas al final de la celda (y la cabecera .col-price también). */
.price {
}

/* TODO 3: una sola línea terminada en «…». */
.product {
}

.checklist {
  padding-inline-start: 1.2em;
  color: #475569;
  font-family: system-ui, sans-serif;
  font-size: 0.8rem;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide las cajas,
// lee los estilos calculados y escribe ✅ o ❌ en la lista (y en la consola).
// No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

function runChecks() {
  // Precios con el mismo número de caracteres deben medir lo mismo.
  const groups = {};
  for (const price of document.querySelectorAll('.price data')) {
    const key = price.textContent.length;
    (groups[key] ??= []).push(price.getBoundingClientRect().width);
  }
  const spread = Math.max(...Object.values(groups).map((list) => Math.max(...list) - Math.min(...list)));
  check('check-digits', spread < 0.3, `diferencia máxima entre precios de igual longitud: ${spread.toFixed(1)} px`);

  const aligns = [document.querySelector('.price'), document.querySelector('.col-price')]
    .map((cell) => getComputedStyle(cell).textAlign);
  check('check-align', aligns.every((align) => align === 'end' || align === 'right'),
    `celda: ${aligns[0]}, cabecera: ${aligns[1]}`);

  const longName = document.querySelectorAll('.product')[4];
  const cut = getComputedStyle(longName).textOverflow === 'ellipsis' && longName.scrollWidth > longName.clientWidth;
  check('check-ellipsis', cut, `contenido ${longName.scrollWidth} px en una caja de ${longName.clientWidth} px`);

  const header = getComputedStyle(document.querySelector('.prices th'));
  const spacing = (parseFloat(header.letterSpacing) || 0) / parseFloat(header.fontSize);
  check('check-headers', header.textTransform === 'uppercase' && spacing >= 0.04 && spacing <= 0.15,
    `text-transform: ${header.textTransform}, letter-spacing: ${spacing.toFixed(2)}em`);
}

// Las medidas dependen de la fuente: primero, esperar a que llegue Literata.
document.fonts.load('1rem Literata').then(runChecks, runChecks);
```
