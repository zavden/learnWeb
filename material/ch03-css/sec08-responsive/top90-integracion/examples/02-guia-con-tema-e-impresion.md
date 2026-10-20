---
example_description: "Una guía de jardinería que sigue el tema del sistema con light-dark(), refuerza bordes y textos con prefers-contrast: more, desliza su índice solo sin «reducir movimiento» y tiene hoja de impresión: sin menú ni botones, en blanco y negro y con las direcciones de los enlaces a la vista"
example_tags: "css|responsive|integracion|light-dark|color-scheme|prefers-contrast|prefers-reduced-motion|print"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="guide">
  <header class="guide__header">
    <p class="guide__kicker">Guías del vivero · Tema del sistema: <span class="scheme"></span></p>
    <h1>Un nopal en maceta</h1>
    <nav class="guide__toc" aria-label="Contenido de la guía">
      <a href="#maceta">La maceta</a> · <a href="#riego">El riego</a> · <a href="#poda">La poda</a>
    </nav>
  </header>
  <section id="maceta">
    <h2>La maceta</h2>
    <p>Barro sin esmaltar y con agujero: el exceso de agua es su peor enemigo. Mezcla tierra con un tercio de arena de río o tezontle.</p>
  </section>
  <section id="riego">
    <h2>El riego</h2>
    <p>Una vez cada dos semanas en verano y casi nada en invierno. Si las pencas se arrugan, tiene sed; si se ablandan, sobra agua.</p>
  </section>
  <section id="poda">
    <h2>La poda</h2>
    <p>Corta en primavera las pencas que se cruzan, con guantes de cuero. La guía completa, en la <a href="https://www.gob.mx/agricultura">Secretaría de Agricultura</a>.</p>
  </section>
  <p class="guide__actions"><a class="button" href="/guias/nopal/compartir">Compartir</a></p>
</article>
<p class="note">Prueba con DevTools (↗) → Rendering: <code>prefers-color-scheme</code>, <code>prefers-contrast: more</code>, <code>prefers-reduced-motion</code> y «Emulate CSS media type: print».</p>
```

# CSS

```css
/* Lección 2: un juego de colores, dos temas. */
:root {
  color-scheme: light dark;
  --surface: light-dark(#ffffff, #0f172a);
  --surface-alt: light-dark(#f0fdf4, #14261c);
  --text: light-dark(#1e293b, #e2e8f0);
  --muted: light-dark(#475569, #94a3b8);
  --accent: light-dark(#15803d, #86efac);
  --border: light-dark(#cbd5e1, #334155);
}

/* prefers-contrast: more. Solo cambian los valores de los tokens: los
   secundarios se acercan al texto y los bordes se ven. */
@media (prefers-contrast: more) {
  :root {
    --muted: light-dark(#1e293b, #e2e8f0);
    --border: light-dark(#1e293b, #e2e8f0);
  }
}

/* Movimiento solo si nadie pidió menos. */
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}

body {
  margin: 0;
  padding: 16px;
  background: var(--surface);
  color: var(--text);
  font-family: Georgia, serif;
  line-height: 1.55;
}

.scheme::after { content: "claro"; }
@media (prefers-color-scheme: dark) { .scheme::after { content: "oscuro"; } }

.guide { max-width: 38rem; }
.guide__header { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-alt); }
.guide__kicker { margin: 0; color: var(--muted); font-family: system-ui, sans-serif; font-size: 0.75rem; }
.guide h1 { margin: 4px 0 8px; font-size: 1.6rem; line-height: 1.1; }
.guide h2 { margin: 1.2em 0 0.3em; font-size: 1.1rem; }
.guide p { margin: 0 0 0.6em; }
.guide a { color: var(--accent); }
.guide__toc { font-family: system-ui, sans-serif; font-size: 0.85rem; }
.guide section { scroll-margin-top: 8px; }
.button { display: inline-block; padding: 6px 14px; border: 2px solid var(--accent); border-radius: 999px; font-family: system-ui, sans-serif; text-decoration: none; }
.note { color: var(--muted); font-family: system-ui, sans-serif; font-size: 0.72rem; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

/* Lección 1: la hoja de impresión. El papel es claro: se fuerza el tema
   claro (color-scheme: light) para que light-dark() elija sus primeros valores. */
@media print {
  :root { color-scheme: light; }
  body { padding: 0; color: #000000; background: #ffffff; font-size: 11pt; }
  .guide__toc, .guide__actions, .note { display: none; }
  .guide__header { border: 0; padding: 0; background: none; }
  .guide a { color: #000000; }
  .guide a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.85em; }
  .guide h2 { break-after: avoid; }
  .guide section { break-inside: avoid; }
}
```
