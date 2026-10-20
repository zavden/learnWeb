---
example_description: "Un componente bien anidado: declaraciones primero; dentro, solo lo que pertenece a la tarjeta (estados, un modificador, su contexto en la barra lateral, una container query y la transición con movimiento permitido); los elementos BEM como reglas planas de una clase. Nunca más de dos niveles"
example_tags: "css|anidamiento|nesting|bem|componentes|container-queries|buenas-practicas"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<div class="page">
  <section class="events" aria-labelledby="events-title">
    <h2 id="events-title">Próximas actividades</h2>
    <article class="event-card">
      <p class="event-card__date">Sáb 17 oct · 12:00</p>
      <h3 class="event-card__title"><a class="event-card__link" href="/actividades/murales-de-rivera">Los murales de Diego Rivera</a></h3>
      <p class="event-card__place">Patio central · entrada libre</p>
    </article>
    <article class="event-card is-sold-out">
      <p class="event-card__date">Dom 18 oct · 11:00</p>
      <h3 class="event-card__title"><a class="event-card__link" href="/actividades/taller-de-grabado">Taller de grabado para familias</a></h3>
      <p class="event-card__place">Aula 2 · agotado</p>
    </article>
  </section>
  <aside class="sidebar" aria-label="Destacado">
    <article class="event-card">
      <p class="event-card__date">Mié 28 oct · 19:00</p>
      <h3 class="event-card__title"><a class="event-card__link" href="/actividades/noche-de-museos">Noche de museos</a></h3>
      <p class="event-card__place">Todo el museo</p>
    </article>
  </aside>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

h2 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.page {
  display: grid;
  grid-template-columns: 1fr 9rem;
  gap: 16px;
  align-items: start;
}

.events,
.sidebar {
  container-type: inline-size;
}

.events {
  display: grid;
  gap: 10px;
}

/* ── El componente ─────────────────────────────────────────────────────
   1. Las declaraciones del bloque, primero.
   2. Dentro, solo lo que pertenece a la tarjeta, a un nivel: estados,
      modificadores, su contexto y sus condiciones.
   3. Los elementos (__date, __title…) fuera, como reglas planas de una
      clase: (0,1,0), igual que el bloque. */
.event-card {
  position: relative;
  display: grid;
  gap: 2px 12px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;

  @media (prefers-reduced-motion: no-preference) {
    transition: border-color 150ms, box-shadow 150ms;
  }

  &:hover {
    border-color: #1d4ed8;
    box-shadow: 0 4px 12px rgb(15 23 42 / 0.12);
  }

  /* El anillo de foco, en la tarjeta entera: el enlace la cubre (::after). */
  &:has(.event-card__link:focus-visible) {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }

  /* Un modificador de estado: & pegado a otra clase → .event-card.is-sold-out */
  &.is-sold-out {
    border-style: dashed;
    color: #475569;
  }

  /* Su contexto: .sidebar .event-card */
  .sidebar & {
    padding: 8px;
    font-size: 0.8rem;
  }

  /* Su condición: con 18rem de hueco, la fecha a la izquierda. */
  @container (width >= 18rem) {
    grid-template-columns: 6rem 1fr;

    .event-card__date {
      grid-row: span 2;
    }
  }
}

.event-card__date {
  margin: 0;
  color: #9d174d;
  font-size: 0.8rem;
  font-weight: 700;
}

.event-card__title {
  margin: 0;
  font-size: 0.95rem;
}

.event-card__link {
  color: inherit;
  text-decoration: none;

  /* Toda la tarjeta es clicable: el ::after del enlace la cubre. */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
  }

  &:focus-visible {
    outline: none;                    /* el anillo lo dibuja la tarjeta */
  }
}

.event-card__place {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
}
```
