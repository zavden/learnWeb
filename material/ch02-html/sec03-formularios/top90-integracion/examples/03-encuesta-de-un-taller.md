---
example_description: "Una encuesta con radio, casillas, un range con su output, un textarea con contador y un campo oculto: qué se envía de cada uno y qué no"
example_tags: "integracion|formularios|radio|checkbox|range|output|textarea|hidden"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Contesta, envía y compara la consola con lo que ves: el output no viaja, las casillas sin
     marcar tampoco, y el campo oculto sí. (oninput: los eventos llegan en el capítulo de JavaScript.) -->
<h1>¿Qué te pareció el taller de compostaje?</h1>
<form action="https://huerta.example/talleres/encuesta" method="post" oninput="updateOutputs(this)" onsubmit="showPairs(this)">
  <!-- El taller al que responde la encuesta: no hace falta preguntarlo -->
  <input type="hidden" name="workshop" value="compost-2026-10-24">

  <fieldset>
    <legend>¿Cómo lo valoras en general?</legend>
    <label><input type="radio" name="rating" value="1" required> Muy mal</label>
    <label><input type="radio" name="rating" value="2"> Mal</label>
    <label><input type="radio" name="rating" value="3"> Regular</label>
    <label><input type="radio" name="rating" value="4"> Bien</label>
    <label><input type="radio" name="rating" value="5"> Muy bien</label>
  </fieldset>

  <fieldset>
    <legend>¿Qué te resultó útil? (opcional, marca las que quieras)</legend>
    <label><input type="checkbox" name="useful" value="theory"> La explicación del proceso</label>
    <label><input type="checkbox" name="useful" value="practice"> Montar el compostador</label>
    <label><input type="checkbox" name="useful" value="handout"> La guía impresa</label>
  </fieldset>

  <p>
    <label for="recommend">¿Lo recomendarías? De 0 (nada) a 10 (mucho)</label>
    <input id="recommend" name="recommend" type="range" min="0" max="10" value="8">
    <!-- output: muestra el valor del deslizador, que el range no enseña. No se envía. -->
    <output id="recommend-value" for="recommend">8</output>
  </p>

  <p>
    <label for="improve">¿Qué mejorarías? (opcional)</label>
    <textarea id="improve" name="improve" rows="3" cols="40" maxlength="300" aria-describedby="improve-count"></textarea>
    <!-- No es un output: un lector de pantalla anunciaría cada tecla. Se lee al llegar al campo. -->
    <small id="improve-count">Puedes escribir 300 caracteres.</small>
  </p>

  <button type="submit">Enviar respuestas</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

fieldset {
  margin-bottom: 1rem;
}

legend {
  font-weight: 700;
}

fieldset label,
p > label,
small {
  display: block;
}

small {
  color: #475569;
}

output {
  font-weight: 700;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
function updateOutputs(form) {
  form.querySelector('#recommend-value').value = form.elements.recommend.value;
  const left = 300 - form.elements.improve.value.length;
  form.querySelector('#improve-count').textContent = `Puedes escribir ${left} caracteres más.`;
}

// Los pares que se enviarían, uno por línea
function showPairs(form) {
  for (const [name, value] of new FormData(form)) console.log(`${name} = ${value}`);
}
```
