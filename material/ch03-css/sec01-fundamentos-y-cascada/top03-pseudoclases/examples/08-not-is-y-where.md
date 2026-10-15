---
example_description: "Pseudoclases lógicas: :not() niega, :is() abrevia combinaciones y :where() hace lo mismo con especificidad cero"
example_tags: "css|pseudoclases|not|is|where"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="legend">Negrita ← <code>.tasks li:not(.done)</code> · Texto azul ← <code>:is(article, aside) :is(h2, h3)</code></div>
<ul class="tasks">
  <li class="done">Comprar pan (hecha)</li>
  <li>Llamar al médico (pendiente)</li>
  <li class="done">Pagar la luz (hecha)</li>
  <li>Regar las plantas (pendiente)</li>
</ul>
<article><h2>h2 dentro de article → azul</h2></article>
<aside><h3>h3 dentro de aside → azul</h3></aside>
<section><h3>h3 dentro de section → negro: section no está en el :is()</h3></section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* :not(S) → los elementos que NO coinciden con S. Aquí: las tareas pendientes.
   Admite listas: li:not(.done, .archived) = ni .done ni .archived. */
.tasks li:not(.done) {
  font-weight: bold;
}

/* :is(A, B) → «coincide con A o con B». Ahorra escribir todas las combinaciones:
   esta regla equivale a la lista  article h2, article h3, aside h2, aside h3 */
:is(article, aside) :is(h2, h3) {
  color: #1d4ed8;
}

/* :where(A, B) selecciona exactamente lo mismo que :is(A, B):
     :where(article, aside) :where(h2, h3) { … }
   La única diferencia es la especificidad (:where siempre cuenta cero).
   La verás en la lección de especificidad. */
```
