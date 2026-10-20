---
example_description: "::placeholder (el texto de ejemplo) frente a :placeholder-shown (el input mientras lo muestra)"
example_tags: "css|pseudoelementos|placeholder|formularios"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p>
  <label for="email">Correo electrónico</label><br>
  <input id="email" type="email" placeholder="ana@example.com">
</p>
<p>Texto gris en cursiva ← <code>::placeholder</code> (el texto). Borde naranja discontinuo ← <code>:placeholder-shown</code> (el input).
  Escribe algo: desaparecen los dos.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

input {
  padding: 6px;
}

/* PSEUDOELEMENTO ::placeholder → el texto de ejemplo, que no es el valor del campo.
   #64748b sobre blanco tiene un contraste de 4,8:1: sigue siendo legible. */
input::placeholder {
  color: #64748b;
  font-style: italic;
}

/* PSEUDOCLASE :placeholder-shown → el INPUT, mientras está mostrando su placeholder */
input:placeholder-shown {
  border: 2px dashed #f59e0b;
}

/* Recuerda el capítulo de formularios: un placeholder no sustituye a un label,
   porque desaparece en cuanto se escribe. */
```
