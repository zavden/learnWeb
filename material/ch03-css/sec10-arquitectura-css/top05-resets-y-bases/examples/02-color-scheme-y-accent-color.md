---
example_description: "Dos líneas de la base que cambian todos los controles: color-scheme: light dark (el navegador dibuja campos, casillas, desplegables y barras de scroll en el tema del sistema) y accent-color (el color de casillas, radios, deslizadores y barras de progreso), las dos con light-dark(). La página dice qué tema está activo"
example_tags: "css|arquitectura|estilos-base|color-scheme|accent-color|light-dark|formularios"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="theme-status">Tema activo (el de tu sistema): <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
<form class="booking" action="/reservas" method="post">
  <fieldset>
    <legend>Reserva en la terraza</legend>
    <label class="field">Nombre <input type="text" name="name" value="Ana Torres"></label>
    <label class="field">Fecha <input type="date" name="date" value="2026-10-24"></label>
    <label class="field">Hora
      <select name="time">
        <option>14:00</option>
        <option selected>14:30</option>
        <option>15:00</option>
      </select>
    </label>
    <label class="field">Personas (de 1 a 8) <input type="range" name="people" min="1" max="8" value="4"></label>
    <div class="choices">
      <label><input type="radio" name="zone" value="sun" checked> Al sol</label>
      <label><input type="radio" name="zone" value="shade"> A la sombra</label>
      <label><input type="checkbox" name="highchair" checked> Trona para bebé</label>
    </div>
    <label class="field">Plazas libres hoy <progress max="40" value="12">12 de 40</progress></label>
  </fieldset>
</form>
```

# CSS

```css
@layer reset, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  input,
  select {
    font: inherit;
  }
}

@layer base {
  :root {
    /* 1. «Esta página admite los dos esquemas; usa el del sistema.» El
       navegador adapta SUS piezas: el lienzo, los campos, el desplegable,
       el calendario de la fecha, las barras de scroll. */
    color-scheme: light dark;

    /* 2. El color de marca en los controles que lo admiten: casillas,
       radios, deslizador y barra de progreso. El navegador elige solo el
       color de la marca de verificación para que contraste. */
    accent-color: light-dark(#0f766e, #5eead4);

    --color-page: light-dark(#ffffff, #0f172a);
    --color-text: light-dark(#1e293b, #e2e8f0);
    --color-border: light-dark(#64748b, #94a3b8);
  }

  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
  }

  :focus-visible {
    outline: 3px solid light-dark(#1d4ed8, #93c5fd);
    outline-offset: 2px;
  }
}

@layer components {
  /* La etiqueta del tema: la base sigue al sistema, así que basta con
     preguntar a prefers-color-scheme. */
  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .theme-status {
    font-size: 0.85rem;
    font-weight: 700;
  }

  .booking fieldset {
    display: grid;
    gap: 10px;
    max-width: 24rem;
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .field {
    display: grid;
    gap: 4px;
    font-size: 0.85rem;
  }

  .choices {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    font-size: 0.85rem;
  }
}
```
