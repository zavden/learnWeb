---
exercise: true
exercise_title: "Da estilo sin añadir clases"
exercise_instructions: "Haz que el primer párrafo después de cada h2 sea más grande y de color gris (TODO 1) || Añade una flecha ↗ detrás de los enlaces que empiezan por https, que un lector de pantalla lea como «(sitio externo)» (TODO 2) || Pinta de gris claro las filas pares del cuerpo de la tabla (TODO 3) || Haz que la celda vacía muestre un guion «—» (TODO 4)"
exercise_hints: "El combinador + elige el elemento que va justo después de otro || ^= comprueba cómo empieza el valor de un atributo, y content admite un texto alternativo tras una barra || even equivale a 2n || :empty y ::before se pueden usar juntos en el mismo selector"
exercise_solution_example: 10-ej-selectores-sin-clases-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_description: "Ejercicio: dar estilo a un artículo sin clases usando combinadores, selectores de atributo, pseudoclases estructurales y pseudoelementos"
example_tags: "css|ejercicio|selectores|pseudoclases|pseudoelementos"
---

# HTML

```html
<article>
  <h2>Ruta por la sierra</h2>
  <p>Una caminata de dificultad media, de unas cuatro horas, con vistas al embalse.</p>
  <p>Sal temprano: en verano, a mediodía, el calor aprieta.</p>

  <h2>Antes de salir</h2>
  <p>Lleva agua, protección solar y calzado de montaña.</p>
  <ul>
    <li><a href="#horarios">Horarios del autobús</a></li>
    <li><a href="https://example.com/tiempo">Previsión del tiempo</a></li>
  </ul>

  <table id="horarios">
    <caption>Horarios del autobús</caption>
    <thead>
      <tr><th scope="col">Salida</th><th scope="col">Llegada</th></tr>
    </thead>
    <tbody>
      <tr><td>08:00</td><td>09:10</td></tr>
      <tr><td>10:30</td><td></td></tr>
      <tr><td>13:00</td><td>14:10</td></tr>
      <tr><td>17:45</td><td>18:55</td></tr>
    </tbody>
  </table>
</article>
```

# CSS

```css
/* No puedes tocar el HTML ni añadir clases: solo selectores. */

body {
  font-family: system-ui, sans-serif;
  color: oklch(25% 0.03 260);
}

table {
  border-collapse: collapse;
}

caption {
  font-weight: bold;
  text-align: start;
}

th,
td {
  padding: 0.3rem 1rem;
  text-align: start;
}

/* TODO 1: el primer párrafo después de cada h2: font-size 1.15rem y
   color oklch(45% 0.03 260). */

/* TODO 2: detrás de cada enlace que empieza por "https", el texto " ↗",
   con el texto alternativo " (sitio externo)". */

/* TODO 3: fondo oklch(96% 0.01 260) en las filas pares del cuerpo de la tabla. */

/* TODO 4: la celda vacía muestra "—". */
```
