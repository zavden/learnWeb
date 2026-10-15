---
example_description: "La cabecera completa de una tienda en línea: aviso de envío, logo, buscador flexible, accesos de cuenta con contador, barra de categorías y migas de pan; se adapta al ancho solo con flex-wrap"
example_tags: "css|profesional|flexbox|cabecera|navegacion|flex-wrap|buscador"
example_stage: professional
example_importance: important
---

# HTML

```html
<a class="skip-link" href="#contenido">Saltar al contenido</a>

<header class="site-header">
  <p class="promo">
    <span>Envío gratis en compras desde 499 MXN</span>
    <a href="/envios">Ver condiciones</a>
  </p>

  <div class="masthead">
    <a class="brand" href="/">
      <svg class="brand-logo" width="32" height="32" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20C4 9 11 4 20 4c0 9-5 16-16 16Zm0 0 9-9" fill="#bbf7d0" stroke="#14532d" stroke-width="2" stroke-linecap="round"/></svg>
      <span class="brand-name">Vivero <strong>Xochi</strong></span>
    </a>

    <form class="search" role="search" action="/buscar">
      <input class="search-input" type="search" name="q" aria-label="Buscar en la tienda" placeholder="Plantas, macetas, abono…">
      <button class="search-button">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="m16 16 5 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        Buscar
      </button>
    </form>

    <nav class="account" aria-label="Tu cuenta">
      <a class="account-link" href="/entrar">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        Entrar
      </a>
      <a class="account-link" href="/favoritos">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        Favoritos
      </a>
      <a class="account-link" href="/carrito" aria-label="Carrito, 3 productos">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.5 12h-11L5 8Zm4 0a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        Carrito
        <span class="count" aria-hidden="true">3</span>
      </a>
    </nav>
  </div>

  <nav class="categories" aria-label="Categorías">
    <ul class="categories-list">
      <li><a href="/plantas/interior" aria-current="page">Interior</a></li>
      <li><a href="/plantas/exterior">Exterior</a></li>
      <li><a href="/suculentas">Suculentas y cactus</a></li>
      <li><a href="/macetas">Macetas</a></li>
      <li><a href="/sustratos">Sustratos y abono</a></li>
      <li><a href="/talleres">Talleres</a></li>
      <li class="categories-deals"><a href="/ofertas">Ofertas de otoño</a></li>
    </ul>
  </nav>
</header>

<main id="contenido" class="page" tabindex="-1">
  <nav aria-label="Migas de pan">
    <ol class="breadcrumbs">
      <li><a href="/">Inicio</a></li>
      <li><a href="/plantas">Plantas</a></li>
      <li><a href="/plantas/interior" aria-current="page">Interior</a></li>
    </ol>
  </nav>
  <h1>Plantas de interior</h1>
  <p>Especies que viven felices lejos de la ventana, con guía de riego incluida. Estrecha la ventana (o abre la vista previa con ↗) para ver cómo se recoloca la cabecera.</p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Cabecera de tienda
   - Tres filas: aviso, cabecera principal y categorías. Cada una es un
     contenedor flex con flex-wrap: cuando falta sitio, las piezas bajan de
     línea en lugar de aplastarse. No hay ni una media query.
   - Cabecera principal: logo rígido (flex: none), buscador que ocupa lo que
     sobra (flex: 1 1 14rem) y cuenta empujada al final con margin-left: auto.
     Cuando no cabe, la cuenta baja a su propia línea y sigue a la derecha.
   - El buscador y su campo llevan min-width: 0 en los dos niveles: un <input>
     tiene un ancho por defecto que, sin esto, sería su mínimo.
   - El orden del HTML es el orden visual: nada de order ni row-reverse.
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
    --color-border: #cbd5e1;
    --color-surface: #ffffff;
    --color-brand: #166534;
    --color-brand-dark: #14532d;
    --color-brand-soft: #f0fdf4;
    --color-accent: #b91c1c;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --radius: 0.5rem;
    --control-h: 2.5rem;
  }
}

@layer base {
  body {
    background: var(--color-surface);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  /* ─── Saltar al contenido: fuera de la vista hasta que recibe el foco ─── */
  .skip-link {
    position: absolute;
    top: -4rem;
    left: var(--space-4);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius);
    background: var(--color-brand-dark);
    color: #ffffff;
  }

  .skip-link:focus {
    top: var(--space-2);
  }

  /* ─── Aviso: centrado y partido en líneas si no cabe ─── */
  .promo {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0 var(--space-3);
    padding: var(--space-1) var(--space-4);
    background: var(--color-brand-dark);
    color: #ffffff;
    font-size: 0.8rem;
    text-align: center;
  }

  .promo a {
    font-weight: 600;
  }

  /* ─── Cabecera principal ─── */
  .masthead {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-4);
    padding: var(--space-3) var(--space-4);
  }

  .brand {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-brand-dark);
    font-size: 1.15rem;
    text-decoration: none;
    white-space: nowrap;
  }

  .brand-name strong {
    font-weight: 800;
  }

  /* Elemento flex de la cabecera (base 14rem, crece) y contenedor de campo y botón. */
  .search {
    display: flex;
    flex: 1 1 14rem;
    min-width: 0;
  }

  .search-input {
    flex: 1;
    min-width: 0;
    height: var(--control-h);
    padding: 0 var(--space-3);
    border: 1px solid #64748b;
    border-right: 0;
    border-radius: var(--radius) 0 0 var(--radius);
  }

  .search-button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    height: var(--control-h);
    padding: 0 var(--space-3);
    border: 0;
    border-radius: 0 var(--radius) var(--radius) 0;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
  }

  /* La cuenta, al final de la línea en la que caiga. */
  .account {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-4);
    margin-left: auto;
    font-size: 0.85rem;
  }

  .account-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    text-decoration: none;
    white-space: nowrap;
  }

  .account-link:hover {
    color: var(--color-brand);
  }

  /* El contador: la cifra en el centro exacto de un círculo que crece con ella. */
  .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.3rem;
    border-radius: 999px;
    background: var(--color-accent);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 700;
  }

  /* ─── Categorías ─── */
  .categories {
    border-block: 1px solid var(--color-border);
    background: var(--color-brand-soft);
  }

  .categories-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-4);
    padding: 0 var(--space-4);
    list-style: none;
    font-size: 0.85rem;
  }

  .categories-list a {
    display: block;
    padding: var(--space-2) 0;
    color: var(--color-brand-dark);
    text-decoration: none;
  }

  /* El elemento actual, subrayado con una sombra interior que no ocupa sitio. */
  .categories-list a[aria-current="page"] {
    box-shadow: inset 0 -3px var(--color-brand);
    font-weight: 700;
  }

  .categories-deals {
    margin-left: auto;
  }

  .categories-deals a {
    color: var(--color-accent);
    font-weight: 700;
  }

  /* ─── Página ─── */
  .page {
    max-width: 60rem;
    padding: var(--space-3) var(--space-4) var(--space-4);
  }

  .breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding: 0;
    color: var(--color-muted);
    font-size: 0.8rem;
    list-style: none;
  }

  /* El separador va antes de cada miga menos la primera. */
  .breadcrumbs li + li::before {
    content: "/";
    margin-right: var(--space-1);
  }

  .breadcrumbs [aria-current="page"] {
    color: var(--color-text);
    font-weight: 600;
    text-decoration: none;
  }

  .page h1 {
    margin-block: var(--space-2);
    font-size: 1.6rem;
    line-height: 1.2;
  }

  .page p {
    max-width: 38rem;
    color: var(--color-muted);
  }
}
```
