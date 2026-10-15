---
example_description: "Las capas de un proyecto, @layer reset, base, components, utilities, escritas en desorden a propósito: manda la sentencia del principio. El reset (escrito el último) pierde contra la base, y la utilidad .u-center (0,1,0) gana al componente sin !important"
example_tags: "css|arquitectura|layer|capas|reset|componentes|utilidades"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<main class="page">
  <h1>Clases de cerámica</h1>
  <p>Torno, esmaltes y horno de leña, en grupos de seis personas.</p>
  <section class="card u-center" aria-labelledby="next-title">
    <h2 id="next-title" class="card__title">Próximo grupo: martes 20</h2>
    <p class="card__text">Quedan 2 plazas · $1,200 al mes</p>
    <a class="button" href="/ceramica/inscripcion">Apartar lugar</a>
  </section>
</main>
```

# CSS

```css
/* ── El orden, en UNA línea ───────────────────────────────────────────
   De menos a más prioridad. Después, los bloques pueden ir en cualquier
   orden (y en archivos distintos): aquí están al revés a propósito. */
@layer reset, base, components, utilities;

/* Utilidades: una clase, un propósito. Última capa: ganan sin !important. */
@layer utilities {
  .u-center {
    text-align: center;
  }
}

/* Componentes: una clase por pieza, (0,1,0). */
@layer components {
  .page {
    max-width: 30rem;
    padding: 16px;
  }

  .card {
    padding: 16px;
    border: 1px solid #fed7aa;
    border-radius: 12px;
    background: #fff7ed;
    text-align: start;                 /* pierde contra .u-center */
  }

  .card__title {
    font-size: 1.05rem;
  }

  .card__text {
    color: #57534e;
  }

  .button {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 999px;
    background: #9a3412;
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }
}

/* Base: los valores por defecto de las etiquetas. */
@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    color: #292524;
    background: #ffffff;
  }

  h1,
  h2 {
    margin-block: 0 0.25em;            /* gana al margin: 0 del reset */
    line-height: 1.2;
  }

  p {
    margin-block: 0 0.75em;
  }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

/* Reset: escrito el ÚLTIMO, pero es la capa de menos prioridad. Su
   margin: 0 pierde contra los márgenes de la base, que va antes en el
   archivo. Lo decide la línea @layer del principio, no la posición. */
@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }
}
```
