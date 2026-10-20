---
example_description: "Un pie de página completo pegado al fondo de la ventana: boletín con campo y botón, columnas de enlaces que se reparten solas, iconos sociales centrados y una franja legal que se parte en líneas"
example_tags: "css|profesional|flexbox|footer|flex-wrap|pie-pegado-abajo|formularios"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="page">
  <main class="page-main">
    <h1>Gracias por tu compra</h1>
    <p>Te enviamos la confirmación del pedido 4821 a ana.torres@correo.mx. Una página corta como esta es el caso en el que el pie tiende a quedarse a media pantalla.</p>
  </main>

  <footer class="site-footer">
    <section class="newsletter" aria-labelledby="newsletter-title">
      <div class="newsletter-text">
        <h2 id="newsletter-title">Consejos de temporada en tu correo</h2>
        <p>Una vez al mes. Sin publicidad de terceros.</p>
      </div>
      <form class="newsletter-form" action="/boletin" method="post">
        <label for="footer-email">Tu correo electrónico</label>
        <div class="field-row">
          <input id="footer-email" type="email" name="email" autocomplete="email" required>
          <button>Suscribirme</button>
        </div>
      </form>
    </section>

    <nav class="footer-links" aria-label="Enlaces del pie">
      <div class="link-column">
        <h2>Tienda</h2>
        <ul>
          <li><a href="/plantas/interior">Plantas de interior</a></li>
          <li><a href="/plantas/exterior">Plantas de exterior</a></li>
          <li><a href="/macetas">Macetas</a></li>
          <li><a href="/tarjetas-de-regalo">Tarjetas de regalo</a></li>
        </ul>
      </div>
      <div class="link-column">
        <h2>Ayuda</h2>
        <ul>
          <li><a href="/envios">Envíos y entregas</a></li>
          <li><a href="/devoluciones">Devoluciones</a></li>
          <li><a href="/garantia">Garantía de plantas</a></li>
          <li><a href="/contacto">Contacto</a></li>
        </ul>
      </div>
      <div class="link-column">
        <h2>Vivero Xochi</h2>
        <ul>
          <li><a href="/nosotros">Quiénes somos</a></li>
          <li><a href="/talleres">Talleres</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/empleo">Trabaja con nosotros</a></li>
        </ul>
      </div>
      <div class="link-column">
        <h2>Visítanos</h2>
        <address>Av. Vallarta 2150<br>Col. Arcos Vallarta<br>44130 Guadalajara, Jal.<br>Lun. a sáb., de 9:00 a 19:00</address>
      </div>
    </nav>

    <ul class="social" aria-label="Redes sociales">
      <li><a href="https://www.instagram.com/" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg></a></li>
      <li><a href="https://www.youtube.com/" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/></svg></a></li>
      <li><a href="https://wa.me/523312345678" aria-label="WhatsApp"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19l-4 1Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></a></li>
    </ul>

    <div class="legal">
      <p>© 2026 Vivero Xochi, S. A. de C. V.</p>
      <ul class="legal-links">
        <li><a href="/aviso-de-privacidad">Aviso de privacidad</a></li>
        <li><a href="/terminos">Términos y condiciones</a></li>
        <li><a href="/cookies">Cookies</a></li>
      </ul>
    </div>
  </footer>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Pie de página
   - Patrón del pie pegado abajo: la página es una columna de 100dvh como
     mínimo y main crece (flex: 1). Con poco contenido, el pie queda abajo;
     con mucho, va detrás.
   - Boletín: texto y formulario se apilan si no caben; dentro, campo y botón.
   - Columnas de enlaces: cada una quiere 9rem y crece; caben 4, 2 o 1 por
     línea según el ancho, sin media queries.
   - Iconos sociales: círculos con el icono centrado; la fila, centrada.
   - Franja legal: copyright a la izquierda, enlaces empujados al final.
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

  svg {
    display: block;
    flex: none;
  }

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-footer: #14532d;
    --color-footer-text: #dcfce7;
    --color-footer-line: #166534;
    --color-accent: #bbf7d0;
    --color-focus-on-dark: #fef08a;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 0.5rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

@layer components {
  /* ─── Pie pegado abajo ─── */
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .page-main {
    flex: 1;
    max-width: 40rem;
    padding: var(--space-6) var(--space-4);
  }

  .page-main h1 {
    margin-bottom: var(--space-2);
    font-size: 1.6rem;
  }

  .page-main p {
    color: var(--color-muted);
  }

  /* ─── Pie ─── */
  .site-footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-6) var(--space-4) var(--space-4);
    background: var(--color-footer);
    color: var(--color-footer-text);
    font-size: 0.9rem;
  }

  .site-footer :focus-visible {
    outline-color: var(--color-focus-on-dark);
  }

  .site-footer h2 {
    color: #ffffff;
    font-size: 1rem;
  }

  /* Boletín: dos piezas que se apilan. */
  .newsletter {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-4);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--color-footer-line);
  }

  .newsletter-text {
    flex: 1 1 14rem;
  }

  .newsletter-form {
    flex: 1 1 18rem;
  }

  .newsletter-form label {
    display: block;
    margin-bottom: var(--space-1);
  }

  .field-row {
    display: flex;
    gap: var(--space-2);
  }

  .field-row input {
    flex: 1;
    min-width: 0;
    padding: var(--space-2) var(--space-3);
    border: 0;
    border-radius: var(--radius);
  }

  .field-row button {
    flex: none;
    padding: var(--space-2) var(--space-4);
    border: 0;
    border-radius: var(--radius);
    background: var(--color-accent);
    color: var(--color-footer);
    font-weight: 700;
    cursor: pointer;
  }

  /* Columnas de enlaces: tantas por línea como quepan. */
  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6) var(--space-4);
  }

  .link-column {
    flex: 1 1 9rem;
  }

  .link-column h2 {
    margin-bottom: var(--space-2);
  }

  .link-column ul {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: 0;
    list-style: none;
  }

  .link-column a {
    text-decoration: none;
  }

  .link-column a:hover {
    text-decoration: underline;
  }

  address {
    font-style: normal;
  }

  /* Iconos sociales: un círculo con el dibujo en su centro exacto. */
  .social {
    display: flex;
    justify-content: center;
    gap: var(--space-3);
    padding: 0;
    list-style: none;
  }

  .social a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid var(--color-accent);
    border-radius: 50%;
    color: #ffffff;
  }

  .social a:hover {
    background: var(--color-footer-line);
  }

  /* Franja legal: copyright y enlaces empujados al final; se parte si no cabe. */
  .legal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-footer-line);
    font-size: 0.8rem;
  }

  .legal-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-4);
    margin-left: auto;
    padding: 0;
    list-style: none;
  }
}
```
