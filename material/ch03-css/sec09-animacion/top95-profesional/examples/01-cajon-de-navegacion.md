---
example_description: "La navegación de una tienda: en pantallas estrechas, un cajón lateral hecho con popover que entra desde la izquierda con @starting-style, sale con overlay y display en allow-discrete, oscurece el fondo con ::backdrop y escalona sus enlaces; desde 48rem, la misma lista es una barra normal. El movimiento depende de un token --motion que vale 0 salvo con prefers-reduced-motion: no-preference"
example_tags: "css|profesional|popover|starting-style|overlay|allow-discrete|backdrop|navegacion|media-queries|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <a class="brand" href="/">Vivero <strong>Los Nopales</strong></a>
  <button type="button" class="menu-button" popovertarget="site-nav">☰ Menú</button>
  <nav id="site-nav" class="nav" popover aria-label="Principal">
    <div class="nav__head">
      <span class="nav__title">Menú</span>
      <button type="button" class="nav__close" popovertarget="site-nav" popovertargetaction="hide">✕<span class="visually-hidden"> Cerrar el menú</span></button>
    </div>
    <ul class="nav__links">
      <li style="--i: 0"><a href="/plantas" aria-current="page">Plantas</a></li>
      <li style="--i: 1"><a href="/macetas">Macetas</a></li>
      <li style="--i: 2"><a href="/talleres">Talleres</a></li>
      <li style="--i: 3"><a href="/blog">Blog del huerto</a></li>
      <li style="--i: 4"><a href="/contacto">Contacto</a></li>
    </ul>
    <p class="nav__foot">Envío gratis desde $599</p>
  </nav>
</header>

<main class="page">
  <h1>Plantas de interior</h1>
  <p>Pothos, sansevierias y helechos que aguantan la poca luz de un departamento. Todas llegan en macetas de barro de Tonalá.</p>
  <p class="hint">En una ventana estrecha, abre el menú con «☰ Menú» y ciérralo con ✕, con Escape o pulsando fuera. Ensancha la vista previa (↗) por encima de 48rem para ver la barra.</p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Cajón de navegación
   - Móvil primero: la navegación es un popover (capa superior, se cierra
     al pulsar fuera o con Escape, sin JavaScript). Entra desde la izquierda:
     @starting-style para la entrada; overlay y display con allow-discrete
     para que, al cerrarse, siga en la capa superior hasta terminar de salir.
   - ::backdrop oscurece la página con su propia transición.
   - Los enlaces llegan escalonados (--i × 40 ms) solo al abrir.
   - Movimiento: --motion vale 0 por defecto y 1 con no-preference. Todas las
     distancias se multiplican por él: con «reducir movimiento», el cajón se
     funde en su sitio y los enlaces no se desplazan.
   - Desde 48rem, la misma lista es una barra en la cabecera: el popover se
     muestra siempre (display: flex gana a la regla del navegador) y el botón
     desaparece.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-accent: #15803d;
  --color-surface: #ffffff;
  --color-tint: #f0fdf4;
  --color-focus: #1d4ed8;
  --duration-enter: 300ms;
  --duration-exit: 200ms;
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --motion: 0;
}

@media (prefers-reduced-motion: no-preference) {
  :root {
    --motion: 1;
  }
}

/* ── Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

/* ── Cabecera ── */
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-brand);
  color: #ffffff;
}

.brand {
  color: inherit;
  text-decoration: none;
}

.site-header :focus-visible {
  outline-color: #fde047;
}

.menu-button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ffffff;
  border-radius: 999px;
  background: transparent;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

/* ── Cajón (móvil) ── */
.nav {
  inset: 0 auto 0 0;
  width: min(80vw, 18rem);
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 1rem;
  border: 0;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 8px 0 24px rgb(15 23 42 / 0.25);
  opacity: 0;
  translate: calc(var(--motion) * -100%) 0;
  transition:
    opacity var(--duration-exit) var(--ease-exit),
    translate var(--duration-exit) var(--ease-exit),
    overlay var(--duration-exit) allow-discrete,
    display var(--duration-exit) allow-discrete;
}

.nav:popover-open {
  opacity: 1;
  translate: 0 0;
  transition:
    opacity var(--duration-enter) var(--ease-enter),
    translate var(--duration-enter) var(--ease-enter),
    overlay var(--duration-enter) allow-discrete,
    display var(--duration-enter) allow-discrete;
}

@starting-style {
  .nav:popover-open {
    opacity: 0;
    translate: calc(var(--motion) * -100%) 0;
  }
}

.nav::backdrop {
  background-color: rgb(15 23 42 / 0);
  transition:
    background-color var(--duration-enter),
    overlay var(--duration-enter) allow-discrete,
    display var(--duration-enter) allow-discrete;
}

.nav:popover-open::backdrop {
  background-color: rgb(15 23 42 / 0.5);
}

@starting-style {
  .nav:popover-open::backdrop {
    background-color: rgb(15 23 42 / 0);
  }
}

.nav__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.nav__title {
  font-weight: 800;
}

.nav__close {
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 50%;
  background: var(--color-tint);
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

.nav__links {
  display: grid;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav__links a {
  display: block;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  color: inherit;
  text-decoration: none;
  transition: background-color 150ms;
}

.nav__links a:hover {
  background: var(--color-tint);
}

.nav__links a[aria-current="page"] {
  color: var(--color-accent);
  font-weight: 700;
}

/* Los enlaces, escalonados al abrir; al cerrar se van con el cajón. */
.nav__links li {
  opacity: 0;
  translate: calc(var(--motion) * -0.75rem) 0;
  transition: opacity 200ms, translate 200ms var(--ease-enter);
}

.nav:popover-open .nav__links li {
  opacity: 1;
  translate: 0 0;
  transition-delay: calc(80ms + var(--i) * 40ms);
}

@starting-style {
  .nav:popover-open .nav__links li {
    opacity: 0;
    translate: calc(var(--motion) * -0.75rem) 0;
  }
}

.nav__foot {
  margin: 1rem 0 0;
  padding-top: 0.75rem;
  border-top: 1px solid #cbd5e1;
  color: var(--color-muted);
  font-size: 0.85rem;
}

/* ── Página ── */
.page {
  max-width: 40rem;
  padding: 1rem;
}

.page h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.hint {
  color: var(--color-muted);
  font-size: 0.85rem;
}

/* ── Escritorio: la misma lista, en la barra ── */
@media (width >= 48rem) {
  .menu-button,
  .nav__head,
  .nav__foot {
    display: none;
  }

  .nav {
    position: static;
    display: block;
    width: auto;
    height: auto;
    padding: 0;
    overflow: visible;
    background: transparent;
    color: #ffffff;
    box-shadow: none;
    opacity: 1;
    translate: none;
    transition: none;
  }

  .nav__links {
    display: flex;
    gap: 0.25rem;
  }

  .nav__links li {
    opacity: 1;
    translate: none;
  }

  .nav__links a:hover {
    background: rgb(255 255 255 / 0.15);
  }

  .nav__links a[aria-current="page"] {
    color: #ffffff;
    text-decoration: underline;
    text-underline-offset: 0.3em;
  }
}
```
