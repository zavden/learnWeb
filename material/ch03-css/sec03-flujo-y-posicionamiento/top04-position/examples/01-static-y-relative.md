---
example_description: "En una caja static, top y left no hacen nada; con position: relative la caja se dibuja desplazada, pero su hueco original sigue reservado"
example_tags: "css|position|static|relative|offsets"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label"><code>static</code> (por defecto): <code>top: 16px; left: 24px</code> no hace nada</p>
<p class="days">
  <span class="day">Lunes</span>
  <span class="day is-offset">Martes</span>
  <span class="day">Miércoles</span>
</p>

<p class="label"><code>relative</code>: «Martes» se dibuja 16px más abajo y 24px a la derecha.<br>Su hueco (la línea discontinua) sigue ahí: «Miércoles» no se ha movido.</p>
<p class="days">
  <span class="day">Lunes</span>
  <span class="slot"><span class="day is-offset is-relative">Martes</span></span>
  <span class="day">Miércoles</span>
</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.days {
  margin: 0 0 32px;
}

.day {
  display: inline-block;
  padding: 6px 12px;
  border: 2px solid #1d4ed8;
  background: #bfdbfe;
}

/* Los desplazamientos (top, right, bottom, left) solo funcionan en cajas POSICIONADAS,
   es decir, con position distinto de static. En una caja static se ignoran sin avisar. */
.is-offset {
  top: 16px;
  left: 24px;
}

/* relative: la caja se coloca en el flujo como siempre (ocupa su sitio) y DESPUÉS se dibuja
   desplazada. Nadie se entera del desplazamiento: ni sus vecinos ni su padre.
   top: 16px = «16px desde donde estaba, hacia abajo»; left: 24px = «hacia la derecha».
   Al estar posicionada, se pinta encima de «Miércoles» (lo verás en la lección 5).
   Su uso principal no es moverse: es servir de referencia a sus hijos absolute (ejemplo 2). */
.is-relative {
  position: relative;
  background: rgb(250 204 21 / 0.9);
}

/* El marco discontinuo es un inline-block que envuelve a «Martes»: mide lo que mide su hueco. */
.slot {
  display: inline-block;
  outline: 2px dashed #64748b;
}
```
