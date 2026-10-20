---
example_description: "sass:color deriva colores al compilar: color.scale para fondos y hovers, color.mix para mezclar y color.change para la transparencia"
example_tags: "sass|sass-color|color|modulos"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="swatches">
  <span class="swatch base">base</span>
  <span class="swatch hover">scale -25%</span>
  <span class="swatch tint">scale +85%</span>
  <span class="swatch mix">mix 20%</span>
  <span class="swatch ghost">alpha 0.15</span>
</div>
<button type="button" class="btn">Pasa el ratón</button>
<div class="note">Aviso con fondo y borde derivados del mismo color.</div>
```

# SCSS

```scss
@use "sass:color";

$brand: #2563eb;

// color.scale mueve un canal un PORCENTAJE de lo que le queda hasta el límite:
// lightness -25% = un 25 % más cerca del negro; +85% = un 85 % más cerca del blanco.
$brand-hover: color.scale($brand, $lightness: -25%);
$brand-tint: color.scale($brand, $lightness: 85%);

// color.mix mezcla dos colores: 20 % de $brand y 80 % de blanco.
$brand-mix: color.mix($brand, #ffffff, 20%);

// color.change FIJA un canal a un valor; aquí, la opacidad.
$brand-ghost: color.change($brand, $alpha: 0.15);

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.swatch {
  padding: 16px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.base  { background: $brand; color: #ffffff; }
.hover { background: $brand-hover; color: #ffffff; }
.tint  { background: $brand-tint; }
.mix   { background: $brand-mix; }
.ghost { background: $brand-ghost; }

.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: $brand;
  color: #ffffff;
  font: inherit;

  &:hover {
    background: $brand-hover;
  }
}

.note {
  margin-top: 12px;
  padding: 10px 14px;
  border-left: 6px solid $brand;
  background: $brand-tint;
}

// En compiled.css verás colores como rgb(222.3, 231.6, 252): desde Dart Sass
// 1.79 los colores calculados conservan los decimales. Es CSS válido.
// También existe color.adjust($brand, $lightness: -10%), que suma una cantidad
// FIJA (equivale al antiguo darken()). color.scale suele dar mejores resultados.
```
