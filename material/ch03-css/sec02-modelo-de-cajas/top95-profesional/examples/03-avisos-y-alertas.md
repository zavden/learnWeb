---
example_description: "Avisos de página, alertas en línea con icono de fondo, un mensaje de error de formulario y una pila de notificaciones alineada a la derecha con margin-inline-start: auto"
example_tags: "css|profesional|alertas|background|margin|accesibilidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="site-banner" role="region" aria-label="Aviso del servicio">
  <p class="site-banner-inner"><strong>Mantenimiento programado:</strong> el domingo 22 de noviembre, de 2:00 a 4:00, no podrás acceder a tu área de cliente.</p>
</div>

<main class="page">
  <h1>Configuración de la cuenta</h1>

  <div class="alert alert--success" role="status">
    <p class="alert-title">Cambios guardados</p>
    <p>Tu nueva dirección de envío se usará a partir del próximo pedido.</p>
  </div>

  <div class="alert alert--info">
    <p class="alert-title">Verifica tu teléfono</p>
    <p>Te enviaremos un código por SMS para activar la verificación en dos pasos.</p>
    <p class="alert-actions"><a class="alert-link" href="#">Enviar el código</a> <a class="alert-link" href="#">Ahora no</a></p>
  </div>

  <div class="alert alert--warning">
    <p class="alert-title">Tu tarjeta caduca este mes</p>
    <p>Actualiza el método de pago antes del día 30 para que tu suscripción no se interrumpa.</p>
  </div>

  <div class="alert alert--danger" role="alert">
    <p class="alert-title">No hemos podido importar el archivo</p>
    <p>El enlace <code>https://almacen.example.com/exportaciones/2026/clientes-noviembre-definitivo-v3.csv</code> ha caducado. Vuelve a generarlo desde tu almacén de datos.</p>
  </div>

  <form class="field" action="#">
    <label class="field-label" for="billing-email">Correo para las facturas</label>
    <input class="field-input" id="billing-email" type="email" value="facturas@" aria-describedby="billing-email-error" aria-invalid="true">
    <p class="field-error" id="billing-email-error">Escribe una dirección completa, por ejemplo facturas@tuempresa.es.</p>
  </form>

  <h2 class="toasts-title" id="toasts-title">Notificaciones recientes</h2>
  <ol class="toasts" aria-labelledby="toasts-title">
    <li class="toast toast--success">Factura FAC-2026-0412 enviada a contabilidad.</li>
    <li class="toast">Javier Ruiz ha comentado en «Presupuesto de diciembre».</li>
    <li class="toast toast--danger">No se ha podido sincronizar el calendario. Lo intentaremos de nuevo en 5 minutos.</li>
  </ol>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Avisos y alertas
   - Un solo componente .alert; el tono es un trío de variables (fondo, borde,
     texto) y una imagen de icono. Las variantes no tocan ninguna medida.
   - El icono es una imagen de fondo DENTRO del relleno: padding-inline-start le
     reserva el hueco y background-position lo coloca. Es decorativo: el título ya
     dice qué tipo de aviso es.
   - El espacio interior es padding y entre párrafos, margen en una sola dirección:
     nada puede escaparse de la caja ni colapsar con lo de fuera.
   - Accesibilidad: role="status" para confirmaciones, role="alert" para errores
     que hay que atender ya; contraste de texto ≥ 4,5:1 en todos los tonos.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  input {
    font: inherit;
  }

  [hidden] {
    display: none !important;
  }
}

