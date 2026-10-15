---
example_description: "all aplica una palabra clave a todas las propiedades a la vez: all: unset deja un botón desnudo, all: revert lo devuelve al del navegador"
example_tags: "css|valores|all|unset|revert"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<p><button type="button">Botón con tus estilos</button></p>
<p><button type="button" class="bare">Botón con all: unset</button> ← parece texto; pulsa <kbd>Tab</kbd> para ver su foco</p>
<p><button type="button" class="native">Botón con all: revert</button> ← el del navegador</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Tus estilos para todos los botones */
button {
  background: #1d4ed8;
  color: #ffffff;
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
}

/* all: unset → TODAS las propiedades a la vez pasan a unset: las heredadas heredan
   (fuente, color) y las demás vuelven a su valor inicial (sin fondo, sin borde,
   display: inline…). Incluido outline: ¡desaparece el anillo de foco! */
.bare {
  all: unset;
}

/* Por eso, tras all: unset, hay que devolverle un foco visible (accesibilidad) */
.bare:focus-visible {
  outline: 2px solid #1d4ed8;
}

/* all: revert → todas las propiedades vuelven al valor de la hoja del navegador:
   es como si tus reglas para este botón no existieran. */
.native {
  all: revert;
}
```
