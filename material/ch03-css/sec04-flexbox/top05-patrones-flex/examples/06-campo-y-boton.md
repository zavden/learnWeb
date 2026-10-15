---
example_description: "Un campo y un botón en fila: el campo ocupa todo lo que deja el botón con flex: 1, pero en un hueco estrecho no encoge por su ancho mínimo y empuja el botón fuera hasta que lleva min-width: 0"
example_tags: "css|flexbox|formularios|input|min-width|patrones|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">✅ En 400px: el campo ocupa todo lo que deja el botón</p>
<form class="search" role="search" action="/buscar">
  <label for="q-wide">Buscar en la tienda</label>
  <div class="field-row">
    <input id="q-wide" name="q" type="search" placeholder="Monstera, cactus…">
    <button>Buscar</button>
  </div>
</form>

<p class="label">❌ En una barra lateral de 200px: el campo no baja de su ancho por defecto y el botón se sale</p>
<form class="search is-narrow" role="search" action="/buscar">
  <label for="q-narrow">Buscar en la tienda</label>
  <div class="field-row">
    <input id="q-narrow" name="q" type="search" placeholder="Monstera, cactus…">
    <button>Buscar</button>
  </div>
</form>

<p class="label">✅ La misma barra con <code>min-width: 0</code> en el campo</p>
<form class="search is-narrow is-fixed" role="search" action="/buscar">
  <label for="q-fixed">Buscar en la tienda</label>
  <div class="field-row">
    <input id="q-fixed" name="q" type="search" placeholder="Monstera, cactus…">
    <button>Buscar</button>
  </div>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 10px 0 4px;
  font-size: 0.8rem;
}

.search {
  max-width: 400px;
  font-size: 0.85rem;
}

.search label {
  display: block;
  margin-bottom: 2px;
  font-weight: bold;
}

.is-narrow {
  max-width: 200px;
}

.field-row {
  display: flex;
  gap: 6px;
  outline: 2px dashed #7c3aed;
  outline-offset: 2px;
}

.field-row input,
.field-row button {
  font: inherit;
  padding: 6px 10px;
  border-radius: 6px;
}

.field-row input {
  border: 1px solid #64748b;
}

.field-row button {
  border: 1px solid #166534;
  background: #166534;
  color: #ffffff;
}

.field-row input:focus-visible,
.field-row button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* El patrón: el campo crece con todo lo que sobra y el botón mide lo suyo.
   (El botón no necesita nada: con flex-grow: 0 se queda con su ancho.) */
.field-row input {
  flex: 1;
}

/* 🐛 Un <input> tiene un ancho por defecto (unos 20 caracteres: el atributo size).
   Ese ancho es su contenido, así que su min-width: auto de elemento flex no le deja
   bajar de ahí. En 200px no caben el campo y el botón: el botón se sale de la barra
   lateral. Es la trampa de la lección 4, con un contenido que no se ve. */

/* ✅ min-width: 0 en el campo: ahora sí encoge y el botón queda dentro. */
.is-fixed input {
  min-width: 0;
}
```
