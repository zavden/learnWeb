---
example_description: "display: contents borra la caja del elemento (borde, fondo, relleno) pero conserva a sus hijos y lo que heredan"
example_tags: "css|display|contents"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<div class="card">
  <h4>Tarjeta normal</h4>
  <p>La caja de <code>.card</code> tiene borde, relleno, fondo y texto granate.</p>
</div>

<div class="card contents">
  <h4>Tarjeta con display: contents</h4>
  <p>Su caja ha desaparecido: ni borde, ni relleno, ni fondo. Sus hijos siguen aquí y el texto sigue granate.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.card {
  border: 3px solid #be123c;
  padding: 12px;
  background: #ffe4e6;
  color: #881337;            /* se hereda a h4 y p */
  margin-bottom: 16px;
}

.card h4 {
  margin: 0 0 4px;
}

/* display: contents: el elemento sigue en el DOM, pero NO genera caja.
   Sus hijos se colocan como si estuvieran directamente en el padre.
   - Desaparece todo lo que pertenece a la caja: borde, padding, fondo, margen, width…
   - Se conserva lo que pertenece al ELEMENTO: los selectores lo siguen eligiendo
     y sus propiedades heredadas (color, font…) siguen llegando a los hijos.
   Su uso estrella llegará con flexbox y grid: hacer que los nietos se comporten como hijos. */
.contents {
  display: contents;
}

/* Precaución: no lo uses en elementos con significado (button, ul, table…).
   Algunos navegadores han tenido fallos que los borraban también para los lectores
   de pantalla. En un div o un span sin semántica es seguro. */
```
