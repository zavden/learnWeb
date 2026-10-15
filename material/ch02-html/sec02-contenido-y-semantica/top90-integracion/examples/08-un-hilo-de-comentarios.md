---
example_description: "Un hilo de comentarios: artículos dentro de un artículo, respuestas como listas anidadas, títulos que bajan de nivel con el hilo y botones con nombre completo"
example_tags: "integracion|comentarios|article|listas-anidadas|titulos|time"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <article>
    <h1>¿Merece la pena una cafetera de émbolo?</h1>
    <p>Es barata, no necesita filtros de papel y hace un café con mucho cuerpo. A cambio, deja algo de poso en la taza.</p>

    <!-- Los comentarios pertenecen al artículo: van dentro de él, en su propia sección -->
    <section aria-labelledby="comments-title">
      <h2 id="comments-title">Comentarios</h2>
      <!-- Por orden de llegada: ol. Cada comentario es un article (lo escribe otra persona y
           tiene sentido solo). Las respuestas son una sublista DENTRO del li al que responden,
           y sus títulos bajan un nivel: h3 → h4 → h5 -->
      <ol class="comments">
        <li>
          <article>
            <h3>Lucía M.</h3>
            <p><time datetime="2026-10-10T09:15+02:00">10 de octubre, 9:15</time></p>
            <p>La uso a diario. El truco es moler el café grueso: si no, se cuela por el filtro.</p>
            <button type="button">Responder<span class="visually-hidden"> a Lucía M.</span></button>
          </article>
          <ol>
            <li>
              <article>
                <h4>Andrés</h4>
                <p><time datetime="2026-10-10T11:40+02:00">10 de octubre, 11:40</time></p>
                <p>¿Qué molinillo usas? El mío no muele tan grueso.</p>
                <button type="button">Responder<span class="visually-hidden"> a Andrés</span></button>
              </article>
              <ol>
                <li>
                  <article>
                    <h5>Lucía M.</h5>
                    <p><time datetime="2026-10-10T12:05+02:00">10 de octubre, 12:05</time></p>
                    <p>Uno manual de madera: tiene una rueda para ajustar el grosor.</p>
                    <button type="button">Responder<span class="visually-hidden"> a Lucía M.</span></button>
                  </article>
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <article>
            <h3>Marta R.</h3>
            <p><time datetime="2026-10-11T18:20+02:00">11 de octubre, 18:20</time></p>
            <p>A mí me sabe a poso. Me quedo con la italiana.</p>
            <button type="button">Responder<span class="visually-hidden"> a Marta R.</span></button>
          </article>
        </li>
      </ol>
    </section>
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
  line-height: 1.5;
  color: #1f2937;
}

/* Sin números; la sangría y la línea de la izquierda muestran a qué responde cada uno */
.comments,
.comments ol {
  padding-left: 0;
  list-style: none;
}

.comments ol {
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 3px solid #d1d5db;
}

.comments h3,
.comments h4,
.comments h5 {
  margin-bottom: 0;
  font-size: 1rem;
}

.comments time {
  font-size: 0.9rem;
  color: #4b5563;
}

button {
  font: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Reconstruimos el hilo solo a partir del
// HTML: el nivel sale de las listas anidadas, y «a quién responde», del li que la contiene.
const comments = document.querySelectorAll('.comments article');
console.log('comentarios →', comments.length);

for (const comment of comments) {
  let level = 0;
  for (let element = comment.parentElement.parentElement; !element.matches('.comments'); element = element.parentElement) {
    if (element.localName === 'ol') level += 1;
  }
  const heading = comment.querySelector('h3, h4, h5');
  const parent = comment.parentElement.parentElement.closest('li');
  const replyTo = parent ? ` → responde a ${parent.querySelector('h3, h4, h5').textContent}` : '';
  console.log(`${'  '.repeat(level)}${heading.localName} ${heading.textContent} · ${comment.querySelector('time').dateTime}${replyTo}`);
}
```
