---
example_description: "El anillo de foco, en la base: una sola regla :focus-visible para toda la página, con su color en un token que las zonas oscuras redefinen. Con el ratón, los botones y enlaces no lo muestran; con Tab, sí; los campos de texto, siempre"
example_tags: "css|arquitectura|estilos-base|focus-visible|accesibilidad|tokens"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Haz clic en «Pedir» y en el campo: el botón no muestra anillo, el campo sí. Después recorre la página con <kbd>Tab</kbd>: todos lo muestran, también en la franja oscura.</p>
<section class="order">
  <label for="notes">Instrucciones para la cocina</label>
  <input id="notes" type="text" value="Sin cebolla">
  <button class="button" type="button">Pedir</button>
  <a href="/menu/alergenos">Ver alérgenos</a>
</section>
<footer class="site-footer">
  <a href="/contacto">Contacto</a>
  <button class="button is-light" type="button">Llamar al restaurante</button>
</footer>
```

# CSS

```css
@layer reset, base, components;

@layer reset {
  input,
  button {
    font: inherit;
  }
}

@layer base {
  :root {
    --focus-color: #1d4ed8;
  }

  body {
    font-family: system-ui, sans-serif;
    color: #1e293b;
    background: #ffffff;
  }

  /* UNA regla para toda la página. :focus-visible es el foco que el
     navegador cree que conviene ver: el que llega con el teclado, y el de
     los campos donde se escribe (también con un clic). Un clic de ratón en
     un botón o un enlace no lo activa.
     outline (no border): no ocupa sitio, así que el anillo no mueve nada. */
  :focus-visible {
    outline: 3px solid var(--focus-color);
    outline-offset: 2px;
  }

  /* NUNCA :focus { outline: none } sin poner otra cosa: quien navega con
     el teclado se queda sin saber dónde está. */
}

@layer components {
  .caption {
    font-size: 0.72rem;
  }

  .order {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 12px;
  }

  .order label {
    flex-basis: 100%;
    font-size: 0.85rem;
  }

  .order input {
    padding: 4px 8px;
    border: 1px solid #64748b;
    border-radius: 6px;
  }

  .order a {
    color: #1d4ed8;
  }

  .button {
    padding: 6px 14px;
    border: 0;
    border-radius: 999px;
    background: #15803d;
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
  }

  /* Una zona oscura solo cambia el TOKEN: el azul no se vería sobre este
     fondo; el amarillo, sí. La regla de foco sigue siendo una. */
  .site-footer {
    --focus-color: #fde68a;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: #1e293b;
  }

  .site-footer a {
    color: #e2e8f0;
  }

  .button.is-light {
    background: #e2e8f0;
    color: #1e293b;
  }
}
```
