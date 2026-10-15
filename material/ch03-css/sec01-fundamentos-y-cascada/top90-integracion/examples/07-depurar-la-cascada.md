---
example_description: "Diagnóstico completo: origen, capas, especificidad, herencia y variables deciden cada propiedad de un botón; la regla sin capa de una «librería» lo estropea"
example_tags: "css|cascada|layer|especificidad|depuracion"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<section class="demo broken">
  <h3>❌ Librería sin capa</h3>
  <button type="button" class="btn">Comprar</button>
</section>
<section class="demo fixed">
  <h3>✅ Librería dentro de una capa</h3>
  <button type="button" class="btn">Comprar</button>
</section>

<table>
  <caption>¿Quién decide cada propiedad del botón roto?</caption>
  <thead><tr><th scope="col">Propiedad</th><th scope="col">Gana</th><th scope="col">Por qué</th></tr></thead>
  <tbody>
    <tr><td>font</td><td><code>button { font: inherit }</code> en <code>base</code></td><td>origen: el autor gana al navegador</td></tr>
    <tr><td>background</td><td><code>.broken button</code> sin capa</td><td>capas: lo que no tiene capa va lo último</td></tr>
    <tr><td>color</td><td><code>.btn</code> en <code>components</code></td><td>nadie más lo declara</td></tr>
    <tr><td>padding</td><td><code>.btn</code> en <code>components</code></td><td>nadie más lo declara (el navegador sí, pero es otro origen)</td></tr>
  </tbody>
</table>
```

# CSS

```css
@layer library, base, components;

@layer base {
  :root {
    --brand: oklch(50% 0.18 260);
  }

  body {
    font-family: system-ui, sans-serif;
    color: oklch(25% 0.03 260);
  }

  button {
    font: inherit;
  }
}

@layer components {
  .btn {
    background: var(--brand);
    color: #ffffff;
    border: 0;
    padding: 0.5rem 1.25rem;
  }
}

/* ❌ Una «librería» pegada sin capa: (0,1,1), poco específica… pero sin capa,
   así que gana a cualquier regla de cualquier capa. Texto blanco sobre gris claro. */
.broken button {
  background: #e5e7eb;
}

/* ✅ La misma regla de la librería, dentro de la capa «library», declarada la primera:
   ahora pierde contra «components», que es lo que queríamos. */
@layer library {
  .fixed button {
    background: #e5e7eb;
  }
}

.demo {
  margin-bottom: 1rem;
}

table {
  border-collapse: collapse;
  font-size: 0.875rem;
}

caption {
  text-align: start;
  font-weight: bold;
}

th,
td {
  border: 1px solid oklch(85% 0.02 260);
  padding: 0.3rem 0.5rem;
  text-align: start;
}
```
