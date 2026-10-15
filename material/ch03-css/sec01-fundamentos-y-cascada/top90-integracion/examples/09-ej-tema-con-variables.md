---
exercise: true
exercise_title: "Convierte los colores en un tema"
exercise_instructions: "Crea en :root las variables --bg, --surface, --text, --muted y --accent con los colores que ya usa el CSS (TODO 1) || Sustituye cada color de las reglas por su var() (TODO 2) || Añade una regla que, con la casilla #dark-mode marcada, redefina las cinco variables con los valores oscuros del comentario y active color-scheme: dark (TODO 3) || Marca y desmarca la casilla para comprobarlo"
exercise_hints: "Si después de TODO 2 la página se ve igual que al principio, vas bien || :has() permite que :root dependa de un elemento que contiene || Los selectores no cambian: solo cambian los valores de las variables"
exercise_solution_example: 09-ej-tema-con-variables-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_description: "Ejercicio: pasar colores escritos a mano a custom properties y añadir un tema oscuro con :has() y :checked, sin JavaScript"
example_tags: "css|ejercicio|custom-properties|has|tema-oscuro"
---

# HTML

```html
<p><label><input type="checkbox" id="dark-mode"> Tema oscuro</label></p>

<article class="post">
  <h2>Notas de la versión 2.0</h2>
  <p>Hemos rediseñado el editor y añadido <a href="#">atajos de teclado</a> para las acciones más comunes.</p>
  <p class="meta">Publicado el 12 de octubre</p>
</article>
```

# CSS

```css
/* TODO 1: crea en :root las variables --bg, --surface, --text, --muted y --accent
   con los cinco colores que usan las reglas de abajo. */

body {
  background: oklch(98.5% 0.005 260);
  color: oklch(25% 0.03 260);
  font-family: system-ui, sans-serif;
}

.post {
  background: oklch(96% 0.02 260);
  border-left: 6px solid oklch(50% 0.18 260);
  padding: 0 1rem 1rem;
}

.post a {
  color: oklch(50% 0.18 260);
}

.meta {
  color: oklch(45% 0.03 260);
}

/* TODO 2: sustituye cada color de arriba por su var(--…). */

/* TODO 3: cuando la casilla #dark-mode esté marcada, redefine las variables y
   activa los controles oscuros (color-scheme: dark). Valores del tema oscuro:
     --bg: oklch(20% 0.02 260)        --surface: oklch(26% 0.03 260)
     --text: oklch(93% 0.01 260)      --muted: oklch(75% 0.02 260)
     --accent: oklch(80% 0.12 260) */
```
