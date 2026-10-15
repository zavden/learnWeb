---
example_description: "La ficha de una lámina de La gran ola: galería sin JavaScript en la que cuatro miniaturas (la misma foto recortada con object-position) eligen, con radios y :has(), qué detalle se amplía en la imagen principal; caja de compra que se reorganiza por contenedor y se pega desde 48rem; controles de 44px con any-pointer: coarse"
example_tags: "css|profesional|responsive|object-fit|object-position|has|container-queries|sticky|producto"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="product">
  <section class="gallery" aria-label="Imágenes de la lámina">
    <div class="gallery__frame">
      <img class="gallery__main" src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa: una ola enorme sobre tres barcas, con el monte Fuji al fondo" width="960" height="646">
    </div>
    <fieldset class="gallery__details">
      <legend>Ver un detalle</legend>
      <label><input type="radio" name="detail" value="full" checked><img src="hokusai-gran-ola-480.jpg" alt="" width="480" height="323"><span>Completa</span></label>
      <label><input type="radio" name="detail" value="wave"><img src="hokusai-gran-ola-480.jpg" alt="" width="480" height="323" style="--focus: 38% 18%"><span>La cresta</span></label>
      <label><input type="radio" name="detail" value="fuji"><img src="hokusai-gran-ola-480.jpg" alt="" width="480" height="323" style="--focus: 63% 68%"><span>El Fuji</span></label>
      <label><input type="radio" name="detail" value="signature"><img src="hokusai-gran-ola-480.jpg" alt="" width="480" height="323" style="--focus: 3% 8%"><span>La firma</span></label>
    </fieldset>
  </section>

  <section class="info" aria-labelledby="product-title">
    <div class="buy-box">
      <p class="buy-box__artist">Katsushika Hokusai · c. 1831</p>
      <h1 id="product-title">Lámina: La gran ola de Kanagawa</h1>
      <p class="buy-box__price">450 MXN <small>IVA incluido</small></p>
      <form class="buy-box__form" action="/carrito" method="post">
        <label class="buy-box__size">Tamaño
          <select name="tamano"><option>30 × 20 cm</option><option selected>45 × 30 cm (+120 MXN)</option><option>60 × 40 cm (+260 MXN)</option></select>
        </label>
        <label class="buy-box__qty">Cantidad <input type="number" name="cantidad" value="1" min="1" max="10"></label>
        <button type="submit">Añadir al carrito</button>
      </form>
      <dl class="specs">
        <div><dt>Papel</dt><dd>Algodón de 300 g, sin ácido</dd></div>
        <div><dt>Impresión</dt><dd>Giclée, tintas pigmentadas</dd></div>
        <div><dt>Envío</dt><dd>En tubo, de 2 a 4 días hábiles</dd></div>
      </dl>
      <p class="credit">Obra de dominio público; la reproducción es de alta resolución.</p>
    </div>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Ficha de producto
   - Galería: una sola imagen grande en un marco 3:2 con overflow: clip.
     Cuatro radios, cada uno con una miniatura (la misma foto recortada por
     object-position: no hay archivos extra). :has() lee el radio marcado y
     amplía la imagen principal con scale desde el punto del detalle
     (transform-origin), sin JavaScript. Los radios se ven (pequeños) y se
     usan con el teclado: las flechas cambian de detalle.
   - Esqueleto mobile-first: galería y compra apiladas; desde 48rem, dos
     columnas y la caja de compra pegada (sticky).
   - La caja de compra es un contenedor: desde 22rem, tamaño y cantidad en
     una fila y el botón a todo el ancho debajo.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, layout;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  img { display: block; max-width: 100%; height: auto; }
  input, select, button { font: inherit; }
}

@layer tokens {
  :root {
    --color-text: #172554;
    --color-muted: #475569;
    --color-accent: #1e40af;
    --color-border: #cbd5e1;
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  }
}

@layer base {
  body { padding: var(--space-s-l); background: #ffffff; color: var(--color-text); font-family: system-ui, sans-serif; line-height: 1.45; }
  h1 { font-family: Georgia, serif; font-size: clamp(1.4rem, 1.1rem + 1.5vw, 2rem); line-height: 1.15; text-wrap: balance; }
  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
}

@layer components {
  /* min-height: 0: que el alto de la foto (un poco más de 3:2) no estire el
     marco (lección de imágenes: aspect-ratio es un mínimo con contenido). */
  .gallery__frame { aspect-ratio: 3 / 2; min-height: 0; overflow: clip; border-radius: 10px; background: #e2e8f0; }

  .gallery__main {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform-origin: var(--zoom-at, 50% 50%);
    scale: var(--zoom, 1);
  }

  /* El radio marcado decide el detalle: dónde ampliar y cuánto. */
  .product:has(input[value="wave"]:checked) { --zoom: 2.4; --zoom-at: 38% 18%; }
  .product:has(input[value="fuji"]:checked) { --zoom: 3; --zoom-at: 63% 68%; }
  .product:has(input[value="signature"]:checked) { --zoom: 3.5; --zoom-at: 3% 8%; }

  .gallery__details { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 8px; padding: 0; border: 0; }
  .gallery__details legend { margin-bottom: 4px; color: var(--color-muted); font-size: 0.8rem; }
  .gallery__details label { display: grid; gap: 4px; justify-items: center; font-size: 0.75rem; text-align: center; cursor: pointer; }
  .gallery__details img { width: 100%; aspect-ratio: 1; border: 2px solid transparent; border-radius: 6px; object-fit: cover; object-position: var(--focus, 50% 50%); }
  .gallery__details input { accent-color: var(--color-accent); }
  .gallery__details label:has(input:checked) img { border-color: var(--color-accent); }

  .buy-box { container: buy / inline-size; display: grid; gap: var(--space-xs); }
  .buy-box__artist { color: var(--color-muted); font-size: 0.85rem; }
  .buy-box__price { font-size: 1.5rem; font-weight: 700; }
  .buy-box__price small { color: var(--color-muted); font-size: 0.8rem; font-weight: 400; }

  .buy-box__form { display: grid; gap: 10px; }
  .buy-box__form label { display: grid; gap: 2px; font-size: 0.85rem; }
  .buy-box__form select, .buy-box__form input { padding: 6px 8px; border: 1px solid #64748b; border-radius: 6px; }
  .buy-box__form button { padding: 10px 16px; border: 0; border-radius: 999px; background: var(--color-accent); color: #ffffff; font-weight: 700; }

  @container buy (width >= 22rem) {
    .buy-box__form { grid-template-columns: 1fr 6rem; }
    .buy-box__form button { grid-column: 1 / -1; }
  }

  @media (any-pointer: coarse) {
    .buy-box__form select, .buy-box__form input, .buy-box__form button { min-height: 44px; }
  }

  .specs { display: grid; gap: 6px; padding-top: var(--space-xs); border-top: 1px solid var(--color-border); font-size: 0.85rem; }
  .specs div { display: grid; grid-template-columns: 6rem 1fr; gap: 8px; }
  .specs dt { color: var(--color-muted); }
  .specs dd { margin: 0; }
  .credit { color: var(--color-muted); font-size: 0.75rem; }
}

@layer layout {
  .product { display: grid; gap: var(--space-s-l); max-width: 68rem; }

  @media (width >= 48rem) {
    .product { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: start; }
    .info { position: sticky; top: var(--space-s); }
  }
}
```
