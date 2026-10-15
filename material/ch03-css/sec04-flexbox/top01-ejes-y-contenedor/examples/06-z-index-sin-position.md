---
example_description: "Los elementos flex aceptan z-index sin position: una pila de avatares solapados en la que el primero queda encima"
example_tags: "css|flexbox|z-index|apilamiento|avatares"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">❌ Imágenes en línea con <code>z-index: 4, 3, 2, 1</code> sin <code>position</code>: se ignora y la última tapa a la anterior</p>
<div class="team is-inline">
  <img src="avatar-1.svg" alt="Ana Martínez" width="48" height="48">
  <img src="avatar-2.svg" alt="Luis Gómez" width="48" height="48">
  <img src="avatar-3.svg" alt="Marta Ruiz" width="48" height="48">
  <img src="avatar-4.svg" alt="Jorge Pérez" width="48" height="48">
</div>

<p class="label">✅ Las mismas imágenes como elementos flex: el <code>z-index</code> funciona sin <code>position</code></p>
<div class="team is-flex">
  <img src="avatar-1.svg" alt="Ana Martínez" width="48" height="48">
  <img src="avatar-2.svg" alt="Luis Gómez" width="48" height="48">
  <img src="avatar-3.svg" alt="Marta Ruiz" width="48" height="48">
  <img src="avatar-4.svg" alt="Jorge Pérez" width="48" height="48">
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.team {
  padding-left: 14px;   /* el sitio que se come el margen negativo del primero */
}

/* Cada avatar se monta 14px sobre el anterior con un margen negativo. */
.team img {
  margin-left: -14px;
  border: 3px solid #ffffff;
  border-radius: 50%;
}

/* Queremos que el PRIMERO quede encima: z-index de mayor a menor. */
.team img:nth-child(1) { z-index: 4; }
.team img:nth-child(2) { z-index: 3; }
.team img:nth-child(3) { z-index: 2; }
.team img:nth-child(4) { z-index: 1; }

/* ❌ Las imágenes son cajas en línea sin posicionar: z-index no se les aplica.
   Se pintan en el orden del HTML y cada una tapa a la anterior. */
.is-inline img {
  vertical-align: top;
}

/* ✅ En un contenedor flex, z-index se aplica a los elementos flex aunque sean static
   (lo anunciaba la lección de z-index). Además, un z-index distinto de auto en un
   elemento flex crea un contexto de apilamiento, igual que en una caja posicionada. */
.is-flex {
  display: flex;
}
```
