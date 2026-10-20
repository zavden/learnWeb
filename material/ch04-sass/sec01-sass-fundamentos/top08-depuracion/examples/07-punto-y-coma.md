---
example_description: "Un punto y coma olvidado: Sass marca el error en la línea SIGUIENTE, porque hasta ahí no descubre que algo falta"
example_tags: "sass|depuracion|errores|sintaxis"
example_stage: common-error
example_importance: important
---

# HTML

```html
<article class="card">
  <h2>Taller de compostaje</h2>
  <p>Sábado 24 de octubre, 10:00.</p>
</article>
<p>❌ Sin estilos. <code>sass-output.txt</code> señala la línea 13, pero el fallo está en la 12.</p>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.card {
  max-width: 24rem;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  // 🐛 La línea 12 no tiene punto y coma:
  background: #f0fdf4
  color: #14532d;
}

// Sass lee «#f0fdf4 color» como un valor de dos palabras (válido: muchos valores
// de CSS son listas con espacios) y se encuentra «:» en la línea 13, donde
// esperaba «;». El mensaje es «expected ";".» en la línea 13.
//
// Regla práctica: si el error está en el principio de una línea, mira también
// el final de la anterior. Pasa lo mismo con una llave } que falta: Sass puede
// quejarse muchas líneas después, a veces al final del archivo.
```
