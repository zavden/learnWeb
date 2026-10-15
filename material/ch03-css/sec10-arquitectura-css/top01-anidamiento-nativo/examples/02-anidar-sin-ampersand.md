---
example_description: "Anidar sin &: un selector anidado que empieza por una etiqueta o una clase es un descendiente (h2 dentro de .recipe = .recipe h2); si empieza por un combinador (> ul, + .note) se une con ese combinador, y puede alcanzar elementos que están fuera"
example_tags: "css|anidamiento|nesting|combinadores|descendiente|sintaxis-relajada"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="recipe">
  <h2>Agua de jamaica</h2>
  <p>Para una jarra de 2 litros, bien fría.</p>
  <ul>
    <li>1 taza de flor de jamaica</li>
    <li>2 litros de agua</li>
    <li>½ taza de azúcar</li>
  </ul>
  <p class="tip">Consejo: el agua del primer hervor concentra el color; añade la fría al final.</p>
</article>
<p class="note">Este párrafo está FUERA de la tarjeta, justo después: lo pinta la regla anidada <code>+ .note</code>, que equivale a <code>.recipe + .note</code>.</p>
<p class="note">Este no: <code>+</code> solo alcanza al hermano que va inmediatamente después.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.note {
  font-size: 0.8rem;
}

.recipe {
  max-width: 24rem;
  padding: 4px 16px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;

  /* Sin &, un selector anidado es un DESCENDIENTE: este h2 es .recipe h2.
     Es la «sintaxis relajada»: hasta 2023 (Chrome 120), un selector anidado
     no podía empezar por una letra y había que escribir «& h2». */
  h2 {
    margin-block: 8px 4px;
    color: #9d174d;
  }

  /* Empezar por un combinador también vale: > ul es .recipe > ul */
  > ul {
    margin-block: 8px;
    padding-inline-start: 1.2em;
  }

  /* Dos niveles en un selector: .recipe li + li */
  li + li {
    margin-top: 4px;
  }

  .tip {
    color: #475569;
    font-size: 0.8rem;
  }

  /* + .note es .recipe + .note: el hermano que sigue a la tarjeta. Anidar
     agrupa el código, pero no obliga a que el elemento esté DENTRO. */
  + .note {
    color: #9d174d;
    font-weight: 700;
  }
}
```
