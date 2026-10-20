---
example_description: "La portada bilingüe español-árabe de una semana cultural: el mismo componente en las dos direcciones con propiedades lógicas, flexbox y grid, nombres en otro alfabeto aislados con bdi, flechas que cambian con :dir(), una pila de fuentes árabes y sin letter-spacing en árabe"
example_tags: "css|profesional|modos-de-escritura|rtl|dir|bdi|propiedades-logicas|lang|arabe"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <a class="brand" href="/">Centro Cultural del Lago</a>
  <nav aria-label="Idioma">
    <a href="/semana-arabe" aria-current="page">Español</a>
    <a href="/ar/semana-arabe" lang="ar" hreflang="ar">العربية</a>
  </nav>
</header>

<main class="editions">
  <section class="edition" lang="es" aria-labelledby="title-es">
    <p class="kicker">Del 15 al 20 de noviembre</p>
    <h2 id="title-es">Semana de la cultura árabe</h2>
    <p class="summary">Cinco días de música, caligrafía y cocina en la Ciudad de México. Entrada libre.</p>
    <h3 class="program-title">Programa</h3>
    <ul class="program">
      <li><time datetime="17:00">17:00</time> <span>Caligrafía árabe, con <bdi lang="ar">نور الهدى</bdi></span></li>
      <li><time datetime="18:30">18:30</time> <span>Música andalusí, con <bdi>Lucía Herrera</bdi></span></li>
      <li><time datetime="20:00">20:00</time> <span>Cocina libanesa, con <bdi lang="ar">سمير خوري</bdi></span></li>
    </ul>
    <a class="cta" href="/semana-arabe/registro">Regístrate gratis</a>
  </section>

  <section class="edition" lang="ar" dir="rtl" aria-labelledby="title-ar">
    <p class="kicker">من 15 إلى 20 نوفمبر</p>
    <h2 id="title-ar">أسبوع الثقافة العربية</h2>
    <p class="summary">خمسة أيام من الموسيقى والخط العربي والطبخ في مدينة مكسيكو. الدخول مجاني.</p>
    <h3 class="program-title">البرنامج</h3>
    <ul class="program">
      <li><time datetime="17:00">17:00</time> <span>الخط العربي، مع <bdi>نور الهدى</bdi></span></li>
      <li><time datetime="18:30">18:30</time> <span>الموسيقى الأندلسية، مع <bdi lang="es">Lucía Herrera</bdi></span></li>
      <li><time datetime="20:00">20:00</time> <span>المطبخ اللبناني، مع <bdi>سمير خوري</bdi></span></li>
    </ul>
    <a class="cta" href="/ar/semana-arabe/registro">سجّل مجانًا</a>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portada bilingüe
   - Un solo componente (.edition) para los dos idiomas. Ni una propiedad
     física: barra, sangrías, horas y flecha siguen la dirección de cada
     sección (dir="rtl" en la árabe).
   - La lista del programa es una rejilla de dos columnas (hora y actividad):
     en árabe, la columna de la hora pasa sola a la derecha.
   - Nombres en <bdi>, con su lang: un nombre árabe en la versión española (y
     al revés) no desordena la línea.
   - El árabe tiene su pila de fuentes y más interlineado (sus letras tienen
     más trazos por encima y por debajo). Sin mayúsculas ni letter-spacing:
     el árabe no tiene mayúsculas, y espaciarlo separa letras que van unidas.
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
}

@layer tokens {
  :root {
    --font-latin: system-ui, sans-serif;
    /* Mac: Geeza Pro; Windows: Segoe UI y Tahoma traen árabe. */
    --font-arabic: "Geeza Pro", "Segoe UI", Tahoma, system-ui, sans-serif;
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-brand: #0f766e;
    --color-brand-dark: #115e59;
    --color-soft: #f0fdfa;
    --color-focus: #1d4ed8;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: var(--font-latin);
    line-height: 1.5;
  }

  :lang(ar) {
    font-family: var(--font-arabic);
    line-height: 1.75;
  }

  a:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  /* ─── Cabecera ─── */
  .site-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-block-end: 1px solid #cbd5e1;
  }

  .brand {
    color: var(--color-text);
    font-weight: 800;
    text-decoration: none;
  }

  .site-header nav {
    display: flex;
    gap: 12px;
  }

  .site-header nav a {
    color: var(--color-brand-dark);
  }

  .site-header [aria-current="page"] {
    font-weight: 700;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.3em;
  }

  /* ─── Las dos ediciones ─── */
  .editions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: 16px;
    padding: 16px;
  }

  .edition {
    display: grid;
    gap: 10px;
    align-content: start;
    padding-block: 16px;
    padding-inline: 20px 16px;
    border-inline-start: 6px solid var(--color-brand);
    border-start-end-radius: 12px;
    border-end-end-radius: 12px;
    background: var(--color-soft);
    text-align: start;
  }

  .kicker {
    color: var(--color-brand-dark);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .edition h2 {
    font-size: 1.7rem;
    line-height: 1.15;
    text-wrap: balance;
  }

  .summary {
    color: var(--color-muted);
    text-wrap: pretty;
  }

  .program-title {
    font-size: 0.95rem;
  }

  .program {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 6px 12px;
    padding: 0;
    list-style: none;
  }

  /* Cada li usa las columnas de la lista: hora | actividad (la actividad va en
     un span: un texto suelto sería un elemento grid más). */
  .program li {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
  }

  .program time {
    color: var(--color-brand-dark);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }

  .cta {
    justify-self: start;              /* al principio de la línea, sea cual sea */
    margin-block-start: 6px;
    padding: 10px 18px;
    border-radius: 999px;
    background: var(--color-brand-dark);
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }

  .cta::after {
    content: " →" / "";
  }

  .cta:dir(rtl)::after {
    content: " ←" / "";
  }

  /* ─── Lo que no se hace en árabe ─── */
  .edition:lang(ar) .kicker {
    letter-spacing: normal;
    text-transform: none;
  }
}
```
