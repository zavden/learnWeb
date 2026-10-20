---
example_description: "Una barra de navegación sticky de cristal esmerilado sobre la foto de una nebulosa: backdrop-filter con un fondo blanco semitransparente calculado para el peor caso, una línea inferior hecha con un degradado y un @supports que la vuelve casi opaca si el navegador no entiende backdrop-filter"
example_tags: "css|integracion|backdrop-filter|sticky|supports|degradados|contraste"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Una «ventana» de 300px de alto con scroll: desplázala y mira la foto pasar por debajo de la barra.</p>
<div class="window">
  <header class="topbar">
    <a class="brand" href="/planetario">Planetario</a>
    <nav aria-label="Principal">
      <a href="/planetario/funciones">Funciones</a>
      <a href="/planetario/talleres">Talleres</a>
    </nav>
  </header>
  <main class="content">
    <div class="poster" role="img" aria-label="Los Pilares de la creación, columnas de gas y polvo en la nebulosa del Águila"></div>
    <h1>Una noche en la nebulosa del Águila</h1>
    <p>La función de este mes recorre los Pilares de la creación, tres columnas de gas y polvo de varios años luz de altura donde nacen estrellas.</p>
    <p>Sesiones a las 17:00 y a las 19:00. Entrada general, 60 pesos.</p>
  </main>
</div>
<p class="credit">Foto: NASA, ESA y Hubble Heritage Team, 2014. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 6px 0;
  font-size: 0.72rem;
}

/* La ventana del ejemplo: un contenedor de scroll, como la de un navegador. */
.window {
  max-width: 440px;
  height: 300px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
  background: #0f172a;
}

/* La barra se pega arriba (position: sticky, módulo de flujo y posición).
   Cristal: blanco al 62 % + desenfoque. Contraste en el peor caso, un píxel
   negro detrás: el fondo queda en rgb(158 158 158) y el texto #0f172a tiene
   6.7:1. La saturación (saturate) aviva los colores que se ven a través.
   La línea de abajo es un degradado de 1px como primera capa del fondo. */
.topbar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background:
    linear-gradient(to right, transparent, #f59e0b, transparent) bottom / 100% 1px no-repeat,
    rgb(255 255 255 / 0.62);
  backdrop-filter: blur(12px) saturate(1.4);
}

/* @supports (lo verás en el módulo de responsive) aplica sus reglas solo si
   el navegador NO entiende backdrop-filter: sin desenfoque, la barra pasa a
   casi opaca, porque la foto nítida detrás del texto molestaría al leer. */
@supports not (backdrop-filter: blur(1px)) {
  .topbar {
    background-color: rgb(255 255 255 / 0.94);
  }
}

.topbar a {
  color: #0f172a;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}

.topbar a:hover,
.topbar a:focus-visible {
  text-decoration: underline 2px;
  text-underline-offset: 3px;
}

.brand {
  font-weight: 800;
}

.topbar nav {
  display: flex;
  gap: 14px;
}

/* El contenido sube por debajo de la barra: el póster empieza en la parte de
   arriba de la ventana (margen negativo del alto de la barra). */
.content {
  margin-top: -44px;
  color: #e2e8f0;
}

.poster {
  height: 260px;
  background: url("pilares-de-la-creacion.jpg") center 30% / cover;
}

.content h1 {
  margin: 12px 14px 6px;
  font-size: 1.2rem;
}

.content p {
  margin: 0 14px 10px;
  font-size: 0.85rem;
  line-height: 1.5;
}
```
