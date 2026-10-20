---
example_description: "Anatomía de una regla: selector, bloque, declaraciones y comentarios; dos reglas que se suman sobre el mismo párrafo"
example_tags: "css|sintaxis|regla|declaracion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<h1>Anatomía de una regla</h1>
<p class="lead">Tengo <code>class="lead"</code>: me afectan las dos reglas (color y fuente de la 1; fondo, relleno y negrita de la 2).</p>
<p>No tengo clase: solo me afecta la regla 1, la de <code>h1, p</code>.</p>
```

# CSS

```css
/* Esto es un comentario: el navegador lo ignora.
   En CSS solo existe esta forma: barra-asterisco … asterisco-barra. */

/* REGLA 1
   - selector: «h1, p» → una lista: todos los <h1> y todos los <p>
   - bloque: todo lo que va entre las llaves
   - dentro, dos declaraciones con la forma  propiedad: valor;  */
h1, p {
  color: #1e3a8a;                /* propiedad «color» (del texto) · valor: azul oscuro */
  font-family: Georgia, serif;   /* un valor puede ser una lista separada por comas */
}

/* REGLA 2
   - selector de clase: el punto significa «elementos con class="lead"» */
.lead {
  background: #fef3c7;           /* fondo amarillo claro */
  padding: 8px;                  /* relleno interior de 8 píxeles */
  font-weight: bold              /* el último ; antes de } es opcional… pero ponlo siempre */
}

/* El párrafo .lead recibe declaraciones de LAS DOS reglas: se suman.
   Ninguna choca (no hay dos valores para la misma propiedad), así que no hay nada que decidir. */
```
