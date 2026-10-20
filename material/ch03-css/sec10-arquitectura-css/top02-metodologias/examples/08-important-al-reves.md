---
example_description: "Una librería de avisos de cookies con !important, metida en @layer vendor: tu !important en components pierde, porque con !important el orden de las capas se invierte y gana la capa más temprana. Para ganarle, un !important en una capa declarada ANTES de vendor"
example_tags: "css|arquitectura|layer|capas|important|librerias|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<aside class="cookie-banner is-broken" aria-label="Cookies (sin arreglar)">
  <p>Usamos cookies para recordar tu carrito. <a href="/privacidad">Más información</a></p>
  <button class="cc-button" type="button">Aceptar</button>
  <p class="note">❌ Gris: tu <code>!important</code> en <code>components</code> pierde contra el de <code>vendor</code>.</p>
</aside>

<aside class="cookie-banner is-fixed" aria-label="Cookies (arreglado)">
  <p>Usamos cookies para recordar tu carrito. <a href="/privacidad">Más información</a></p>
  <button class="cc-button" type="button">Aceptar</button>
  <p class="note">✅ Verde: el <code>!important</code> está en <code>vendor-fixes</code>, una capa anterior a <code>vendor</code>.</p>
</aside>
```

# CSS

```css
/* vendor-fixes va ANTES que vendor. Parece al revés, y lo es a propósito. */
@layer reset, vendor-fixes, vendor, base, components;

/* La librería de cookies, en su capa (como aprendiste en el ejemplo
   anterior). Sus autores usaron !important para que «nadie» la pisara. */
@layer vendor {
  .cc-button {
    padding: 6px 14px;
    border: 0;
    border-radius: 4px;
    background: #4b5563 !important;
    color: #ffffff !important;
    font: inherit;
    cursor: pointer;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: #1e293b;
    background: #ffffff;
  }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

@layer components {
  .cookie-banner {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
    margin-bottom: 12px;
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 0.85rem;
  }

  .cookie-banner p {
    margin: 0;
  }

  .note {
    flex-basis: 100%;
    font-size: 0.72rem;
  }

  /* 🐛 Tu marca quiere el botón verde. Sin !important, pierde (vendor
     usa !important). Con !important… también pierde. Recuerda la lección
     de cascada: para las declaraciones !important, el orden de las capas
     se INVIERTE:
       normales:    reset < vendor-fixes < vendor < base < components
       !important:  components < base < vendor < vendor-fixes < reset
     El !important de vendor (más temprana) gana al tuyo (más tardía).
     Y un !important sin capa perdería todavía más: es el más débil. */
  :where(.is-broken) .cc-button {
    background: #15803d !important;
  }
}

/* ✅ Un !important solo puede ganar a otro desde una capa ANTERIOR.
   vendor-fixes está declarada justo antes de vendor: aquí van, a
   propósito y en un solo sitio, los pocos arreglos que necesita la
   librería. (Mejor aún, si la librería lo permite: configurarla con sus
   custom properties y no pelear con ella.) */
@layer vendor-fixes {
  :where(.is-fixed) .cc-button {
    background: #15803d !important;
  }
}
```
