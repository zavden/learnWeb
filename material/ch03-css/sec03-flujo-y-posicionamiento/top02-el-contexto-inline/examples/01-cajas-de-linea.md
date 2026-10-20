---
example_description: "Cada línea de texto es una caja de línea: mide line-height y se apila sin huecos; una caja más alta estira solo su línea"
example_tags: "css|contexto-inline|line-box|line-height"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="column">
  <p class="legend">Cada franja morada mide 28px (<code>line-height</code>): es una <strong>caja de línea</strong>.</p>
  <p class="lines">Librería La Buhardilla<br>Calle del Pez, 27<br>28004 Madrid</p>
</div>

<div class="column">
  <p class="legend">El cartel verde mide 44px: estira <strong>su</strong> línea y las franjas dejan de coincidir.</p>
  <p class="lines">Librería La Buhardilla<br>Calle del Pez, 27 <span class="tall">Abierto</span><br>28004 Madrid</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* Dos columnas con inline-block (vertical-align: top se explica en esta lección). */
.column {
  display: inline-block;
  vertical-align: top;
  width: 205px;
  margin-right: 12px;
}

.legend {
  min-height: 3.6em;
  margin: 0 0 6px;
  font-size: 0.8rem;
}

/* Un párrafo con solo texto crea un contexto inline: el texto se reparte en LÍNEAS
   (aquí, forzadas con <br>). Cada línea es una caja de línea; se apilan una tras otra,
   sin márgenes entre ellas: el espacio entre renglones sale de line-height. */
.lines {
  margin: 0;
  font-size: 15px;
  line-height: 28px;
  /* Regla visual: una imagen de dos franjas de 28px repetida hacia abajo (56px = 2 líneas). */
  background: url("line-bands.svg") 0 0 / 100% 56px;
}

/* La caja de línea mide lo necesario para contener TODAS las cajas que lleva dentro.
   Una caja inline-block de 44px no cabe en 28px: esa línea crece y empuja a las siguientes. */
.tall {
  display: inline-block;
  padding: 0 8px;
  line-height: 42px;
  border: 1px solid #15803d;
  background: #bbf7d0;
  font-size: 0.85rem;
}
```
