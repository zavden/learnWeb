---
example_description: "Un aviso de cookies accesible pegado al borde inferior: sticky al final del body (reserva su propio hueco, a diferencia de fixed), con altura máxima y scroll propio, opciones plegables y dos botones con el mismo peso; scroll-padding evita que tape el foco"
example_tags: "css|profesional|sticky|fixed|scroll-padding|accesibilidad|z-index"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <p class="site-name">Ayuntamiento de Ribera · Deportes</p>
</header>

<main class="page">
  <h1>Piscina municipal: horarios de invierno</h1>
  <p>Del 1 de octubre al 31 de mayo, la piscina cubierta abre de lunes a viernes de 7:00 a 22:00 y los fines de semana de 9:00 a 14:00.</p>
  <h2>Calles de nado libre</h2>
  <p>De lunes a viernes hay tres calles de nado libre por la mañana y dos por la tarde. Consulta la <a href="#">ocupación en directo</a> antes de venir.</p>
  <h2>Cursos</h2>
  <p>Las inscripciones de los cursos de enero se abren el 1 de diciembre. Hay cursos para bebés, infantiles, adultos y mayores de 65 años.</p>
  <p><a href="#">Ver todos los cursos</a> · <a href="#">Tarifas y bonos</a></p>
  <h2>Normas</h2>
  <p>Gorro obligatorio, chanclas en el recinto y ducha antes del baño. Los menores de 12 años deben ir acompañados.</p>
  <p>Para cualquier duda, escribe a <a href="#">deportes@ribera.example</a>.</p>
</main>

<section class="consent" aria-labelledby="consent-title">
  <div class="consent-inner">
    <h2 class="consent-title" id="consent-title">Tu privacidad</h2>
    <p class="consent-text">Usamos cookies propias para que la web funcione y, solo si nos dejas, cookies de medición para saber qué páginas se consultan más. <a href="#">Política de cookies</a></p>
    <details class="consent-settings">
      <summary>Configurar</summary>
      <p class="option"><input type="checkbox" id="cookies-needed" checked disabled> <label for="cookies-needed"><strong>Necesarias</strong> · siempre activas: sesión e idioma.</label></p>
      <p class="option"><input type="checkbox" id="cookies-stats"> <label for="cookies-stats"><strong>Medición</strong> · visitas anónimas por página.</label></p>
    </details>
    <p class="consent-actions">
      <button class="button" type="button">Rechazar</button>
      <button class="button" type="button">Aceptar todas</button>
    </p>
  </div>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Aviso de cookies
   - sticky + bottom: 0 como ÚLTIMO hijo del body: mientras lees, se queda pegado
     abajo; al llegar al final de la página, ocupa su propio hueco y no tapa nada.
     Con position: fixed habría que reservar a mano un padding-bottom del tamaño
     del aviso, que cambia con el texto, el ancho y las opciones abiertas.
   - Altura máxima con min() y scroll propio: en un móvil en horizontal nunca
     ocupa toda la pantalla.
   - scroll-padding-bottom: al navegar con Tab, el navegador desplaza la página
     para que el elemento enfocado no quede debajo del aviso.
   - «Rechazar» y «Aceptar todas» tienen el mismo aspecto: elegir debe costar lo mismo.
     (Guardar la elección y ocultar el aviso lo haría el JavaScript del sitio.)
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

  button,
  input {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: #ffffff;
    --color-surface: #f8fafc;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #cbd5e1;
    --color-brand: #0f766e;
    --color-focus: #1d4ed8;

    --consent-max-h: min(60vh, 22rem);
    --z-consent: 300;
  }
}

@layer base {
  html {
    scroll-padding-bottom: calc(var(--consent-max-h) + 1rem);
  }

  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .site-header {
    padding: 0.75rem clamp(1rem, 4vw, 2rem);
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
  }

  .page {
    width: min(100% - 2rem, 42rem);
    margin: 1.5rem auto 2rem;
  }

  .page h1 {
    margin-bottom: 0.75rem;
    font-size: clamp(1.4rem, 4vw, 1.9rem);
    line-height: 1.2;
  }

  .page h2 {
    margin: 1.5rem 0 0.25rem;
    font-size: 1.15rem;
  }

  .page p {
    margin-bottom: 0.75rem;
  }

  /* ─── El aviso ─── */
  .consent {
    position: sticky;
    bottom: 0;
    z-index: var(--z-consent);
    max-height: var(--consent-max-h);
    overflow-y: auto;
    border-top: 3px solid var(--color-brand);
    background: var(--color-surface);
    box-shadow: 0 -8px 24px rgb(15 23 42 / 0.12);
  }

  .consent-inner {
    width: min(100% - 2rem, 50rem);
    margin-inline: auto;
    padding-block: 1rem;
  }

  .consent-title {
    font-size: 1.05rem;
  }

  .consent-text {
    margin-block: 0.25rem 0.5rem;
    font-size: 0.95rem;
  }

  .consent-settings {
    margin-bottom: 0.75rem;
  }

  .consent-settings summary {
    width: fit-content;
    color: var(--color-brand);
    font-weight: 600;
    cursor: pointer;
  }

  /* Casilla y texto: la casilla es inline-block y se apoya en la línea base de su
     etiqueta; las líneas siguientes se alinean con el texto gracias al relleno y a
     un margen negativo de la casilla. */
  .option {
    margin-top: 0.5rem;
    padding-left: 1.75rem;
    font-size: 0.9rem;
  }

  .option input {
    width: 1.1rem;
    height: 1.1rem;
    margin: 0 0.5rem 0 -1.75rem;
    vertical-align: -0.15em;
  }

  /* Dos botones iguales, en fila (inline-block alineados por arriba). */
  .consent-actions {
    margin-top: 0.25rem;
  }

  .button {
    display: inline-block;
    vertical-align: top;
    min-width: 9rem;
    margin: 0.25rem 0.5rem 0 0;
    padding: 0.6rem 1.1rem;
    border: 2px solid var(--color-brand);
    border-radius: 8px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
  }
}
```
