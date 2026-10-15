---
example_description: "conic-gradient() reparte los colores alrededor de un centro, empezando arriba y en sentido horario: con paradas duras en porcentajes es un gráfico de tarta, acompañado de una leyenda con los datos en texto"
example_tags: "css|degradados|conic-gradient|grafico-de-tarta|accesibilidad"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<div class="layout">
  <figure class="wheel-case">
    <div class="wheel" aria-hidden="true"></div>
    <figcaption>Colores alrededor del centro: empieza <strong>arriba</strong> (0deg) y gira en el sentido del reloj</figcaption>
  </figure>

  <figure class="chart">
    <figcaption>¿Cómo llegan a la biblioteca? <small>(encuesta a 120 lectores)</small></figcaption>
    <div class="chart-body">
      <!-- La tarta es decorativa para el lector de pantalla: los datos están en la leyenda. -->
      <div class="pie" aria-hidden="true"></div>
      <ul class="legend">
        <li><span class="swatch walk"></span>Caminando <strong>45 %</strong></li>
        <li><span class="swatch bus"></span>Transporte público <strong>30 %</strong></li>
        <li><span class="swatch bike"></span>Bicicleta <strong>15 %</strong></li>
        <li><span class="swatch car"></span>Coche <strong>10 %</strong></li>
      </ul>
    </div>
  </figure>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: start;
}

figure {
  margin: 0;
}

figcaption {
  font-size: 0.75rem;
}

.wheel-case {
  width: 130px;
}

/* Sin «from», el primer color está arriba (0deg) y los demás siguen en el
   sentido de las agujas del reloj hasta volver arriba (360deg). Para cerrar
   el círculo sin costura, el último color repite el primero. */
.wheel {
  width: 110px;
  aspect-ratio: 1;
  margin-bottom: 6px;
  border-radius: 50%;
  background-image: conic-gradient(#dc2626, #f59e0b, #16a34a, #0284c7, #7c3aed, #dc2626);
}

.chart figcaption {
  margin-bottom: 8px;
  font-weight: 600;
}

.chart-body {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* Cada porcentaje es una fracción de la vuelta (45 % = 162deg). Con paradas
   duras y el truco del «0» (se ajusta a la posición anterior), cada parada
   dice dónde ACABA su porción: el código se lee como una suma acumulada.
   Los colores alternan oscuro y claro: dos porciones vecinas contrastan al
   menos 3:1, y la leyenda repite los datos en texto (no solo en color). */
.pie {
  flex: none;
  width: 140px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-image: conic-gradient(
    #1e3a8a 0 45%,   /* caminando: de 0 a 45 */
    #fbbf24 0 75%,   /* transporte público: de 45 a 75 */
    #0f766e 0 90%,   /* bicicleta: de 75 a 90 */
    #f9a8d4 0        /* coche: hasta el final */
  );
}

.legend {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
  line-height: 1.9;
}

.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgb(15 23 42 / 0.3);   /* los claros, visibles sobre blanco */
  vertical-align: -1px;
}

.walk { background: #1e3a8a; }
.bus  { background: #fbbf24; }
.bike { background: #0f766e; }
.car  { background: #f9a8d4; }
```
