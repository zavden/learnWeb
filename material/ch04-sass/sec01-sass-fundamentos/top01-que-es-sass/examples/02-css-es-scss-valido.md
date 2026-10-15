---
example_description: "Todo CSS válido es SCSS válido: capas, custom properties, :has(), clamp() y oklch() pasan por Sass sin cambios"
example_tags: "sass|scss|css|superconjunto"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="notice" role="status">
  <p class="notice-title">Pedido enviado</p>
  <p>Tu pedido #20417 sale hoy del almacén. Te llegará entre el jueves y el viernes.</p>
  <button type="button" class="notice-close" aria-label="Cerrar aviso">×</button>
</div>
```

# SCSS

```scss
// Este bloque es SCSS, pero no tiene NADA de Sass: es CSS moderno normal.
// SCSS es un superconjunto de CSS: cualquier hoja .css válida es un .scss válido.
// Compara con la pestaña compiled.css: es el mismo CSS, solo reformateado
// (y sin estos comentarios con //, que Sass elimina).

@layer base, components;

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: #1e293b;
  }
}

:root {
  --accent: oklch(50% 0.14 150);
}

@layer components {
  .notice {
    position: relative;
    max-width: 26rem;
    padding: clamp(0.75rem, 3vw, 1.25rem);
    border-left: 6px solid var(--accent);
    background: color-mix(in oklch, var(--accent) 10%, white);
  }

  .notice:has(.notice-close) {
    padding-right: 3rem;
  }

  .notice p {
    margin: 0;
  }

  .notice-title {
    font-weight: bold;
    color: var(--accent);
  }

  .notice-close {
    position: absolute;
    inset: 8px 8px auto auto;
    font-size: 1.25rem;
    line-height: 1;
  }
}
```
