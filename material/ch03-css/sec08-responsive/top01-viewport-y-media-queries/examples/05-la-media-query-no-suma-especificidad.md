---
example_description: "Una media query no añade especificidad: si la regla base va después en la hoja, gana aunque la media query se cumpla. El menú se queda en columna; con la regla base antes, se pone en fila"
example_tags: "css|responsive|media-queries|cascada|especificidad|orden|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">La tarjeta mide 480px, más que 25rem (400px): las dos media queries <strong>se cumplen</strong>. Los dos menús deberían estar en fila.</p>

<p class="label">❌ La media query va antes que la regla base: el menú sigue en columna</p>
<nav class="menu-broken" aria-label="Recetas (versión con el error)">
  <a href="/recetas/desayunos">Desayunos</a>
  <a href="/recetas/comidas">Comidas</a>
  <a href="/recetas/postres">Postres</a>
</nav>

<p class="label">✅ La regla base primero y la media query después: en fila</p>
<nav class="menu-fixed" aria-label="Recetas (versión corregida)">
  <a href="/recetas/desayunos">Desayunos</a>
  <a href="/recetas/comidas">Comidas</a>
  <a href="/recetas/postres">Postres</a>
</nav>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 10px 0 4px;
  font-size: 0.72rem;
}

nav a {
  padding: 6px 10px;
  border-radius: 6px;
  background: #ffedd5;
  color: #7c2d12;
  font-size: 0.85rem;
}

/* ❌ Alguien puso la versión ancha arriba, junto a las otras media queries… */
@media (width >= 25rem) {
  .menu-broken { flex-direction: row; }
}

/* …y la regla base del componente más abajo. Las dos tienen especificidad
   (0,1,0): @media no suma nada, solo pone una condición. Con empate, gana la
   que va DESPUÉS en la hoja, y esta pone column siempre.
   En DevTools (Styles), el row de la media query aparece tachado. */
.menu-broken {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ✅ El orden de siempre: la regla base primero, las media queries después,
   de menor a mayor ancho. Cuando la condición se cumple, su regla gana por
   ir detrás. */
.menu-fixed {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (width >= 25rem) {
  .menu-fixed { flex-direction: row; }
}
```
