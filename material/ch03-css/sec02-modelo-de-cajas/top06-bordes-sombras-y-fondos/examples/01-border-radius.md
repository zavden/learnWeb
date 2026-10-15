---
example_description: "border-radius redondea esquinas: un valor, uno por esquina, radios elípticos con / y los trucos del círculo (50%) y la píldora"
example_tags: "css|bordes|border-radius"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="row">
  <div class="shape one">12px</div>
  <div class="shape corners">24px 4px</div>
  <div class="shape ellipse">50% / 20%</div>
  <div class="shape circle">50%</div>
  <div class="shape pill">Píldora 999px</div>
  <div class="shape leaf">60px 0</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.shape {
  display: inline-grid;          /* inline-grid solo para centrar el texto: grid llega más adelante */
  place-items: center;
  width: 120px;
  height: 80px;
  margin: 8px;
  background: #bfdbfe;
  border: 3px solid #1d4ed8;
  font-size: 0.85rem;
}

.one     { border-radius: 12px; }
.corners { border-radius: 24px 4px; }        /* sup-izq e inf-der · sup-der e inf-izq */
.ellipse { border-radius: 50% / 20%; }        /* radios horizontales / radios verticales */
.circle  { width: 80px; border-radius: 50%; } /* caja cuadrada + 50% = círculo */
.pill    { width: 160px; border-radius: 999px; }   /* un radio enorme se limita a la mitad del lado corto */
.leaf    { border-radius: 60px 0; }
```
