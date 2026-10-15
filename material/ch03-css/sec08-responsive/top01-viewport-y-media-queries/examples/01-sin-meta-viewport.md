---
example_description: "Sin la etiqueta meta viewport, un móvil maqueta la página en un lienzo de 980px y la encoge: las media queries ven 980px y los estilos para móvil no se aplican nunca. Solo se ve en una pestaña propia (↗) con el modo dispositivo de DevTools"
example_tags: "css|responsive|viewport|meta-viewport|media-queries|movil|bug"
example_stage: common-error
example_importance: critical
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <!-- 🐛 Falta la línea del viewport. Para arreglarlo, quita el comentario:
  <meta name="viewport" content="width=device-width, initial-scale=1">
  -->
  <title>Pozole verde · Recetas de la abuela</title>
  <style>
    body {
      margin: 0;
      padding: 1rem;
      font-family: system-ui, sans-serif;
      color: #1e293b;
    }

    /* El indicador: dice qué media query se cumple. */
    .viewport-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      background: #fef3c7;
      color: #92400e;
      font-weight: 700;
    }

    .viewport-badge::after {
      content: "móvil · menos de 40rem (640px)";
    }

    .recipe {
      display: grid;
      gap: 1rem;
    }

    /* A partir de 640px de viewport: ingredientes y pasos lado a lado. */
    @media (width >= 40rem) {
      .viewport-badge {
        background: #dcfce7;
        color: #166534;
      }

      .viewport-badge::after {
        content: "escritorio · 40rem (640px) o más";
      }

      .recipe {
        grid-template-columns: 1fr 2fr;
      }
    }
  </style>
</head>
<body>
  <p class="viewport-badge"></p>
  <h1>Pozole verde</h1>
  <div class="recipe">
    <section>
      <h2>Ingredientes</h2>
      <ul>
        <li>1 kg de maíz pozolero</li>
        <li>500 g de tomate verde</li>
        <li>100 g de pepita de calabaza</li>
      </ul>
    </section>
    <section>
      <h2>Pasos</h2>
      <p>Cuece el maíz hasta que «floree». Asa los tomates y muélelos con la pepita tostada.</p>
    </section>
  </div>
  <!-- Cómo verlo: en la vista previa de LearnWeb (un iframe) el viewport es
       el propio marco y la etiqueta meta no cuenta. Ábrelo con ↗, activa el modo
       dispositivo de DevTools (⇧⌘M) y elige un móvil: el indicador dice
       «escritorio» y el texto se ve diminuto. Con la línea del viewport, «móvil». -->
</body>
</html>
```
