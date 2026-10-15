---
example_description: "click es el evento de activación accesible: un <button> lo recibe con el ratón, con Enter y con Espacio (event.detail → 0 si vino del teclado), mientras que un <div> con un listener de click no recibe el foco y el teclado no puede usarlo"
example_tags: "javascript|eventos|click|teclado|accesibilidad|button|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Reproductor</h1>
  <div class="controls">
    <div id="div-play" class="fake-button">▶ Reproducir (🐛 div)</div>
    <button id="button-play" type="button">▶ Reproducir (✅ button)</button>
  </div>
  <p id="status" class="status" role="status">En pausa.</p>
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
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.fake-button,
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
const statusLine = document.querySelector('#status');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function play(event) {
  statusLine.textContent = 'Sonando: Bésame mucho';
  // detail: cuántos clics seguidos (1, 2…); 0 si el click lo generó el teclado.
  const how = event.detail === 0 ? 'teclado' : 'puntero';
  logLine(`▶ click en #${event.currentTarget.id} · detail: ${event.detail} (${how})`);
}

// 🐛 Un <div> no es interactivo: no recibe el foco con Tab y Enter o Espacio
//    no generan ningún click. Con el teclado, este «botón» no existe.
document.querySelector('#div-play').addEventListener('click', play);
// ✅ Un <button> recibe el foco y convierte Enter y Espacio en click.
document.querySelector('#button-play').addEventListener('click', play);

// Testigo: qué elemento recibe el foco al pulsar Tab.
document.addEventListener('focusin', (event) => logLine(`foco → #${event.target.id}`));
logLine('Listo: pulsa los dos con el ratón; luego haz clic en el título «Reproductor» y usa Tab, Enter y Espacio');

// Arreglarlo «a mano» (tabindex="0", role="button" y un keydown que
// distinga Enter de Espacio) es posible, pero largo y fácil de olvidar:
// usa <button>. Por la misma razón, escucha click (no mousedown ni
// pointerdown) para activar cosas: es el evento que llega con cualquier
// forma de activación, también desde los lectores de pantalla.
```
