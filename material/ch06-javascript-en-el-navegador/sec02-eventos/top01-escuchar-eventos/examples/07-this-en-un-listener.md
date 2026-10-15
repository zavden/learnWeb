---
example_description: "this dentro de un listener: con function es el elemento que escucha (currentTarget), así que un método pasado tal cual pierde su instancia (likes → NaN); una flecha conserva el this de fuera. Soluciones: campo flecha, flecha que llama al método o handleEvent"
example_tags: "javascript|eventos|this|bind|flecha|clases|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Galería de viaje</h1>
  <ul class="photos">
    <li>Atardecer en Tulum <button id="like-tulum" type="button">♥ (🐛)</button></li>
    <li>Volcán de Fuego <button id="like-volcano" type="button">♥ (✅ campo flecha)</button></li>
    <li>Cenote Ik Kil <button id="like-cenote" type="button">♥ (✅ handleEvent)</button></li>
  </ul>
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
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.photos {
  display: grid;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
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
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 🐛 El método se pasa tal cual: el navegador lo llama con this = el botón
//    (event.currentTarget), no con la instancia. this.likes es undefined → NaN.
class BrokenLikes {
  likes = 0;
  constructor(button) {
    button.addEventListener('click', this.addLike);
  }
  addLike() {
    this.likes += 1;
    logLine(`🐛 this → ${this.constructor.name} · likes: ${this.likes}`);
  }
}

// ✅ Un campo cuyo valor es una flecha: la flecha no tiene this propio y usa el
//    de la instancia (la tercera solución de la lección «Clases»).
class ArrowLikes {
  likes = 0;
  constructor(button) {
    button.addEventListener('click', this.addLike);
  }
  addLike = () => {
    this.likes += 1;
    logLine(`✅ this → ${this.constructor.name} · likes: ${this.likes}`);
  };
}

// ✅ Un OBJETO con un método handleEvent también vale como listener: el
//    navegador llama a object.handleEvent(event), con this = el objeto.
class HandlerLikes {
  likes = 0;
  constructor(button) {
    button.addEventListener('click', this); // ← el objeto entero
  }
  handleEvent(event) {
    this.likes += 1;
    logLine(`✅ this → ${this.constructor.name} · likes: ${this.likes} · ${event.type}`);
  }
}

new BrokenLikes(document.querySelector('#like-tulum'));
new ArrowLikes(document.querySelector('#like-volcano'));
new HandlerLikes(document.querySelector('#like-cenote'));
logLine('Listo: pulsa cada ♥ dos veces');

// Resumen: listener con function → this es event.currentTarget;
// listener flecha → el this de donde se escribió. Para no depender de this,
// usa event.currentTarget, que siempre es el elemento que escucha.
```
