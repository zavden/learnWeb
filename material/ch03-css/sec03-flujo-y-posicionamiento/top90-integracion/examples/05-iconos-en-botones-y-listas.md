---
example_description: "Iconos alineados con el texto: en botones con vertical-align en em y en listas con un ::before absolute centrado en la primera línea; un contador en la esquina de un botón y botones en fila alineados por arriba"
example_tags: "css|vertical-align|inline-block|position|iconos|botones"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="toolbar">
  <a class="button button--primary" href="#"><img class="icon" src="icon-download.svg" alt="">Descargar factura</a>
  <button class="button" type="button"><img class="icon" src="icon-heart.svg" alt="">Guardar</button>
  <button class="button button--icon" type="button" aria-label="Notificaciones: 12 sin leer"><img class="icon" src="icon-bell.svg" alt=""><span class="counter" aria-hidden="true">12</span></button>
</p>

<h3 class="list-title">Qué incluye tu plan</h3>
<ul class="features">
  <li>Envíos gratis en pedidos de más de 30 €</li>
  <li>Devoluciones en 30 días, sin preguntas</li>
  <li>Atención por teléfono de 9:00 a 21:00, también los sábados y domingos</li>
</ul>

<p class="shortcut">Busca en cualquier página con <kbd>Ctrl</kbd> + <kbd>K</kbd>.</p>
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
  line-height: 1.5;
}

/* ─── Botones en fila ───
   Lección 2: inline-block alineados por arriba. Un botón solo con icono y otro con texto
   tienen líneas base distintas: con baseline quedarían a distinta altura. */
.button {
  display: inline-block;
  vertical-align: top;
  min-height: 2.75rem;
  margin: 0 0.5rem 0.5rem 0;
  padding: 0.55rem 1rem;
  border: 2px solid #1d4ed8;
  border-radius: 8px;
  background: #ffffff;
  color: #1d4ed8;
  font: inherit;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  cursor: pointer;
}

.button--primary {
  background: #1d4ed8;
  color: #ffffff;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* Lección 2: icono de 1em, bajado 1/8 para centrarlo con mayúsculas y cifras. */
.icon {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  margin-right: 0.4em;
  vertical-align: -0.2em;
}

/* Lección 4: el botón cuadrado es la referencia del contador. */
.button--icon {
  position: relative;
  width: 2.75rem;
  padding: 0;
}

.button--icon .icon {
  margin: 0;                         /* el botón ya centra su contenido */
  vertical-align: middle;
}

/* El contador sobresale por la esquina superior derecha (desplazamientos negativos).
   min-width + radio de píldora: un círculo con una cifra, una píldora con más. */
.counter {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  min-width: 1.4rem;
  padding: 0 0.3rem;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
  line-height: 1.2rem;
  text-align: center;
}

/* ─── Lista con iconos ───
   El icono es un ::before absolute en el hueco que deja el relleno izquierdo, así que
   las líneas siguientes quedan alineadas con el texto, no con el icono (lección 4).
   top lo centra en la PRIMERA línea: (alto de línea − alto del icono) / 2, con la unidad lh. */
.list-title {
  margin: 1rem 0 0.25rem;
  font-size: 1rem;
}

.features {
  max-width: 24rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.features li {
  position: relative;
  margin-bottom: 0.25rem;
  padding-left: 1.6em;
}

.features li::before {
  content: "";
  position: absolute;
  top: calc((1lh - 1em) / 2);
  left: 0;
  width: 1em;
  height: 1em;
  background: url("icon-check.svg") center / contain no-repeat;
}

/* ─── Teclas ───
   inline-block con borde inferior grueso; se apoyan en la línea base de su texto,
   así que quedan alineadas con la frase sin tocar vertical-align. */
kbd {
  display: inline-block;
  min-width: 1.8em;
  padding: 0 0.35em;
  border: 1px solid #64748b;
  border-bottom-width: 3px;
  border-radius: 5px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.85em;
  line-height: 1.5;
  text-align: center;
}
```
