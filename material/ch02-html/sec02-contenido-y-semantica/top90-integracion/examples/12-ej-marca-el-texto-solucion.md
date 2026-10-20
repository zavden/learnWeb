---
example_description: "Solución: el anuncio con time, strong, em, abbr, q, cite, i lang, sup, kbd y small, cada uno por lo que significa"
example_tags: "solucion|texto|time|abbr|q|cite|kbd|em|strong"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<article>
  <h1>Taller de fotografía nocturna</h1>

  <!-- ✅ 1. Fecha y hora con zona horaria (en noviembre, horario de invierno: +01:00) y una duración -->
  <p>Nos vemos el <time datetime="2026-11-14T22:00+01:00">sábado 14 de noviembre a las 22:00</time> en el mirador del castillo. El taller dura <time datetime="PT2H">dos horas</time>.</p>

  <!-- ✅ 2. strong: importancia, lo que no hay que pasar por alto -->
  <p><strong>Trae ropa de abrigo.</strong> A esa hora la temperatura baja de 5&nbsp;°C.</p>

  <!-- ✅ 3. abbr, ya desarrollada en el texto · ✅ 4. q pone sus propias comillas, según el idioma -->
  <p>Organiza la Agrupación Astronómica de Ribera (<abbr>AAR</abbr>). Como dice su presidenta, <q>la mejor cámara es la que llevas encima</q>.</p>

  <!-- ✅ 5. Otra lengua: i con lang · ✅ 6. sup: el exponente -->
  <p>Probaremos la técnica de <i lang="en">star trails</i>: exposiciones largas en las que las estrellas dejan estelas. Solo nuestra galaxia tiene más de 10<sup>11</sup> estrellas.</p>

  <!-- ✅ 7. kbd: lo que el usuario teclea · ✅ 8. em: el énfasis que cambia el sentido -->
  <p>Al pasar las fotos al ordenador, renómbralas todas a la vez: en Windows, selecciónalas y pulsa <kbd>F2</kbd>. La foto no tiene que ser perfecta: tiene que ser <em>tuya</em>.</p>

  <!-- ✅ 9. cite: el título de la obra (el autor queda fuera) -->
  <p>Lectura recomendada: <cite>El universo en tu mano</cite>, de Christophe Galfard.</p>

  <!-- ✅ 10. small: la letra pequeña, dentro de su párrafo -->
  <p><small>Actividad gratuita. Plazas limitadas a 20 personas.</small></p>
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
// Las mismas comprobaciones del ejercicio: ahora todas salen ✅
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
