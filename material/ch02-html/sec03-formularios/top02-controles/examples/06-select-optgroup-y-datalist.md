---
example_description: "select ofrece una lista cerrada (con optgroup y multiple), y datalist solo sugiere valores para un campo de texto libre"
example_tags: "html|formularios|select|option|optgroup|datalist"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Envía, elige «Riego por goteo» y vuelve a enviar. En «Barrio», borra el texto y escribe:
     las sugerencias se filtran, pero puedes escribir cualquier otro barrio. -->
<form action="https://huerta.example/cursos/inscripcion" method="post" onsubmit="showPairs(this)">
  <p>
    <label for="course">Curso</label><br>
    <select id="course" name="course">
      <!-- optgroup: un título de grupo que no se puede elegir -->
      <optgroup label="Otoño">
        <option value="compost">Compostaje doméstico</option>
        <option value="pruning" selected>Poda de frutales</option>
      </optgroup>
      <optgroup label="Primavera">
        <option value="seedbeds">Semilleros</option>
        <!-- sin value, se envía el TEXTO de la opción -->
        <option>Riego por goteo</option>
      </optgroup>
    </select>
  </p>
  <p>
    <label for="days">Días que te vienen bien</label><br>
    <!-- multiple: varias elecciones (⌘ o Ctrl + clic); cada una es un par con el mismo name -->
    <select id="days" name="days" multiple size="3">
      <option value="tue" selected>Martes</option>
      <option value="thu" selected>Jueves</option>
      <option value="sat">Sábado</option>
    </select>
  </p>
  <p>
    <label for="district">Barrio</label><br>
    <!-- list + datalist: SUGERENCIAS para un campo de texto, no una lista cerrada -->
    <input id="district" name="district" list="districts" value="Delicias">
    <datalist id="districts">
      <option value="Actur"></option>
      <option value="Delicias"></option>
      <option value="Las Fuentes"></option>
      <option value="Torrero"></option>
    </datalist>
  </p>
  <button type="submit">Inscribirme</button>
</form>
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Recorremos los pares que se enviarían.
function showPairs(form) {
  for (const [name, value] of new FormData(form)) console.log(`${name} = ${value}`);
}
```
