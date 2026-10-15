---
example_description: "¿Grid o flexbox? Unas etiquetas de tamaños distintos van mejor con flex-wrap (cada una mide su texto); un calendario mensual necesita grid (siete columnas fijas y el día 1 colocado en su columna)"
example_tags: "css|grid|flexbox|comparacion|calendario|etiquetas"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Etiquetas con <strong>flexbox</strong>: cada una mide su texto y, si no cabe, pasa a la línea siguiente ✅</p>
<ul class="tags is-flex">
  <li>Interior</li><li>Poca luz</li><li>Apta para mascotas</li><li>Colgante</li><li>Riego semanal</li><li>Purifica el aire</li>
</ul>

<p class="caption">Las mismas con <strong>grid</strong> (<code>auto-fill</code>): columnas iguales: a las cortas les sobra sitio y las largas se parten ⚠️</p>
<ul class="tags is-grid">
  <li>Interior</li><li>Poca luz</li><li>Apta para mascotas</li><li>Colgante</li><li>Riego semanal</li><li>Purifica el aire</li>
</ul>

<p class="caption">Un calendario con <strong>grid</strong>: siete columnas en dos dimensiones, y el 1 de octubre de 2026 (jueves) en la columna 4 ✅</p>
<div class="calendar" role="group" aria-label="Octubre de 2026">
  <b>L</b><b>M</b><b>X</b><b>J</b><b>V</b><b>S</b><b>D</b>
  <span class="first">1</span><span>2</span><span>3</span><span>4</span>
  <span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
  <span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span>
  <span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span>
  <span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span>
</div>
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

.tags {
  gap: 6px;
  max-width: 400px;
  margin: 0;
  padding: 6px;
  list-style: none;
  font-size: 0.75rem;
}

.tags li {
  padding: 2px 10px;
  border-radius: 999px;
}

/* Flexbox va del contenido hacia fuera: cada etiqueta mide su texto y la línea
   se reparte entre las que caben. Es una sola dimensión: no hace falta que las
   etiquetas de dos líneas queden en columna. */
.is-flex {
  display: flex;
  flex-wrap: wrap;
  outline: 2px dashed #7c3aed;
}

.is-flex li {
  border: 1px solid #4338ca;
  background: #e0e7ff;
}

/* Grid va del layout hacia dentro: primero las columnas, después el contenido.
   Aquí obliga a todas las etiquetas a medir lo mismo: un layout en dos
   dimensiones para un contenido que solo tiene una. */
.is-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
  outline: 2px dashed #0f766e;
}

.is-grid li {
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

/* El calendario SÍ es bidimensional: cada día tiene que caer bajo su día de la
   semana, fila tras fila. Siete columnas, y el día 1 colocado en la suya; los
   demás siguen solos (la colocación automática continúa desde ahí). */
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  max-width: 400px;
  outline: 2px dashed #0f766e;
  font-size: 0.75rem;
  text-align: center;
}

.calendar b {
  color: #0f5c55;
}

.calendar span {
  padding: 3px 0;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.calendar .first {
  grid-column-start: 4;
}
```
