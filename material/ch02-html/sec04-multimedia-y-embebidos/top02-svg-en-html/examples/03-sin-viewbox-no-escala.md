---
example_description: "Un svg sin viewBox no escala: al cambiar width y height, el dibujo se recorta o se queda pequeño en una esquina; con viewBox se adapta"
example_tags: "html|svg|viewbox|escala|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<!-- La misma etiqueta «Bio», dibujada para un lienzo de 100 × 100, a 50 px y a 150 px. -->
<h2>❌ Sin viewBox</h2>
<!-- 🐛 Sin viewBox, 1 unidad = 1 px siempre: width y height solo cambian el tamaño de la
     «ventana». A 50 px solo cabe un cuarto del dibujo; a 150 px sobra espacio. -->
<svg width="50" height="50" role="img" aria-label="Etiqueta Bio recortada">
  <circle cx="50" cy="50" r="45" fill="#0e7490"/>
  <text x="50" y="62" font-size="34" text-anchor="middle" fill="#ffffff">Bio</text>
</svg>
<svg width="150" height="150" role="img" aria-label="Etiqueta Bio pequeña en una esquina">
  <circle cx="50" cy="50" r="45" fill="#0e7490"/>
  <text x="50" y="62" font-size="34" text-anchor="middle" fill="#ffffff">Bio</text>
</svg>

<h2>✅ Con viewBox="0 0 100 100"</h2>
<!-- viewBox dice qué parte del lienzo mostrar, y el navegador la ajusta a width × height -->
<svg width="50" height="50" viewBox="0 0 100 100" role="img" aria-label="Etiqueta Bio">
  <circle cx="50" cy="50" r="45" fill="#0e7490"/>
  <text x="50" y="62" font-size="34" text-anchor="middle" fill="#ffffff">Bio</text>
</svg>
<svg width="150" height="150" viewBox="0 0 100 100" role="img" aria-label="Etiqueta Bio grande">
  <circle cx="50" cy="50" r="45" fill="#0e7490"/>
  <text x="50" y="62" font-size="34" text-anchor="middle" fill="#ffffff">Bio</text>
</svg>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h2 {
  font-size: 1.1rem;
}

/* Un borde punteado para ver el hueco de cada SVG (CSS: capítulo 3) */
svg {
  outline: 1px dashed #64748b;
}
```
