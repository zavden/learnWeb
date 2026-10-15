---
example_description: "Un cupón y un boleto con forma de papel: muescas hechas con máscaras de dos radial-gradient (una capa por mitad), línea de corte y código de barras dibujados con degradados repetidos, matriz con texto vertical (writing-mode) y la sombra con drop-shadow en un envoltorio para que entre en las muescas"
example_tags: "css|profesional|mask-image|radial-gradient|repeating-linear-gradient|drop-shadow|writing-mode"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="wallet">
  <h1 class="wallet__title">Mis cupones y boletos</h1>

  <div class="paper-shadow">
    <article class="coupon" aria-labelledby="coupon-title">
      <div class="coupon__body">
        <p class="coupon__shop">Panadería La Espiga</p>
        <h2 id="coupon-title" class="coupon__offer">2×1 en conchas</h2>
        <p class="coupon__terms">Válido hasta el 30 de noviembre. Un cupón por compra.</p>
      </div>
      <div class="coupon__code">
        <span class="barcode" aria-hidden="true"></span>
        <p>Código <strong>ESP-4471</strong></p>
      </div>
    </article>
  </div>

  <div class="paper-shadow">
    <article class="ticket" aria-labelledby="ticket-title">
      <div class="ticket__body">
        <p class="ticket__venue">Salón La Paloma · Ciudad de México</p>
        <h2 id="ticket-title" class="ticket__event">Noche de danzón</h2>
        <p class="ticket__when">Sábado 22 de noviembre · 20:00</p>
        <p class="ticket__seat">Pista general · Boleto 0187</p>
      </div>
      <p class="ticket__stub">Admite uno</p>
    </article>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Cupones y boletos
   - Muescas: una máscara con DOS capas de radial-gradient, cada una del 51 %
     del papel (se solapan un poco para no dejar una raya en medio). Cada capa
     es opaca salvo un círculo de 12px centrado en su borde. Las capas de una
     máscara se suman: se ve todo menos las muescas.
       · cupón: muescas a la izquierda y a la derecha, a media altura;
       · boleto: arriba y abajo, sobre la línea de corte (a 56px del borde
         derecho, donde empieza la matriz).
   - Sombras: la máscara recortaría una box-shadow; drop-shadow() en el
     envoltorio ve el papel ya recortado y la sombra entra en las muescas.
   - Línea de corte: un repeating-linear-gradient de 2px de ancho en la
     posición de la matriz (guiones de 6px cada 10px).
   - Código de barras: un repeating-linear-gradient con barras de anchos
     distintos. Es decorativo (aria-hidden): el código va en texto.
   - Matriz del boleto con writing-mode: sideways-lr (se lee de abajo arriba).
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
    --color-desk: #e7e5e4;
    --color-paper: #fffbeb;
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-coupon: #9a3412;
    --color-ticket: #6d28d9;
    --notch: 12px;
    --stub: 56px;
  }
}

@layer base {
  body {
    padding: 16px;
    background: var(--color-desk);
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.4;
  }
}

@layer components {
  .wallet {
    display: grid;
    gap: 16px;
    max-width: 28rem;
  }

  .wallet__title {
    font-size: 1.3rem;
  }

  .paper-shadow {
    filter: drop-shadow(0 4px 6px rgb(28 25 23 / 0.3));
  }

  /* Cupón */
  .coupon {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 18px;
    padding: 16px 26px;
    border-radius: 8px;
    background: var(--color-paper);
    mask-image:
      radial-gradient(circle at 0 50%, transparent var(--notch), black calc(var(--notch) + 0.5px)),
      radial-gradient(circle at 100% 50%, transparent var(--notch), black calc(var(--notch) + 0.5px));
    mask-position: left, right;
    mask-repeat: no-repeat;
    mask-size: 51% 100%;
  }

  .coupon__body {
    flex: 1 1 12rem;
  }

  .coupon__shop {
    color: var(--color-coupon);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .coupon__offer {
    font-size: 1.5rem;
  }

  .coupon__terms {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .coupon__code {
    display: grid;
    justify-items: center;
    gap: 4px;
    font-size: 0.75rem;
  }

  .barcode {
    width: 110px;
    height: 40px;
    background: repeating-linear-gradient(
      to right,
      var(--color-text) 0 2px, transparent 2px 4px,
      var(--color-text) 4px 5px, transparent 5px 7px,
      var(--color-text) 7px 10px, transparent 10px 11px,
      var(--color-text) 11px 12px, transparent 12px 15px
    );
  }

  /* Boleto */
  .ticket {
    display: flex;
    border-radius: 8px;
    background-color: var(--color-paper);
    background-image: repeating-linear-gradient(var(--color-muted) 0 6px, transparent 6px 10px);
    background-position: right var(--stub) top 0;
    background-repeat: no-repeat;
    background-size: 2px 100%;
    mask-image:
      radial-gradient(circle at calc(100% - var(--stub)) 0, transparent var(--notch), black calc(var(--notch) + 0.5px)),
      radial-gradient(circle at calc(100% - var(--stub)) 100%, transparent var(--notch), black calc(var(--notch) + 0.5px));
    mask-position: top, bottom;
    mask-repeat: no-repeat;
    mask-size: 100% 51%;
  }

  .ticket__body {
    flex: 1;
    padding: 16px 18px;
  }

  .ticket__venue,
  .ticket__when,
  .ticket__seat {
    font-size: 0.8rem;
  }

  .ticket__venue {
    color: var(--color-ticket);
    font-weight: 700;
  }

  .ticket__event {
    margin: 2px 0 4px;
    font-family: Georgia, serif;
    font-size: 1.5rem;
  }

  .ticket__seat {
    color: var(--color-muted);
    font-variant-numeric: tabular-nums;
  }

  .ticket__stub {
    display: grid;
    place-items: center;
    width: var(--stub);
    color: var(--color-ticket);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    writing-mode: sideways-lr;
  }
}
```
