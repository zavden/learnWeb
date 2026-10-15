---
example_description: "Si una propiedad recibe null, Sass no escribe la declaración: sirve para valores opcionales"
example_tags: "sass|variables|null|valores"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<article class="card card-flat">
  <h2>Tarjeta plana</h2>
  <p><code>$flat-shadow: null</code> → no hay <code>box-shadow</code> en el CSS.</p>
</article>
<article class="card card-raised">
  <h2>Tarjeta elevada</h2>
  <p><code>$raised-shadow</code> tiene valor → sí hay <code>box-shadow</code>.</p>
</article>
```

# SCSS

```scss
// null es el valor «nada» de Sass (como None en Python).
$flat-shadow: null;
$raised-shadow: 0 4px 12px rgb(15 23 42 / 0.2);

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.card {
  max-width: 22rem;
  padding: 2px 16px;
  margin-bottom: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.card-flat {
  // Una declaración cuyo valor es null NO se escribe en el CSS generado.
  // Compruébalo en compiled.css: .card-flat solo tiene background.
  box-shadow: $flat-shadow;
  background: #f8fafc;
}

.card-raised {
  box-shadow: $raised-shadow;
  background: #ffffff;
}

h2 {
  font-size: 1.1rem;
}

// Es útil para valores opcionales: «si no me das una sombra, no pongo ninguna».
// Lo usarás con argumentos de mixins y con funciones que no encuentran un valor.
```
