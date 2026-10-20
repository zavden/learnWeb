---
example_description: "Una guía larga con índice: un IntersectionObserver con root: document (la ventana del propio iframe) y un rootMargin negativo marca la sección actual con aria-current; los saltos del índice y los botones «anterior/siguiente» desplazan con suavidad solo sin prefers-reduced-motion y llevan el foco al título, para el teclado y los lectores de pantalla"
example_tags: "javascript|intersectionobserver|indice|aria-current|scroll|prefers-reduced-motion|foco|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<div class="layout">
  <nav class="toc" aria-labelledby="toc-title">
    <h2 id="toc-title">En esta guía</h2>
    <ol id="toc">
      <li><a href="#origen">El origen importa</a></li>
      <li><a href="#tueste">Tueste</a></li>
      <li><a href="#molienda">Molienda</a></li>
      <li><a href="#agua">Agua y temperatura</a></li>
      <li><a href="#metodos">Métodos</a></li>
      <li><a href="#conservar">Conservar el café</a></li>
    </ol>
    <p class="steps">
      <button id="previous" type="button">↑ Anterior</button>
      <button id="next" type="button">↓ Siguiente</button>
    </p>
  </nav>
  <main>
    <h1>Guía del café de especialidad</h1>
    <section id="origen" aria-labelledby="h-origen">
      <h2 id="h-origen" tabindex="-1">El origen importa</h2>
      <p>La altura, el suelo y la lluvia de cada finca se notan en la taza. Un café de Chiapas cultivado a 1,400 m suele ser más ácido y aromático que uno de tierras bajas.</p>
      <p>En la bolsa busca la región, la finca, la variedad (bourbon, typica, geisha) y el proceso: lavado, natural o honey.</p>
    </section>
    <section id="tueste" aria-labelledby="h-tueste">
      <h2 id="h-tueste" tabindex="-1">Tueste</h2>
      <p>Un tueste claro conserva la fruta y la acidez; uno oscuro aporta cuerpo, amargor y notas de chocolate. Ninguno es mejor: depende del grano y del método.</p>
      <p>Compra café tostado hace menos de un mes y deja reposar los granos unos días después del tueste para que suelten el gas.</p>
    </section>
    <section id="molienda" aria-labelledby="h-molienda">
      <h2 id="h-molienda" tabindex="-1">Molienda</h2>
      <p>Muele justo antes de preparar: el café molido pierde aroma en minutos. Un molino de muelas da partículas parejas; uno de aspas, polvo y trozos.</p>
      <p>Fino para espresso, medio para filtro y grueso para prensa francesa u olla.</p>
    </section>
    <section id="agua" aria-labelledby="h-agua">
      <h2 id="h-agua" tabindex="-1">Agua y temperatura</h2>
      <p>El café es casi todo agua: usa agua filtrada, sin olor a cloro. Entre 90 y 96 °C extrae bien sin quemar.</p>
      <p>Una proporción de partida: 60 g de café por litro de agua. Ajusta a tu gusto de 5 en 5 gramos.</p>
    </section>
    <section id="metodos" aria-labelledby="h-metodos">
      <h2 id="h-metodos" tabindex="-1">Métodos</h2>
      <p>El filtro de papel da una taza limpia; la prensa francesa, más cuerpo; la cafetera italiana, intensidad; el espresso, todo eso concentrado en 30 ml.</p>
      <p>El café de olla, con piloncillo y canela, se prepara sin filtro: déjalo reposar para que el poso baje.</p>
    </section>
    <section id="conservar" aria-labelledby="h-conservar">
      <h2 id="h-conservar" tabindex="-1">Conservar el café</h2>
      <p>En un bote opaco y hermético, lejos del calor. El refrigerador no ayuda: el café absorbe olores y humedad.</p>
      <p>Compra para dos o tres semanas. Lo que no te tomes a tiempo, mejor regálalo que guardarlo.</p>
    </section>
  </main>
