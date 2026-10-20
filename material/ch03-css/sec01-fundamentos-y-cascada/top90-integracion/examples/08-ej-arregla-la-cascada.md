---
exercise: true
exercise_title: "Arregla la cascada de la alerta"
exercise_instructions: "Declara el orden de las capas en la primera línea (TODO 1) para que la utilidad centre el párrafo || Haz que el título de la alerta sea verde bajando la especificidad de la regla con el id, sin cambiar a qué elementos afecta (TODO 2) || Devuelve el relleno a la alerta (TODO 3) || Comprueba que se cumplen los tres puntos de la lista"
exercise_hints: "Sin una sentencia @layer al principio, el orden de las capas es el de su primera aparición en el archivo || :where() selecciona lo mismo que su argumento, pero aporta especificidad cero || var() no se pega a una unidad: convierte el número dentro de calc()"
exercise_solution_example: 08-ej-arregla-la-cascada-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_description: "Ejercicio: tres errores de cascada (orden de capas, especificidad de un id y una variable sin unidad) que se arreglan solo en el CSS"
example_tags: "css|ejercicio|layer|especificidad|custom-properties"
---

# HTML

```html
<div class="alert" id="payment-alert">
  <p class="alert-title">Pago recibido</p>
  <p>Te hemos enviado el recibo a tu correo electrónico.</p>
</div>

<p class="note u-text-center">Este párrafo debería estar centrado: lleva la utilidad <code>.u-text-center</code>.</p>

<ul>
  <li>El título de la alerta es verde y está en negrita.</li>
  <li>La alerta tiene relleno interior por los cuatro lados.</li>
  <li>El párrafo de arriba está centrado.</li>
</ul>
```

# CSS

```css
/* Este CSS tiene tres problemas de cascada. Arréglalos sin tocar el HTML. */

/* TODO 1: declara aquí, en una sola línea, el orden de las capas:
   base, components y utilities (de menos a más prioridad). */

@layer utilities {
  .u-text-center {
    text-align: center;
  }
}

@layer base {
  :root {
    --color-success: oklch(45% 0.12 150);
    --color-muted: oklch(45% 0.03 260);
    --alert-space: 16;               /* un número sin unidad: píxeles */
  }

  body {
    font-family: system-ui, sans-serif;
    color: oklch(25% 0.03 260);
  }
}

@layer components {
  .alert {
    border-left: 6px solid var(--color-success);
    background: oklch(96% 0.03 150);
    /* TODO 3: esta declaración no aplica ningún relleno. Arréglala. */
    padding: var(--alert-space)px;
  }

  /* TODO 2: esta regla pesa (1,0,1) y tapa el color de .alert-title.
     Reescríbela para que pese lo mínimo posible, sin cambiar a qué elementos afecta. */
  #payment-alert p {
    color: var(--color-muted);
    margin: 0.25rem 0;
  }

  .alert-title {
    color: var(--color-success);
    font-weight: bold;
  }

  .note {
    text-align: start;
  }
}
```
