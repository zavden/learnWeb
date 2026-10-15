---
example_description: "El plano de un mercado dibujado solo con capas de degradados (calles, canal y jardín), marcadores en forma de gota (border-radius y rotate, con la sombra en el enlace sin girar), una insignia hexagonal y una estrella recortadas con clip-path y la misma información en una lista accesible"
example_tags: "css|profesional|clip-path|polygon|rotate|degradados|drop-shadow|mapa"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="market">
  <h1 class="market__title">Mercado de la Luz · Plano</h1>

  <div class="map" role="group" aria-label="Plano del mercado con los puestos numerados">
    <a class="pin" href="/mercado/puestos/tamales" style="--x: 22%; --y: 38%">
      <span class="pin__shape" aria-hidden="true"><span class="pin__num">1</span></span>
      <span class="visually-hidden">1. Tamales Doña Lupe</span>
    </a>
    <a class="pin" href="/mercado/puestos/flores" style="--x: 58%; --y: 30%">
      <span class="pin__shape" aria-hidden="true"><span class="pin__num">2</span></span>
      <span class="visually-hidden">2. Flores de Xochimilco</span>
    </a>
    <a class="pin is-featured" href="/mercado/puestos/cafe" style="--x: 78%; --y: 70%">
      <span class="pin__shape" aria-hidden="true"><span class="pin__num">3</span></span>
      <span class="visually-hidden">3. Café de olla El Comal</span>
    </a>
  </div>

  <ol class="stalls">
    <li class="stall"><span class="stall__num" aria-hidden="true">1</span><div><h2>Tamales Doña Lupe</h2><p>Pasillo 2 · Desde las 7:00</p></div><span class="badge badge--hex">Orgánico</span></li>
    <li class="stall"><span class="stall__num" aria-hidden="true">2</span><div><h2>Flores de Xochimilco</h2><p>Pasillo 5 · Desde las 8:00</p></div></li>
    <li class="stall"><span class="stall__num is-featured" aria-hidden="true">3</span><div><h2>Café de olla El Comal</h2><p>Junto al jardín · Desde las 6:30</p></div><span class="badge badge--star">Favorito del mes</span></li>
  </ol>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Plano de un mercado
   - El plano es un div con cinco capas de fondo: un jardín (radial), un
     canal en diagonal (linear con paradas duras), calles horizontales y
     verticales (dos repeating-linear-gradient) y el color del suelo.
   - Marcador: el ENLACE es una caja de 32 × 32 sin girar, colocada con
     --x y --y desde el HTML y con la sombra (drop-shadow). Dentro, la gota:
     un cuadrado con tres esquinas redondeadas girado -45° con rotate, para
     que la esquina en punta mire hacia abajo; el número se gira +45° para
     quedar derecho. La sombra va en el enlace porque un filtro se aplica
     ANTES de la transformación: en la gota, la sombra giraría con ella.
   - Insignias: un hexágono con clip-path y el texto dentro (con relleno de
     sobra para que el recorte no lo toque), y una píldora con una estrella
     de 10 puntos recortada en su ::before.
   - Accesibilidad: cada marcador es un enlace con nombre (texto oculto a la
     vista); la lista repite la información con los mismos números.
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
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-ground: #f5f5f4;
    --color-street: #ffffff;
    --color-water: #93c5fd;
    --color-park: #bbf7d0;
    --color-pin: #be123c;
    --color-pin-featured: #a16207;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.4;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

@layer components {
  .market {
    display: grid;
    gap: 12px;
    max-width: 32rem;
  }

  .market__title {
    font-size: 1.3rem;
  }

  .map {
    position: relative;
    height: 240px;
    border: 1px solid #d6d3d1;
    border-radius: 12px;
    background:
      radial-gradient(ellipse 22% 18% at 82% 82%, var(--color-park) 98%, transparent),
      linear-gradient(115deg, transparent 48%, var(--color-water) 48% 53%, transparent 53%),
      repeating-linear-gradient(transparent 0 46px, var(--color-street) 46px 54px),
      repeating-linear-gradient(to right, transparent 0 70px, var(--color-street) 70px 78px),
      var(--color-ground);
  }

  .pin {
    --pin-color: var(--color-pin);
    position: absolute;
    left: calc(var(--x) - 16px);
    top: calc(var(--y) - 39px);      /* la punta de la gota cae en (x, y) */
    width: 32px;
    height: 32px;
    filter: drop-shadow(0 3px 2px rgb(28 25 23 / 0.45));
  }

  .pin.is-featured {
    --pin-color: var(--color-pin-featured);
  }

  .pin:focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 4px;
    border-radius: 50%;
  }

  .pin__shape {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border: 2px solid #ffffff;
    border-radius: 50% 50% 50% 0;
    background: var(--pin-color);
    rotate: -45deg;
  }

  .pin__num {
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 800;
    rotate: 45deg;
  }

  .stalls {
    display: grid;
    gap: 8px;
    padding: 0;
    list-style: none;
  }

  .stall {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
    align-items: center;
    padding: 8px 10px;
    border-radius: 10px;
    background: #fafaf9;
  }

  .stall > div {
    flex: 1 1 10rem;
  }

  .stall h2 {
    font-size: 0.95rem;
  }

  .stall p {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .stall__num {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--color-pin);
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 800;
  }

  .stall__num.is-featured {
    background: var(--color-pin-featured);
  }

  .badge {
    display: grid;
    place-items: center;
    font-size: 0.7rem;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
  }

  /* Hexágono: los lados de la izquierda y la derecha en punta. */
  .badge--hex {
    padding: 6px 18px;
    background: #166534;
    color: #ffffff;
    clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0 50%);
  }

  /* Una píldora con una estrella delante: la estrella es un ::before
     recortado con un polígono de 10 puntos (5 puntas), calculado con
     trigonometría. Decorativa: el texto ya lo dice. */
  .badge--star {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 4px 10px 4px 6px;
    border-radius: 999px;
    background: #fef9c3;
    color: #713f12;
  }

  .badge--star::before {
    content: "";
    width: 16px;
    aspect-ratio: 1;
    background: #ca8a04;
    clip-path: polygon(50% 0%, 61.8% 33.8%, 97.6% 34.5%, 69% 56.2%, 79.4% 90.5%, 50% 70%, 20.6% 90.5%, 31% 56.2%, 2.4% 34.5%, 38.2% 33.8%);
  }
}
```
