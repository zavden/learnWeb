---
example_description: "La portada de una exposición con efectos ligados al scroll, sin JavaScript: la cabecera pegajosa se vuelve opaca y gana sombra en los primeros 80px, la pintura de la portada se desplaza más despacio que el texto (parallax), el título se desvanece al subir, una barra mide la lectura y cada sección aparece al entrar. Con reducir movimiento no hay parallax ni desplazamientos: solo fundidos"
example_tags: "css|profesional|scroll-driven|scroll|view|animation-range|parallax|sticky|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="page">
  <header class="site-header">
    <a class="site-header__brand" href="/exposiciones/velasco">Museo del Valle</a>
    <a class="site-header__cta" href="/exposiciones/velasco/entradas">Entradas</a>
    <div class="site-header__progress" aria-hidden="true"></div>
  </header>

  <section class="hero" aria-labelledby="hero-title">
    <img class="hero__image" src="velasco-valle-de-mexico.jpg" alt="" width="960" height="660">
    <div class="hero__text">
      <p class="hero__kicker">Exposición temporal · hasta el 30 de noviembre</p>
      <h1 id="hero-title">Velasco: el valle de México</h1>
    </div>
  </section>

  <main class="content">
    <section class="block">
      <h2>La exposición</h2>
      <p>José María Velasco pintó el valle decenas de veces entre 1873 y 1900. Reunimos once de esas vistas, con sus bocetos y las fotografías que tomó para estudiarlas.</p>
    </section>
    <section class="block">
      <h2>Horarios</h2>
      <p>De martes a domingo, de 10:00 a 18:00. Los miércoles, hasta las 21:00, con visita guiada a las 19:00.</p>
    </section>
    <section class="block">
      <h2>Cómo llegar</h2>
      <p>Metro Chapultepec, línea 1. Hay estacionamiento para bicicletas en la entrada principal.</p>
    </section>
    <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Óleo sobre tela. Dominio público.</p>
  </main>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portada con scroll
   - La «página» es un contenedor con scroll propio (en una web real sería la
     ventana: scroll(root)). Todas las animaciones usan scroll() del
     contenedor más cercano o view() de cada elemento.
   - Cabecera: de transparente a opaca con sombra en los primeros 80px
     (animation-range: 0 80px). Es color y sombra: se anima para todos.
   - Parallax: la pintura baja un 30 % de su caja mientras la portada sube,
     así que parece moverse más despacio. Es el efecto que más marea: su
     distancia se multiplica por --motion, que vale 0 salvo con
     no-preference.
   - El título se desvanece en los primeros 160px (y sube, con movimiento).
   - Barra de lectura: scale de 0 a 1 en todo el recorrido.
   - Secciones: aparecen mientras entran (view() + entry).
   - Siempre: el atajo animation antes de animation-timeline y -range.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-surface: #ffffff;
  --color-focus: #1d4ed8;
  --motion: 0;
}

@media (prefers-reduced-motion: no-preference) {
  :root {
    --motion: 1;
  }
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

/* Alto fijo, más bajo que el contenido: siempre hay recorrido de scroll. */
.page {
  height: min(100vh, 30rem);
  overflow-y: auto;
}

/* ── Cabecera ── */
.site-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -3.25rem;      /* la portada sube por debajo */
  padding: 0.75rem 1rem;
  color: #ffffff;
  animation: solidify auto linear both;
  animation-timeline: scroll();
  animation-range: 0 80px;
}

@keyframes solidify {
  from {
    background-color: rgb(20 83 45 / 0);
    box-shadow: 0 0 0 rgb(15 23 42 / 0);
  }
  to {
    background-color: rgb(20 83 45 / 1);
    box-shadow: 0 6px 16px rgb(15 23 42 / 0.25);
  }
}

.site-header a {
  color: inherit;
  font-weight: 700;
  text-decoration: none;
}

.site-header :focus-visible {
  outline-color: #fde047;
}

.site-header__cta {
  padding: 0.3rem 0.8rem;
  border: 1px solid #ffffff;
  border-radius: 999px;
}

.site-header__progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #fde047;
  transform-origin: left;
  scale: 0 1;
  animation: read auto linear both;
  animation-timeline: scroll();
}

@keyframes read {
  to { scale: 1 1; }
}

/* ── Portada ── */
.hero {
  position: relative;
  display: grid;
  align-items: end;
  height: 18rem;
  overflow: clip;
  background: #0f172a;
}

/* La pintura, un 30 % más alta que la portada para tener recorrido. */
.hero__image {
  position: absolute;
  inset: -15% 0 auto;
  width: 100%;
  height: 130%;
  object-fit: cover;
  animation: parallax auto linear both;
  animation-timeline: scroll();
  animation-range: 0 18rem;
}

@keyframes parallax {
  to { translate: 0 calc(var(--motion) * 30%); }
}

/* Velos: la pintura tiene cielos claros, y hay texto blanco arriba (la
   cabecera, todavía transparente) y abajo (el título). Un 70 % de negro
   azulado bajo la cabecera y un 85 % bajo el título: el blanco conserva al
   menos 6:1 aunque detrás haya un píxel blanco. */
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgb(15 23 42 / 0.7) 0 3.5rem, rgb(15 23 42 / 0) 6rem),
    linear-gradient(to top, rgb(15 23 42 / 0.85) 0 35%, rgb(15 23 42 / 0.2));
}

.hero__text {
  position: relative;
  z-index: 1;
  padding: 1rem;
  color: #ffffff;
  animation: title-out auto linear both;
  animation-timeline: scroll();
  animation-range: 0 10rem;
}

@keyframes title-out {
  to {
    opacity: 0;
    translate: 0 calc(var(--motion) * -2rem);
  }
}

.hero__kicker {
  margin: 0;
  font-size: 0.85rem;
}

.hero h1 {
  margin: 0;
  font-size: clamp(1.6rem, 1.2rem + 2vw, 2.4rem);
  line-height: 1.1;
}

/* ── Contenido ── */
.content {
  max-width: 40rem;
  margin-inline: auto;
  padding: 1rem;
}

.block {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f0fdf4;
  animation: reveal auto linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 80%;
}

@keyframes reveal {
  from {
    opacity: 0;
    translate: 0 calc(var(--motion) * 1.5rem);
  }
}

.block h2 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.block p {
  margin: 0;
}

.credit {
  margin: 1rem 0 2rem;
  color: var(--color-muted);
  font-size: 0.8rem;
}
```
