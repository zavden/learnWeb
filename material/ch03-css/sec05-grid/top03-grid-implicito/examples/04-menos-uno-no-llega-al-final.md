---
example_description: "grid-row: 1 / -1 no ocupa todas las filas cuando las filas son implícitas: -1 es la última línea de la rejilla explícita; con filas explícitas (o span) la columna lateral llega hasta abajo"
example_tags: "css|grid|lineas-negativas|grid-row|grid-implicito|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ La presentación con <code>grid-row: 1 / -1</code>, sin filas definidas: ocupa solo la primera fila y las plantas se meten debajo</p>
<section class="catalog">
  <p class="intro"><strong>Plantas de interior</strong> Fáciles de cuidar y con poca luz.</p>
  <p class="plant">Monstera</p>
  <p class="plant">Pothos</p>
  <p class="plant">Sansevieria</p>
  <p class="plant">Calathea</p>
  <p class="plant">Peperomia</p>
  <p class="plant">Zamioculca</p>
</section>

<p class="caption">✅ Con <code>grid-template-rows: repeat(3, auto)</code>, -1 es la línea 4 y la presentación ocupa las tres filas</p>
<section class="catalog has-rows">
  <p class="intro"><strong>Plantas de interior</strong> Fáciles de cuidar y con poca luz.</p>
  <p class="plant">Monstera</p>
  <p class="plant">Pothos</p>
  <p class="plant">Sansevieria</p>
  <p class="plant">Calathea</p>
  <p class="plant">Peperomia</p>
  <p class="plant">Zamioculca</p>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.catalog {
  display: grid;
  grid-template-columns: 8rem repeat(2, 1fr);
  gap: 8px;
  max-width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.75rem;
}

.catalog > p {
  margin: 0;
  padding: 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.intro strong {
  display: block;
}

/* La presentación, en la primera columna y «de la primera fila a la última». */
.intro {
  grid-column: 1;
  grid-row: 1 / -1;
  border-color: #b45309;
  background: #fef3c7;
}

/* 🐛 Las líneas negativas cuentan desde el final de la rejilla EXPLÍCITA. Sin
   grid-template-rows no hay filas explícitas: solo existe la línea 1, y -1 es…
   la línea 1. «1 / -1» se queda en «1 / 1», y un inicio igual al fin se trata como
   «una fila». Las filas 2 y 3 son implícitas, -1 no las ve, y las plantas sin
   posición rellenan la columna 1 por debajo de la presentación. */

/* ✅ Filas explícitas: ahora hay 4 líneas horizontales y -1 es la 4.
   (grid-row: 1 / span 3 también valdría, si sabes cuántas filas habrá.) */
.has-rows {
  grid-template-rows: repeat(3, auto);
}
```
