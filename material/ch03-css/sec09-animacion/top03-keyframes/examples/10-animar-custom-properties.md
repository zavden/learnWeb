---
example_description: "Una custom property sin registrar se anima de forma discreta: el anillo de progreso con conic-gradient se queda en 0 % la primera mitad del tiempo y salta al 75 % a la mitad. Registrada con @property y syntax <percentage>, se interpola y el anillo se llena poco a poco. Copias congeladas al 0, 20, 40, 60, 80 y 100 %"
example_tags: "css|animaciones|keyframes|custom-properties|property|conic-gradient|congelar|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Un anillo de progreso que se llena del 0 al 75 % en 2 s, a velocidad constante. Las copias están congeladas al 0, 20, 40, 60, 80 y 100 % del tiempo. Marca la casilla para el anillo en vivo.</p>
<label class="control"><input type="checkbox" id="play"> Subir las fotos</label>

<p class="label">❌ <code>--plain</code> sin registrar: 0, 0, 0, 75, 75 y 75 %</p>
<div class="row is-plain">
  <span class="ring" style="--t: 0"></span><span class="ring" style="--t: 0.2"></span><span class="ring" style="--t: 0.4"></span><span class="ring" style="--t: 0.6"></span><span class="ring" style="--t: 0.8"></span><span class="ring" style="--t: 1"></span><span class="ring is-live"></span>
</div>

<p class="label">✅ <code>--progress</code> registrada con <code>@property</code>: 0, 15, 30, 45, 60 y 75 %</p>
<div class="row is-typed">
  <span class="ring" style="--t: 0"></span><span class="ring" style="--t: 0.2"></span><span class="ring" style="--t: 0.4"></span><span class="ring" style="--t: 0.6"></span><span class="ring" style="--t: 0.8"></span><span class="ring" style="--t: 1"></span><span class="ring is-live"></span>
</div>
```

# CSS

```css
/* ✅ Registrada: el navegador sabe que es un porcentaje y puede calcular
   valores intermedios (lección de custom properties). */
@property --progress {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

/* Un anillo: un conic-gradient con parada dura en el progreso y una máscara
   radial que quita el centro (módulo de efectos visuales). */
.ring {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  mask-image: radial-gradient(circle, transparent 52%, #000 53%);
}

.is-plain .ring {
  --plain: 0%;
  background: conic-gradient(#15803d var(--plain), #e2e8f0 0);
}

.is-typed .ring {
  background: conic-gradient(#15803d var(--progress), #e2e8f0 0);
}

.is-live {
  outline: 2px solid #1d4ed8;
  outline-offset: 3px;
}

@keyframes fill-plain {
  from { --plain: 0%; }
  to   { --plain: 75%; }
}

@keyframes fill-typed {
  from { --progress: 0%; }
  to   { --progress: 75%; }
}

/* 🐛 Para el navegador, --plain es solo texto: «0%» y «75%» son dos trozos de
   texto sin nada en medio. Se anima de forma DISCRETA: el primer valor hasta
   la mitad del tiempo y el segundo desde la mitad. (En una transición, sin
   allow-discrete, ni eso: salta al principio, como en el ejemplo de la
   lección de custom properties.) */
.is-plain .ring {
  animation: fill-plain 1s linear both paused;
  animation-delay: calc(var(--t) * -1s);
}

.is-typed .ring {
  animation: fill-typed 1s linear both paused;
  animation-delay: calc(var(--t) * -1s);
}

/* En vivo: el cambio de color de un anillo no es movimiento; se anima siempre. */
.row .is-live {
  animation-name: none;
}

body:has(#play:checked) .is-plain .is-live {
  animation: fill-plain 2s linear both;
}

body:has(#play:checked) .is-typed .is-live {
  animation: fill-typed 2s linear both;
}
```
