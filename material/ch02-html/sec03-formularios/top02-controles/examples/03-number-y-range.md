---
example_description: "number y range eligen un número, pero su valor es texto; un range sin value empieza en el punto medio entre min y max"
example_tags: "html|formularios|number|range|min|max|step"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<form action="https://alojamientos.example/buscar" method="get">
  <p>
    <label for="guests">Personas</label>
    <!-- number: flechas para subir y bajar (también ↑ y ↓ del teclado); min, max y step las limitan -->
    <input id="guests" name="guests" type="number" min="1" max="12" step="1" value="2">
  </p>
  <p>
    <label for="max-price">Precio máximo por noche (40 € a 200 €)</label><br>
    <!-- range: un deslizador. No muestra su valor (verás cómo hacerlo con output).
         Sin value, empieza en el medio: (40 + 200) / 2 = 120 -->
    <input id="max-price" name="max_price" type="range" min="40" max="200" step="10">
  </p>
  <button type="submit">Buscar alojamiento</button>
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
// Adelanto: JavaScript se explica en su capítulo. value siempre es un texto (string);
// valueAsNumber lo da ya convertido en número.
for (const input of document.querySelectorAll('input')) {
  console.log(`${input.name}: value → '${input.value}' (${typeof input.value}) · valueAsNumber → ${input.valueAsNumber}`);
}
```
