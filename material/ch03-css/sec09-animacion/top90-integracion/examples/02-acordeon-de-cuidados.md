---
example_description: "Un acordeón de cuidados de plantas con details y name: la altura de ::details-content se anima de 0 a auto con interpolate-size, la flecha gira con rotate y la pregunta abierta se resalta con details[open]. Con reducir movimiento, el acordeón se abre de golpe y solo se funde el color"
example_tags: "css|integracion|details|details-content|interpolate-size|content-visibility|rotate|acordeon"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="care" aria-labelledby="care-title">
  <h2 id="care-title">Cuidados del nopal</h2>
  <details name="care" open>
    <summary>Riego</summary>
    <div class="answer">
      <p>Cada 10 o 15 días en verano y una vez al mes en invierno. Espera a que la tierra esté seca del todo: el exceso de agua pudre las raíces.</p>
    </div>
  </details>
  <details name="care">
    <summary>Luz</summary>
    <div class="answer">
      <p>Sol directo al menos 6 horas. Si lo cambias de un sitio con sombra a pleno sol, hazlo poco a poco durante una semana para que no se queme.</p>
    </div>
  </details>
  <details name="care">
    <summary>Abono</summary>
    <div class="answer">
      <p>Un abono para cactus, diluido a la mitad, una vez al mes de marzo a septiembre. En invierno, nada.</p>
    </div>
  </details>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────
   Acordeón de cuidados
   - details con el mismo name: solo uno abierto (capítulo de HTML).
   - ::details-content (Chrome 131+) anima su altura de 0 a auto gracias a
     interpolate-size, y content-visibility (discreta) con allow-discrete
     para que el texto siga visible mientras se cierra.
   - La flecha es el ::after del summary; gira con la propiedad rotate (es
     un elemento flexible, así que es una caja transformable).
   - La pregunta abierta se resalta con details[open]; el color se funde
     también con «reducir movimiento».
   ────────────────────────────────────────────────────────────────────── */
:root {
  interpolate-size: allow-keywords;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.care {
  max-width: 26rem;
}

.care h2 {
  margin: 0 0 10px;
  font-size: 1.1rem;
}

details {
  margin-bottom: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  transition: background-color 200ms, border-color 200ms;
}

/* La abierta, resaltada (el color se funde para todos). */
details[open] {
  border-color: #15803d;
  background: #f0fdf4;
}

summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  font-weight: 700;
  list-style: none;
  cursor: pointer;
}

summary::-webkit-details-marker {
  display: none;
}

summary::after {
  content: "▾";
  color: #15803d;
}

details[open] > summary::after {
  rotate: 180deg;
}

summary:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
  border-radius: 10px;
}

.answer p {
  margin: 0;
  padding: 0 12px 12px;
  font-size: 0.9rem;
}

/* La caja del contenido: cerrada mide 0. */
details::details-content {
  height: 0;
  overflow: clip;
}

details[open]::details-content {
  height: auto;
}

@media (prefers-reduced-motion: no-preference) {
  details::details-content {
    transition:
      height 300ms cubic-bezier(0.2, 0, 0, 1),
      content-visibility 300ms allow-discrete;
  }

  summary::after {
    transition: rotate 300ms cubic-bezier(0.2, 0, 0, 1);
  }
}
```
