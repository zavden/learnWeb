---
example_description: "Las funciones de transform se aplican en orden y cada una mueve los ejes de la caja para la siguiente: translateX(120px) rotate(45deg) va a la derecha, pero rotate(45deg) translateX(120px) va en diagonal; scale(2) antes de translateX duplica el desplazamiento"
example_tags: "css|transformaciones|transform|orden|rotate|translate|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Las mismas dos funciones en distinto orden. La flecha blanca es el eje x <strong>de la caja</strong>: hacia ahí avanza un <code>translateX</code>.</p>

<p class="label"><code>translateX(120px) rotate(45deg)</code>: primero va 120px a la derecha, después gira en su sitio</p>
<div class="stage"><div class="box is-move-then-turn"></div></div>

<p class="label">🐛 <code>rotate(45deg) translateX(120px)</code>: primero gira, y su eje x con ella; los 120px van en diagonal, hacia abajo</p>
<div class="stage"><div class="box is-turn-then-move"></div></div>

<p class="label">Con <code>scale</code>: los dos cuadrados verdes salen de x = 20…50 (centro en 35)</p>
<div class="stage is-scale">
  <div class="box is-small is-move-then-scale">A</div>
  <div class="box is-small is-scale-then-move">B</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
<p class="label">A, <code>translateX(60px) scale(2)</code>: centro en 95, se ha movido 60px. B, <code>scale(2) translateX(60px)</code>: centro en 155, se ha movido 120px, porque después de <code>scale(2)</code> cada píxel del eje mide 2.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.stage {
  position: relative;
  width: 400px;
  height: 180px;
  background: #f1f5f9;
}

.ruler {
  display: block;
}

/* El sitio original de la caja, discontinuo. */
.stage::before,
.box {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  box-sizing: border-box;
}

.stage::before {
  content: "";
  border: 2px dashed #94a3b8;
}

.box {
  background: #1d4ed8;
}

/* El eje x de la caja: una flecha que apunta a su derecha (gira con ella). */
.box::after {
  content: "→";
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-weight: 700;
}

/* Lectura de izquierda a derecha: cada función mueve los EJES de la caja, y
   la siguiente trabaja con los ejes ya movidos.
   translateX(120px): la caja, con sus ejes, va 120px a la derecha.
   rotate(45deg): gira en su nuevo sitio. Resultado: 120px a la derecha. */
.is-move-then-turn { transform: translateX(120px) rotate(45deg); }

/* 🐛 rotate(45deg): gira la caja Y SU EJE x, que ahora apunta abajo a la
   derecha. translateX(120px): avanza 120px por ese eje inclinado, que en la
   pantalla son 85px a la derecha y 85px hacia abajo (120 × cos 45° ≈ 85). */
.is-turn-then-move { transform: rotate(45deg) translateX(120px); }

/* El tercer escenario: dos cuadrados de 30 × 30 en filas distintas. */
.is-scale {
  height: 150px;
}

.is-scale::before {
  top: 15px;
  width: 30px;
  height: 100px;                 /* el sitio original de los dos */
}

.is-small {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  background: rgb(21 128 61 / 0.85);
  color: #ffffff;
  font-size: 0.6rem;
  font-weight: 700;
}

.is-small::after {
  content: none;
}

.is-move-then-scale {
  top: 15px;
  transform: translateX(60px) scale(2);
}

.is-scale-then-move {
  top: 85px;
  transform: scale(2) translateX(60px);
}
```
