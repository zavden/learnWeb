---
example_description: "prefers-contrast: more pide bordes y textos más marcados; forced-colors: active (los temas de alto contraste de Windows) sustituye tus colores por los del sistema: un borde transparente reaparece y forced-color-adjust: none conserva las muestras de color"
example_tags: "css|responsive|preferencias|prefers-contrast|forced-colors|alto-contraste|accesibilidad"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="status">En tu equipo: <code class="contrast">prefers-contrast: </code> · <code class="forced">forced-colors: </code></p>
<p class="caption">Para probar los otros valores: ↗, DevTools → Rendering → «Emulate CSS media feature» <code>prefers-contrast</code> o <code>forced-colors</code>.</p>

<form class="newsletter" action="/boletin" method="post">
  <label for="email">Correo electrónico</label>
  <input id="email" name="email" type="email" autocomplete="email">
  <p class="hint">Un correo al mes con las novedades del vivero.</p>
  <p class="label">Color de la maceta:</p>
  <div class="swatches">
    <span class="swatch" style="--swatch: #b45309">Barro</span>
    <span class="swatch" style="--swatch: #1d4ed8">Talavera azul</span>
    <span class="swatch" style="--swatch: #15803d">Verde jade</span>
  </div>
  <button type="submit" class="cta">Suscribirme</button>
</form>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.status { margin: 0; font-size: 0.8rem; }
.contrast::after { content: var(--contrast, "no-preference"); font-weight: 700; }
.forced::after { content: var(--forced, "none"); font-weight: 700; }
.caption, .label { margin: 4px 0 8px; font-size: 0.72rem; }

.newsletter { display: grid; gap: 4px; max-width: 22rem; font-size: 0.85rem; }
.newsletter input { padding: 6px; border: 1px solid #64748b; border-radius: 6px; font: inherit; }
.hint { margin: 0 0 6px; color: #64748b; font-size: 0.75rem; }

.swatches { display: flex; gap: 6px; margin-bottom: 8px; }
.swatch { padding: 2px 8px 2px 4px; border: 1px solid #cbd5e1; border-radius: 999px; font-size: 0.75rem; }
.swatch::before { content: ""; display: inline-block; width: 12px; height: 12px; margin-right: 4px; border-radius: 50%; background: var(--swatch); vertical-align: -1px; }

/* Los otros dos valores de prefers-contrast, solo para la etiqueta. */
@media (prefers-contrast: less) { :root { --contrast: "less"; } }
@media (prefers-contrast: custom) { :root { --contrast: "custom"; } }

/* Un botón hecho solo de fondo: el borde transparente no se ve… todavía. */
.cta { justify-self: start; padding: 8px 14px; border: 2px solid transparent; border-radius: 8px; background: #1d4ed8; color: #ffffff; font: inherit; font-weight: 700; }

/* prefers-contrast: more (en macOS, «Aumentar contraste»): bordes y textos
   secundarios más oscuros. Tus colores siguen siendo tuyos. */
@media (prefers-contrast: more) {
  :root { --contrast: "more"; }
  .newsletter input { border: 2px solid #1e293b; }
  .hint { color: #1e293b; }
}

/* forced-colors: active (los temas de contraste de Windows): el navegador
   SUSTITUYE colores, fondos y bordes por los de la paleta del sistema y quita
   las sombras. Un botón distinguido solo por su fondo se quedaría en texto
   suelto; su borde transparente pasa a ser del color del sistema: se ve. */
@media (forced-colors: active) {
  :root { --forced: "active"; }

  /* Las muestras SON la información: que conserven su color. */
  .swatch::before { forced-color-adjust: none; border: 1px solid CanvasText; }
}
```
