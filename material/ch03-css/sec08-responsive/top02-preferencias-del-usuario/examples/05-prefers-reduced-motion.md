---
example_description: "prefers-reduced-motion: el desplazamiento suave de los enlaces internos y un pequeño deslizamiento del paso elegido se añaden solo con no-preference; con reduce, el salto es instantáneo y el paso se marca solo con color"
example_tags: "css|responsive|preferencias|prefers-reduced-motion|scroll-behavior|accesibilidad|target"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="motion-badge">Tu sistema: <code>prefers-reduced-motion: </code></p>
<nav class="index" id="indice" aria-label="Pasos de la receta">
  <a href="#paso-1">1. Remojar</a> · <a href="#paso-2">2. Cocer</a> · <a href="#paso-3">3. Sazonar</a> · <a href="#paso-4">4. Servir</a>
</nav>
<p class="note">Pulsa un paso del índice. Con <code>no-preference</code>, la página se desliza hasta él y el paso entra con un pequeño desplazamiento; con <code>reduce</code> (emúlalo en DevTools → Rendering), salta al instante y el paso solo cambia de color.</p>

<article class="recipe">
  <h2>Frijoles de la olla</h2>
  <section class="step" id="paso-1"><h3>1. Remojar</h3><p>Deja 500 g de frijol negro en agua fría toda la noche. Tira el agua del remojo.</p><a href="#indice">↑ Índice</a></section>
  <section class="step" id="paso-2"><h3>2. Cocer</h3><p>Cubre con dos litros de agua, media cebolla y dos dientes de ajo. Fuego bajo, dos horas.</p><a href="#indice">↑ Índice</a></section>
  <section class="step" id="paso-3"><h3>3. Sazonar</h3><p>Cuando estén suaves, añade sal y una rama de epazote. Diez minutos más.</p><a href="#indice">↑ Índice</a></section>
  <section class="step" id="paso-4"><h3>4. Servir</h3><p>Con su caldo, queso fresco y tortillas recién hechas.</p><a href="#indice">↑ Índice</a></section>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.motion-badge { display: inline-block; margin: 0; padding: 2px 10px; border-radius: 999px; background: #e0e7ff; font-size: 0.8rem; }
.motion-badge code::after { content: "reduce"; font-weight: 700; }
.note { font-size: 0.72rem; }
.index a, .step a { color: #1d4ed8; }

.step {
  min-height: 9rem;              /* pasos altos, para que haya scroll */
  margin: 0 0 8px;
  padding: 8px 12px;
  border-left: 4px solid #cbd5e1;
  font-size: 0.85rem;
}

.step h3 { margin: 0 0 4px; font-size: 0.95rem; }

/* Lo esencial, para todos: el paso elegido se marca con color y borde. */
.step:target { border-left-color: #b45309; background: #fef3c7; }

/* EL MOVIMIENTO, SOLO SI NADIE HA PEDIDO MENOS. Sin movimiento por defecto, y
   esta media query lo añade. Así, quien activa «Reducir movimiento» en su
   sistema (mareos, trastornos vestibulares, migrañas) no lo recibe nunca. */
@media (prefers-reduced-motion: no-preference) {
  .motion-badge code::after { content: "no-preference"; }

  /* Los enlaces internos se deslizan en vez de saltar. */
  html { scroll-behavior: smooth; }

  /* Adelanto: las transiciones se estudian en el módulo siguiente. Aquí, el
     paso elegido entra deslizándose 8px durante 0,4 s. */
  .step { transition: translate 0.4s ease-out; }
  .step:target { translate: 8px 0; }
}
```
