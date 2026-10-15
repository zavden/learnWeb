---
example_description: "Variables Sass para lo que se decide al compilar (breakpoints, cálculos) y custom properties para lo que cambia en el navegador, generadas desde Sass"
example_tags: "sass|variables|custom-properties|media-queries|tokens"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<section class="demo demo-sass">
  <h2>✅ <code>@media (width &gt;= $bp)</code>: dos columnas</h2>
  <div class="grid"><p>Tomates</p><p>Pimientos</p><p>Lechugas</p><p>Calabacines</p></div>
</section>
<section class="demo demo-var">
  <h2>❌ <code>@media (width &gt;= var(--bp))</code>: nunca se cumple</h2>
  <div class="grid"><p>Tomates</p><p>Pimientos</p><p>Lechugas</p><p>Calabacines</p></div>
</section>
```

# SCSS

```scss
// Valores de diseño en Sass: una sola fuente de verdad.
$brand: #15803d;
$surface: #f0fdf4;
$gap: 8px;
$bp: 15rem;   // breakpoint pequeño, para que se cumpla en la vista previa

// 1) Lo que tiene que existir en el navegador → custom properties,
//    generadas DESDE las variables Sass con interpolación.
:root {
  --brand: #{$brand};
  --surface: #{$surface};
  --gap: #{$gap};
  --bp: #{$bp};     // existe, pero una media query no puede leerla (ver abajo)
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

h2 {
  font-size: 1rem;
}

.grid {
  display: grid;
  gap: var(--gap);
}

.grid p {
  margin: 0;
  padding: 8px;
  border-left: 4px solid var(--brand);
  background: var(--surface);
}

// 2) Lo que se decide al compilar → variable Sass. Una media query se evalúa
//    para toda la página, no para un elemento, así que var() no tiene dónde
//    leer el valor: CSS no permite var() en las condiciones de @media.
//    Con la variable Sass, el CSS generado contiene un número: (width >= 15rem).
@media (width >= $bp) {
  .demo-sass .grid {
    grid-template-columns: 1fr 1fr;
  }
}

// ❌ La condición con var() es inválida: esta media query no se cumple nunca.
@media (width >= var(--bp)) {
  .demo-var .grid {
    grid-template-columns: 1fr 1fr;
  }
}
```
