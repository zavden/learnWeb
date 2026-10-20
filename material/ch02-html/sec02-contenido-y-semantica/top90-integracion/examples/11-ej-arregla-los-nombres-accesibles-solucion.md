---
example_description: "Solución: cada botón, campo, enlace, imagen y menú con su nombre, y un button de verdad para suscribirse"
example_tags: "solucion|accesibilidad|nombre-accesible|aria-label|alt|button"
example_stage: final-solution
example_importance: critical
console: true
---

# HTML

```html
<header>
  <p class="brand">Raíces · el pódcast de lo que comemos</p>
  <!-- ✅ 1. Un nombre para cada nav -->
  <nav aria-label="Principal">
    <ul>
      <li><a href="https://raices.example/">Episodios</a></li>
      <li><a href="https://raices.example/equipo/">Quiénes somos</a></li>
    </ul>
  </nav>
</header>

<!-- ✅ 2. aria-label: el nombre del botón de icono -->
<p class="notice">Nuevo episodio cada lunes. <button type="button" aria-label="Cerrar el aviso" onclick="this.parentElement.hidden = true">✕</button></p>

<main>
  <h1>Episodios</h1>

  <!-- ✅ 3. Un label visible asociado por for/id (el placeholder no es una etiqueta) y un nombre para 🔍 -->
  <p>
    <label for="search">Buscar episodios</label>
    <input id="search" type="search">
    <button type="button" aria-label="Buscar">🔍</button>
  </p>

  <!-- ✅ 4. Adorno: alt vacío, el lector lo ignora -->
  <img class="divider" src="img/divider.svg" alt="" width="600" height="24">

  <ul class="episodes">
    <li>
      <article>
        <!-- ✅ 5. La portada aporta su ilustración: el alt la describe (el título ya va en el h2) -->
        <img class="cover" src="img/cover-tomato.svg" alt="Portada: un tomate rojo sobre fondo verde" width="160" height="160">
        <h2>12. El viaje del tomate</h2>
        <p>De planta ornamental sospechosa a rey del gazpacho.</p>
        <!-- ✅ 6. El texto oculto completa el enlace; se ve igual, pero se entiende fuera de contexto -->
        <p><a href="https://raices.example/12-tomate/">Escuchar<span class="visually-hidden"> el episodio 12: El viaje del tomate</span></a> <button type="button" aria-label="Reproducir el episodio 12">▶</button></p>
      </article>
    </li>
    <li>
      <article>
        <img class="cover" src="img/cover-potato.svg" alt="Portada: una patata sobre fondo verde" width="160" height="160">
        <h2>11. La patata, de los Andes a la tortilla</h2>
        <p>Cómo un tubérculo andino llegó a todas las cocinas de Europa.</p>
        <p><a href="https://raices.example/11-patata/">Escuchar<span class="visually-hidden"> el episodio 11: La patata, de los Andes a la tortilla</span></a> <button type="button" aria-label="Reproducir el episodio 11">▶</button></p>
      </article>
    </li>
  </ul>

  <!-- ✅ 7. Primera regla de ARIA: un button recibe el foco y responde a Enter y Espacio -->
  <button type="button" class="subscribe" onclick="subscribe()">Suscribirse</button>
</main>

<footer>
  <!-- ✅ 8. Un nombre distinto para el segundo nav -->
  <nav aria-label="Redes sociales">
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
// Las mismas comprobaciones del ejercicio: ahora todas salen ✅
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
