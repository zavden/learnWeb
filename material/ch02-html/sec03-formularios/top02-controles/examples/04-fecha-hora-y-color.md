---
example_description: "date, time, datetime-local y color se muestran según el idioma del navegador, pero siempre envían un formato fijo: 2026-10-24, 17:30, #15803d"
example_tags: "html|formularios|date|time|datetime-local|color"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Compara lo que ves en cada campo con lo que se envía.
     Lo que VES depende del idioma de tu navegador; lo que se ENVÍA es siempre igual. -->
<form action="https://huerta.example/talleres/reserva" method="post">
  <p>
    <label for="day">Día del taller</label>
    <!-- min: no se pueden elegir días anteriores -->
    <input id="day" name="day" type="date" min="2026-10-13" value="2026-10-24">
  </p>
  <p>
    <label for="arrival">Hora de llegada</label>
    <input id="arrival" name="arrival" type="time" value="17:30">
  </p>
  <p>
    <label for="reminder">Recordatorio</label>
    <!-- datetime-local: fecha y hora SIN zona horaria (la hora «de la pared» del usuario) -->
    <input id="reminder" name="reminder" type="datetime-local" value="2026-10-23T20:00">
  </p>
  <p>
    <label for="tag-color">Color de tu etiqueta</label>
    <!-- color: siempre #rrggbb en minúsculas, aunque escribas el value en mayúsculas -->
    <input id="tag-color" name="tag_color" type="color" value="#15803D">
  </p>
  <button type="submit">Reservar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. En Chrome, el idioma del navegador decide
// cómo se MUESTRAN los campos (no el lang de la página); value es lo que se enviaría.
console.log('Idioma del navegador:', navigator.language);
for (const input of document.querySelectorAll('input')) {
  console.log(`${input.name} → '${input.value}'`);
}
```
