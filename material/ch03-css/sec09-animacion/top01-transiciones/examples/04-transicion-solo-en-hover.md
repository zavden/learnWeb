---
example_description: "Las notas adhesivas de la lección de transformaciones, ahora animadas: con transition solo en la regla :hover, la nota crece con suavidad pero vuelve de golpe; con transition en la regla base, se anima en los dos sentidos"
example_tags: "css|transiciones|transition|hover|cascada|scale|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Las notas giradas de la lección de transformaciones (con <code>rotate</code> y <code>scale</code> sueltas, que no se pisan). Pasa el ratón por cada una y <strong>sal</strong>: ahí está la diferencia. (Con «reducir movimiento», las cuatro crecen sin animación.)</p>

<p class="label">❌ <code>transition</code> solo en <code>:hover</code>: crece despacio y vuelve de golpe</p>
<div class="board is-broken">
  <p class="note">Comprar maíz para tamales</p>
  <p class="note">Regar las suculentas</p>
</div>

<p class="label">✅ <code>transition</code> en la regla base: crece y vuelve en 300 ms</p>
<div class="board is-fixed">
  <p class="note">Comprar maíz para tamales</p>
  <p class="note">Regar las suculentas</p>
</div>
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

.board {
  display: flex;
  gap: 32px;
  padding: 14px 16px;
  background: #d6b88f;                 /* corcho */
}

.note {
  width: 120px;
  margin: 0;
  padding: 14px 10px;
  background: #fef08a;
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.25);
  font-size: 0.8rem;
  rotate: -4deg;
}

.note + .note {
  rotate: 3deg;
}

.note:hover {
  scale: 1.15;
}

@media (prefers-reduced-motion: no-preference) {
  /* 🐛 La transición que usa el navegador es la del estado de LLEGADA.
     - Al entrar, el estado nuevo es :hover, que tiene transition: crece en 300 ms.
     - Al salir, el estado nuevo es el de la regla base, que NO tiene
       transition (su duración es 0s): la nota vuelve a su tamaño de golpe. */
  .is-broken .note:hover {
    transition: scale 300ms;
  }

  /* ✅ En la regla base, la transición vale para los dos sentidos: al entrar
     (se cumple :hover, que no declara otra) y al salir. */
  .is-fixed .note {
    transition: scale 300ms;
  }
}
```
