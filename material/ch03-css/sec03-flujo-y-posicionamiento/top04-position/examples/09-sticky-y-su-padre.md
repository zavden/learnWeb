---
example_description: "Una caja sticky no puede salir de su padre: si el padre mide lo mismo que ella, no tiene recorrido y no se pega"
example_tags: "css|position|sticky|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">↕ Desplaza las dos agendas. Solo la primera mantiene su cabecera arriba.</p>

<div class="column">
  <p class="caption">✅ sticky en <code>.day-header</code>, hija de la sección larga</p>
  <div class="scroller" tabindex="0" role="region" aria-label="Agenda, ejemplo correcto">
    <section class="day">
      <header class="day-header is-sticky"><h3>Lunes 12</h3></header>
      <ul><li>9:00 Reunión</li><li>10:30 Dentista</li><li>14:00 Comida con Elena</li><li>17:00 Yoga</li><li>19:30 Cine</li></ul>
    </section>
  </div>
</div>

<div class="column">
  <p class="caption">❌ sticky en el <code>h3</code>: su padre mide lo mismo que él</p>
  <div class="scroller" tabindex="0" role="region" aria-label="Agenda, ejemplo con el padre a medida">
    <section class="day">
      <header class="day-header"><h3 class="is-sticky">Lunes 12</h3></header>
      <ul><li>9:00 Reunión</li><li>10:30 Dentista</li><li>14:00 Comida con Elena</li><li>17:00 Yoga</li><li>19:30 Cine</li></ul>
    </section>
  </div>
</div>
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

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

.caption {
  min-height: 2.6em;
  margin: 0 0 4px;
  font-size: 0.75rem;
}

.scroller {
  height: 110px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
}

/* La cabecera del día: un componente que envuelve al título (en un proyecto real llevaría
   también botones o un contador). */
.day-header {
  background: #1e3a8a;
  color: #ffffff;
}

.day-header h3 {
  margin: 0;
  padding: 2px 8px;
  background: #1e3a8a;
  font-size: 0.8rem;
}

.day ul {
  margin: 0;
  padding: 0 8px;
  list-style: none;
  font-size: 0.8rem;
}

.day li {
  padding: 3px 0;
}

/* sticky solo se mueve DENTRO de su padre (su bloque contenedor).
   ✅ El padre de .day-header es la sección entera: tiene recorrido para quedarse arriba.
   🐛 El padre del h3 es .day-header, que mide lo mismo que el h3: el h3 no tiene dónde
   moverse y sube con su padre. Pon sticky en el componente, no en su título. */
.is-sticky {
  position: sticky;
  top: 0;
}
```
