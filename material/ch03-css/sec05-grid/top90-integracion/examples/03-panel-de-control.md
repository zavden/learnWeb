---
example_description: "Un panel de control: widgets en columnas auto-fill con filas implícitas de altura mínima, gráficas y listas que abarcan dos columnas o dos filas, dense para no dejar huecos y reading-flow para que el teclado siga el orden visual"
example_tags: "css|grid|grid-auto-rows|span|dense|reading-flow|accesibilidad|panel"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="label">⌨️ Haz clic en este texto y recorre los enlaces con <kbd>Tab</kbd>: con <code>dense</code>, «Clientes nuevos» se ve en la primera fila, y <code>reading-flow</code> hace que el foco llegue a él antes que a la gráfica (Chrome 137+).</p>

<main class="dashboard">
  <section class="widget">
    <h2>Ventas de hoy</h2>
    <p class="figure">18 450 MXN</p>
    <a href="/panel/ventas">Ver ventas</a>
  </section>

  <section class="widget">
    <h2>Pedidos</h2>
    <p class="figure">37</p>
    <a href="/panel/pedidos">12 por enviar</a>
  </section>

  <section class="widget is-chart">
    <h2>Pedidos de la semana</h2>
    <ol class="bars">
      <li style="--value: 60"><span class="bar"></span><span class="day">L 24</span></li>
      <li style="--value: 78"><span class="bar"></span><span class="day">M 31</span></li>
      <li style="--value: 45"><span class="bar"></span><span class="day">X 18</span></li>
      <li style="--value: 100"><span class="bar"></span><span class="day">J 40</span></li>
      <li style="--value: 90"><span class="bar"></span><span class="day">V 36</span></li>
      <li style="--value: 30"><span class="bar"></span><span class="day">S 12</span></li>
      <li style="--value: 20"><span class="bar"></span><span class="day">D 8</span></li>
    </ol>
    <a href="/panel/informes/semana">Informe completo</a>
  </section>

  <section class="widget">
    <h2>Clientes nuevos</h2>
    <p class="figure">9</p>
    <a href="/panel/clientes">Ver clientes</a>
  </section>

  <section class="widget is-wide">
    <h2>Próximos envíos</h2>
    <ul class="list">
      <li>Pedido 1042 · Monterrey · hoy</li>
      <li>Pedido 1045 · Puebla · mañana</li>
    </ul>
    <a href="/panel/envios">Ver todos</a>
  </section>

  <section class="widget">
    <h2>Reseñas</h2>
    <p class="figure">4,8 de 5</p>
    <a href="/panel/resenas">Leer reseñas</a>
  </section>

  <section class="widget is-tall">
    <h2>Stock bajo</h2>
    <ul class="list">
      <li>Calathea · 2</li>
      <li>Peperomia · 3</li>
      <li>Maceta 30 cm · 4</li>
      <li>Sustrato 5 L · 5</li>
    </ul>
    <a href="/panel/inventario">Reponer</a>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel de control
   - Columnas: auto-fill de al menos 8rem (con min() para contenedores
     estrechos). Filas: todas implícitas, de al menos 5.5rem (grid-auto-rows).
   - Tamaños: la gráfica abarca 2 × 2, los envíos 2 columnas y el stock 2 filas.
     Ojo: span 2 en una rejilla que se quede en UNA columna crearía una columna
     implícita (lección 3); por eso el panel tiene un min-width de dos columnas.
   - dense rellena los huecos que dejan las piezas grandes… y cambia el orden
     visual. reading-flow: grid-rows hace que el teclado lo siga.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  margin: 8px;
  color: #0f172a;
  font-family: system-ui, sans-serif;
}

.label {
  margin: 0 0 8px;
  font-size: 0.8rem;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 8rem), 1fr));
  grid-auto-rows: minmax(5.5rem, auto);
  grid-auto-flow: dense;
  gap: 8px;
  min-width: 18rem;            /* dos columnas de 8rem como mínimo: ver arriba */
  padding: 8px;
  border-radius: 12px;
  background: #e2e8f0;
  reading-flow: grid-rows;
}

.widget {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #ffffff;
  font-size: 0.8rem;
}

.widget h2 {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
}

.figure {
  margin: 0;
  font-size: 1.3rem;
  font-weight: bold;
}

/* El enlace, siempre al fondo del widget. */
.widget a {
  margin-top: auto;
  color: #0f5c55;
  font-weight: bold;
}

.widget a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.is-chart {
  grid-column: span 2;
  grid-row: span 2;
}

.is-wide {
  grid-column: span 2;
}

.is-tall {
  grid-row: span 2;
}

.list {
  margin: 4px 0;
  padding-left: 1.2em;
}

/* La gráfica: otra rejilla, de 7 columnas, con las barras abajo. */
.bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  height: 7rem;
  margin: 6px 0;
  padding: 0;
  list-style: none;
}

/* Cada día, una columna flex: la barra empujada abajo y la etiqueta debajo.
   --value es el porcentaje del máximo de la semana (40 pedidos). */
.bars li {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  min-width: 0;
}

.bar {
  height: calc(var(--value) * 0.75%);
  border-radius: 3px 3px 0 0;
  background: #0f766e;
}

.day {
  color: #334155;
  font-size: 0.65rem;
  text-align: center;
}
```
