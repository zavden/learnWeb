---
example_description: "Ejercicio: un anuncio escrito en texto plano al que hay que poner las etiquetas de frase correctas (time, strong, em, abbr, q, cite, kbd, i, sup, small)"
example_tags: "ejercicio|texto|time|abbr|q|cite|kbd|em|strong"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Marca el texto con los elementos correctos"
exercise_instructions: "Marca la fecha y hora del taller con un time y su datetime, y la duración con otro time || Marca el aviso de la ropa de abrigo como importante || Marca la palabra «tuya» con énfasis || Envuelve la sigla AAR en un abbr (ya está desarrollada en el texto) || Convierte la frase entre comillas en una cita corta y borra las comillas escritas a mano || Marca el título del libro y el término en inglés (con su idioma) || Marca la tecla F2 y el exponente de 10¹¹ || Convierte el último párrafo en letra pequeña || Comprueba que la consola sale toda ✅"
exercise_hints: "Fecha y hora con zona horaria: 2026-11-14T22:00+01:00; una duración de dos horas: PT2H || strong es importancia; em, el énfasis que cambia el sentido de la frase || q pone sus propias comillas: si dejas las tuyas, saldrán dobles || cite es el título de una obra, no el nombre de su autor || i lang=\"en\" para star trails · kbd para una tecla · sup para el exponente: escribe 10<sup>11</sup> || small va dentro del párrafo: <p><small>…</small></p>"
exercise_solution_example: 12-ej-marca-el-texto-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<article>
  <h1>Taller de fotografía nocturna</h1>

  <!-- TODO 1: la fecha y la hora (time con datetime) y la duración (otro time) -->
  <p>Nos vemos el sábado 14 de noviembre a las 22:00 en el mirador del castillo. El taller dura dos horas.</p>

  <!-- TODO 2: la primera frase es un aviso importante -->
  <p>Trae ropa de abrigo. A esa hora la temperatura baja de 5&nbsp;°C.</p>

  <!-- TODO 3: la sigla AAR · TODO 4: la cita corta, sin las comillas escritas a mano -->
  <p>Organiza la Agrupación Astronómica de Ribera (AAR). Como dice su presidenta, «la mejor cámara es la que llevas encima».</p>

  <!-- TODO 5: el término en inglés, con su idioma · TODO 6: el exponente -->
  <p>Probaremos la técnica de star trails: exposiciones largas en las que las estrellas dejan estelas. Solo nuestra galaxia tiene más de 1011 estrellas.</p>

  <!-- TODO 7: la tecla · TODO 8: el énfasis que cambia el sentido de la última frase -->
  <p>Al pasar las fotos al ordenador, renómbralas todas a la vez: en Windows, selecciónalas y pulsa F2. La foto no tiene que ser perfecta: tiene que ser tuya.</p>

  <!-- TODO 9: el título del libro -->
  <p>Lectura recomendada: El universo en tu mano, de Christophe Galfard.</p>

  <!-- TODO 10: letra pequeña -->
  <p>Actividad gratuita. Plazas limitadas a 20 personas.</p>
</article>
```

# CSS

```css
/* Bloqueado: no hace falta tocarlo */
body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #1f2937;
}

/* Para ver de un vistazo qué has marcado: cada elemento de frase, con un fondo de color */
:is(time, strong, em, abbr, q, cite, kbd, i, sup, small) {
  background: #fef3c7;
}

kbd {
  padding: 0 0.3em;
  border: 1px solid #94a3b8;
  border-radius: 4px;
}
```

# JavaScript

```javascript
// Comprobaciones automáticas (bloqueadas: no hace falta tocarlas). Adelanto: JavaScript se
// explica en su capítulo.
const textOf = (selector) => document.querySelector(selector)?.textContent.trim() ?? '';
const quote = document.querySelector('q');

const checks = [
  ['fecha y hora: time con datetime 2026-11-14T22:00…', document.querySelector('time[datetime^="2026-11-14T22:00"]') !== null],
  ['duración: time con datetime="PT2H"', document.querySelector('time[datetime="PT2H"]') !== null],
  ['el aviso importante está en strong', textOf('strong') === 'Trae ropa de abrigo.' || textOf('strong') === 'Trae ropa de abrigo'],
  ['«tuya» está en em', textOf('em') === 'tuya'],
  ['la sigla está en abbr', textOf('abbr') === 'AAR'],
  ['la cita corta es un q', quote !== null && quote.textContent.includes('la mejor cámara')],
  ['sin comillas escritas a mano', !document.querySelector('article').textContent.includes('«')],
  ['el título del libro está en cite', textOf('cite') === 'El universo en tu mano'],
  ['el término en inglés está en i con lang="en"', document.querySelector('i[lang="en"]')?.textContent.trim() === 'star trails'],
  ['el exponente está en sup', textOf('sup') === '11'],
  ['la tecla está en kbd', textOf('kbd') === 'F2'],
  ['la letra pequeña está en small', textOf('small').startsWith('Actividad gratuita')],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
```
