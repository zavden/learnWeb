---
example_description: "Un plano con marcadores colocados en porcentajes sobre la imagen, con la punta exactamente en su sitio, un globo centrado con el nombre al pasar el ratón o con el foco y el marcador activo por encima de los demás; la lista de sitios se resalta con :target"
example_tags: "css|profesional|position|porcentajes|z-index|isolation|target"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="guide">
  <h1 class="guide-title">Dónde comer cerca del mercado</h1>
  <p class="guide-lede">Cinco sitios a menos de diez minutos andando del mercado de Ruzafa. Pulsa un marcador para ver la ficha.</p>

  <figure class="map">
    <div class="map-canvas">
      <img src="map.svg" width="800" height="500" alt="Plano del barrio con calles, dos parques y el río al sur">
      <a class="pin pin--1" href="#place-1" aria-label="1. Casa Amparo">1<span class="pin-label" aria-hidden="true">Casa Amparo</span></a>
      <a class="pin pin--2" href="#place-2" aria-label="2. La Tahona del Sur">2<span class="pin-label" aria-hidden="true">La Tahona del Sur</span></a>
      <a class="pin pin--3" href="#place-3" aria-label="3. Arrocería Mediterránea">3<span class="pin-label" aria-hidden="true">Arrocería Mediterránea</span></a>
      <a class="pin pin--4" href="#place-4" aria-label="4. Verde que te quiero">4<span class="pin-label" aria-hidden="true">Verde que te quiero</span></a>
      <a class="pin pin--5" href="#place-5" aria-label="5. Horchatería del Parque">5<span class="pin-label" aria-hidden="true">Horchatería del Parque</span></a>
    </div>
    <figcaption class="map-caption">Plano orientativo. El mercado está en el cruce de las dos calles principales.</figcaption>
  </figure>

  <ol class="places">
    <li class="place" id="place-1"><span class="place-number" aria-hidden="true">1</span><h2>Casa Amparo</h2><p>Cocina de mercado; el menú del día cambia con lo que llega por la mañana. De 13:00 a 16:00.</p></li>
    <li class="place" id="place-2"><span class="place-number" aria-hidden="true">2</span><h2>La Tahona del Sur</h2><p>Panadería con obrador a la vista y mesas para desayunar. Abre a las 7:30.</p></li>
    <li class="place" id="place-3"><span class="place-number" aria-hidden="true">3</span><h2>Arrocería Mediterránea</h2><p>Paella valenciana y arroz negro, por encargo para dos o más personas.</p></li>
    <li class="place" id="place-4"><span class="place-number" aria-hidden="true">4</span><h2>Verde que te quiero</h2><p>Platos vegetarianos y zumos. Terraza junto al parque.</p></li>
    <li class="place" id="place-5"><span class="place-number" aria-hidden="true">5</span><h2>Horchatería del Parque</h2><p>Horchata y fartons desde 1952. Cierra de noviembre a marzo.</p></li>
  </ol>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Plano con marcadores
   - El lienzo del plano es la referencia (relative) de los marcadores, que se
     colocan con left y top en PORCENTAJE: al cambiar el tamaño de la imagen,
     siguen en su sitio, porque los % se calculan sobre el bloque contenedor.
   - Cada marcador es un círculo con un triángulo debajo; márgenes negativos
     llevan la punta del triángulo (abajo en el centro) al punto exacto.
   - El globo con el nombre se centra sobre el marcador (left y right simétricos
     + fit-content + margin auto) y aparece con :hover y :focus-visible. El
     marcador activo sube de z-index para que su globo tape a los vecinos; el
     lienzo está aislado (isolation).
   - El nombre accesible de cada marcador está en aria-label: el globo es visual.
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
    --color-bg: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-pin: #b91c1c;
    --color-pin-active: #7f1d1d;
    --color-focus: #1d4ed8;

    --pin-size: 2rem;
    --pin-tip: 0.55rem;
    --z-pin: 1;
    --z-pin-active: 2;
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
}

@layer components {
  .guide {
    width: min(100% - 2rem, 48rem);
    margin: 1.5rem auto 3rem;
  }

  .guide-title {
    font-size: clamp(1.4rem, 4vw, 1.9rem);
    line-height: 1.2;
  }

  .guide-lede {
    margin-block: 0.5rem 1rem;
    color: var(--color-text-muted);
  }

  /* ─── El plano ─── */
  .map {
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }

  /* El lienzo mide exactamente lo que la imagen: sus % son % de la imagen. */
  .map-canvas {
    position: relative;
    isolation: isolate;
  }

  .map-canvas img {
    width: 100%;
    border-radius: 12px 12px 0 0;
  }

  .map-caption {
    padding: 0.5rem 0.75rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  /* ─── Marcadores ───
     (left, top) es la PUNTA: margen izquierdo = −mitad del ancho; margen superior =
     −(alto del círculo + alto del triángulo). */
  .pin {
    position: absolute;
    z-index: var(--z-pin);
    width: var(--pin-size);
    height: var(--pin-size);
    margin: calc((var(--pin-size) + var(--pin-tip)) * -1) 0 0 calc(var(--pin-size) / -2);
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: var(--color-pin);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 700;
    line-height: calc(var(--pin-size) - 4px);
    text-align: center;
    text-decoration: none;
  }

  /* La punta: un triángulo hecho con bordes, centrado debajo del círculo. */
  .pin::after {
    content: "";
    position: absolute;
    top: calc(100% - 1px);
    right: 0;
    left: 0;
    width: 0;
    margin-inline: auto;
    border-top: var(--pin-tip) solid var(--color-pin);
    border-inline: 0.45rem solid transparent;
  }

  .pin--1 { left: 37%; top: 46%; }
  .pin--2 { left: 18%; top: 50%; }
  .pin--3 { left: 58%; top: 50%; }
  .pin--4 { left: 76%; top: 30%; }
  .pin--5 { left: 26%; top: 26%; }

  /* El marcador activo sube por encima de sus vecinos, con su globo. */
  .pin:hover,
  .pin:focus-visible {
    z-index: var(--z-pin-active);
    background: var(--color-pin-active);
  }

  .pin:hover::after,
  .pin:focus-visible::after {
    border-top-color: var(--color-pin-active);
  }

  /* ─── Globo con el nombre ───
     Centrado sobre el marcador: left y right iguales (y mucho mayores que el globo),
     ancho fit-content y margin-inline: auto. */
  .pin-label {
    display: none;
    position: absolute;
    right: -10rem;
    bottom: calc(100% + var(--pin-tip) + 0.25rem);
    left: -10rem;
    width: fit-content;
    margin-inline: auto;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    background: #0f172a;
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .pin:hover .pin-label,
  .pin:focus-visible .pin-label {
    display: block;
  }

  /* ─── Lista de sitios ─── */
  .places {
    margin-top: 1.5rem;
    padding: 0;
    list-style: none;
  }

  .place {
    position: relative;
    margin-bottom: 0.75rem;
    padding: 0.6rem 0.75rem 0.6rem 3rem;
    border-radius: 10px;
  }

  /* El número, un círculo en el hueco del relleno, a la altura del título. */
  .place-number {
    position: absolute;
    top: 0.6rem;
    left: 0.75rem;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: var(--color-pin);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.6rem;
    text-align: center;
  }

  .place h2 {
    font-size: 1.05rem;
  }

  .place p {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  /* El sitio elegido desde el plano. */
  .place:target {
    background: #fef2f2;
    box-shadow: inset 0 0 0 2px var(--color-pin);
  }
}
```
