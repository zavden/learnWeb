---
example_description: "margin-inline: auto centra un bloque con ancho definido; sin width no hay nada que repartir, y en vertical auto vale 0 en el flujo normal"
example_tags: "css|modelo-de-cajas|margin|auto|centrar"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="frame"><div class="box centered">✅ width: 60% + margin-inline: auto → centrado</div></div>
<div class="frame"><div class="box no-width">❌ margin-inline: auto sin width → ocupa todo, nada que repartir</div></div>
<div class="frame"><div class="box right">margin-left: auto → empujado a la derecha</div></div>
<div class="frame tall"><div class="box vertical">❌ margin-block: auto → en el flujo normal vale 0: no centra en vertical</div></div>
<p class="frame"><span class="box inline">❌ un span con margin-inline: auto no se mueve</span></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.frame {
  display: flow-root;
  background: #fed7aa;             /* el hueco naranja es el margen */
  margin: 0 0 12px;
}

.tall {
  height: 120px;
}

.box {
  background: #bfdbfe;
  padding: 8px 10px;
  font-size: 0.9rem;
}

/* El espacio libre de la línea (ancho del contenedor − ancho de la caja) se reparte
   a partes iguales entre los dos márgenes auto. */
.centered {
  width: 60%;
  margin-inline: auto;
}

/* Un bloque sin width ya mide todo el ancho disponible: no queda espacio libre. */
.no-width {
  margin-inline: auto;
}

/* Solo un lado auto: ese lado se queda con todo el espacio libre. */
.right {
  width: 50%;
  margin-left: auto;
}

/* En el flujo normal, un margen vertical auto se calcula como 0.
   (En flexbox y grid sí centra: lo verás en esos módulos.) */
.vertical {
  width: 60%;
  margin-block: auto;
}

/* Los elementos inline no tienen «ancho propio» que centrar: auto no hace nada. */
.inline {
  margin-inline: auto;
}
```
