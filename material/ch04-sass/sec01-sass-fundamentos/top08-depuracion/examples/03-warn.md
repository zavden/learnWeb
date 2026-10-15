---
example_description: "@warn avisa a quien usa tu mixin sin detener la compilación: un tamaño desconocido se sustituye por el normal y el aviso sale en sass-output.txt"
example_tags: "sass|depuracion|warn|mixins|mapas"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="toolbar">
  <button type="button" class="btn-small">Pequeño</button>
  <button type="button" class="btn-normal">Normal</button>
  <button type="button" class="btn-huge">¿Enorme?</button>
</div>
<p>El tercer botón pidió el tamaño <code>xl</code>, que no existe: sale con el normal y hay un aviso en <code>sass-output.txt</code>.</p>
```

# SCSS

```scss
@use "sass:map";

$button-sizes: (
  sm: 4px 10px,
  md: 8px 16px,
  lg: 12px 24px,
);

@mixin button-size($size) {
  @if not map.has-key($button-sizes, $size) {
    // @warn imprime un aviso y SIGUE compilando. En sass-output.txt: la línea del
    // @include que lo provocó y, debajo, la pila (la de este @warn, la 13).
    @warn "button-size(): no existe el tamaño «#{$size}». Uso «md». Opciones: #{map.keys($button-sizes)}.";
    $size: md;
  }

  padding: map.get($button-sizes, $size);
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
}

[class^="btn-"] {
  border: 0;
  border-radius: 6px;
  background: #1e40af;
  color: #ffffff;
  font: inherit;
}

.btn-small  { @include button-size(sm); }
.btn-normal { @include button-size(md); }
.btn-huge   { @include button-size(xl); }   // ← provoca el @warn

// @warn es para errores LEVES, cuando hay una alternativa razonable: la página
// funciona y quien compila se entera. Para errores graves, @error (siguiente ejemplo).
```
