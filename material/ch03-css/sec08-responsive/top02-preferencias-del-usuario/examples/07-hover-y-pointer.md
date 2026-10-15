---
example_description: "hover y pointer preguntan por el dispositivo de entrada principal; any-hover y any-pointer, por cualquiera de los conectados. Una tabla con sus valores en tu equipo y una barra de botones que crece con pointer: coarse"
example_tags: "css|responsive|hover|pointer|any-pointer|tactil|media-queries"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Los valores de tu equipo. En un Mac con trackpad o ratón: <code>hover</code> y <code>fine</code>. Para ver los de un móvil, ábrelo con ↗ y activa el modo dispositivo de DevTools con un teléfono: <code>none</code> y <code>coarse</code>.</p>
<table class="features">
  <tr class="row-hover"><th scope="row"><code>hover</code></th><td></td><td>¿el puntero principal puede quedarse encima sin pulsar?</td></tr>
  <tr class="row-any-hover"><th scope="row"><code>any-hover</code></th><td></td><td>¿alguno de los conectados puede?</td></tr>
  <tr class="row-pointer"><th scope="row"><code>pointer</code></th><td></td><td>precisión del principal: dedo (<code>coarse</code>) o ratón (<code>fine</code>)</td></tr>
  <tr class="row-any-pointer"><th scope="row"><code>any-pointer</code></th><td></td><td>la de cualquiera de los conectados (con ratón y pantalla táctil se cumplen <code>fine</code> y <code>coarse</code>; la tabla enseña la última)</td></tr>
</table>

<p class="caption">Barra de un editor de fotos: botones de 32px con un ratón, 48px con el dedo.</p>
<div class="toolbar" role="toolbar" aria-label="Herramientas">
  <button type="button" aria-label="Recortar">✂️</button>
  <button type="button" aria-label="Girar">🔄</button>
  <button type="button" aria-label="Brillo">☀️</button>
  <button type="button" aria-label="Deshacer">↩️</button>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption { margin: 8px 0 4px; font-size: 0.72rem; }

.features { border-collapse: collapse; font-size: 0.75rem; }
.features th, .features td { padding: 3px 8px; border: 1px solid #cbd5e1; text-align: start; }
.features td:nth-child(2) { font-weight: 700; background: #e0e7ff; }
.features td:nth-child(2)::after { content: var(--value, "—"); }

/* Cada media query rellena SU fila. hover: hover | none;
   pointer: fine | coarse | none (sin puntero: solo teclado o voz). */
@media (hover: hover)    { .row-hover { --value: "hover"; } }
@media (hover: none)     { .row-hover { --value: "none"; } }
@media (any-hover: hover) { .row-any-hover { --value: "hover"; } }
@media (any-hover: none)  { .row-any-hover { --value: "none"; } }
@media (pointer: fine)   { .row-pointer { --value: "fine"; } }
@media (pointer: coarse) { .row-pointer { --value: "coarse"; } }
@media (pointer: none)   { .row-pointer { --value: "none"; } }
@media (any-pointer: fine)   { .row-any-pointer { --value: "fine"; } }
@media (any-pointer: coarse) { .row-any-pointer { --value: "coarse"; } }
@media (any-pointer: none)   { .row-any-pointer { --value: "none"; } }

.toolbar { display: flex; gap: 4px; }

.toolbar button {
  width: 32px;
  height: 32px;
  border: 1px solid #64748b;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 1rem;
}

/* Con el dedo, objetivos de al menos 44-48px (lo que piden las guías de
   accesibilidad y de los sistemas móviles). any-pointer: coarse también
   cubre un portátil con pantalla táctil, cuyo puntero principal es el ratón. */
@media (any-pointer: coarse) {
  .toolbar { gap: 8px; }
  .toolbar button { width: 48px; height: 48px; font-size: 1.4rem; }
}
```
