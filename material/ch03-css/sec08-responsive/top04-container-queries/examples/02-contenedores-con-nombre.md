---
example_description: "Una @container sin nombre pregunta al contenedor más cercano; con nombre (container-name, o el atajo container: nombre / tipo) pregunta al antepasado que se llama así, aunque haya otros más cerca"
example_tags: "css|responsive|container-queries|container-name|container|anidados"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Dos contenedores, uno dentro de otro: la <strong>columna</strong> (440px) y la <strong>tarjeta</strong> (200px). Las cuatro filas viven dentro de la tarjeta; 15rem = 240px y 30rem = 480px.</p>
<div class="column">
  <p class="tag">container: column / inline-size · 440px</p>
  <div class="card">
    <p class="tag">container: card / inline-size · 200px</p>
    <ul class="checks">
      <li class="c1"><code>@container (width &gt;= 15rem)</code></li>
      <li class="c2"><code>@container card (width &gt;= 15rem)</code></li>
      <li class="c3"><code>@container column (width &gt;= 15rem)</code></li>
      <li class="c4"><code>@container column (width &gt;= 30rem)</code></li>
    </ul>
  </div>
</div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }
.tag { margin: 0 0 6px; font-size: 0.7rem; font-weight: 700; color: #6d28d9; }

/* container: nombre / tipo es el atajo de container-name + container-type. */
.column {
  container: column / inline-size;
  width: 440px;
  padding: 8px;
  outline: 2px dashed #7c3aed;
}

.card {
  container: card / inline-size;
  width: 200px;
  padding: 8px;
  outline: 2px solid #7c3aed;
}

.checks { margin: 0; padding: 0; list-style: none; font-size: 0.7rem; }
.checks li { margin: 2px 0; padding: 3px 6px; background: var(--status-bg, #f1f5f9); }
.checks li::after { content: var(--status-text, " ✗ no"); font-weight: 700; }

/* Sin nombre: el contenedor MÁS CERCANO de cada fila, la tarjeta (200px). */
@container (width >= 15rem) {
  .c1 { --status-text: " ✓ sí"; --status-bg: #bbf7d0; }
}

/* Con el nombre de la tarjeta: la misma respuesta. */
@container card (width >= 15rem) {
  .c2 { --status-text: " ✓ sí"; --status-bg: #bbf7d0; }
}

/* Con el nombre de la columna: se salta la tarjeta y pregunta a la columna. */
@container column (width >= 15rem) {
  .c3 { --status-text: " ✓ sí"; --status-bg: #bbf7d0; }
}

@container column (width >= 30rem) {
  .c4 { --status-text: " ✓ sí"; --status-bg: #bbf7d0; }
}
```
