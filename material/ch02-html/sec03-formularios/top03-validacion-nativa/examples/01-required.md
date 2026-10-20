---
example_description: "required en un campo, un grupo de radio, un select y una casilla: el navegador no envía, enfoca el primer campo que falla y muestra un aviso"
example_tags: "html|formularios|validacion|required"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Pulsa «Inscribirme» sin rellenar nada: el navegador NO envía, enfoca el primer campo que
     falla y muestra un aviso. Ve rellenando y prueba otra vez: el envío solo llega a la consola
     cuando todo es válido. -->
<form action="https://huerta.example/talleres/inscripcion" method="post">
  <p>Todos los campos son obligatorios.</p>
  <p><label for="full-name">Nombre</label><br><input id="full-name" name="full_name" required></p>

  <fieldset>
    <legend>Turno</legend>
    <!-- En un grupo de radio basta con required en uno: obliga a elegir alguno del grupo -->
    <label><input type="radio" name="shift" value="morning" required> Mañana</label>
    <label><input type="radio" name="shift" value="afternoon"> Tarde</label>
  </fieldset>

  <p>
    <label for="level">Experiencia</label><br>
    <!-- En un select, required exige un valor no vacío: la primera opción, con value="",
         hace de «elige una» y no cuenta como respuesta -->
    <select id="level" name="level" required>
      <option value="">Elige una opción</option>
      <option value="none">Nunca he cultivado</option>
      <option value="pots">Tengo algunas macetas</option>
      <option value="plot">Tengo un huerto</option>
    </select>
  </p>

  <!-- En una casilla, required obliga a marcarla -->
  <p><label><input type="checkbox" name="rules" required> He leído las normas del huerto</label></p>
  <button type="submit">Inscribirme</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```
