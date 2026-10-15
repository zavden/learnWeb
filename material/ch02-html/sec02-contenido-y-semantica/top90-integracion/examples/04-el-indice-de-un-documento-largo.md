---
example_description: "Un índice que refleja los títulos: nav con nombre, listas ordenadas anidadas, enlaces a fragmentos y enlaces de vuelta"
example_tags: "integracion|indice|fragmentos|listas-anidadas|titulos|nav"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<h1>Manual del huerto comunitario</h1>
<p>Te damos la bienvenida al Huerto del Molino. Cada apartado de este manual se puede enlazar: pulsa una entrada del índice y mira cómo termina la dirección.</p>

<!-- El índice es la navegación principal de este documento: un nav con nombre (su título).
     Sus listas reproducen la jerarquía de los títulos: un nivel de ol por cada nivel de h -->
<nav aria-labelledby="toc-title">
  <h2 id="toc-title">Índice</h2>
  <ol>
    <li>
      <a href="#start">Antes de empezar</a>
      <!-- La sublista va DENTRO del li al que pertenece -->
      <ol>
        <li><a href="#plot">Tu parcela</a></li>
        <li><a href="#tools">Herramientas</a></li>
      </ol>
    </li>
    <li>
      <a href="#watering">El riego</a>
      <ol>
        <li><a href="#shifts">Turnos de riego</a></li>
        <li><a href="#saving">Cómo ahorrar agua</a></li>
      </ol>
    </li>
    <li><a href="#rules">Normas de convivencia</a></li>
    <li><a href="#contact">Contacto</a></li>
  </ol>
</nav>

<section>
  <h2 id="start">Antes de empezar</h2>
  <p>Durante el primer mes te acompañará una persona veterana del huerto. Pregúntale todo: nadie nace sabiendo cuándo se plantan las habas.</p>
  <h3 id="plot">Tu parcela</h3>
  <p>Cada parcela mide 4&nbsp;×&nbsp;2&nbsp;m (8&nbsp;m<sup>2</sup>) y lleva su número pintado en la estaca de la esquina.</p>
  <h3 id="tools">Herramientas</h3>
  <p>La caseta se abre con el código que recibiste al inscribirte. Dentro encontrarás:</p>
  <ul>
    <li>Azadas, rastrillos y palas</li>
    <li>Regaderas y mangueras</li>
    <li>Guantes de varias tallas</li>
  </ul>
  <p><a href="#toc-title">Volver al índice</a></p>
</section>

<section>
  <h2 id="watering">El riego</h2>
  <p>El agua es de todos y se paga a medias: por eso hay turnos y algunas reglas.</p>
  <h3 id="shifts">Turnos de riego</h3>
  <!-- Parejas «quién → cuándo»: una lista de descripción -->
  <dl>
    <dt>Parcelas pares</dt>
    <dd>Lunes, miércoles y viernes</dd>
    <dt>Parcelas impares</dt>
    <dd>Martes, jueves y sábados</dd>
    <dt>Domingos</dt>
    <dd>Libre, para quien lo necesite</dd>
  </dl>
  <h3 id="saving">Cómo ahorrar agua</h3>
  <ul>
    <li>Riega al amanecer o al atardecer, nunca a pleno sol.</li>
    <li>Cubre la tierra con paja: conserva la humedad.</li>
    <li>Usa el goteo en las tomateras.</li>
  </ul>
  <p><a href="#toc-title">Volver al índice</a></p>
</section>

<section>
  <h2 id="rules">Normas de convivencia</h2>
  <ul>
    <li><strong>Cierra siempre la puerta del huerto</strong>, aunque vayas a volver enseguida.</li>
    <li>Solo tratamientos ecológicos: nada de pesticidas químicos.</li>
    <li>Los restos vegetales, al compostador.</li>
  </ul>
  <p><a href="#toc-title">Volver al índice</a></p>
</section>

<section>
  <h2 id="contact">Contacto</h2>
  <p>Escribe a <a href="mailto:huertodelmolino@ejemplo.es">huertodelmolino@ejemplo.es</a> o llama al <a href="tel:+34600000000">600 00 00 00</a>.</p>
  <p><a href="#toc-title">Volver al índice</a></p>
</section>
```

# CSS

```css
/* Solo para que se lea bien: el CSS se estudia en el capítulo 3 */
body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1f2937;
}

/* Separación generosa para que el salto a cada apartado se note */
section {
  margin-top: 4rem;
}

/* :target es el elemento al que apunta el fragmento de la URL (pseudoclase: capítulo de CSS) */
:target {
  background: #fef08a;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Comprobamos que el índice refleja de verdad
// la estructura: cada enlace tiene destino y su nivel en las listas coincide con el del título.
const toc = document.querySelector('nav');

for (const link of toc.querySelectorAll('a')) {
  let depth = 0; // cuántas ol rodean al enlace dentro del índice
  for (let element = link; element !== toc; element = element.parentElement) {
    if (element.localName === 'ol') depth += 1;
  }
  const target = document.querySelector(link.hash);
  const ok = target !== null && Number(target.tagName[1]) === depth + 1;
  const where = target ? `${target.localName}#${target.id}` : 'sin destino';
  console.log(ok ? '✅' : '❌', `${'  '.repeat(depth - 1)}${link.textContent} → ${where}`);
}
console.log('enlaces «Volver al índice» →', document.querySelectorAll('a[href="#toc-title"]').length);
```
