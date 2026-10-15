---
example_description: "Dos casos en que aspect-ratio no consigue su proporción: con width y height a la vez se ignora (incluido el height que ponen los atributos de un <img>), y en una caja con texto el contenido la estira (su min-height es automático) salvo que tenga overflow distinto de visible o min-height: 0"
example_tags: "css|responsive|imagenes|aspect-ratio|min-height|overflow|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">Fotos con <code>aspect-ratio: 1</code> y <code>width: 120px</code>. Deberían ser cuadrados de 120 × 120.</p>
<div class="row">
  <figure><img class="photo is-both" src="tierra-apolo-17-480.jpg" alt="La Tierra vista desde el Apolo 17" width="480" height="480"><figcaption>❌ con <code>height: 80px</code>: 120 × 80, se ignora</figcaption></figure>
  <figure><img class="photo is-attr" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa" width="480" height="323"><figcaption>❌ sin <code>height</code> en el CSS: manda el atributo (323px)</figcaption></figure>
  <figure><img class="photo is-auto" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa" width="480" height="323"><figcaption>✅ <code>height: auto</code>: cuadrada</figcaption></figure>
</div>

<p class="label">Citas con <code>aspect-ratio: 1</code> y <code>width: 140px</code>. Deberían ser cuadradas.</p>
<div class="row">
  <blockquote class="quote">❌ «El buen pan pide tiempo, harina honrada y paciencia.» Y la caja crece para que quepa todo.</blockquote>
  <blockquote class="quote is-scroll">✅ <code>overflow: auto</code>: cuadrada, con scroll. «El buen pan pide tiempo, harina honrada y paciencia.»</blockquote>
</div>
<p class="credit">NASA, Apolo 17, 1972; Hokusai, c. 1831. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.label, .credit { margin: 8px 0 4px; font-size: 0.72rem; }
.row { display: flex; flex-wrap: wrap; gap: 12px; align-items: start; }
figure { width: 120px; margin: 0; }
figcaption { margin-top: 4px; font-size: 0.65rem; }

.photo { display: block; width: 120px; aspect-ratio: 1; object-fit: cover; outline: 2px solid #7c3aed; }

/* 🐛 aspect-ratio solo calcula un lado que sea auto. Con los dos fijados, no
   tiene nada que calcular y se ignora. */
.is-both { height: 80px; }

/* 🐛 El caso que nadie ve: los atributos width y height de un <img> cuentan
   como width y height en CSS. Si el CSS solo cambia el ancho, el alto sigue
   siendo el del atributo (323px) y aspect-ratio vuelve a no tener nada que
   calcular. */

/* ✅ height: auto deja el alto libre para que aspect-ratio lo calcule. */
.is-auto { height: auto; }

.quote {
  width: 140px;
  aspect-ratio: 1;
  margin: 0;
  padding: 8px;
  box-sizing: border-box;
  border-left: 4px solid #b45309;
  background: #fef3c7;
  font-size: 0.8rem;
}

/* 🐛 En una caja con contenido, aspect-ratio es un mínimo (lección de
   tamaños): su min-height automático es el alto del contenido, y si el texto
   no cabe, la caja crece.
   ✅ Con overflow distinto de visible (auto, hidden), el mínimo automático
   pasa a 0: la caja se queda cuadrada y el texto se desplaza dentro. Con
   min-height: 0 también se queda cuadrada, pero el texto se sale. */
.is-scroll { overflow: auto; }
```
