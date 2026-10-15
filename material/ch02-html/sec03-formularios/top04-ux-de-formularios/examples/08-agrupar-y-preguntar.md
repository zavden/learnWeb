---
example_description: "Agrupar un formulario largo: grupos con nombre, una fecha conocida en tres campos y una pregunta como legend con sus respuestas"
example_tags: "html|formularios|ux|fieldset|legend|agrupacion|fechas"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Recórrelo con Tab: el orden es el de la conversación (quién eres, cuándo naciste, qué quieres). -->
<form action="https://huerta.example/parcelas/solicitud" method="post">
  <fieldset>
    <legend>Tus datos</legend>
    <p><label for="full-name">Nombre y apellidos</label><br><input id="full-name" name="full_name" autocomplete="name"></p>
    <p><label for="email">Correo electrónico</label><br><input id="email" name="email" type="email" autocomplete="email"></p>
  </fieldset>

  <!-- Una fecha que la persona ya sabe (su nacimiento): tres campos cortos se escriben más rápido
       que buscarla en un calendario. El grupo da el nombre común; cada campo, el suyo. -->
  <fieldset aria-describedby="birth-hint">
    <legend>Fecha de nacimiento</legend>
    <p id="birth-hint" class="hint">Por ejemplo, 27 3 1985</p>
    <label for="birth-day">Día</label> <input id="birth-day" name="birth_day" inputmode="numeric" autocomplete="bday-day" size="2" maxlength="2">
    <label for="birth-month">Mes</label> <input id="birth-month" name="birth_month" inputmode="numeric" autocomplete="bday-month" size="2" maxlength="2">
    <label for="birth-year">Año</label> <input id="birth-year" name="birth_year" inputmode="numeric" autocomplete="bday-year" size="4" maxlength="4">
  </fieldset>

  <!-- Una pregunta = un grupo: la legend ES la pregunta y los radio, sus respuestas -->
  <fieldset aria-describedby="size-hint">
    <legend>¿Qué tamaño de parcela prefieres?</legend>
    <p id="size-hint" class="hint">Las grandes tienen una lista de espera de unos seis meses.</p>
    <label><input type="radio" name="plot_size" value="small"> Pequeña, 10 m²</label><br>
    <label><input type="radio" name="plot_size" value="medium"> Mediana, 25 m²</label><br>
    <label><input type="radio" name="plot_size" value="large"> Grande, 50 m²</label>
  </fieldset>

  <button type="submit">Enviar solicitud</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

fieldset {
  max-width: 30rem;
  margin-bottom: 1rem;
}

legend {
  font-weight: 700;
}

.hint {
  margin-top: 0;
  color: #475569;
}
```
