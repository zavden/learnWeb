---
example_description: "La carta de un restaurante de ramen escrita en vertical: writing-mode: vertical-rl, cada platillo como una fila flex que corre de arriba abajo con su línea de puntos, precios con text-combine-upright y la traducción al español en una tabla horizontal"
example_tags: "css|modos-de-escritura|writing-mode|text-combine-upright|flexbox|japones|propiedades-logicas"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<div class="layout">
  <article class="menu" lang="ja" aria-labelledby="menu-title">
    <h2 id="menu-title" class="menu-title">お品書き</h2>
    <p class="shop">麺処 さくら</p>
    <ul class="dishes">
      <li><span class="dish">醤油ラーメン</span><span class="leader" aria-hidden="true"></span><span class="price"><span class="tcy">850</span>円</span></li>
      <li><span class="dish">味噌ラーメン</span><span class="leader" aria-hidden="true"></span><span class="price"><span class="tcy">900</span>円</span></li>
      <li><span class="dish">塩ラーメン</span><span class="leader" aria-hidden="true"></span><span class="price"><span class="tcy">850</span>円</span></li>
      <li><span class="dish">餃子（<span class="tcy">6</span>個）</span><span class="leader" aria-hidden="true"></span><span class="price"><span class="tcy">400</span>円</span></li>
      <li><span class="dish">替え玉</span><span class="leader" aria-hidden="true"></span><span class="price"><span class="tcy">150</span>円</span></li>
    </ul>
  </article>

  <table class="legend">
    <caption>La carta en español (precios en yenes)</caption>
    <tbody>
      <tr><th scope="row">Ramen de soya</th><td>850</td></tr>
      <tr><th scope="row">Ramen de miso</th><td>900</td></tr>
      <tr><th scope="row">Ramen de sal</th><td>850</td></tr>
      <tr><th scope="row">Gyozas (6 piezas)</th><td>400</td></tr>
      <tr><th scope="row">Porción extra de fideos</th><td>150</td></tr>
    </tbody>
  </table>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Carta vertical
   - La carta entera es vertical-rl: las líneas bajan y cada platillo es una
     columna nueva, a la izquierda de la anterior. inline-size es su ALTO.
   - Cada platillo es una fila flex: en vertical, la fila corre de arriba abajo
     (el eje inline). La línea de puntos crece con flex: 1, así que todos los
     precios terminan abajo, a la misma altura.
   - Los precios combinan sus cifras en el ancho de un carácter.
   - Márgenes, rellenos y bordes lógicos: funcionan igual en los dos modos.
   ────────────────────────────────────────────────────────────────────────── */
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

/* Pila de fuentes japonesas con remates: Hiragino Mincho en Mac, Yu Mincho en
   Windows, Noto Serif JP en Linux y Android. */
.menu {
  writing-mode: vertical-rl;
  inline-size: 17rem;
  padding: 16px 12px;
  border: 3px double #9a3412;
  background: #fff7ed;
  font-family: "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif;
}

.menu-title {
  margin: 0;
  font-size: 1.6rem;
  letter-spacing: 0.3em;
}

.shop {
  margin-block: 0 0.75em;       /* después de la columna: a su izquierda */
  margin-inline: 0;
  color: #9a3412;
  font-size: 0.95rem;
  text-align: end;              /* al final de la línea: abajo */
}

.dishes {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 1.1rem;
  line-height: 1.9;
}

.dishes li {
  display: flex;
  align-items: center;
}

/* Línea de puntos: una caja sin grosor (block-size: 0) con un borde punteado
   en su lado block-start. En vertical, ese lado es una línea vertical. */
.leader {
  flex: 1;
  block-size: 0;
  margin-inline: 0.4em;
  border-block-start: 2px dotted #94a3b8;
}

/* Tate-chū-yoko: los números, en horizontal dentro de una casilla. */
.tcy {
  text-combine-upright: all;
}

/* ─── La traducción, en horizontal ─── */
.legend {
  border-collapse: collapse;
  font-size: 0.85rem;
}

.legend caption {
  margin-block-end: 4px;
  font-weight: 700;
  text-align: start;
}

.legend th,
.legend td {
  padding: 3px 8px;
  border-block-end: 1px solid #cbd5e1;
  font-weight: 400;
  text-align: start;
}

.legend td {
  font-variant-numeric: tabular-nums;
  text-align: end;
}
```
