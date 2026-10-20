---
example_description: "La guía de inicio de una API de datos abiertos: cabecera pegada que gana sombra y se compacta al pegarse (scroll-state, solo en Chrome, como mejora), índice arriba en pantallas estrechas y columna lateral pegada desde 56rem, anclas con scroll-margin-top, desplazamiento suave solo sin «reducir movimiento» y bloques de código desplazables con el teclado"
example_tags: "css|profesional|responsive|scroll-state|sticky|scroll-margin|prefers-reduced-motion|documentacion"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <div class="site-header__inner">
    <a class="site-header__logo" href="/">Datos Abiertos CDMX <span>· API</span></a>
    <nav aria-label="Principal"><a href="/docs">Documentación</a> · <a href="/estado">Estado</a></nav>
  </div>
</header>

<div class="docs">
  <nav class="toc" aria-labelledby="toc-title">
    <h2 id="toc-title">En esta página</h2>
    <ol>
      <li><a href="#clave">Pide tu clave</a></li>
      <li><a href="#primera-consulta">Tu primera consulta</a></li>
      <li><a href="#parametros">Parámetros</a></li>
      <li><a href="#limites">Límites de uso</a></li>
    </ol>
  </nav>

  <main class="content">
    <h1>Guía de inicio: calidad del aire</h1>
    <p class="lead">La API devuelve el índice IMECA de cada estación de monitoreo, actualizado cada hora, en formato JSON.</p>

    <section id="clave">
      <h2>Pide tu clave</h2>
      <p>Regístrate con un correo y recibirás una clave de 32 caracteres. Envíala en la cabecera <code>Authorization</code> de cada petición.</p>
    </section>

    <section id="primera-consulta">
      <h2>Tu primera consulta</h2>
      <p>Pide las mediciones de la última hora de una estación:</p>
      <pre class="code" tabindex="0" role="region" aria-label="Ejemplo de petición"><code>GET https://datos.cdmx.example/api/v1/aire/estaciones/MER/mediciones?desde=2026-10-14T12:00:00-06:00
Authorization: Bearer 3f9a0c2e7b5d4e1f8a6c9b2d0e4f7a1c</code></pre>
    </section>

    <section id="parametros">
      <h2>Parámetros</h2>
      <dl class="params">
        <dt><code>desde</code></dt><dd>Fecha y hora ISO 8601 con zona. Obligatorio.</dd>
        <dt><code>hasta</code></dt><dd>Fecha y hora final. Por defecto, ahora.</dd>
        <dt><code>contaminante</code></dt><dd><code>O3</code>, <code>PM25</code>, <code>PM10</code> o <code>NO2</code>.</dd>
      </dl>
    </section>

    <section id="limites">
      <h2>Límites de uso</h2>
      <p>Mil peticiones por hora y clave. Si te pasas, la respuesta es <code>429 Too Many Requests</code> con la cabecera <code>Retry-After</code>.</p>
      <p><a href="#toc-title">Volver al índice</a></p>
    </section>
  </main>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Documentación con cabecera pegada
   - La cabecera es sticky y, además, un contenedor de estado de scroll.
     Cuando está pegada (scroll-state(stuck: top), solo en Chrome), su
     interior gana sombra y se compacta. En los demás navegadores se pega
     igual: es una mejora progresiva. El estilo va en el HIJO (.inner): el
     contenedor no puede consultarse a sí mismo.
   - Anclas: scroll-margin-top deja sitio a la cabecera al saltar a una
     sección. scroll-behavior: smooth solo con prefers-reduced-motion:
     no-preference.
   - Esqueleto mobile-first: el índice arriba; desde 56rem, columna lateral
     pegada debajo de la cabecera.
   - Código: <pre> con overflow-x: auto, tabindex="0" y nombre, para poder
     desplazarlo con el teclado.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, layout;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
}

@layer tokens {
  :root {
    --header-height: 3.5rem;
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-accent: #0369a1;
    --color-code: #f1f5f9;
    --color-border: #e2e8f0;
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  }
}

@layer base {
  @media (prefers-reduced-motion: no-preference) {
    html { scroll-behavior: smooth; }
  }

  body { background: #ffffff; color: var(--color-text); font-family: system-ui, sans-serif; line-height: 1.55; }
  h1 { font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.2rem); line-height: 1.15; }
  h2 { font-size: 1.15rem; }
  a { color: var(--color-accent); }
  code { font-family: Menlo, Consolas, monospace; font-size: 0.9em; }
  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }

  /* Al saltar a un ancla, la sección no queda debajo de la cabecera. */
  :target, section { scroll-margin-top: calc(var(--header-height) + 0.5rem); }
}

@layer components {
  .site-header {
    position: sticky;
    top: 0;
    z-index: 1;
    container-type: scroll-state;
  }

  .site-header__inner {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    align-items: center;
    justify-content: space-between;
    min-height: var(--header-height);
    padding: 8px var(--space-s-l);
    border-bottom: 1px solid var(--color-border);
    background: #ffffff;
    font-size: 0.9rem;
  }

  .site-header__logo { color: var(--color-text); font-size: 1.1rem; font-weight: 700; text-decoration: none; }
  .site-header__logo span { color: var(--color-muted); font-weight: 400; }

  /* Pegada: sombra y un poco más compacta (solo en Chrome). */
  @container scroll-state(stuck: top) {
    .site-header__inner { min-height: 2.75rem; box-shadow: 0 4px 12px rgb(15 23 42 / 0.15); }
    .site-header__logo { font-size: 1rem; }
  }

  .toc { padding: var(--space-s); border-radius: 10px; background: var(--color-code); font-size: 0.9rem; }
  .toc h2 { margin-bottom: 4px; font-size: 0.85rem; text-transform: uppercase; color: var(--color-muted); }
  .toc ol { display: grid; gap: 2px; padding-inline-start: 1.2em; }

  .lead { color: var(--color-muted); font-size: 1.05rem; }
  .content { display: grid; gap: var(--space-s); max-inline-size: 70ch; min-width: 0; }
  .content section { display: grid; gap: 8px; }

  .code {
    overflow-x: auto;
    padding: 12px;
    border-radius: 8px;
    background: #0f172a;
    color: #e2e8f0;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .params { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; }
  .params dd { margin: 0; }
}

@layer layout {
  .docs { display: grid; gap: var(--space-s); padding: var(--space-s-l); }

  @media (width >= 56rem) {
    .docs { grid-template-columns: 14rem minmax(0, 1fr); align-items: start; }
    .toc { position: sticky; top: calc(var(--header-height) + 1rem); }
  }
}
```
