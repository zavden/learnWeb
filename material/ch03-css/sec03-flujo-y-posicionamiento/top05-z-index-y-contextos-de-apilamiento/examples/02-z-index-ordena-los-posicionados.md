---
example_description: "Entre cajas posicionadas que se solapan, sin z-index gana la última del HTML; con z-index gana el número mayor"
example_tags: "css|z-index|position|stacking"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="column">
  <p class="caption">Sin <code>z-index</code>: encima, la última del HTML</p>
  <div class="stack">
    <div class="photo photo-1">1.ª en el HTML</div>
    <div class="photo photo-2">2.ª</div>
    <div class="photo photo-3">3.ª</div>
  </div>
</div>

<div class="column">
  <p class="caption">Con <code>z-index</code>: encima, el número mayor</p>
  <div class="stack">
    <div class="photo photo-1 z-3">1.ª · z-index: 3</div>
    <div class="photo photo-2 z-1">2.ª · z-index: 1</div>
    <div class="photo photo-3 z-2">3.ª · z-index: 2</div>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

.stack {
  position: relative;
  height: 120px;
}

/* Tres «fotos» absolute que se solapan en diagonal. */
.photo {
  position: absolute;
  width: 120px;
  height: 64px;
  padding: 4px 6px;
  border: 3px solid #ffffff;
  box-shadow: 0 2px 8px rgb(15 23 42 / 0.35);
  font-size: 0.75rem;
  font-weight: bold;
}

.photo-1 { top: 0;    left: 0;    background: #bfdbfe; }
.photo-2 { top: 24px; left: 28px; background: #bbf7d0; }
.photo-3 { top: 48px; left: 56px; background: #fde68a; }

/* z-index solo funciona en cajas posicionadas (y en hijos de flex y grid).
   Ordena en el eje Z: el número mayor se pinta encima. Admite negativos.
   Con el mismo z-index (o sin él), desempata el orden del HTML: gana la última. */
.z-1 { z-index: 1; }
.z-2 { z-index: 2; }
.z-3 { z-index: 3; }
```
