---
example_description: "Una letra capitular hecha con ::first-letter y float: left; el texto de las primeras líneas la rodea"
example_tags: "css|float|first-letter|tipografia"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<article class="story">
  <h2>La última verbena</h2>
  <p class="has-drop-cap">Era la última noche de las fiestas y en la plaza ya solo quedaban los músicos recogiendo los atriles. Lucía se sentó en el bordillo de la fuente, se quitó los zapatos y esperó a que alguien apagara las bombillas de colores. Nadie lo hizo: el pueblo entero se había ido a dormir con la luz encendida.</p>
</article>
```

# CSS

```css
body {
  font-family: Georgia, "Times New Roman", serif;
  color: #1e293b;
}

.story {
  max-width: 52ch;
}

.story h2 {
  margin: 0 0 8px;
  font-size: 1.3rem;
}

.has-drop-cap {
  margin: 0;
  line-height: 1.5;
}

/* ::first-letter (módulo 1) selecciona la primera letra del párrafo. Al hacerla flotar,
   sale de la primera línea y el texto de las líneas siguientes la rodea, como en un libro.
   line-height pequeño: que su caja mida poco más que la letra (sin interlineado).
   El texto del párrafo no cambia: un lector de pantalla sigue leyendo «Era…». */
.has-drop-cap::first-letter {
  float: left;
  margin: 0.06em 0.1em 0 0;
  color: #9a3412;
  font-size: 4.2em;
  font-weight: bold;
  line-height: 0.8;
}

/* La propiedad moderna initial-letter: 3 encaja la letra exactamente en 3 líneas, pero aún
   no funciona en todos los navegadores; float es la solución que funciona en todos. */
```
