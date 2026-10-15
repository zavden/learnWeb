---
example_description: "Un botón que muestra u oculta un panel comunica su estado con aria-expanded y su relación con aria-controls; details/summary lo hace de serie"
example_tags: "html|accesibilidad|aria-expanded|details|desplegables"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<!-- Versión a mano: el botón cambia aria-expanded y el panel su atributo hidden.
     (onclick: los eventos se estudian en el capítulo de JavaScript.) -->
<button type="button" aria-expanded="false" aria-controls="shipping-info"
        onclick="const open = this.getAttribute('aria-expanded') === 'true';
                 this.setAttribute('aria-expanded', String(!open));
                 document.getElementById('shipping-info').hidden = open;">
  Gastos de envío
</button>
<div id="shipping-info" hidden>
  <p>Gratis a partir de 30 €. Entrega en 48 horas en la península.</p>
</div>

<!-- Versión nativa: details y summary ya comunican «expandido/contraído» y funcionan con teclado. -->
<details>
  <summary>Devoluciones</summary>
  <p>Tienes 30 días para devolver cualquier producto sin abrir.</p>
</details>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

button {
  font: inherit;
  padding: 6px 12px;
}

/* El estilo puede leer el estado accesible: una sola fuente de verdad. */
button[aria-expanded]::after {
  content: " ▸";
}

button[aria-expanded="true"]::after {
  content: " ▾";
}

details {
  margin-top: 16px;
}
```
