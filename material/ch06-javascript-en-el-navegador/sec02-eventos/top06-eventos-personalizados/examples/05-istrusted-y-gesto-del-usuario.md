---
example_description: "Un clic simulado (click() o dispatchEvent) llega con isTrusted: false y no es un gesto del usuario: navigator.userActivation.isActive es false y las APIs que lo exigen, como la pantalla completa, lo rechazan; con un clic real, las dos cosas son true"
example_tags: "javascript|eventos|istrusted|useractivation|fullscreen|dispatchevent|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <figure id="photo" class="photo">
    <div class="art" role="img" aria-label="Ilustración: atardecer sobre el mar en Tulum">🌅</div>
    <figcaption>Atardecer en Tulum</figcaption>
  </figure>
  <button id="fullscreen" type="button">⛶ Ver a pantalla completa</button>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
.photo {
  margin: 0 0 0.75rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  background: #1f2933;
  color: #ffffff;
  text-align: center;
}
.art {
  font-size: 4rem;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
const fullscreenButton = document.querySelector('#fullscreen');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

fullscreenButton.addEventListener('click', async (event) => {
  // isTrusted: ¿lo generó el navegador por una acción real del usuario?
  // userActivation.isActive: ¿hay un gesto del usuario «reciente»?
  logLine(`click · isTrusted: ${event.isTrusted} · gesto del usuario: ${navigator.userActivation.isActive}`);
  try {
    await document.querySelector('#photo').requestFullscreen();
    logLine('✅ pantalla completa (Esc para salir)');
  } catch (error) {
    logLine(`🐛 requestFullscreen rechazado → ${error.name}`);
  }
});

// 🐛 Simulado al cargar: el código «pulsa» el botón. Llega un click
//    idéntico… salvo por isTrusted, y sin gesto del usuario.
logLine('— simulado: fullscreenButton.click() —');
fullscreenButton.click();
setTimeout(() => logLine('— Listo: ahora pulsa tú el botón —'), 50);

// Pantalla completa, ventanas emergentes, reproducir audio con sonido,
// copiar al portapapeles en algunos navegadores… exigen un gesto del usuario
// para que una página no pueda hacerlo por su cuenta. Un evento simulado no
// cuenta. Y no puedes falsificar isTrusted: es de solo lectura.
```
