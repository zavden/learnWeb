---
example_description: "El CSS de un widget de reservas pegado al final sin capa: su selector button (0,0,1) gana a tu .button (0,1,0) de la capa components, porque lo que no tiene capa va por encima de todas las capas. Metido en @layer vendor (declarada antes de components), deja de molestar"
example_tags: "css|arquitectura|layer|capas|librerias|cascada|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<section class="is-broken" aria-label="Sin capa">
  <p class="label">❌ El CSS del widget, sin capa: tu botón verde se vuelve gris y cuadrado</p>
  <button class="button" type="button">Reservar mesa</button>
  <button type="button">Ver horarios del widget</button>
</section>

<section class="is-fixed" aria-label="En una capa">
  <p class="label">✅ El mismo CSS dentro de <code>@layer vendor</code>: cada botón con lo suyo</p>
  <button class="button" type="button">Reservar mesa</button>
  <button type="button">Ver horarios del widget</button>
</section>
```

# CSS

```css
@layer reset, vendor, base, components, utilities;

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: #1e293b;
    background: #ffffff;
  }

  section {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 16px;
  }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

@layer components {
  .label {
    flex-basis: 100%;
    margin: 0;
    font-size: 0.72rem;
  }

  .button {                            /* (0,1,0) en la capa components */
    padding: 8px 16px;
    border: 0;
    border-radius: 999px;
    background: #15803d;
    color: #ffffff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
}

/* ❌ El CSS del widget de reservas, pegado al final del archivo SIN capa.
   Su selector es débil, button (0,0,1)… pero lo que no tiene capa forma
   una capa implícita que va POR ENCIMA de todas las demás. Gana a tu
   .button, y a cualquier cosa que esté en una capa. (:where() solo sirve
   aquí para separar las dos mitades del ejemplo: no suma especificidad.) */
:where(.is-broken) button {
  padding: 4px 10px;
  border: 1px solid #6b7280;
  border-radius: 0;
  background: #e5e7eb;
  color: #111827;
  font-family: Arial, sans-serif;
  font-weight: 400;
}

/* ✅ El mismo CSS, dentro de @layer vendor. La línea del principio pone
   vendor DEBAJO de components: el widget sigue vistiendo sus propios
   botones, pero ya no puede con los tuyos. Con un archivo aparte se hace
   igual: @import url("widget.css") layer(vendor); */
@layer vendor {
  :where(.is-fixed) button {
    padding: 4px 10px;
    border: 1px solid #6b7280;
    border-radius: 0;
    background: #e5e7eb;
    color: #111827;
    font-family: Arial, sans-serif;
    font-weight: 400;
  }
}
```
