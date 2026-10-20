---
example_description: "Las funciones de transform: translate mueve, rotate gira, scale agranda o refleja y skew inclina; el recuadro discontinuo marca dónde estaba la caja, y un porcentaje en translate se mide con la propia caja"
example_tags: "css|transformaciones|transform|translate|rotate|scale|skew"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Cajas de 80 × 50. El recuadro discontinuo es su sitio original; la caja azul, el resultado de su <code>transform</code>.</p>
<ul class="grid">
  <li><div class="cell"><div class="box t-translate">Hola</div></div><code>translate(30px, 20px)</code></li>
  <li><div class="cell"><div class="box t-percent">Hola</div></div><code>translate(50%)</code>: 40px, la mitad de su ancho</li>
  <li><div class="cell"><div class="box t-rotate">Hola</div></div><code>rotate(30deg)</code>, en sentido horario</li>
  <li><div class="cell"><div class="box t-scale">Hola</div></div><code>scale(1.4)</code>, desde el centro</li>
  <li><div class="cell"><div class="box t-mirror">Hola</div></div><code>scale(-1, 1)</code>: un espejo</li>
  <li><div class="cell"><div class="box t-skew">Hola</div></div><code>skew(-20deg)</code>: inclinada</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 8px;
  font-size: 0.72rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

/* Cada celda tiene el recuadro del sitio original como ::before. */
.cell {
  position: relative;
  height: 110px;
  margin-bottom: 4px;
  background: #f1f5f9;
}

.cell::before,
.box {
  position: absolute;
  top: 30px;
  left: 30px;
  width: 80px;
  height: 50px;
  box-sizing: border-box;
}

.cell::before {
  content: "";
  border: 2px dashed #94a3b8;
}

.box {
  display: grid;
  place-items: center;
  background: rgb(29 78 216 / 0.85);
  color: #ffffff;
  font-weight: 700;
}

/* transform cambia cómo se PINTA la caja, no dónde está en el layout: el
   recuadro discontinuo (y cualquier vecino) no se entera de nada.
   Por defecto, todo se hace respecto al CENTRO de la caja. */
.t-translate { transform: translate(30px, 20px); }  /* x a la derecha, y hacia abajo */

/* Los % de translate se miden con la PROPIA caja (lección de unidades):
   el 50 % de 80px de ancho = 40px. */
.t-percent   { transform: translate(50%); }

/* Ángulos positivos: en el sentido de las agujas del reloj (el eje y de la
   pantalla apunta hacia abajo). */
.t-rotate    { transform: rotate(30deg); }

.t-scale     { transform: scale(1.4); }

/* Un factor negativo refleja la caja: el texto se lee en espejo. */
.t-mirror    { transform: scale(-1, 1); }

/* skew inclina los lados: los verticales se tumban 20° hacia la derecha. */
.t-skew      { transform: skew(-20deg); }
```
