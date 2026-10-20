---
example_description: "Un índice que sigue la lectura sin JavaScript: cada sección de la guía ofrece una línea de tiempo de vista con nombre (view-timeline) reducida a una franja con view-timeline-inset, timeline-scope las hace visibles fuera del contenedor con scroll, y cada enlace del índice se resalta mientras su sección cruza la franja. Debajo del índice, una barra de lectura con scroll-timeline"
example_tags: "css|profesional|scroll-driven|view-timeline|view-timeline-inset|timeline-scope|scroll-timeline|indice|container-queries"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="guide">
  <div class="guide__layout">
    <nav class="toc" aria-label="En esta guía">
      <p class="toc__title">En esta guía</p>
      <ol>
        <li><a href="#luz">Luz</a></li>
        <li><a href="#peso">Peso</a></li>
        <li><a href="#agua">Agua</a></li>
        <li><a href="#plantas">Plantas</a></li>
      </ol>
      <div class="toc__progress" aria-hidden="true"><div class="toc__fill"></div></div>
    </nav>

    <article class="reader">
      <h1>Un huerto en la azotea</h1>
      <section id="luz" class="chapter">
        <h2>Luz</h2>
        <p>Las hortalizas de fruto (tomate, chile, calabaza) necesitan al menos seis horas de sol directo. Observa tu azotea un día entero antes de decidir dónde van los cajones.</p>
        <p>Las de hoja (lechuga, espinaca, acelga) aguantan con cuatro horas y agradecen algo de sombra por la tarde en verano.</p>
      </section>
      <section id="peso" class="chapter">
        <h2>Peso</h2>
        <p>Un cajón de 1 × 1 m con 30 cm de tierra húmeda pesa unos 400 kg. Antes de llenarlo, pregunta qué carga soporta la losa.</p>
        <p>Mezcla la tierra con fibra de coco y perlita: pesa la mitad y retiene igual el agua.</p>
      </section>
      <section id="agua" class="chapter">
        <h2>Agua</h2>
        <p>En una azotea el viento seca la tierra muy deprisa. Un riego por goteo con temporizador evita que dependas de acordarte cada mañana.</p>
        <p>Un acolchado de paja de 5 cm reduce la evaporación casi a la mitad.</p>
      </section>
      <section id="plantas" class="chapter">
        <h2>Plantas</h2>
        <p>Para empezar: rábanos (se cosechan en un mes), lechugas, albahaca y chiles. Deja los árboles frutales para cuando conozcas tu azotea.</p>
        <p>Siembra poco y a menudo: cada dos semanas, una fila nueva.</p>
      </section>
    </article>
  </div>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Índice que sigue la lectura
   - Cada sección declara su línea de tiempo de vista con nombre
     (view-timeline-name: --sec-luz, eje block). Su progreso va de 0 a 1 mientras la
     sección pasa por el área visible del artículo.
   - view-timeline-inset encoge esa «área visible» a una franja fina a un
     tercio de altura (del 30 % al 31 %): el tramo «cover» dura exactamente
     lo que la sección tarda en cruzar esa línea. Mientras la cruza, el
     enlace está activo.
   - El índice está FUERA del contenedor con scroll: timeline-scope en el
     antepasado común (.guide__layout) hace visibles los nombres.
   - Los fotogramas del enlace: inactivo en el 0 % y el 100 %, activo entre
     el 1 % y el 99 %. Con fill both, antes y después del tramo, inactivo.
   - Es color y fondo (paint), no movimiento: igual con «reducir movimiento».
     El desplazamiento suave al pulsar un enlace, solo con no-preference.
   - Contenedor estrecho: el índice va arriba, en una fila. Desde 34rem de
     contenedor, a la izquierda.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-accent: #15803d;
  --color-tint: #dcfce7;
  --color-track: #e2e8f0;
  --color-surface: #ffffff;
  --color-focus: #1d4ed8;
}

/* ── Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

/* .guide es el contenedor de la consulta; .guide__layout, el que cambia
   (una container query estiliza a los descendientes, no al propio
   contenedor). timeline-scope, en el antepasado común del índice y el
   artículo. */
.guide {
  max-width: 48rem;
  margin-inline: auto;
  padding: 1rem;
  container-type: inline-size;
}

.guide__layout {
  display: grid;
  gap: 0.75rem;
  timeline-scope: --sec-luz, --sec-peso, --sec-agua, --sec-plantas, --reader;
}

/* ── Artículo ── */
.reader {
  height: 20rem;
  overflow-y: auto;
  padding: 0 1rem 14rem;         /* aire al final: la última sección también cruza la línea */
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  scroll-timeline: --reader block;
}

@media (prefers-reduced-motion: no-preference) {
  .reader {
    scroll-behavior: smooth;
  }
}

.reader h1 {
  margin: 0.75rem 0;
  font-size: 1.4rem;
}

.chapter h2 {
  margin: 1rem 0 0.25rem;
  font-size: 1.1rem;
}

.chapter p {
  margin: 0 0 0.75rem;
}

/* Longhands: el atajo view-timeline reiniciaría también el inset. */
#luz     { view-timeline-name: --sec-luz; }
#peso    { view-timeline-name: --sec-peso; }
#agua    { view-timeline-name: --sec-agua; }
#plantas { view-timeline-name: --sec-plantas; }

.chapter {
  view-timeline-axis: block;
  view-timeline-inset: 30% 69%;
}

/* ── Índice ── */
.toc__title {
  margin: 0 0 0.25rem;
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.toc ol {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc a {
  display: block;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  color: var(--color-muted);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  animation: toc-active auto linear both;
}

@keyframes toc-active {
  0%,
  100% {
    background-color: transparent;
    color: var(--color-muted);
  }

  1%,
  99% {
    background-color: var(--color-tint);
    color: var(--color-brand);
  }
}

/* Cada enlace, con la línea de tiempo de su sección (después del atajo). */
.toc a[href="#luz"]     { animation-timeline: --sec-luz; }
.toc a[href="#peso"]    { animation-timeline: --sec-peso; }
.toc a[href="#agua"]    { animation-timeline: --sec-agua; }
.toc a[href="#plantas"] { animation-timeline: --sec-plantas; }

/* La barra de lectura: la línea de tiempo de scroll del artículo, por su nombre. */
.toc__progress {
  height: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-track);
}

.toc__fill {
  height: 100%;
  background: var(--color-accent);
  transform-origin: left;
  scale: 0 1;
  animation: read auto linear both;
  animation-timeline: --reader;
}

@keyframes read {
  to { scale: 1 1; }
}

/* ── Contenedor ancho: índice a la izquierda ── */
@container (width >= 34rem) {
  .guide__layout {
    grid-template-columns: 10rem 1fr;
    align-items: start;
  }

  .toc ol {
    flex-direction: column;
  }
}
```
