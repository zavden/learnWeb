---
example_description: "Un artículo de principio a fin: títulos, énfasis, fechas, figura, cita con su fuente, lista y notas al pie enlazadas"
example_tags: "integracion|articulo|texto|figure|blockquote|time|notas"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <!-- article: un contenido autónomo, con su propio header y su propio footer -->
  <article>
    <header>
      <h1>Por qué el agua del grifo sabe distinta en cada ciudad</h1>
      <!-- time: texto para personas, datetime para máquinas (fecha y duración ISO 8601) -->
      <p>Por <a href="#author">Elena Soto</a> · <time datetime="2026-09-14">14 de septiembre de 2026</time> · Lectura: <time datetime="PT5M">5&nbsp;min</time></p>
    </header>

    <!-- em cambia el sentido de la frase; strong marca lo importante -->
    <p>Si te has mudado alguna vez, lo habrás notado: el café no sabe igual y la mampara de la ducha se llena de manchas blancas. No es tu imaginación. El agua del grifo <em>no</em> es la misma en todas partes, aunque en todas sea <strong>apta para beber</strong>.</p>

    <section>
      <h2>Qué es la dureza</h2>
      <!-- dfn: el término que esta frase define · sub: fórmula química · sup + enlace: llamada a una nota -->
      <p>La <dfn>dureza</dfn> del agua es la cantidad de minerales que lleva disueltos, sobre todo calcio y magnesio. Se mide en miligramos de carbonato cálcico (CaCO<sub>3</sub>) por litro: hasta 60&nbsp;mg/l el agua se considera blanda, y por encima de 180&nbsp;mg/l, muy dura<sup><a href="#note-1" id="ref-1">1</a></sup>.</p>

      <!-- figure + figcaption: el pie lo leen todos; el alt describe el contenido para quien no ve la imagen -->
      <figure>
        <img src="img/hardness-scale.svg" alt="Escala de dureza: blanda de 0 a 60 mg/l, moderada de 60 a 120, dura de 120 a 180 y muy dura por encima de 180." width="640" height="200">
        <figcaption>Figura 1. Las cuatro categorías de dureza. La de tu ciudad suele aparecer en la factura del agua.</figcaption>
      </figure>
    </section>

    <section>
      <h2>De dónde sale la cal</h2>
      <p>El agua de lluvia es blanda: se endurece por el camino. Al atravesar terrenos calizos disuelve parte de la roca; al pasar por granito apenas recoge nada. Por eso dos ciudades vecinas pueden tener aguas muy distintas.</p>

      <!-- Una cita larga dentro de una figure: el cite de blockquote guarda la URL (no se ve);
           la atribución visible va en el figcaption, y el título de la obra en <cite> -->
      <figure>
        <blockquote cite="https://aguasderibera.example/entrevistas/laboratorio">
          <p>La cal no es un contaminante: es la huella del terreno por el que ha pasado el agua antes de llegar a tu casa.</p>
        </blockquote>
        <figcaption>— Marta Ibarra, jefa del laboratorio de Aguas de Ribera, en <cite>Lo que cuenta el agua</cite></figcaption>
      </figure>
    </section>

    <section>
      <h2>¿Hay que filtrarla?</h2>
      <!-- q: cita corta; las comillas las pone el navegador según el idioma -->
      <p>Para beber, no. Como resume la guía de la empresa de aguas, <q>si sale del grifo, se puede beber</q>. Para lo demás, depende:</p>
      <!-- ul: el orden de los consejos da igual · b: palabras clave, sin añadir importancia -->
      <ul>
        <li><b>Café y té:</b> una jarra con filtro de carbón suaviza el sabor del cloro.</li>
        <li><b>Plancha y cafetera:</b> descalcifícalas una vez al mes con vinagre o ácido cítrico.</li>
        <li><b>Mampara:</b> sécala después de la ducha; la cal aparece cuando el agua se evapora.</li>
      </ul>
      <p><small>Artículo divulgativo. Si tienes dudas sobre el agua de tu casa, consulta a tu ayuntamiento.</small></p>
    </section>

    <footer>
      <h2>Notas</h2>
      <!-- Las notas son una lista ordenada; cada una enlaza de vuelta a su llamada.
           «↩» no dice nada a un lector de pantalla: aria-label le da un nombre -->
      <ol>
        <li id="note-1">Clasificación del Servicio Geológico de Estados Unidos (<abbr>USGS</abbr>), la más usada en divulgación. <a href="#ref-1" aria-label="Volver a la llamada 1">↩</a></li>
      </ol>
      <!-- address: el contacto del AUTOR de este artículo -->
      <address id="author">Escrito por <a href="mailto:elena.soto@ejemplo.es">Elena Soto</a>, periodista de ciencia.</address>
    </footer>
  </article>
</main>
```

# CSS

```css
/* Solo para que se lea bien: el CSS se estudia en el capítulo 3 */
body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #1f2937;
}

/* La imagen no desborda la columna; display: block quita el hueco de la línea base */
img {
  display: block;
  max-width: 100%;
  height: auto;
}

figcaption {
  font-size: 0.9rem;
  color: #4b5563;
}

blockquote {
  margin: 0;
  padding-left: 1rem;
  border-left: 4px solid #1d4ed8;
  font-size: 1.15rem;
}

article > footer {
  margin-top: 2rem;
  border-top: 1px solid #d1d5db;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Esto es lo que una máquina (un lector
// de pantalla, un buscador, el modo lectura) puede sacar del artículo sin «verlo».
const article = document.querySelector('article');

console.group('Índice de títulos');
for (const heading of article.querySelectorAll('h1, h2, h3')) {
  const level = Number(heading.tagName[1]);
  console.log(`${'  '.repeat(level - 1)}${heading.tagName.toLowerCase()} ${heading.textContent}`);
}
console.groupEnd();

console.log('publicado (datetime) →', article.querySelector('header time').dateTime);
console.log('fuente de la cita    →', article.querySelector('blockquote').cite);
console.log('figura 1, alt        →', article.querySelector('figure img').alt);
for (const call of article.querySelectorAll('sup a')) {
  console.log(`nota ${call.textContent} →`, document.querySelector(call.hash).textContent.trim());
}
```
