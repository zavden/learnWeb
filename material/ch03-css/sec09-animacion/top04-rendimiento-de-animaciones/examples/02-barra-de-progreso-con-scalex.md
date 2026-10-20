---
example_description: "La barra de progreso de la lección de transformaciones, animada: con width hay layout en cada fotograma; con scale y transform-origin a la izquierda, solo composite. Pero scale también aplasta las esquinas redondeadas del relleno: el radio va en la pista, con overflow: hidden. Copias congeladas al 10 %"
example_tags: "css|rendimiento|scale|scalex|transform-origin|barra-de-progreso|border-radius|congelar"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Subida de <strong>huerto-mayo.jpg</strong> (2,4 MB). Marca la casilla: las tres barras se llenan en 3 s. A la derecha de cada una, la misma barra congelada al 10 %: compara la forma del relleno.</p>
<label class="control"><input type="checkbox" id="upload"> Subir el archivo</label>

<p class="label">❌ <code>width</code> de 0 a 100 %: layout en cada fotograma</p>
<div class="row"><span class="track is-clipping"><span class="fill is-width"></span></span><span class="track is-small is-clipping"><span class="fill is-width" style="--t: 0.1"></span></span></div>

<p class="label">🟡 <code>scale</code> con el radio en el relleno: barato, pero el extremo redondo se aplasta</p>
<div class="row"><span class="track"><span class="fill is-scale is-rounded"></span></span><span class="track is-small"><span class="fill is-scale is-rounded" style="--t: 0.1"></span></span></div>

<p class="label">✅ <code>scale</code> con el radio y <code>overflow: hidden</code> en la pista</p>
<div class="row"><span class="track is-clipping"><span class="fill is-scale"></span></span><span class="track is-small is-clipping"><span class="fill is-scale" style="--t: 0.1"></span></span></div>
```

# CSS

```css
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
  gap: 16px;
  align-items: center;
}

.track {
  display: block;
  width: 240px;
  height: 16px;
  border-radius: 8px;
  background: #e2e8f0;
}

/* La copia congelada, más ancha para ver el extremo: 120px al 10 % = 12px. */
.track.is-small {
  width: 120px;
}

.fill {
  display: block;
  height: 100%;
  background: #15803d;
}

/* ❌ El ancho cambia la geometría: layout, paint y composite en cada fotograma. */
.is-width {
  width: 0%;
}

@keyframes fill-width {
  to { width: 100%; }
}

/* scale: la barra mide siempre el 100 % y se encoge al pintarse. Con el origen
   a la izquierda, crece desde ahí (lección de transformaciones). Solo composite. */
.is-scale {
  transform-origin: left;
  scale: 0 1;
}

@keyframes fill-scale {
  to { scale: 1 1; }
}

/* 🟡 Pero scale encoge TODO lo que se pinta, también el radio: al 10 %, las
   esquinas de 8px quedan en 0,8px de ancho y la píldora se convierte en un
   rectángulo, también por la izquierda, donde debería encajar en la pista
   redonda. Y si el relleno tuviera texto («10 %»), se aplastaría igual. */
.is-rounded {
  border-radius: 8px;
}

/* ✅ El relleno es un rectángulo sin radio; la PISTA tiene el radio y recorta
   lo que sobresale: la izquierda siempre encaja y el extremo que avanza es
   recto, como en casi todas las barras. El texto, fuera del elemento escalado. */
.is-clipping {
  overflow: hidden;
}

/* Congeladas al 10 %. */
.is-small .is-width {
  animation: fill-width 1s linear both paused;
  animation-delay: calc(var(--t) * -1s);
}

.is-small .is-scale {
  animation: fill-scale 1s linear both paused;
  animation-delay: calc(var(--t) * -1s);
}

/* En vivo. Una barra de progreso no es «movimiento» decorativo: informa de
   algo que está pasando. Se anima también con «reducir movimiento». */
body:has(#upload:checked) .track:not(.is-small) .is-width {
  animation: fill-width 3s linear both;
}

body:has(#upload:checked) .track:not(.is-small) .is-scale {
  animation: fill-scale 3s linear both;
}
```
