---
example_description: "::first-letter (letra capital, con la puntuación pegada) y ::first-line, que depende del ancho disponible"
example_tags: "css|pseudoelementos|first-letter|first-line"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="intro">¿Sabías que el navegador decide qué es «la primera línea» después de calcular cuánto texto cabe en ella? Estrecha la vista previa y verás cómo cambia el trozo en versalitas azules. La letra capital roja incluye el signo «¿» porque la puntuación pegada a la primera letra también forma parte de ::first-letter.</p>
<p>Y aquí hay un <span class="inline-text">span dentro de un párrafo</span>: su <code>::first-letter</code> no hace nada, porque solo funciona en elementos de bloque.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* ::first-letter → la primera letra del primer renglón de un bloque,
   junto con la puntuación que la rodea (¿, «, comillas…) */
.intro::first-letter {
  font-size: 2.5em;
  font-weight: bold;
  color: #b91c1c;
}

/* ::first-line → la primera línea TAL COMO SE DIBUJA: si cambia el ancho, cambia el texto.
   Solo admite propiedades de texto y fondo (color, fuentes, background…); margin o padding no. */
.intro::first-line {
  font-variant: small-caps;
  color: #1e40af;
}

/* ❌ Un span es un elemento en línea (inline), no un bloque: ::first-letter no se aplica */
.inline-text::first-letter {
  font-size: 2em;
  color: #b91c1c;
}
```
