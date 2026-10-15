---
example_description: "Una noticia con quince elementos de texto, cada uno por lo que significa; la consola lista los datos que dejan a las máquinas"
example_tags: "integracion|texto|time|del|ins|q|cite|abbr|mark"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<article>
  <h1>La Banda Municipal estrena una obra de Lucía Ferrer</h1>
  <!-- time: la fecha legible y, en datetime, su versión para máquinas -->
  <p>Publicado el <time datetime="2026-10-05">5 de octubre de 2026</time></p>

  <!-- cite: el título de una obra · del/ins: una corrección, con la fecha en que se hizo
       · sup: el exponente de una unidad -->
  <p>La Banda Municipal de Ribera estrenará <cite>Nocturno del molino</cite>, de la compositora Lucía Ferrer, el <del datetime="2026-10-07">sábado 24</del> <ins datetime="2026-10-07"><time datetime="2026-10-31T20:30+01:00">sábado 31 de octubre a las 20:30</time></ins> en la plaza del Ayuntamiento, de 1&nbsp;200&nbsp;m<sup>2</sup>.</p>

  <!-- time también vale para duraciones · i + lang: palabras de otra lengua -->
  <p>La obra dura <time datetime="PT25M">unos veinticinco minutos</time> e incluye un pasaje para coro <i lang="it">a cappella</i>.</p>

  <!-- q: cita corta, con comillas automáticas · em: el énfasis que cambia el sentido -->
  <p>Ferrer cuenta que <q>la obra empezó como un juego con el sonido del agua</q> y que <em>no</em> pretende imitar un río.</p>

  <!-- mark: la parte de una cita que el texto comenta justo después -->
  <figure>
    <blockquote cite="https://bandaderibera.example/programa/nocturno">
      <p>La escribí pensando en el molino de mi abuelo, <mark>que todavía suena cuando sube el río</mark>.</p>
    </blockquote>
    <figcaption>— Lucía Ferrer, notas al programa</figcaption>
  </figure>
  <p>La frase resaltada explica el título: el molino lleva medio siglo parado, pero las crecidas aún mueven su rueda.</p>

  <!-- strong: lo que no hay que pasar por alto · abbr: la sigla, desarrollada en el propio texto -->
  <p><strong>Las entradas son gratuitas, pero hay que recogerlas antes del <time datetime="2026-10-29">jueves 29</time></strong> en la Oficina de Turismo. Si no puedes ir, la Radio Municipal de Ribera (<abbr>RMR</abbr>) lo retransmitirá en directo.</p>

  <!-- small: la letra pequeña -->
  <p><small>Aforo limitado a 400 personas. Si llueve, el concierto se traslada al Teatro Principal.</small></p>
</article>
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

blockquote {
  margin: 0;
  padding-left: 1rem;
  border-left: 4px solid #1d4ed8;
}

figcaption {
  color: #4b5563;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Una auditoría del texto: cada elemento de
// frase, su texto y el dato que deja a las máquinas (datetime, lang, title), si lo tiene.
const PHRASING = 'em, strong, i, b, q, cite, abbr, time, mark, del, ins, sup, sub, small, s, dfn';
const rows = [...document.querySelectorAll(`article :is(${PHRASING})`)].map((element) => ({
  elemento: `<${element.localName}>`,
  texto: element.textContent,
  dato: element.getAttribute('datetime') ?? element.getAttribute('lang') ?? element.getAttribute('title') ?? '',
}));
console.table(rows);
console.log('elementos de texto →', rows.length);
console.log('fuente de la cita en bloque →', document.querySelector('blockquote').cite);
```
