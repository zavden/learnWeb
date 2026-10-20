---
example_description: "Ejercicio: la página de un pódcast con botones de icono mudos, un campo sin etiqueta, enlaces repetidos, imágenes sin alt, menús sin nombre y un div que hace de botón"
example_tags: "ejercicio|accesibilidad|nombre-accesible|aria-label|alt|button"
example_stage: exercise
example_importance: critical
exercise: true
exercise_title: "Arregla los nombres accesibles"
exercise_instructions: "Da nombre a los botones de icono: ✕, 🔍 y los dos ▶ || Asocia un label al campo de búsqueda || Haz que los dos enlaces «Escuchar» digan qué episodio abren || Escribe el alt de las portadas y deja vacío el del adorno ondulado || Pon un nombre distinto a cada nav || Convierte el div «Suscribirse» en un button de verdad (conserva su clase) || Comprueba que la consola sale toda ✅"
exercise_hints: "La consola lista el nombre que recibe cada control: vigila los «(sin nombre)» || aria-label sirve para los botones de icono; para el campo, label for + id || Un texto oculto con la clase visually-hidden completa un enlace sin cambiar lo que se ve || El alt de una portada dice lo que aporta; un adorno lleva alt=\"\" (vacío, no ausente) || <button type=\"button\" class=\"subscribe\" onclick=\"subscribe()\">"
exercise_solution_example: 11-ej-arregla-los-nombres-accesibles-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<header>
  <p class="brand">Raíces · el pódcast de lo que comemos</p>
  <!-- TODO 1: este nav necesita un nombre («Principal») -->
  <nav>
    <ul>
      <li><a href="https://raices.example/">Episodios</a></li>
      <li><a href="https://raices.example/equipo/">Quiénes somos</a></li>
    </ul>
  </nav>
</header>

<!-- TODO 2: el botón ✕ no dice qué hace -->
<p class="notice">Nuevo episodio cada lunes. <button type="button" onclick="this.parentElement.hidden = true">✕</button></p>

<main>
  <h1>Episodios</h1>

  <!-- TODO 3: el campo no tiene etiqueta y el botón 🔍 no tiene nombre -->
  <p>
    <input id="search" type="search" placeholder="Buscar episodios">
    <button type="button">🔍</button>
  </p>

  <!-- TODO 4: adorno sin alt -->
  <img class="divider" src="img/divider.svg" width="600" height="24">

  <ul class="episodes">
    <li>
      <article>
        <!-- TODO 5: las portadas no tienen alt -->
        <img class="cover" src="img/cover-tomato.svg" width="160" height="160">
        <h2>12. El viaje del tomate</h2>
        <p>De planta ornamental sospechosa a rey del gazpacho.</p>
        <!-- TODO 6: dos enlaces con el mismo nombre que llevan a sitios distintos -->
        <p><a href="https://raices.example/12-tomate/">Escuchar</a> <button type="button">▶</button></p>
      </article>
    </li>
    <li>
      <article>
        <img class="cover" src="img/cover-potato.svg" width="160" height="160">
        <h2>11. La patata, de los Andes a la tortilla</h2>
        <p>Cómo un tubérculo andino llegó a todas las cocinas de Europa.</p>
        <p><a href="https://raices.example/11-patata/">Escuchar</a> <button type="button">▶</button></p>
      </article>
    </li>
  </ul>

  <!-- TODO 7: un div no es un botón: no recibe el foco ni responde al teclado -->
  <div class="subscribe" onclick="subscribe()">Suscribirse</div>
</main>

<footer>
  <!-- TODO 8: el segundo nav también necesita su propio nombre («Redes sociales») -->
  <nav>
    <ul>
      <li><a href="https://social.example/@raices">Raíces en Mastodon</a></li>
      <li><a href="https://video.example/raices">Raíces en vídeo</a></li>
    </ul>
  </nav>
</footer>
```

# CSS

```css
/* Bloqueado: no hace falta tocarlo */
body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  color: #1f2937;
}

nav ul {
  display: flex; /* en fila (capítulo de CSS) */
  gap: 1rem;
  padding: 0;
  list-style: none;
}

.notice {
  padding: 0.5rem;
  background: #dcfce7;
}

.episodes {
  padding: 0;
  list-style: none;
}

.cover {
  display: block;
}

article {
  margin-bottom: 2rem;
}

.divider {
  display: block;
  max-width: 100%;
  height: auto;
}

button,
.subscribe {
  font: inherit;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
}

.subscribe {
  display: inline-block;
  border: 2px solid #15803d;
  border-radius: 4px;
  background: #15803d;
  color: #ffffff;
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
// Comprobaciones automáticas (bloqueadas: no hace falta tocarlas). Adelanto: JavaScript se
// explica en su capítulo. nameOf() aproxima el nombre accesible: aria-labelledby,
// aria-label, label asociado o, si no, el texto del elemento (incluido el oculto).
function subscribe() {
  console.log('🔔 Suscripción confirmada');
}

function nameOf(element) {
  const ids = element.getAttribute('aria-labelledby');
  if (ids) return ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ').trim();
  if (element.getAttribute('aria-label')) return element.getAttribute('aria-label').trim();
  if (element.labels?.length) return element.labels[0].textContent.trim();
  return element.textContent.replace(/\s+/g, ' ').trim();
}
const hasWords = (text) => /\p{L}{3,}/u.test(text); // «✕» o «▶» no son un nombre

// El nombre de una región (nav) solo sale de aria-label o aria-labelledby, nunca de su texto
const regionName = (element) => element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby') ? nameOf(element) : '';

console.group('Controles y su nombre');
for (const control of document.querySelectorAll('a, button, input')) {
  let name = nameOf(control);
  if (control.localName === 'input' && name === '') name = `(solo el placeholder «${control.placeholder}», que desaparece al escribir)`;
  else if (!hasWords(name)) name = `(sin nombre${name ? `: solo «${name}»` : ''})`;
  console.log(control.localName.padEnd(6), '→', name);
}
console.groupEnd();

const links = [...document.querySelectorAll('a')];
const navNames = [...document.querySelectorAll('nav')].map(regionName);
const checks = [
  ['todos los botones tienen un nombre con palabras', [...document.querySelectorAll('button')].every((button) => hasWords(nameOf(button)))],
  ['el campo de búsqueda tiene una etiqueta', document.querySelector('#search').labels.length > 0],
  ['dos enlaces con el mismo nombre llevan al mismo sitio', links.every((a) => links.every((b) => nameOf(a) !== nameOf(b) || a.href === b.href))],
  ['todas las imágenes tienen alt', [...document.images].every((image) => image.hasAttribute('alt'))],
  ['las portadas tienen un alt con contenido', [...document.querySelectorAll('.cover')].every((image) => image.alt.trim() !== '')],
  ['el adorno tiene alt vacío', document.querySelector('.divider').getAttribute('alt') === ''],
  ['cada nav tiene un nombre, y son distintos', navNames.every((name) => name !== '' && navNames.indexOf(name) === navNames.lastIndexOf(name))],
  ['«Suscribirse» es un button de verdad', document.querySelector('.subscribe').localName === 'button'],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
```
