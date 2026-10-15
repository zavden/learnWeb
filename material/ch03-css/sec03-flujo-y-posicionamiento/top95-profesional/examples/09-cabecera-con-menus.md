---
example_description: "La cabecera de un sitio: enlace para saltar al contenido que aparece con el foco, cabecera sticky con menús desplegables que quedan por encima de un hero con capas propias aisladas, y anclas que no quedan tapadas por la cabecera"
example_tags: "css|profesional|sticky|position|z-index|isolation|accesibilidad"
example_stage: professional
example_importance: critical
---

# HTML

```html
<a class="skip-link" href="#main">Saltar al contenido</a>

<header class="site-header">
  <a class="logo" href="#"><img class="logo-mark" src="logo.svg" width="32" height="32" alt="">Refugios de Gredos</a>
  <nav class="site-nav" aria-label="Principal">
    <ul class="menu">
      <li class="menu-item">
        <details class="dropdown" open>
          <summary>Rutas</summary>
          <ul class="submenu">
            <li><a href="#">Laguna Grande</a></li>
            <li><a href="#">Circo de Gredos</a></li>
            <li><a href="#">Cinco Lagunas</a></li>
            <li><a href="#">Travesía integral</a></li>
          </ul>
        </details>
      </li>
      <li class="menu-item">
        <details class="dropdown">
          <summary>Refugios</summary>
          <ul class="submenu">
            <li><a href="#">Refugio Elola</a></li>
            <li><a href="#">Refugio del Rey</a></li>
          </ul>
        </details>
      </li>
      <li class="menu-item"><a class="menu-link" href="#">Reservas</a></li>
    </ul>
  </nav>
</header>

<main id="main" tabindex="-1">
  <section class="hero" aria-labelledby="hero-title">
    <p class="hero-kicker">Temporada 2026-2027</p>
    <h1 class="hero-title" id="hero-title">Duerme a 1950 metros, junto a la Laguna Grande</h1>
    <a class="hero-action" href="#">Ver disponibilidad</a>
  </section>

  <section class="news" aria-labelledby="news-title">
    <h2 id="news-title">Avisos de la semana</h2>
    <article class="notice"><span class="notice-tag">Nieve</span><h3>Crampones obligatorios desde el Morezón</h3><p>La nieve helada cubre el sendero a partir de las 10:00. Comprueba el parte antes de salir.</p></article>
    <article class="notice"><span class="notice-tag notice-tag--info">Horario</span><h3>El refugio cierra los martes de noviembre</h3><p>Las reservas para esos días se mueven sin coste al miércoles.</p></article>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Cabecera con menús desplegables
   - Skip link: absolute fuera de la pantalla (top negativo) hasta que recibe el
     foco; entonces baja a la vista, por encima de todo.
   - Cabecera sticky con z-index de la escala: crea un contexto de apilamiento
     y todo lo que cuelga de ella (los submenús) compite con ese número.
   - Submenús: details + lista absolute colgada de su elemento (top: 100%).
   - El hero tiene capas propias (una veladura con z-index: -1 sobre la foto):
     isolation: isolate las mantiene dentro de él, delante de su fondo y detrás
     de su texto, y sin competir con la cabecera.
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

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@layer tokens {
  :root {
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-brand: #1e3a8a;
    --color-accent: #facc15;
    --color-focus: #1d4ed8;

    --header-h: 3.75rem;

    --z-header: 200;
    --z-skip: 1000;
  }
}

@layer base {
  html {
    scroll-padding-top: calc(var(--header-h) + 1rem);
  }

  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-focus);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  /* ─── Saltar al contenido ───
     Fuera de la vista pero en el documento: el teclado lo encuentra el primero. */
  .skip-link {
    position: absolute;
    top: -10rem;
    left: 1rem;
    z-index: var(--z-skip);
    padding: 0.6rem 1rem;
    border-radius: 0 0 8px 8px;
    background: var(--color-text);
    color: #ffffff;
    font-weight: 700;
  }

  .skip-link:focus {
    top: 0;
  }

  /* ─── Cabecera ─── */
  .site-header {
    position: sticky;
    top: 0;
    z-index: var(--z-header);
    padding-inline: clamp(1rem, 4vw, 2rem);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    line-height: var(--header-h);        /* cada línea de la cabecera mide lo mismo */
  }

  .logo {
    margin-right: 1.5rem;
    color: var(--color-text);
    font-weight: 800;
    text-decoration: none;
  }

  /* Logotipo inline-block centrado con el texto de la línea. */
  .logo-mark {
    display: inline-block;
    width: 2rem;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  .site-nav {
    display: inline-block;
  }

  .menu {
    padding: 0;
    list-style: none;
  }

  /* Elementos del menú en fila (inline-block). En una pantalla estrecha, el menú baja
     a una segunda línea de la cabecera, como una palabra que no cabe. */
  .menu-item {
    display: inline-block;
    margin-right: 0.25rem;
  }

  .dropdown {
    position: relative;                  /* referencia de su submenú */
  }

  .dropdown summary,
  .menu-link {
    display: block;
    padding-inline: 0.75rem;
    border-radius: 6px;
    color: var(--color-text);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .dropdown[open] summary {
    background: #eef2ff;
  }

  /* El submenú cuelga justo debajo de su elemento, sin empujar nada. */
  .submenu {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    min-width: 12rem;
    padding: 0.4rem 0;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-surface);
    box-shadow: 0 12px 28px rgb(15 23 42 / 0.18);
    list-style: none;
    line-height: 1.5;
  }

  .submenu a {
    display: block;
    padding: 0.35rem 1rem;
    color: var(--color-text);
    text-decoration: none;
  }

  .submenu a:hover {
    background: #eef2ff;
  }

  /* ─── Hero con capas propias ─── */
  .hero {
    position: relative;
    isolation: isolate;
    padding: clamp(2.5rem, 8vw, 5rem) clamp(1rem, 4vw, 2rem);
    background: #1e3a8a url("hero-mountains.svg") center / cover;
    color: #ffffff;
  }

  /* La veladura oscurece la foto para que el texto se lea. Con z-index: -1 queda
     detrás del texto; gracias a isolation, delante del fondo del propio hero. */
  .hero::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: rgb(15 23 42 / 0.45);
  }

  .hero-kicker {
    color: var(--color-accent);
    font-weight: 700;
  }

  .hero-title {
    max-width: 22ch;
    margin-block: 0.5rem 1.25rem;
    font-size: clamp(1.6rem, 5vw, 2.6rem);
    line-height: 1.15;
  }

  .hero-action {
    display: inline-block;
    padding: 0.6rem 1.2rem;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-text);
    font-weight: 700;
    text-decoration: none;
  }

  .hero-action:focus-visible {
    outline-color: #ffffff;
  }

  /* ─── Avisos ─── */
  .news {
    width: min(100% - 2rem, 48rem);
    margin: 2rem auto 3rem;
  }

  .news h2 {
    margin-bottom: 0.75rem;
    font-size: 1.3rem;
  }

  .notice {
    position: relative;
    margin-bottom: 0.75rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
  }

  .notice h3 {
    padding-right: 5rem;                 /* sitio para la etiqueta de la esquina */
    font-size: 1.05rem;
  }

  .notice p {
    color: var(--color-text-muted);
  }

  .notice-tag {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0 0.6rem;
    border-radius: 999px;
    background: #fee2e2;
    color: #991b1b;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .notice-tag--info {
    background: #dbeafe;
    color: #1e40af;
  }
}
```