</div>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
  line-height: 1.55;
}
/* El salto de un ancla es suave solo si nadie ha pedido menos movimiento. */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
.layout {
  max-width: 52rem;
  margin: 0 auto;
  padding: 0 1rem;
}
.toc {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.5rem 0;
  border-bottom: 1px solid #cbd2d9;
  background: #f5f7fa;
}
.toc h2 {
  margin: 0;
  font-size: 0.95rem;
}
.toc ol {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 0.9rem;
  margin: 0.25rem 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
}
.toc a {
  color: #1d4ed8;
}
/* La sección actual: el mismo atributo que leen los lectores de pantalla. */
.toc a[aria-current] {
  color: #1f2933;
  font-weight: 700;
  text-decoration-thickness: 3px;
}
.steps {
  display: flex;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
}
main {
  padding-block-end: 50vh; /* la última sección también puede subir arriba */
}
section {
  min-block-size: 50vh; /* llena la franja del observer (media ventana) */
  scroll-margin-top: 7.5rem; /* que el índice fijo no tape el título */
}
main h1 {
  font-size: 1.4rem;
}
main h2 {
  font-size: 1.15rem;
}
button {
  font: inherit;
  font-size: 0.9rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
a:focus-visible,
button:focus-visible,
h2:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
/* En pantallas anchas, el índice va a la izquierda y se queda fijo. */
@media (width >= 44rem) {
  .layout {
    display: grid;
    grid-template-columns: 13rem 1fr;
    gap: 2rem;
  }
  .toc {
    align-self: start;
    top: 1rem;
    border: 0;
  }
  .toc ol {
    flex-direction: column;
  }
  section {
    scroll-margin-top: 1rem;
  }
}
```

# JavaScript

```javascript
// ÍNDICE CON SECCIÓN ACTUAL.
//
// Decisiones de diseño:
// - IntersectionObserver con root: document: la raíz es la ventana de ESTE
//   documento, también dentro del iframe de la vista previa (con la raíz
//   implícita, un iframe de otro origen no recibe rootMargin ni rootBounds).
// - rootMargin '0px 0px -50% 0px': la raíz se queda en una franja con la mitad
//   de arriba de la ventana. Cada sección mide al menos media ventana y la
//   página termina con media ventana libre: tras un salto, en la franja solo
//   está la sección de destino, sea cual sea la altura de la ventana (con una
//   sección más corta que la franja, entraría también la siguiente).
//   La sección actual es la ÚLTIMA (en el orden del
//   documento) que toca la franja: pickCurrent(), una función pura que se
//   comprueba sin desplazar nada.
// - Solo se escribe en el DOM cuando la sección cambia (aria-current="true"
//   en el enlace del índice).
// - Los enlaces son anclas de verdad (funcionan sin JS). Tras un salto, el
//   foco va al título (tabindex="-1"), así un lector de pantalla lo lee y el
//   siguiente Tab sigue desde ahí. El desplazamiento suave lo pone el CSS solo
//   sin prefers-reduced-motion; los botones usan matchMedia para lo mismo.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const sections = [...document.querySelectorAll('main section')];
const links = new Map([...document.querySelectorAll('#toc a')].map((link) => [link.hash.slice(1), link]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const touching = new Set();
let currentId = null;

// La sección actual: la última, en el orden del documento, que toca la franja.
function pickCurrent(touchingIds, fallback) {
  const last = sections.findLast((section) => touchingIds.has(section.id));
  return last?.id ?? fallback;
}
function markCurrent(id) {
  if (id === currentId) return false; // nada cambió: ninguna escritura
  currentId = id;
  for (const [linkId, link] of links) {
    if (linkId === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  return true;
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) touching.add(entry.target.id);
    else touching.delete(entry.target.id);
  }
  if (markCurrent(pickCurrent(touching, currentId ?? sections[0].id))) {
    console.log(`📍 sección actual → ${links.get(currentId).textContent}`);
  }
}, { root: document, rootMargin: '0px 0px -50% 0px' });
for (const section of sections) observer.observe(section);

// ── Saltos: enlaces del índice y botones ─────────────────────────────────
function goTo(section) {
  section.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
  section.querySelector('h2').focus({ preventScroll: true });
  try {
    history.replaceState(null, '', `#${section.id}`); // la dirección dice dónde estás (sin entrada nueva)
  } catch {
    // En una tarjeta de la teoría (iframe aislado) el historial no se puede tocar.
  }
}
document.querySelector('#toc').addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault(); // el salto lo hacemos nosotros para llevar el foco
  goTo(document.getElementById(link.hash.slice(1)));
});
function step(direction) {
  const index = sections.findIndex((section) => section.id === currentId);
  const target = sections[Math.max(0, Math.min(sections.length - 1, index + direction))];
  goTo(target);
  console.log(`${direction > 0 ? '↓' : '↑'} ${links.get(target.id).textContent}`);
}
document.querySelector('#previous').addEventListener('click', () => step(-1));
document.querySelector('#next').addEventListener('click', () => step(1));

// ── Comprobaciones al cargar ─────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
audit('cada enlace del índice lleva a una sección', [...links.keys()].every((id) => document.getElementById(id)?.localName === 'section'), true);
audit('cada título puede recibir el foco', sections.every((section) => section.querySelector('h2').tabIndex === -1), true);
audit('franja con el final de «Tueste» y el principio de «Molienda»', pickCurrent(new Set(['tueste', 'molienda']), 'origen'), 'molienda');
audit('nada en la franja: se queda la anterior', pickCurrent(new Set(), 'agua'), 'agua');
audit('markCurrent escribe solo si cambia', `${markCurrent('origen')} ${markCurrent('origen')}`, 'true false');
audit('un solo aria-current en el índice', document.querySelectorAll('#toc [aria-current]').length, 1);
console.log('Listo: desplaza la guía, usa el índice o los botones «↑ Anterior» / «↓ Siguiente»');
```
