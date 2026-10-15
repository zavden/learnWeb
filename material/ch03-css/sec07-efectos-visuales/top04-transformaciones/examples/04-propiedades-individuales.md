---
example_description: "translate, rotate y scale como propiedades sueltas no se pisan entre sí (un :hover con scale conserva el giro) y se aplican siempre en el mismo orden, translate, rotate, scale, aunque las escribas al revés"
example_tags: "css|transformaciones|translate|rotate|scale|hover|cascada|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Notas adhesivas giradas que deberían crecer un poco al pasar el ratón sin perder el giro. A la derecha, una copia fija del estado <code>:hover</code>.</p>

<p class="label">❌ <code>transform: rotate(-4deg)</code> y, en <code>:hover</code>, <code>transform: scale(1.15)</code>: la nota se endereza</p>
<div class="row is-broken">
  <p class="note">Comprar maíz para tamales</p>
  <p class="note is-hover">Comprar maíz para tamales</p>
</div>

<p class="label">✅ <code>rotate: -4deg</code> y, en <code>:hover</code>, <code>scale: 1.15</code>: cada propiedad conserva su valor</p>
<div class="row is-fixed">
  <p class="note">Comprar maíz para tamales</p>
  <p class="note is-hover">Comprar maíz para tamales</p>
</div>

<p class="label">🐛 El orden es fijo. Azul: <code>rotate: 45deg; translate: 120px 0</code>, escritas en ese orden, va <strong>a la derecha</strong>, como si <code>translate</code> fuera primero. Ámbar: <code>transform: rotate(45deg) translateX(120px)</code> gira antes de avanzar.</p>
<div class="stage">
  <div class="box is-props"></div>
  <div class="box is-transform"></div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.row {
  display: flex;
  gap: 40px;
  padding: 10px 16px;
}

.note {
  width: 130px;
  margin: 0;
  padding: 14px 10px;
  background: #fef08a;
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.25);
  font-size: 0.8rem;
}

/* ❌ transform es UNA propiedad con una lista: la del :hover sustituye entera
   a la anterior, y el giro desaparece (como filter, en la lección de filtros). */
.is-broken .note {
  transform: rotate(-4deg);
}

.is-broken .note:hover,
.is-broken .note.is-hover {
  transform: scale(1.15);
}

/* ✅ translate, rotate y scale son propiedades INDEPENDIENTES: cada regla
   cambia solo la suya. (El cambio es instantáneo: las transiciones llegan en
   el módulo de animación.) */
.is-fixed .note {
  rotate: -4deg;
}

.is-fixed .note:hover,
.is-fixed .note.is-hover {
  scale: 1.15;
}

.stage {
  position: relative;
  max-width: 400px;
  height: 170px;
  background: #f1f5f9;
}

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

/* 🐛 Da igual el orden en que las escribas: el navegador aplica siempre
   translate, después rotate, después scale, y por último transform.
   Equivale a transform: translate(120px, 0) rotate(45deg). */
.is-props {
  background: rgb(29 78 216 / 0.85);
  rotate: 45deg;
  translate: 120px 0;
}

/* Con transform, el orden lo decides tú: girar y luego avanzar por el eje
   girado (lo viste en el ejemplo anterior). */
.is-transform {
  background: rgb(180 83 9 / 0.85);
  transform: rotate(45deg) translateX(120px);
}
```
