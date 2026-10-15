---
example_description: "Una cabecera mobile-first: por debajo de 40rem, el menú es un popover que abre el botón «Menú» (sin JavaScript); desde 40rem, el mismo elemento se muestra en línea y el botón desaparece. Objetivos de 44px con any-pointer: coarse y espacios fluidos"
example_tags: "css|responsive|integracion|media-queries|mobile-first|popover|any-pointer|navegacion"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<header class="site-header">
  <a class="site-header__logo" href="/">Vivero <strong>Xochimilco</strong></a>
  <button class="site-header__button" type="button" popovertarget="site-menu">☰ Menú</button>
  <nav id="site-menu" class="site-menu" popover aria-label="Principal">
    <ul>
      <li><a href="/plantas">Plantas</a></li>
      <li><a href="/macetas">Macetas</a></li>
      <li><a href="/cursos">Cursos</a></li>
      <li><a href="/visitanos">Visítanos</a></li>
    </ul>
  </nav>
</header>
<main class="page">
  <p>A 480px (esta tarjeta): botón «Menú». Púlsalo: el menú se abre encima de la página y se cierra al pulsar fuera o con <kbd>Esc</kbd>. Ensancha la vista previa o ábrela con ↗: desde 40rem (640px), los enlaces se ven en la cabecera y el botón desaparece.</p>
</main>
```

# CSS

```css
:root {
  --space-s: clamp(0.75rem, 0.6rem + 0.75vw, 1.25rem);   /* lección 3 */
  --brand: #166534;
}

body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.page { padding: var(--space-s); font-size: 0.85rem; }

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-s);
  padding: var(--space-s);
  background: #f0fdf4;
  border-bottom: 2px solid var(--brand);
}

.site-header__logo { color: var(--brand); text-decoration: none; }
.site-header__button { padding: 6px 12px; border: 2px solid var(--brand); border-radius: 8px; background: #ffffff; color: var(--brand); font: inherit; font-weight: 700; }

/* MÓVIL (la base): el menú es un popover (lección de elementos interactivos
   de HTML). Mientras está cerrado, el navegador lo oculta; abierto, va en la
   capa superior. Lo colocamos como un desplegable bajo la cabecera. */
.site-menu {
  inset: 3.5rem 0.75rem auto auto;
  margin: 0;
  padding: 8px;
  border: 1px solid #94a3b8;
  border-radius: 10px;
  background: #ffffff;
  color: inherit;
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.25);
}

.site-menu ul { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.site-menu a { display: block; padding: 6px 12px; border-radius: 6px; color: #1e293b; }
.site-menu a:hover { background: #dcfce7; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }

/* Lección 2: con un dedo, objetivos de al menos 44px de alto. */
@media (any-pointer: coarse) {
  .site-menu a, .site-header__button { min-height: 44px; display: flex; align-items: center; }
}

/* ESCRITORIO: el mismo <nav> se muestra en su sitio. Los estilos del popover
   cerrado (display: none) son del navegador, y una regla del autor les gana;
   el resto (position: fixed, borde, márgenes) se deshace aquí. */
@media (width >= 40rem) {
  .site-header__button { display: none; }

  .site-menu {
    display: block;
    position: static;
    inset: auto;
    width: auto;
    height: auto;
    overflow: visible;
    padding: 0;
    border: 0;
    background: none;
    box-shadow: none;
  }

  .site-menu ul { display: flex; gap: 4px; }
}
```
