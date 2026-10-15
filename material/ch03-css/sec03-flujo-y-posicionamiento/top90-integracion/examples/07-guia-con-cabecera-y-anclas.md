---
example_description: "Una guía larga con dos barras sticky apiladas (cabecera y navegación de etapas), anclas que no quedan tapadas gracias a scroll-padding, la sección activa resaltada con :target y un botón fijo para subir"
example_tags: "css|sticky|fixed|z-index|inline-block|target|scroll-padding"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="site-header" id="top">Guía del Camino de Santiago · Últimos 100 km</header>

<nav class="stage-nav" aria-label="Etapas">
  <a href="#sarria">Sarria</a>
  <a href="#portomarin">Portomarín</a>
  <a href="#palas">Palas de Rei</a>
  <a href="#arzua">Arzúa</a>
  <a href="#pedrouzo">O Pedrouzo</a>
</nav>

<main class="guide">
  <p class="hint">Pulsa una etapa: el título aparece justo debajo de las barras, no tapado por ellas.</p>
  <section class="stage" id="sarria"><h2>Sarria → Portomarín · 22 km</h2><p>La etapa más tranquila: robledales, aldeas de piedra y el mojón de los 100 km. Al final, el embalse de Belesar y la escalinata de Portomarín.</p></section>
  <section class="stage" id="portomarin"><h2>Portomarín → Palas de Rei · 25 km</h2><p>Una subida larga al principio y una meseta suave después. Pocas sombras: sal temprano en verano y lleva agua.</p></section>
  <section class="stage" id="palas"><h2>Palas de Rei → Arzúa · 29 km</h2><p>La más larga, con continuas subidas y bajadas. En Melide, parada obligada para probar el pulpo.</p></section>
  <section class="stage" id="arzua"><h2>Arzúa → O Pedrouzo · 19 km</h2><p>Eucaliptos y pequeñas aldeas. Arzúa es tierra de queso: llévate uno para el último día.</p></section>
  <section class="stage" id="pedrouzo"><h2>O Pedrouzo → Santiago · 20 km</h2><p>Desde el Monte do Gozo se ven por fin las torres de la catedral. Quedan cinco kilómetros de ciudad hasta la plaza del Obradoiro.</p></section>
</main>

<a class="to-top" href="#top">↑ Subir</a>
```

# CSS

```css
:root {
  --header-h: 2.75rem;
  --nav-h: 2.75rem;
  --z-sticky: 200;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Al saltar a un ancla (o al mover el foco con Tab), el navegador deja libre este espacio
   arriba y abajo: así las barras sticky y el botón fijo no tapan lo que vas a leer.
   scroll-padding es la forma de que lo fijo «no tape el contenido enfocado». */
html {
  scroll-padding-top: calc(var(--header-h) + var(--nav-h) + 0.5rem);
  scroll-padding-bottom: 4rem;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.5;
}

/* Dos barras sticky apiladas: la segunda se pega justo debajo de la primera.
   Necesitan una altura conocida para calcular dónde empieza la siguiente. */
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: var(--header-h);
  padding: 0 1rem;
  overflow: hidden;
  background: #1e3a8a;
  color: #ffffff;
  font-weight: bold;
  line-height: var(--header-h);
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* La navegación tiene su propio scroll horizontal en pantallas estrechas. Eso la convierte
   en un contenedor de scroll, pero no estropea su sticky: lo que importa es el overflow de
   sus ANTEPASADOS (lección 4). */
.stage-nav {
  position: sticky;
  top: var(--header-h);
  z-index: var(--z-sticky);
  height: var(--nav-h);
  padding: 0.4rem 1rem;
  overflow-x: auto;
  border-bottom: 1px solid #cbd5e1;
  background: #ffffff;
  white-space: nowrap;
}

/* Lección 2: enlaces inline-block en fila. */
.stage-nav a {
  display: inline-block;
  margin-right: 0.25rem;
  padding: 0.15rem 0.75rem;
  border: 1px solid #94a3b8;
  border-radius: 999px;
  color: #1e3a8a;
  font-size: 0.85rem;
  text-decoration: none;
}

.stage-nav a:focus-visible,
.to-top:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.guide {
  width: min(100% - 2rem, 36rem);
  margin: 0 auto 4rem;
}

.hint {
  color: #475569;
  font-size: 0.85rem;
}

.stage {
  margin-bottom: 2rem;
}

.stage h2 {
  margin: 0 0 0.25rem;
  padding: 0.15rem 0.4rem;
  font-size: 1.1rem;
}

.stage p {
  margin: 0;
  min-height: 9rem;                  /* etapas altas para que la guía tenga scroll */
}

/* :target = la sección a la que apunta la URL: la resaltamos. */
.stage:target h2 {
  background: #fef9c3;
}

/* Lección 4: fijo respecto a la ventana, con el z-index de la escala. */
.to-top {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: var(--z-sticky);
  padding: 0.4rem 0.9rem;
  border: 2px solid #1d4ed8;
  border-radius: 999px;
  background: #ffffff;
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
}
```
