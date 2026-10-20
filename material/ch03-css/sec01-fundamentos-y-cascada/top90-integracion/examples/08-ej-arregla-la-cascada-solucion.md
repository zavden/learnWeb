---
example_stage: final-solution
example_description: "Solución: orden de capas declarado, :where() para anular la especificidad del id y calc() para convertir la variable en píxeles"
example_tags: "css|solucion|layer|especificidad|custom-properties"
---

# HTML

```html
<div class="alert" id="payment-alert">
  <p class="alert-title">Pago recibido</p>
  <p>Te hemos enviado el recibo a tu correo electrónico.</p>
</div>

<p class="note u-text-center">Este párrafo debería estar centrado: lleva la utilidad <code>.u-text-center</code>.</p>

<ul>
  <li>El título de la alerta es verde y está en negrita.</li>
  <li>La alerta tiene relleno interior por los cuatro lados.</li>
  <li>El párrafo de arriba está centrado.</li>
</ul>
```

# CSS

```css
/* ✅ 1: el orden se fija antes de que aparezca ningún bloque.
   Sin esta línea, «utilities» aparecía primero y quedaba con la MENOR prioridad. */
@layer base, components, utilities;

@layer utilities {
  .u-text-center {
    text-align: center;
  }
}

@layer base {
  :root {
    --color-success: oklch(45% 0.12 150);
    --color-muted: oklch(45% 0.03 260);
    --alert-space: 16;
  }

  body {
    font-family: system-ui, sans-serif;
    color: oklch(25% 0.03 260);
  }
}

@layer components {
  .alert {
    border-left: 6px solid var(--color-success);
    background: oklch(96% 0.03 150);
    /* ✅ 3: «16 px» (dos piezas) era inválido en tiempo de cómputo → padding: 0.
       Multiplicar por 1px convierte el número en una longitud. */
    padding: calc(var(--alert-space) * 1px);
  }

  /* ✅ 2: :where() conserva la condición del id pero aporta (0,0,0):
     la regla pesa (0,0,1) y .alert-title (0,1,0) ya puede ganarle. */
  :where(#payment-alert) p {
    color: var(--color-muted);
    margin: 0.25rem 0;
  }

  .alert-title {
    color: var(--color-success);
    font-weight: bold;
  }

  .note {
    text-align: start;
  }
}
```
