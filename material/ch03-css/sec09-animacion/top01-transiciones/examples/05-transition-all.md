---
example_description: "transition: all anima todo lo que cambia, también lo que no pensabas animar: unas pestañas que en :hover pasan a negrita y ganan relleno hacen que la fila entera se desplace poco a poco, fotograma a fotograma; con la lista de propiedades, solo se funde el color"
example_tags: "css|transiciones|transition-all|font-weight|layout|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Pasa el ratón despacio por las pestañas de cada fila (o recórrelas con <kbd>Tab</kbd>) y mira las pestañas <strong>vecinas</strong>.</p>

<p class="label">❌ <code>transition: all 400ms</code>: la negrita y el relleno también se animan; las vecinas se deslizan durante 0,4 s cada vez</p>
<nav class="tabs is-all" aria-label="Categorías (con all)">
  <a href="/tienda/plantas">Plantas</a>
  <a href="/tienda/macetas">Macetas</a>
  <a href="/tienda/sustratos">Sustratos</a>
  <a href="/tienda/herramientas">Herramientas</a>
</nav>

<p class="label">✅ <code>transition: color 150ms, border-color 150ms</code>: solo se funde lo que querías</p>
<nav class="tabs is-listed" aria-label="Categorías (con la lista)">
  <a href="/tienda/plantas">Plantas</a>
  <a href="/tienda/macetas">Macetas</a>
  <a href="/tienda/sustratos">Sustratos</a>
  <a href="/tienda/herramientas">Herramientas</a>
</nav>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.label {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid #cbd5e1;
}

.tabs a {
  padding: 8px 10px;
  border-bottom: 3px solid transparent;
  color: #475569;
  font-size: 0.85rem;
  text-decoration: none;
}

.tabs a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}

/* ❌ La intención era fundir el color y el subrayado. Pero con «all», TODO lo
   que cambia se anima: también font-weight (un número: 400 → 700) y el
   padding. El texto engorda poco a poco y las vecinas se desplazan en cada
   fotograma: el navegador rehace el layout de la fila 60 veces por segundo
   (lección de rendimiento). Y cualquier regla que alguien añada mañana (un
   tema oscuro, un tamaño en una media query) también se animará sin querer.
   (Va dentro de no-preference porque mueve a las vecinas: con «reducir
   movimiento», esta fila cambia sin animación.) */
@media (prefers-reduced-motion: no-preference) {
  .is-all a {
    transition: all 400ms;
  }
}

.is-all a:hover,
.is-all a:focus-visible {
  padding-inline: 14px;
  border-bottom-color: #15803d;
  color: #14532d;
  font-weight: 700;
}

/* ✅ Lista solo lo que quieres animar. Y no cambies el tamaño de una pestaña
   al pasar el ratón: aunque no se anime, la negrita empujaría a las vecinas
   de golpe. Aquí el estado solo cambia colores. */
.is-listed a {
  transition: color 150ms, border-color 150ms;
}

.is-listed a:hover,
.is-listed a:focus-visible {
  border-bottom-color: #15803d;
  color: #14532d;
}
```
