---
example_description: "polygon() une puntos con rectas, en porcentajes del ancho y del alto de la caja: una flecha, un hexágono y una sección con el borde inferior inclinado, sobre una cuadrícula del 10 % para leer cada vértice"
example_tags: "css|recortes|clip-path|polygon|coordenadas"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Cajas de 200 × 120 sobre una cuadrícula: cada cuadro es un 10 % del ancho y un 10 % del alto. Los puntos (x y) se cuentan desde la esquina de arriba a la izquierda.</p>
<ul class="grid">
  <li>
    <div class="paper"><div class="shape is-arrow"></div></div>
    Flecha: <code>0 0, 75% 0, 100% 50%, 75% 100%, 0 100%, 25% 50%</code>
  </li>
  <li>
    <div class="paper"><div class="shape is-hexagon"></div></div>
    Hexágono: <code>25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%</code>
  </li>
  <li>
    <div class="paper"><div class="shape is-slanted"></div></div>
    Sección inclinada: <code>0 0, 100% 0, 100% 70%, 0 100%</code>
  </li>
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
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

/* Papel cuadriculado (lección de degradados): líneas cada 10 %. */
.paper {
  width: 200px;
  height: 120px;
  margin-bottom: 4px;
  outline: 1px solid #94a3b8;
  background-color: #ffffff;
  background-image:
    linear-gradient(#cbd5e1 1px, transparent 1px),
    linear-gradient(to right, #cbd5e1 1px, transparent 1px);
  background-size: 10% 10%;
}

/* La forma es semitransparente para que se vea la cuadrícula a través. */
.shape {
  height: 100%;
  background: rgb(37 99 235 / 0.7);
}

/* polygon() une los puntos EN ORDEN y cierra la forma volviendo al primero.
   Cada punto es «x y»: x en % del ancho, y en % del alto (o en px, rem…). */
.is-arrow {
  clip-path: polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%, 25% 50%);
}

.is-hexagon {
  clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
}

/* El patrón más común en una web: el fondo de una sección con el borde de
   abajo en diagonal. Al ser porcentajes, la diagonal se adapta al ancho. */
.is-slanted {
  clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
}
```
