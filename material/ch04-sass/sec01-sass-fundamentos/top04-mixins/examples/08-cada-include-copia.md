---
example_description: "Cada @include copia todas las declaraciones del mixin: para variantes que solo cambian colores, unas custom properties generan mucho menos CSS"
example_tags: "sass|mixins|custom-properties|rendimiento|arquitectura"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p>Con un mixin (cada variante copia 8 declaraciones):</p>
<div class="row">
  <span class="badge-a badge-a--info">Info</span>
  <span class="badge-a badge-a--success">Enviado</span>
  <span class="badge-a badge-a--warning">Pendiente</span>
  <span class="badge-a badge-a--danger">Cancelado</span>
</div>
<p>Con una clase base y custom properties (cada variante cambia 2 valores):</p>
<div class="row">
  <span class="badge badge--info">Info</span>
  <span class="badge badge--success">Enviado</span>
  <span class="badge badge--warning">Pendiente</span>
  <span class="badge badge--danger">Cancelado</span>
</div>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.row {
  display: flex;
  gap: 8px;
}

// ── A) Un mixin con todo el componente ─────────────────────────────
@mixin badge($bg, $fg) {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.02em;
  background: $bg;
  color: $fg;
}

// Cuatro @include = cuatro copias de las 8 declaraciones (míralo en compiled.css).
.badge-a--info    { @include badge(#e0f2fe, #0c4a6e); }
.badge-a--success { @include badge(#dcfce7, #14532d); }
.badge-a--warning { @include badge(#fef3c7, #78350f); }
.badge-a--danger  { @include badge(#fee2e2, #7f1d1d); }

// ── B) Una clase base + custom properties ─────────────────────────
// Las declaraciones comunes se escriben UNA vez; cada variante solo cambia datos.
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.02em;
  background: var(--badge-bg);
  color: var(--badge-fg);
}

.badge--info    { --badge-bg: #e0f2fe; --badge-fg: #0c4a6e; }
.badge--success { --badge-bg: #dcfce7; --badge-fg: #14532d; }
.badge--warning { --badge-bg: #fef3c7; --badge-fg: #78350f; }
.badge--danger  { --badge-bg: #fee2e2; --badge-fg: #7f1d1d; }

// Se ven igual, pero A genera unas 45 líneas de CSS y B unas 30. Con 20
// variantes y un componente más grande, la diferencia son kilobytes.
// Los mixins brillan cuando la LÓGICA cambia (media queries, estados,
// argumentos que deciden qué se escribe), no cuando solo cambian datos.
```
