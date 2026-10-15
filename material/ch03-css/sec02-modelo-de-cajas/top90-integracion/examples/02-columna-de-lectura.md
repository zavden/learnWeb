---
example_description: "Una columna de lectura centrada con min() y margin-inline: auto, márgenes en una sola dirección, una cabecera con flow-root y una cita que sobresale sin desbordar nunca"
example_tags: "css|modelo-de-cajas|margin|max-width|flow-root|colapso"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<header class="site-header">
  <div class="wrapper">
    <h1>Diario del huerto</h1>
    <p>Notas de temporada de un huerto urbano en Valladolid</p>
  </div>
</header>

<main class="wrapper flow">
  <h2>Cómo plantar ajos en noviembre</h2>
  <p>El ajo es de los pocos cultivos que agradecen el frío: necesita varias semanas por debajo de 10 °C para formar bien la cabeza. Por eso se planta ahora, cuando el resto del huerto se va a dormir.</p>
  <p>Separa los dientes justo antes de plantarlos, sin pelarlos, y elige los más gordos de fuera. Los del centro, pequeños, dan cabezas pequeñas.</p>

  <figure>
    <img src="garlic.svg" width="640" height="360" alt="Tres plantas de ajo con sus hojas verdes y la cabeza blanca asomando sobre la tierra">
    <figcaption>Hacia mayo las hojas amarillean: es la señal para cosechar.</figcaption>
  </figure>

  <aside class="note flow">
    <h3>Antes de empezar</h3>
    <p>Busca un sitio con sol y una tierra que drene bien: el ajo se pudre si se encharca.</p>
  </aside>

  <h2>Distancias y profundidad</h2>
  <p>Entierra cada diente con la punta hacia arriba, a unos 4 cm de profundidad. Deja 15 cm entre plantas y 30 cm entre filas para poder quitar las hierbas sin pisarlas.</p>
  <blockquote class="pull-quote">
    <p>«Ajo de noviembre, cabeza de diciembre en la mesa de junio.»</p>
  </blockquote>
  <p>Riega solo si el otoño viene seco. Durante el invierno, la lluvia suele bastar.</p>
</main>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  background: #fffbeb;
}

/* La columna: como mucho 65 caracteres, y nunca más que «el ancho disponible − 2rem».
   margin-inline: auto reparte el sobrante a los dos lados (lección 3).
   En una pantalla estrecha, min() elige 100% − 2rem: siempre queda 1rem a cada lado. */
.wrapper {
  width: min(100% - 2rem, 65ch);
  margin-inline: auto;
}

/* Fondo a todo el ancho, contenido en la columna.
   🐛 Sin flow-root, el margin-top del h1 atravesaría el .wrapper y la cabecera
   y aparecería como una franja clara ENCIMA del verde (colapso padre-hijo). */
.site-header {
  display: flow-root;
  background: #14532d;
  color: #f0fdf4;
}

.site-header h1 {
  margin: 1.5rem 0 0.25rem;
}

.site-header p {
  margin: 0 0 1.5rem;
}

/* Ritmo vertical con márgenes en UNA sola dirección: cada hijo se separa del anterior
   y nunca hay dos márgenes enfrentados que colapsen. El espacio de arriba y de abajo
   de la columna es padding: no sale fuera. (* + * es «cualquiera que vaya detrás de otro».) */
.flow > * {
  margin-block: 0;
}

.flow > * + * {
  margin-block-start: 1em;
}

.flow > h2 {
  margin-block-start: 2em;
  line-height: 1.25;
}

main.flow {
  padding-block: 1rem 3rem;
}

main.flow > :first-child {
  margin-block-start: 0;
}

/* figure trae 40px de margen a los lados en la hoja del navegador */
figure {
  margin-inline: 0;
}

figure img {
  display: block;
  max-width: 100%;               /* lección 4: la imagen nunca desborda la columna */
  height: auto;
  border-radius: 8px;
}

figcaption {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #57534e;
}

/* La nota se espacia por dentro con padding; su primer hijo no tiene margen arriba,
   así que no hay nada que pueda escaparse. */
.note {
  padding: 1rem 1.25rem;
  border-left: 4px solid #15803d;
  border-radius: 0 8px 8px 0;
  background: #f0fdf4;
}

.note h3 {
  font-size: 1rem;
}

/* La cita sobresale 1rem por cada lado de la columna. Nunca desborda la página:
   la columna deja SIEMPRE al menos 1rem libre a cada lado (el «− 2rem» de min()). */
.pull-quote {
  margin-inline: -1rem;
  padding: 1rem;
  border-block: 3px solid #b45309;
  font-size: 1.25rem;
  font-style: italic;
  text-align: center;
  color: #78350f;
}

.pull-quote p {
  margin: 0;
}
```
