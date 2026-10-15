---
example_description: "El orden de pintado: el navegador pinta primero todos los fondos de los bloques y después todo el texto, así que el texto de una caja puede quedar encima del fondo de la siguiente; una caja posicionada se pinta después de todo"
example_tags: "css|z-index|orden-de-pintado|stacking"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="legend">La nota amarilla sube 36px sobre la azul con un margen negativo. ¿Qué queda encima en la zona en la que se solapan?</p>

<div class="column">
  <p class="caption">Ninguna posicionada</p>
  <div class="note first">El texto azul se ve ENCIMA del fondo amarillo</div>
  <div class="note second">Nota amarilla</div>
</div>

<div class="column">
  <p class="caption">La amarilla con <code>position: relative</code></p>
  <div class="note first">El texto azul queda tapado</div>
  <div class="note second is-positioned">Nota amarilla</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.legend,
.caption {
  font-size: 0.8rem;
}

.caption {
  margin: 0 0 4px;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

.note {
  box-sizing: border-box;
  height: 72px;
  padding: 44px 8px 0;              /* el texto, abajo: justo en la zona que se solapa */
  border: 2px solid;
  font-size: 0.85rem;
  font-weight: bold;
}

.first {
  border-color: #1d4ed8;
  background: #bfdbfe;
  color: #1e3a8a;
}

.second {
  margin: -36px 0 0 24px;           /* sube 36px y se monta sobre la primera */
  border-color: #a16207;
  background: #fde68a;
}

/* Dentro de un contexto de apilamiento, el navegador pinta POR FASES, no caja a caja:
   1. los fondos y bordes de los bloques, en el orden del HTML;
   2. los flotantes;
   3. el contenido en línea (texto, imágenes, inline-block), en el orden del HTML;
   4. las cajas posicionadas, en el orden del HTML (y luego por z-index, ejemplo 2).
   Sin position, el fondo amarillo (fase 1) se pinta ANTES que el texto azul (fase 3):
   el texto de la primera nota queda encima del fondo de la segunda. */

/* Una caja posicionada se pinta entera (fondo y texto) en la fase 4, después de todo lo
   demás: ahora sí tapa el texto azul. */
.is-positioned {
  position: relative;
}
```
