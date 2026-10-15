---
example_description: "Los radio con el mismo name forman un grupo de una sola elección; cada checkbox se envía solo si está marcada, y sin value envía «on»"
example_tags: "html|formularios|checkbox|radio|checked|name"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Envía el pedido, desmarca «Para llevar» y vuelve a enviarlo.
     Dentro de un grupo de radio, las flechas ← → mueven la elección. -->
<form action="https://cafeteria.example/pedido" method="post" onsubmit="showPairs(this)">
  <!-- fieldset y legend: el grupo y su nombre (ejemplo 07) -->
  <fieldset>
    <legend>Tamaño</legend>
    <!-- radio: el mismo name forma un grupo y solo uno puede estar marcado.
         checked: el marcado al empezar. Se envía el value del elegido. -->
    <label><input type="radio" name="size" value="s"> Pequeño</label>
    <label><input type="radio" name="size" value="m" checked> Mediano</label>
    <label><input type="radio" name="size" value="l"> Grande</label>
  </fieldset>

  <fieldset>
    <legend>Extras</legend>
    <!-- checkbox: cada una se envía SOLO si está marcada; con el mismo name, la clave se repite -->
    <label><input type="checkbox" name="extras" value="oat-milk" checked> Bebida de avena</label>
    <label><input type="checkbox" name="extras" value="cinnamon" checked> Canela</label>
    <label><input type="checkbox" name="extras" value="extra-shot"> Carga extra de café</label>
  </fieldset>

  <!-- Sin value, una casilla marcada envía «on». Desmarcada no envía «off»: no envía nada. -->
  <p><label><input type="checkbox" name="takeaway" checked> Para llevar</label></p>
  <button type="submit">Pedir</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El formulario expone su estado al CSS: :checked es una casilla marcada, y :has() elige el
   label que la contiene (los dos selectores se estudian en el capítulo de CSS) */
label:has(:checked) {
  font-weight: 700;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Recorremos los pares que se enviarían.
function showPairs(form) {
  const data = new FormData(form);
  for (const [name, value] of data) console.log(`${name} = ${value}`);
  console.log('getAll("extras") →', data.getAll('extras'));
}
```
