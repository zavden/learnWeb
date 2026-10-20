---
example_description: "Página de preguntas frecuentes con details/summary: marcador propio con ::marker, estado [open], foco en el bloque con :has(), contadores y categorías enlazables con :target"
example_tags: "css|profesional|details|marker|has|target"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="page">
  <h1>Preguntas frecuentes</h1>
  <p class="lead">Si no encuentras tu respuesta, escríbenos y te contestaremos en menos de 24 horas.</p>

  <nav aria-label="Categorías">
    <ul class="categories">
      <li><a href="#account">Cuenta</a></li>
      <li><a href="#billing">Pagos</a></li>
      <li><a href="#privacy">Privacidad</a></li>
    </ul>
  </nav>

  <section class="faq-group" id="account" aria-labelledby="account-title">
    <h2 id="account-title">Cuenta</h2>
    <details class="faq">
      <summary>¿Cómo cambio mi contraseña?</summary>
      <p>Entra en <strong>Configuración → Seguridad</strong> y pulsa «Cambiar contraseña». Te pediremos la actual antes de guardar la nueva.</p>
    </details>
    <details class="faq">
      <summary>¿Puedo usar la misma cuenta en varios dispositivos?</summary>
      <p>Sí. Tu cuenta funciona a la vez en el móvil, la tableta y el ordenador; los cambios se sincronizan en unos segundos.</p>
    </details>
  </section>

  <section class="faq-group" id="billing" aria-labelledby="billing-title">
    <h2 id="billing-title">Pagos</h2>
    <details class="faq">
      <summary>¿Qué métodos de pago aceptáis?</summary>
      <p>Tarjeta de crédito o débito y transferencia bancaria. Las facturas se envían por correo cada mes.</p>
    </details>
    <details class="faq">
      <summary>¿Puedo pedir un reembolso?</summary>
      <p>Durante los primeros 14 días, sí, sin dar explicaciones. Escríbenos desde la sección de ayuda de tu cuenta.</p>
    </details>
  </section>

  <section class="faq-group" id="privacy" aria-labelledby="privacy-title">
    <h2 id="privacy-title">Privacidad</h2>
    <details class="faq">
      <summary>¿Dónde se guardan mis datos?</summary>
      <p>En servidores de la Unión Europea, cifrados tanto en tránsito como en reposo.</p>
    </details>
    <details class="faq">
      <summary>¿Cómo elimino mi cuenta?</summary>
      <p>Desde <strong>Configuración → Cuenta → Eliminar cuenta</strong>. Borraremos tus datos en un plazo de 30 días.</p>
    </details>
  </section>

  <aside class="contact" aria-labelledby="contact-title">
    <h2 id="contact-title">¿Sigues con dudas?</h2>
    <p>Escríbenos a <a href="mailto:ayuda@example.com">ayuda@example.com</a>.</p>
  </aside>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Preguntas frecuentes
   - details/summary aporta el comportamiento (abrir, cerrar, teclado) sin JS;
     el CSS solo lo viste.
   - El marcador nativo se sustituye con ::marker (content) y cambia con [open].
   - :has() lleva el foco de <summary> a todo el bloque, que es lo que se ve.
   - Contadores: las preguntas se numeran dentro de cada categoría.
   Nota: las propiedades de caja y de texto se usan de forma básica.
   ────────────────────────────────────────────────────────────────────────── */
@layer tokens, base, components;

@layer tokens {
  :root {
    --color-bg: oklch(98.5% 0.005 260);
    --color-surface: oklch(96% 0.01 260);
    --color-border: oklch(85% 0.02 260);
    --color-text: oklch(25% 0.03 260);
    --color-text-muted: oklch(45% 0.03 260);
    --color-brand: oklch(50% 0.18 260);
    --radius: 0.5rem;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.55;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-brand);
    outline-offset: 2px;
  }
}

@layer components {
  .page {
    max-width: 44rem;
    margin-inline: auto;
    padding: 1rem;
  }

  .lead {
    color: var(--color-text-muted);
  }

  /* Índice de categorías en línea */
  .categories {
    list-style: none;
    padding: 0;
  }

  .categories li {
    display: inline;                      /* en la misma línea (modelo de cajas) */
    margin-inline-end: 1.25rem;
  }

  .categories a {
    font-weight: 600;
  }

  /* Cada categoría reinicia su propio contador de preguntas */
  .faq-group {
    counter-reset: question;
    border-left: 4px solid transparent;
    padding-inline-start: 0.75rem;
    margin-block: 1.5rem;
  }

  /* La categoría elegida en el índice */
  .faq-group:target {
    border-left-color: var(--color-brand);
  }

  .faq-group h2 {
    font-size: 1.25rem;
  }

  .faq {
    counter-increment: question;
    background: #ffffff;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    margin-bottom: 0.5rem;
  }

  .faq summary {
    padding: 0.75rem 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  /* Marcador propio: número de la pregunta y un signo que cambia al abrirla */
  .faq summary::marker {
    content: counter(question) ". +  ";
    color: var(--color-brand);
    font-weight: 700;
  }

  .faq[open] summary::marker {
    content: counter(question) ". −  ";
  }

  .faq summary:hover {
    color: var(--color-brand);
  }

  /* El anillo de foco se dibuja en todo el bloque, no solo en el texto de la pregunta */
  .faq summary:focus-visible {
    outline: none;
  }

  .faq:has(> summary:focus-visible) {
    outline: 3px solid var(--color-brand);
    outline-offset: 2px;
  }

  .faq[open] {
    border-color: var(--color-brand);
  }

  .faq[open] summary {
    border-bottom: 1px solid var(--color-border);
  }

  .faq p {
    margin: 0;
    padding: 0.75rem 1rem 1rem;
  }

  .contact {
    background: var(--color-surface);
    border-radius: var(--radius);
    padding: 0.25rem 1.25rem 0.5rem;
    margin-top: 2rem;
  }

  .contact h2 {
    font-size: 1.125rem;
  }
}
```