@layer tokens {
  :root {
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-border-strong: #64748b;
    --color-focus: #1d4ed8;

    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.5rem;
    --radius: 10px;
    --shadow-toast: 0 1px 3px rgb(15 23 42 / 0.12), 0 12px 28px rgb(15 23 42 / 0.16);
    --icon-size: 1.25rem;
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  :where(code) {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.875em;
  }
}

@layer components {
  /* ─── Aviso de página: fondo a todo el ancho, texto en la columna ─── */
  .site-banner {
    background: #1e293b;
    color: #f8fafc;
  }

  .site-banner-inner {
    width: min(100% - 2rem, 44rem);
    margin-inline: auto;
    padding-block: var(--space-3);
    font-size: 0.9375rem;
  }

  .page {
    width: min(100% - 2rem, 44rem);
    margin: 2rem auto 3rem;
  }

  .page h1 {
    margin-bottom: var(--space-5);
  }

  /* ─── Alerta ─── */
  .alert {
    --tone-bg: #eff6ff;
    --tone-border: #93c5fd;
    --tone-accent: #1d4ed8;
    --tone-text: #1e3a8a;
    --tone-icon: url("icon-info.svg");

    margin-bottom: var(--space-4);
    padding: var(--space-4) var(--space-4) var(--space-4) calc(var(--space-4) * 2 + var(--icon-size));
    border: 1px solid var(--tone-border);
    border-inline-start-width: 5px;
    border-inline-start-color: var(--tone-accent);
    border-radius: var(--radius);
    background: var(--tone-icon) left var(--space-4) top calc(var(--space-4) + 0.125rem) / var(--icon-size) no-repeat, var(--tone-bg);
    color: var(--tone-text);
  }

  .alert--success {
    --tone-bg: #f0fdf4;
    --tone-border: #86efac;
    --tone-accent: #15803d;
    --tone-text: #14532d;
    --tone-icon: url("icon-success.svg");
  }

  .alert--warning {
    --tone-bg: #fffbeb;
    --tone-border: #fcd34d;
    --tone-accent: #b45309;
    --tone-text: #78350f;
    --tone-icon: url("icon-warning.svg");
  }

  .alert--danger {
    --tone-bg: #fef2f2;
    --tone-border: #fca5a5;
    --tone-accent: #b91c1c;
    --tone-text: #7f1d1d;
    --tone-icon: url("icon-error.svg");
  }

  /* Márgenes en una sola dirección: cada párrafo se separa del anterior */
  .alert > * + * {
    margin-top: var(--space-2);
  }

  .alert-title {
    font-weight: 700;
  }

  /* Las direcciones largas no tienen espacios donde partirse y desbordarían la caja.
     overflow-wrap se estudia en el módulo de tipografía; aquí permite cortarlas. */
  .alert code {
    overflow-wrap: anywhere;
  }

  .alert-link {
    display: inline-block;              /* zona de clic con relleno */
    margin-right: var(--space-3);
    padding: 0.125rem 0;
    color: inherit;
    font-weight: 600;
  }

  /* ─── Error de un campo ─── */
  .field {
    margin-block: var(--space-5);
  }

  .field-label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  /* El borde mide siempre 2px: el estado de error solo cambia su color */
  .field-input {
    display: block;
    width: 100%;
    max-width: 24rem;
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--color-border-strong);
    border-radius: 8px;
    background: var(--color-surface);
  }

  .field-input[aria-invalid="true"] {
    border-color: #b91c1c;
  }

  .field-input:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  .field-error {
    margin-top: 0.375rem;
    padding-left: 1.5rem;
    background: url("icon-error.svg") left top 0.15rem / 1.1rem no-repeat;
    color: #991b1b;
    font-size: 0.875rem;
  }

  /* ─── Pila de notificaciones ─── */
  .toasts-title {
    margin-bottom: var(--space-3);
    font-size: 1.125rem;
  }

  .toasts {
    padding: 0;
    list-style: none;
  }

  /* Ancho limitado y margin-inline-start: auto: todo el espacio libre va a la izquierda
     y la notificación queda pegada a la derecha (lección de márgenes). */
  .toast {
    --toast-accent: var(--color-border-strong);

    width: min(100%, 22rem);
    margin: 0 0 var(--space-3) auto;
    padding: var(--space-3) var(--space-4);
    border-inline-start: 4px solid var(--toast-accent);
    border-radius: var(--radius);
    background: var(--color-surface);
    box-shadow: var(--shadow-toast);    /* la sombra la «levanta» sin ocupar espacio */
    font-size: 0.9375rem;
  }

  .toast--success {
    --toast-accent: #15803d;
  }

  .toast--danger {
    --toast-accent: #b91c1c;
  }
}
```
