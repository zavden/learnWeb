---
example_description: "Una página de lectura con tres animaciones ligadas al scroll y ninguna línea de JavaScript: la barra de progreso (scroll() + scale), los pasos de la receta que aparecen al entrar (view() + animation-range: entry) y el enlace «Volver arriba», que aparece tras los primeros 120px de scroll (un animation-range en píxeles)"
example_tags: "css|integracion|scroll-driven|scroll|view|animation-range|sticky|prefers-reduced-motion"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Desplaza la receta: la barra se llena, cada paso aparece al entrar y, pasados unos 120px, aparece «Volver arriba».</p>
<article class="reader">
  <div class="progress" aria-hidden="true"><div class="progress__fill"></div></div>
  <h2 id="receta">Salsa verde de molcajete</h2>
  <p class="intro">Para 4 personas · 20 minutos</p>
  <ol class="steps">
    <li>Asa 6 tomates verdes, 2 chiles serranos y ¼ de cebolla en un comal hasta que se tuesten por fuera.</li>
    <li>Pela un diente de ajo y muélelo en el molcajete con una pizca de sal gruesa.</li>
    <li>Añade los chiles y muélelos hasta formar una pasta.</li>
    <li>Incorpora los tomates de uno en uno, aplastándolos con movimientos circulares.</li>
    <li>Agrega la cebolla picada y un puñado de cilantro. Prueba y rectifica de sal.</li>
    <li>Sirve enseguida, con tortillas recién hechas.</li>
  </ol>
  <!-- El destino es el título, DENTRO del artículo: así el artículo vuelve arriba. -->
  <a class="to-top" href="#receta">↑ Volver arriba</a>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────
   Lectura con progreso
   Tres animaciones con @keyframes normales cuyo reloj es el scroll:
   1. Barra: scroll() del contenedor más cercano (el artículo), de 0 a 1.
   2. Pasos: view(), con el tramo «entry»: aparecen mientras entran.
   3. «Volver arriba»: scroll() con un tramo en píxeles (de 80px a 120px
      de scroll): invisible arriba del todo, visible a partir de 120px.
   El atajo animation va siempre ANTES de animation-timeline y
   animation-range. Movimiento reducido: los pasos solo se funden.
   ────────────────────────────────────────────────────────────────────── */
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.reader {
  position: relative;
  height: 260px;
  max-width: 400px;
  overflow-y: auto;
  padding: 0 14px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (prefers-reduced-motion: no-preference) {
  .reader {
    scroll-behavior: smooth;
  }
}

.reader h2 {
  margin: 10px 0 0;
  font-size: 1.05rem;
}

.intro {
  margin: 0 0 8px;
  color: #475569;
  font-size: 0.8rem;
}

/* ── 1. Barra ── */
.progress {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 6px;
  margin-inline: -14px;
  background: #e2e8f0;
}

.progress__fill {
  height: 100%;
  background: #15803d;
  transform-origin: left;
  scale: 0 1;
  animation: grow auto linear both;
  animation-timeline: scroll();
}

@keyframes grow {
  to { scale: 1 1; }
}

/* ── 2. Pasos ── */
.steps {
  display: grid;
  gap: 10px;
  padding-left: 1.4rem;
}

.steps li {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f0fdf4;
  animation: appear-fade auto linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@keyframes appear-fade {
  from { opacity: 0; }
}

@keyframes appear-rise {
  from { opacity: 0; translate: 0 20px; }
}

@media (prefers-reduced-motion: no-preference) {
  .steps li {
    animation-name: appear-rise;
  }
}

/* ── 3. Volver arriba ── */
.to-top {
  position: sticky;
  bottom: 8px;
  display: block;
  width: fit-content;
  margin: 12px 0 0 auto;
  padding: 6px 12px;
  border-radius: 999px;
  background: #14532d;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  animation: show-link auto linear both;
  animation-timeline: scroll();
  animation-range: 80px 120px;
}

.to-top:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* Invisible y sin clics arriba del todo; visible pasados los 120px.
   visibility es discreta, pero con su caso especial: es visible en cuanto
   empieza el tramo (desde 80px) y la opacidad sube hasta los 120px. */
@keyframes show-link {
  from { opacity: 0; visibility: hidden; }
  to   { opacity: 1; visibility: visible; }
}
```
