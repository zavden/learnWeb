---
example_description: "Líneas con nombre ([full-start], [content-start]…) en un artículo: el texto va en una columna central y la foto y la cita «a sangre» ocupan todo el ancho con grid-column: full"
example_tags: "css|grid|lineas-con-nombre|grid-column|full-bleed|articulo"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">↔ Ensancha la vista previa (o ábrela con ↗): el texto se queda en su columna de 18rem y la foto y la cita llegan siempre a los bordes.</p>

<article class="post">
  <h2>Un fin de semana en el lago</h2>
  <p>Salimos el sábado a las siete para llegar antes que el calor. El camino de tierra termina en un embarcadero de madera donde alquilan canoas por horas.</p>
  <img class="full-bleed" src="lake.svg" alt="Un lago azul al pie de unas montañas verdes, con el sol arriba a la derecha" width="320" height="200">
  <p>Remamos hasta la orilla norte, donde el agua es tan clara que se ven los peces entre las piedras del fondo.</p>
  <blockquote class="full-bleed">«Lleva agua de sobra: no hay tiendas en todo el camino.»</blockquote>
  <p>Al volver, el embarcadero ya estaba lleno. Si vas en fin de semana, llega temprano.</p>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  margin: 8px 0;
}

.label {
  margin: 0 8px 8px;
  font-size: 0.8rem;
}

/* Las líneas se pueden NOMBRAR escribiendo nombres entre corchetes entre las pistas.
   Tres columnas: dos laterales elásticas y una central de 18rem como máximo.
     [full-start] lateral [content-start] central [content-end] lateral [full-end]
   Las laterales tienen un mínimo de 1rem: en pantallas estrechas, un margen. */
.post {
  display: grid;
  grid-template-columns:
    [full-start] minmax(1rem, 1fr)
    [content-start] minmax(0, 18rem) [content-end]
    minmax(1rem, 1fr) [full-end];
  row-gap: 10px;
  padding-bottom: 10px;
  outline: 2px dashed #0f766e;
  font-size: 0.85rem;
  line-height: 1.5;
}

/* Todos los hijos, en la columna central. Si dos líneas se llaman algo-start y
   algo-end, grid-column: algo equivale a algo-start / algo-end. */
.post > * {
  grid-column: content;
  margin: 0;
}

/* «A sangre» (full-bleed): de borde a borde. Sin nombres habría que escribir 1 / -1;
   con ellos, el CSS dice lo que significa. */
.post > .full-bleed {
  grid-column: full;
}

.post h2 {
  margin-top: 10px;
  font-size: 1.15rem;
}

.post img {
  width: 100%;
  height: auto;
}

.post blockquote {
  padding: 12px 1rem;
  border-top: 1px solid #0f766e;
  border-bottom: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
}
```
