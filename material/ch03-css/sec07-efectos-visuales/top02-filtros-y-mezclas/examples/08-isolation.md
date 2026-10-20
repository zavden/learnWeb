---
example_description: "Tres círculos con mix-blend-mode: multiply se mezclan también con las rayas del fondo de la página, porque se mezclan con todo lo que hay debajo en su contexto de apilamiento; isolation: isolate en su contenedor limita la mezcla al grupo"
example_tags: "css|mezclas|mix-blend-mode|isolation|contexto-de-apilamiento|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Tres círculos cian, magenta y amarillo con <code>mix-blend-mode: multiply</code>: donde se cruzan salen colores más oscuros (verde, rojo, azul… y casi negro en el centro), como al superponer tintas</p>
<div class="stage">
  <figure class="case">
    <div class="venn"><span class="c"></span><span class="m"></span><span class="y"></span></div>
    <figcaption>❌ Las rayas del fondo se ven a través de los círculos</figcaption>
  </figure>
  <figure class="case">
    <div class="venn is-isolated"><span class="c"></span><span class="m"></span><span class="y"></span></div>
    <figcaption>✅ <code>isolation: isolate</code> en el grupo</figcaption>
  </figure>
</div>
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

/* Un fondo de rayas: es lo que queda DEBAJO de los círculos. */
.stage {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
  padding: 12px;
  background: repeating-linear-gradient(-45deg, #334155 0 8px, #e2e8f0 8px 16px);
}

.case {
  margin: 0;
}

.case figcaption {
  width: 160px;
  margin-top: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  background: #ffffff;
  font-size: 0.7rem;
}

.venn {
  position: relative;
  width: 160px;
  height: 150px;
}

.venn span {
  position: absolute;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  mix-blend-mode: multiply;
}

.c { top: 0;    left: 0;    background: #00ffff; }
.m { top: 0;    right: 0;   background: #ff00ff; }
.y { bottom: 0; left: 32px; background: #ffff00; }

/* Nota: en una pantalla de gama amplia (Display P3, como la de un Mac), Chrome
   mezcla en el espacio de color de la pantalla, así que el azul sale violáceo
   y el centro granate oscuro, no los colores puros de la teoría (que sí da
   la fórmula en sRGB: cian × magenta = azul, los tres = negro).

   🐛 Un elemento con mix-blend-mode se mezcla con TODO lo pintado antes que
   él en su contexto de apilamiento: aquí, el contexto raíz, que incluye las
   rayas del contenedor. Cian × raya oscura = casi negro: las rayas atraviesan
   los círculos. */

/* ✅ isolation: isolate convierte el grupo en un contexto de apilamiento: los
   círculos se mezclan solo entre sí (sobre un lienzo transparente), y el
   resultado se pinta encima de las rayas de forma normal.
   (Cualquier cosa que cree un contexto aísla igual: opacity < 1, transform,
   filter… isolation es la forma de hacerlo sin ningún otro efecto.) */
.is-isolated {
  isolation: isolate;
}
```
