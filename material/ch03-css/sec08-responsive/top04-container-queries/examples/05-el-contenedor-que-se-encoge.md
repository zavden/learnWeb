---
example_description: "container-type: inline-size aplica contención de tamaño: el contenido ya no da ancho al contenedor. Si su ancho dependía del contenido (inline-block, un elemento flex que no crece, width: fit-content, un float), se encoge hasta su relleno y el texto se sale. El contenedor debe recibir su ancho de fuera"
example_tags: "css|responsive|container-queries|container-type|contencion|inline-block|fit-content|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Un aviso que se ajusta a su texto. Alguien le puso <code>container-type: inline-size</code> para adaptar su contenido a su ancho (para ver el problema no hace falta ninguna regla <code>@container</code>). El borde morado es la caja del contenedor.</p>

<p class="label">❌ <code>display: inline-block</code></p>
<p class="note is-inline-block">🚚 Envío gratis desde 800 MXN</p>

<p class="label">❌ Elemento de una fila flex (no crece: su ancho venía del texto)</p>
<div class="row"><p class="note">🚚 Envío gratis desde 800 MXN</p></div>

<p class="label">❌ <code>width: fit-content</code></p>
<p class="note is-fit-content">🚚 Envío gratis desde 800 MXN</p>

<p class="label">✅ El contenedor es el bloque de fuera, que toma su ancho del padre; el aviso, dentro, se ajusta a su texto</p>
<div class="note-slot"><p class="note is-inline-block is-plain">🚚 Envío gratis desde 800 MXN</p></div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .label { margin: 10px 0 4px; font-size: 0.72rem; }

.note {
  container-type: inline-size;
  margin: 0;
  padding: 6px 10px;
  outline: 2px solid #7c3aed;
  background: #ecfccb;
  font-size: 0.85rem;
}

.is-inline-block { display: inline-block; }
.is-fit-content { width: fit-content; }
.row { display: flex; gap: 8px; }

/* 🐛 POR QUÉ. Una container query cambia los estilos de lo de dentro según el
   ancho del contenedor. Si ese ancho dependiera de lo de dentro, habría un
   círculo: el texto da el ancho → la consulta cambia el texto → cambia el
   ancho… Para romperlo, container-type: inline-size aplica CONTENCIÓN DE
   TAMAÑO en el eje en línea: el navegador calcula el ancho del contenedor como
   si estuviera vacío. Si nadie le da un ancho de fuera, mide 0 + relleno, y el
   texto se desborda (una palabra por línea, saliéndose).
   Le pasa a todo lo que se ajusta a su contenido: inline-block, float, width:
   fit-content / max-content, elementos flex o grid que no se estiran. */

/* ✅ El contenedor es un bloque normal: su ancho lo pone el padre, no el
   contenido. El aviso de dentro ya no es contenedor y se ajusta a su texto. */
.note-slot { container-type: inline-size; padding: 4px; outline: 2px solid #7c3aed; }
.is-plain { container-type: normal; outline: none; }
```
