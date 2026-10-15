---
example_description: "Botones que suben y se hunden solo con box-shadow, iconos como imagen de fondo con su hueco reservado en el padding y tamaños en em que escalan relleno y radio"
example_tags: "css|box-shadow|background|border-radius|padding|botones"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="row">
  <button class="btn btn--primary" type="button">Añadir a la cesta</button>
  <button class="btn" type="button">Guardar</button>
  <button class="btn btn--ghost" type="button">Cancelar</button>
  <button class="btn btn--primary" type="button" disabled>Agotado</button>
</p>

<p class="row">
  <button class="btn btn--primary btn--icon icon-cart" type="button">Comprar ahora</button>
  <button class="btn btn--icon icon-heart" type="button">Favorito</button>
  <a class="btn" href="#">Ver la cesta <span class="badge">3</span></a>
</p>

<p class="row">
  <button class="btn btn--primary btn--small" type="button">Pequeño</button>
  <button class="btn btn--primary" type="button">Normal</button>
  <button class="btn btn--primary btn--large" type="button">Grande</button>
</p>

<p class="hint">Pasa el ratón (la sombra crece), mantén pulsado (se hunde) y recorre los botones con <kbd>Tab</kbd>: ninguna fila se mueve ni un píxel.</p>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f8fafc;
}

/* Todo lo que cambia entre variantes son variables: la forma la pone .btn */
.btn {
  --btn-bg: #ffffff;
  --btn-fg: #1e293b;
  --btn-border: #64748b;

  display: inline-block;           /* los <a> son inline: así aceptan su padding vertical */
  margin: 0 0.5rem 0.75rem 0;
  padding: 0.6em 1.1em;            /* em: el relleno escala con el tamaño de letra */
  border: 2px solid var(--btn-border);
  border-radius: 0.6em;
  background-color: var(--btn-bg);
  color: var(--btn-fg);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  /* Dos sombras: una cercana y nítida, otra lejana y difusa (lección 6) */
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.15), 0 2px 6px rgb(15 23 42 / 0.08);
}

/* Las sombras no ocupan espacio: el botón «sube» sin empujar a nadie */
.btn:hover {
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.15), 0 10px 20px rgb(15 23 42 / 0.12);
}

/* inset: la sombra se dibuja por dentro y el botón parece hundido.
   (Mover el botón con margin-top haría saltar toda la fila.) */
.btn:active {
  box-shadow: inset 0 2px 5px rgb(15 23 42 / 0.3);
}

/* Anillo de foco que tampoco ocupa sitio: outline + separación (lección 1) */
.btn:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}

.btn--primary {
  --btn-bg: #1d4ed8;
  --btn-fg: #ffffff;
  --btn-border: #1d4ed8;
}

.btn--primary:hover {
  --btn-bg: #1e40af;
  --btn-border: #1e40af;
}

/* Borde y fondo transparentes, pero el borde SIGUE ahí: mide igual que los demás */
.btn--ghost {
  --btn-bg: transparent;
  --btn-border: transparent;
  box-shadow: none;
}

.btn--ghost:hover {
  --btn-bg: #e2e8f0;
  box-shadow: none;
}

.btn:disabled {
  --btn-bg: #e2e8f0;
  --btn-fg: #475569;
  --btn-border: #e2e8f0;
  box-shadow: none;
  cursor: not-allowed;
}

/* Icono como imagen de fondo: el padding izquierdo le reserva el hueco
   y background-position lo coloca dentro de ese hueco (lección 6). */
.btn--icon {
  padding-inline-start: 2.6em;
  background-repeat: no-repeat;
  background-position: left 0.9em center;
  background-size: 1.2em;
}

.icon-cart {
  background-image: url("icon-cart.svg");
}

.icon-heart {
  background-image: url("icon-heart.svg");
}

/* min-width + radio de píldora: un círculo con un dígito, una píldora con más */
.badge {
  display: inline-block;
  min-width: 1.5em;
  margin-left: 0.35em;
  padding: 0 0.35em;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.8em;
  text-align: center;
}

/* Tamaños: solo cambia font-size. Padding, radio, icono e insignia van en em y escalan solos. */
.btn--small {
  font-size: 0.875rem;
}

.btn--large {
  font-size: 1.25rem;
}

.hint {
  max-width: 36rem;
  color: #475569;
}
```
