---
example_description: "color-mix() mezcla dos colores en un espacio de color: tonos más claros, más oscuros y versiones translúcidas de un color base"
example_tags: "css|color|color-mix|oklch"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p>Todas estas muestras salen de un solo color base, <code>#2563eb</code>:</p>
<p>
  <span class="chip tint-80">+80 % blanco</span><span class="chip tint-50">+50 % blanco</span><span class="chip base">base</span><span class="chip shade-30">+30 % negro</span><span class="chip shade-60">+60 % negro</span>
</p>
<p><span class="chip see-through">+50 % transparent</span> ← mezclado con transparente: deja ver el fondo de la página</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  background: #fef3c7;
}

/* (display: inline-block deja dar tamaño a una caja dentro de una línea: módulo del modelo de cajas.) */
.chip {
  display: inline-block;
  padding: 10px 6px;
  margin-right: 4px;
  font-size: 0.8rem;
}

/* color-mix(in ESPACIO, COLOR_A PORCENTAJE, COLOR_B)
   «in oklch» hace la mezcla en un espacio perceptual: los pasos se ven uniformes. */
.tint-80   { background: color-mix(in oklch, #2563eb 20%, white); }
.tint-50   { background: color-mix(in oklch, #2563eb 50%, white); }
.base      { background: #2563eb; color: #ffffff; }
.shade-30  { background: color-mix(in oklch, #2563eb 70%, black); color: #ffffff; }
.shade-60  { background: color-mix(in oklch, #2563eb 40%, black); color: #ffffff; }

/* Mezclar con transparent es otra forma de dar alfa a un color que no controlas */
.see-through {
  background: color-mix(in srgb, #2563eb 50%, transparent);
}
```
