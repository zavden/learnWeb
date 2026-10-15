---
example_description: "Cuatro usos de los desplazamientos de una caja absolute sobre una foto: una esquina, una franja estirada, una capa que lo cubre todo con inset: 0 y un botón centrado"
example_tags: "css|position|absolute|inset|offsets|porcentaje"
example_stage: minimal
example_importance: important
---

# HTML

```html
<figure class="scene">
  <span class="close">Cerrar ×</span>
  <figcaption class="code">top: 8px; right: 8px</figcaption>
</figure>

<figure class="scene">
  <figcaption class="caption">Lago de Sanabria, Zamora</figcaption>
  <span class="code">left, right y bottom: 0</span>
</figure>

<figure class="scene">
  <span class="sold-out">Agotado</span>
  <figcaption class="code">inset: 0</figcaption>
</figure>

<figure class="scene">
  <span class="play">▶ Ver vídeo</span>
  <figcaption class="code">inset: 0; margin: auto; width: 60%; height: 36%</figcaption>
</figure>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* Cada escena es la referencia (relative) de las cajas absolute que contiene. */
.scene {
  position: relative;
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  height: 96px;
  margin: 0 8px 36px 0;
  background: url("lake.svg") center / cover;
}

/* Los rótulos con el CSS van debajo de cada foto (también son absolute: top: 100%). */
.code {
  position: absolute;
  top: 100%;
  left: 0;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.7rem;
}

/* 1. Una esquina: dos desplazamientos. */
.close {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #ffffff;
  font-size: 0.75rem;
}

/* 2. Dos desplazamientos opuestos (left Y right) con width: auto ESTIRAN la caja:
   mide «ancho del bloque contenedor − left − right». */
.caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 4px 8px;
  background: rgb(15 23 42 / 0.85);
  color: #ffffff;
  font-size: 0.8rem;
}

/* 3. inset es el atajo de top, right, bottom y left (como margin, de 1 a 4 valores).
   inset: 0 pega los cuatro lados: la capa cubre toda la escena. */
.sold-out {
  position: absolute;
  inset: 0;
  padding-top: 36px;
  background: rgb(15 23 42 / 0.8);
  color: #ffffff;
  font-weight: bold;
  text-align: center;
}

/* 4. Con los cuatro lados a 0, un tamaño fijo y margin: auto, la caja se CENTRA en los dos ejes.
   Los porcentajes de width y height se calculan sobre el bloque contenedor (la escena).
   A diferencia del flujo normal, en una caja absolute el % de altura funciona aunque
   el bloque contenedor tenga height: auto. */
.play {
  position: absolute;
  inset: 0;
  width: 60%;
  height: 36%;
  margin: auto;
  border-radius: 999px;
  background: #ffffff;
  color: #1d4ed8;
  font-size: 0.85rem;
  font-weight: bold;
  line-height: 34px;
  text-align: center;
}
```
