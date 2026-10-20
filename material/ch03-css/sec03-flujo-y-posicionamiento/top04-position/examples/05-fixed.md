---
example_description: "position: fixed coloca una barra y un botón respecto a la ventana: no se mueven al desplazar la página y no ocupan sitio en el flujo"
example_tags: "css|position|fixed|viewport"
example_stage: minimal
example_importance: important
---

# HTML

```html
<header class="topbar">Librería La Buhardilla · <a href="#">Cesta (2)</a></header>

<main class="page" id="top">
  <p class="label">↕ Desplaza la vista previa: la barra de arriba y el botón «Subir» no se mueven.</p>
  <h1>Novedades de octubre</h1>
  <h2>El faro de las ballenas</h2>
  <p>Una farera jubilada vuelve a la isla donde creció para escribir la historia del último invierno en que el faro funcionó con aceite. Novela, 312 páginas.</p>
  <h2>Cocina de aprovechamiento</h2>
  <p>Ochenta recetas para no tirar nada: del pan duro a las pieles de las verduras, con una guía para planificar la compra de la semana. Gastronomía, 224 páginas.</p>
  <h2>Mapas del cielo austral</h2>
  <p>Un atlas ilustrado de las constelaciones que solo se ven desde el hemisferio sur, con las leyendas de los pueblos que les pusieron nombre. Divulgación, 180 páginas.</p>
  <h2>La huerta en el balcón</h2>
  <p>Todo lo necesario para cultivar tomates, lechugas y aromáticas en dos metros cuadrados, mes a mes. Jardinería, 160 páginas.</p>
  <h2>Cartas desde Valparaíso</h2>
  <p>La correspondencia de dos hermanas separadas por un océano entre 1910 y 1935, editada por primera vez. Historia, 280 páginas.</p>
</main>

<a class="back-to-top" href="#top">↑ Subir</a>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* position: fixed saca la caja del flujo y la coloca respecto a la VENTANA (el viewport).
   Al desplazar la página, la ventana no se mueve, así que la caja tampoco.
   En LearnWeb, la «ventana» es el marco de la vista previa. */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;                 /* left y right a 0: ocupa todo el ancho de la ventana */
  padding: 10px 16px;
  background: #1e3a8a;
  color: #ffffff;
  font-weight: bold;
}

.topbar a {
  color: #ffffff;
}

/* Como la barra no ocupa sitio, taparía el principio de la página:
   hay que reservarle el hueco a mano. */
.page {
  max-width: 60ch;
  padding: 52px 16px 16px;
}

.page h1 {
  margin: 8px 0;
  font-size: 1.3rem;
}

.page h2 {
  margin: 16px 0 4px;
  font-size: 1rem;
}

.page p {
  margin: 0;
}

.label {
  font-size: 0.85rem;
}

.back-to-top {
  position: fixed;
  right: 12px;
  bottom: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 2px solid #1d4ed8;
  color: #1d4ed8;
  font-weight: bold;
  text-decoration: none;
}
```
