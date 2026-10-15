---
example_description: "Si no declaras el orden de las capas, lo decide su primera aparición en el archivo: el reset acaba ganando a los componentes"
example_tags: "css|cascada|layer|orden"
example_stage: common-error
example_importance: important
---

# HTML

```html
<button type="button" class="button">❌ Este botón debería ser verde (capa «components»)</button>
<p>Rojo = gana <code>@layer reset</code>. Para arreglarlo, quita el comentario de la primera línea del CSS.</p>
```

# CSS

```css
/* @layer reset, components; */    /* ✅ SOLUCIÓN: quítale el comentario a esta línea */

/* 🐛 Sin esa sentencia, el orden de las capas es el de su PRIMERA aparición en el archivo:
   «components» aparece antes que «reset» → components < reset → gana reset.
   Con la sentencia arriba del todo, el orden queda fijado desde el principio:
   reset < components, da igual dónde aparezcan luego los bloques. */

@layer components {
  .button {
    background: #bbf7d0;      /* querías que los componentes ganaran al reset… */
  }
}

@layer reset {
  .button {
    background: #fecaca;      /* …pero esta capa apareció después */
  }
}

/* Buena práctica: la PRIMERA línea de tu CSS declara todas las capas en orden:
   @layer reset, base, layout, components, utilities; */

body {
  font-family: system-ui, sans-serif;
}

button {
  padding: 8px 12px;
  border: 2px solid #475569;
}
```
