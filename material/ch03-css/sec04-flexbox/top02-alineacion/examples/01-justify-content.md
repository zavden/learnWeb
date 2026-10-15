---
example_description: "justify-content reparte el espacio sobrante en el eje principal: al inicio, al centro, al final o entre los elementos (between, around, evenly)"
example_tags: "css|flexbox|justify-content|alineacion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Tres elementos de 40px en un contenedor de 300px: sobran 180px. <code>justify-content</code> decide dónde van.</p>

<div class="demo"><code>flex-start</code><div class="box is-start"><span>1</span><span>2</span><span>3</span></div></div>
<div class="demo"><code>center</code><div class="box is-center"><span>1</span><span>2</span><span>3</span></div></div>
<div class="demo"><code>flex-end</code><div class="box is-end"><span>1</span><span>2</span><span>3</span></div></div>
<div class="demo"><code>space-between</code><div class="box is-between"><span>1</span><span>2</span><span>3</span></div></div>
<div class="demo"><code>space-around</code><div class="box is-around"><span>1</span><span>2</span><span>3</span></div></div>
<div class="demo"><code>space-evenly</code><div class="box is-evenly"><span>1</span><span>2</span><span>3</span></div></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

/* Cada fila: el nombre del valor y su contenedor de ejemplo. */
.demo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.demo code {
  width: 110px;
  font-size: 0.8rem;
}

.box {
  display: flex;
  width: 300px;
  border: 2px dashed #7c3aed;
}

.box span {
  box-sizing: border-box;      /* 40px con borde incluido: las cuentas salen redondas */
  width: 40px;
  border: 1px solid #4338ca;
  background: #e0e7ff;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

/* justify-content actúa en el EJE PRINCIPAL (aquí, horizontal) y solo reparte el
   espacio que SOBRA. Si los elementos llenan la línea, no hace nada. */
.is-start { justify-content: flex-start; }     /* por defecto (normal = flex-start)     */
.is-center { justify-content: center; }
.is-end { justify-content: flex-end; }

/* space-between: 0 en los extremos, el resto a partes iguales ENTRE ellos (90 + 90). */
.is-between { justify-content: space-between; }

/* space-around: cada elemento recibe medio hueco a cada lado (30 | 60 | 60 | 30):
   en los extremos queda la mitad que entre dos elementos. */
.is-around { justify-content: space-around; }

/* space-evenly: todos los huecos iguales, también los de los extremos (45 × 4). */
.is-evenly { justify-content: space-evenly; }
```
