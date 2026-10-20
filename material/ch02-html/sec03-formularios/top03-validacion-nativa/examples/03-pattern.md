---
example_description: "pattern exige que el valor entero cumpla una expresión regular, distingue mayúsculas y se explica con una pista visible"
example_tags: "html|formularios|validacion|pattern|regex"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Los dos valores iniciales no cumplen su patrón. Corrígelos (50001 y HU-0042) y mira la consola.
     (oninput se ejecuta al escribir; los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://huerta.example/socios/alta" method="post" oninput="report(event.target)">
  <p>
    <label for="postal-code">Código postal</label><br>
    <!-- pattern: el valor ENTERO debe cumplir la expresión, no basta con que la contenga.
         [0-9]{5} = exactamente cinco cifras -->
    <input id="postal-code" name="postal_code" pattern="[0-9]{5}" value="5000" aria-describedby="postal-hint">
    <small id="postal-hint">Cinco cifras, por ejemplo 50001.</small>
  </p>
  <p>
    <label for="member">Número de socio</label><br>
    <!-- Distingue mayúsculas y minúsculas: «hu-0042» no cumple HU-[0-9]{4} -->
    <input id="member" name="member" pattern="HU-[0-9]{4}" value="hu-0042" aria-describedby="member-hint">
    <small id="member-hint">Como aparece en tu carné: HU y cuatro cifras, por ejemplo HU-0042.</small>
  </p>
  <button type="submit">Darme de alta</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* display: block pone cada pista en su propia línea (display: capítulo de CSS) */
small {
  display: block;
  color: #475569;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
function report(input) {
  const verdict = input.validity.patternMismatch ? '❌ no cumple' : '✅ cumple';
  console.log(`${input.name}: '${input.value}' ${verdict} ${input.pattern}`);
}

for (const input of document.querySelectorAll('input')) report(input);
```
