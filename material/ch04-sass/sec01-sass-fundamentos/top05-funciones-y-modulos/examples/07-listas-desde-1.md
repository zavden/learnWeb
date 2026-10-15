---
example_description: "Las listas y las cadenas de Sass empiezan en 1, no en 0: list.nth($l, 1) es el PRIMER elemento y string.slice incluye los dos extremos"
example_tags: "sass|sass-list|sass-string|indices|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="card card-bad">❌ <code>list.nth($steps, 1)</code>: esperaba 8px (como <code>steps[1]</code> en Python)… y es 4px</div>
<div class="card card-good">✅ <code>list.nth($steps, 2)</code>: 8px, el segundo</div>
<div class="card card-last">✅ <code>list.nth($steps, -1)</code>: 32px, el último</div>
<p class="sku">Código de producto generado con <code>string.slice("Huerta", 1, 3)</code>: </p>
```

# SCSS

```scss
@use "sass:list";
@use "sass:string";

// Una lista separada por espacios (también valen comas).
$steps: 4px 8px 16px 32px;
//       1   2    3    4    ← así cuenta Sass
//       0   1    2    3    ← así cuenta Python

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.card {
  margin-bottom: 8px;
  border: 2px solid #7c3aed;
  background: #ede9fe;
}

// 🐛 Costumbre de Python: steps[1] es el SEGUNDO. En Sass, el índice 1 es el PRIMERO.
.card-bad {
  padding: list.nth($steps, 1);       // → 4px
}

.card-good {
  padding: list.nth($steps, 2);       // → 8px
}

// Los índices negativos cuentan desde el final, como en Python: -1 es el último.
.card-last {
  padding: list.nth($steps, -1);      // → 32px
}

// Las cadenas también empiezan en 1, y string.slice INCLUYE los dos extremos:
// string.slice("Huerta", 1, 3) → "Hue"   (en Python, "Huerta"[1:3] → "ue")
.sku::after {
  content: string.slice("Huerta", 1, 3) + "-2026";
  font-weight: bold;
}

// Y el índice 0 no existe: list.nth($steps, 0) detiene la compilación con
// «List index may not be 0.»
```
