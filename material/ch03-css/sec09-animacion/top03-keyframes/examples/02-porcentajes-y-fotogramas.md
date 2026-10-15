---
example_description: "Keyframes con porcentajes: una sacudida de «código no válido» con cinco momentos (y selectores de fotograma agrupados, 20 %, 60 %) y un corazón de «me gusta» con un solo fotograma al 50 %: si faltan from y to, el principio y el final son el valor que el elemento ya tiene. La sacudida nunca va sola: el texto y el borde explican el error"
example_tags: "css|animaciones|keyframes|porcentajes|sacudida|accesibilidad"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Marca la casilla: el campo se sacude y el corazón late una vez. Con «reducir movimiento» no hay sacudida, pero el error se entiende igual por el texto y el borde rojo.</p>
<label class="control"><input type="checkbox" id="play"> Reproducir</label>
<div class="row">
  <p class="field">
    <label for="coupon">Código de descuento</label>
    <input id="coupon" value="VERANO2019" aria-describedby="coupon-error" aria-invalid="true">
    <span id="coupon-error" class="error">Este código caducó el 31 de agosto.</span>
  </p>
  <p class="like"><span class="heart" aria-hidden="true">♥</span> 128 personas guardaron esta planta</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: start;
  margin-top: 12px;
}

.field {
  display: grid;
  gap: 4px;
  margin: 0;
  font-size: 0.85rem;
}

.field input {
  padding: 6px 8px;
  border: 2px solid #be123c;
  border-radius: 6px;
  font: inherit;
}

.error {
  color: #be123c;
  font-size: 0.75rem;
}

.like {
  margin: 0;
  font-size: 0.85rem;
}

.heart {
  display: inline-block;
  color: #be123c;
  font-size: 1.4rem;
}

/* Cinco momentos. Los fotogramas que comparten valores se agrupan con comas.
   Cada fotograma solo dice las propiedades que cambian. */
@keyframes shake {
  0%,
  100% { translate: 0 0; }
  20%,
  60%  { translate: -6px 0; }
  40%,
  80%  { translate: 6px 0; }
}

/* Solo el 50 %: sin from ni to, el navegador usa como principio y final el
   valor que el elemento tiene sin animación (aquí, scale: 1). Sirve para
   cualquier «ir y volver» sin repetir el estado de reposo. */
@keyframes beat {
  50% { scale: 1.35; }
}

@media (prefers-reduced-motion: no-preference) {
  body:has(#play:checked) .field input {
    animation: shake 400ms ease-in-out;
  }

  body:has(#play:checked) .heart {
    animation: beat 500ms ease-in-out;
  }
}

/* El movimiento NUNCA es la única pista: alguien que no lo ve (o que lo
   tiene desactivado) necesita el texto del error, el borde y aria-invalid. */
```
