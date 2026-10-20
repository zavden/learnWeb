---
example_description: "El calendario de octubre de 2026: siete columnas, el día 1 en la columna del jueves, y las actividades de varios días en una capa encima de los días, las dos con subgrid sobre las mismas pistas"
example_tags: "css|grid|subgrid|capas|span|colocacion|calendario"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="calendar" aria-labelledby="calendar-title">
  <h2 id="calendar-title">Octubre de 2026</h2>
  <div class="month">
    <div class="weekdays">
      <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
    </div>
    <ol class="days">
      <li><time datetime="2026-10-01">1</time></li>
      <li><time datetime="2026-10-02">2</time></li>
      <li><time datetime="2026-10-03">3</time></li>
      <li><time datetime="2026-10-04">4</time></li>
      <li><time datetime="2026-10-05">5</time></li>
      <li><time datetime="2026-10-06">6</time></li>
      <li><time datetime="2026-10-07">7</time></li>
      <li><time datetime="2026-10-08">8</time></li>
      <li><time datetime="2026-10-09">9</time></li>
      <li><time datetime="2026-10-10">10</time></li>
      <li><time datetime="2026-10-11">11</time></li>
      <li><time datetime="2026-10-12">12</time></li>
      <li aria-current="date"><time datetime="2026-10-13">13</time></li>
      <li><time datetime="2026-10-14">14</time></li>
      <li><time datetime="2026-10-15">15</time></li>
      <li><time datetime="2026-10-16">16</time></li>
      <li><time datetime="2026-10-17">17</time></li>
      <li><time datetime="2026-10-18">18</time></li>
      <li><time datetime="2026-10-19">19</time></li>
      <li><time datetime="2026-10-20">20</time></li>
      <li><time datetime="2026-10-21">21</time></li>
      <li><time datetime="2026-10-22">22</time></li>
      <li><time datetime="2026-10-23">23</time></li>
      <li><time datetime="2026-10-24">24</time></li>
      <li><time datetime="2026-10-25">25</time></li>
      <li><time datetime="2026-10-26">26</time></li>
      <li><time datetime="2026-10-27">27</time></li>
      <li><time datetime="2026-10-28">28</time></li>
      <li><time datetime="2026-10-29">29</time></li>
      <li><time datetime="2026-10-30">30</time></li>
      <li><time datetime="2026-10-31">31</time></li>
    </ol>
    <ul class="events" aria-label="Actividades del mes">
      <li class="event is-workshop">14 a 16 oct. · Taller de terrarios</li>
      <li class="event is-market">24 y 25 oct. · Mercado de plantas</li>
      <li class="event is-pruning">30 oct. · Poda de otoño</li>
    </ul>
  </div>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Calendario mensual
   - .month define las pistas: 7 columnas y 6 filas EXPLÍCITAS (la de los días
     de la semana y 5 semanas). Tienen que ser explícitas para que 2 / -1
     llegue hasta abajo (lección del grid implícito).
   - Tres hijos: la fila de días de la semana, la lista de días y la lista de
     actividades. Las dos listas ocupan las mismas celdas (2 / -1): son dos
     CAPAS, y con subgrid las dos usan las pistas de .month.
   - Días: el 1 de octubre de 2026 es jueves → columna 4; los demás siguen solos.
   - Actividades: colocadas por semana (fila) y día (columna), con span para las
     de varios días, y pegadas abajo de su celda con align-self: end.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  margin: 8px;
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.calendar h2 {
  margin: 0 0 8px;
  font-size: 1.15rem;
}

.month {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: auto repeat(5, minmax(3.5rem, auto));
  max-width: 30rem;
  border: 1px solid #94a3b8;
  font-size: 0.75rem;
}

.weekdays {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  background: #0f766e;
  color: #ffffff;
  font-weight: bold;
  text-align: center;
}

.weekdays span {
  padding: 4px 0;
}

/* Las dos capas: mismas celdas, mismas pistas. */
.days,
.events {
  display: grid;
  grid-column: 1 / -1;
  grid-row: 2 / -1;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.days li {
  padding: 3px 5px;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

/* El primer día, en la columna del jueves; el resto, detrás. */
.days li:first-child {
  grid-column-start: 4;
}

/* Sábados y domingos: con el 1 en jueves, son los días 3, 10, 17… y 4, 11, 18… */
.days li:nth-child(7n + 3),
.days li:nth-child(7n + 4) {
  background: #f1f5f9;
}

.days [aria-current="date"] time {
  padding: 0 5px;
  border-radius: 999px;
  background: #0f766e;
  color: #ffffff;
  font-weight: bold;
}

/* Cada actividad: fila = semana del mes (dentro de la capa, la 1 es la primera
   semana) y columna = día de la semana. */
.event {
  align-self: end;
  margin: 1.4rem 3px 3px;
  padding: 2px 5px;
  border-left: 3px solid #b45309;
  border-radius: 4px;
  background: #fef3c7;
  font-size: 0.65rem;
  line-height: 1.25;
}

.is-workshop {
  grid-column: 3 / span 3;     /* miércoles 14 a viernes 16 */
  grid-row: 3;
}

.is-market {
  grid-column: 6 / span 2;     /* sábado 24 y domingo 25 */
  grid-row: 4;
}

.is-pruning {
  grid-column: 5;              /* viernes 30 */
  grid-row: 5;
}
```
