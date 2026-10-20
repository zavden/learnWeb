---
example_description: "connectedCallback se ejecuta cada vez que el elemento entra en la página, también al moverlo con append: una insignia de carrito que añade un listener en cada conexión acaba contando por tres; la versión correcta lo quita en disconnectedCallback con un AbortController"
example_tags: "javascript|web-components|connectedcallback|disconnectedcallback|abortcontroller|fugas|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <header class="header">
    <nav id="desktop-nav" aria-label="Barra principal">Barra: <buggy-badge></buggy-badge> <cart-badge></cart-badge></nav>
    <nav id="mobile-menu" aria-label="Menú móvil">Menú móvil: </nav>
  </header>
  <p class="actions">
    <button id="add" type="button">Añadir al carrito</button>
    <button id="move" type="button">Mover las insignias</button>
  </p>
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
.header {
  display: grid;
  gap: 0.4rem;
}
.header nav {
  min-height: 1.6rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.375rem;
  background: #ffffff;
}
buggy-badge,
cart-badge {
  padding: 0 0.5rem;
  border-radius: 1rem;
  background: #e4e7eb;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

class BuggyBadge extends HTMLElement {
  connections = 0;
  liveListeners = 0;
  count = 0;
  connectedCallback() {
    this.connections += 1;
    // 🐛 Un listener NUEVO cada vez que el elemento entra en la página…
    document.addEventListener('cart:add', (event) => {
      this.count += event.detail.quantity;
      this.textContent = `🐛 ${this.count}`;
    });
    this.liveListeners += 1;
    this.textContent = `🐛 ${this.count}`;
  }
  // …y ningún disconnectedCallback que lo quite al salir.
}

class CartBadge extends HTMLElement {
  connections = 0;
  liveListeners = 0;
  count = 0;
  #controller = null;
  connectedCallback() {
    this.connections += 1;
    this.#controller = new AbortController();
    document.addEventListener('cart:add', (event) => {
      this.count += event.detail.quantity;
      this.textContent = `✅ ${this.count}`;
    }, { signal: this.#controller.signal });
    this.liveListeners += 1;
    this.textContent = `✅ ${this.count}`;
  }
  disconnectedCallback() {
    this.#controller.abort(); // ✅ quita el listener (y todo lo que use esta señal)
    this.liveListeners -= 1;
  }
}

customElements.define('buggy-badge', BuggyBadge);
customElements.define('cart-badge', CartBadge);
const buggy = document.querySelector('buggy-badge');
const fixed = document.querySelector('cart-badge');
const desktopNav = document.querySelector('#desktop-nav');
const mobileMenu = document.querySelector('#mobile-menu');

function report() {
  logLine(`🐛 conexiones: ${buggy.connections} · listeners vivos: ${buggy.liveListeners}`);
  logLine(`✅ conexiones: ${fixed.connections} · listeners vivos: ${fixed.liveListeners}`);
}
// append MUEVE un nodo: sale de un sitio (disconnected) y entra en otro (connected).
function moveBadges() {
  const target = buggy.parentElement === desktopNav ? mobileMenu : desktopNav;
  target.append(buggy, ' ', fixed);
}
function addToCart() {
  document.dispatchEvent(new CustomEvent('cart:add', { detail: { sku: 'CAF-500', quantity: 1 } }));
  logLine(`🛒 +1 producto → insignia 🐛: ${buggy.count} · insignia ✅: ${fixed.count}`);
}

logLine('— la cabecera se monta —');
report();
logLine('— pantalla estrecha: las insignias pasan al menú móvil —');
moveBadges();
report();
logLine('— pantalla ancha otra vez: vuelven a la barra —');
moveBadges();
report();
addToCart();
logLine('Listo: pulsa «Añadir al carrito» y «Mover las insignias»');

document.querySelector('#add').addEventListener('click', addToCart);
document.querySelector('#move').addEventListener('click', () => {
  moveBadges();
  report();
});

// En Chrome, parent.moveBefore(nodo, referencia) mueve sin desconectar si el
// elemento define connectedMoveCallback(). Aun así, limpia en disconnected:
// también llega cuando el elemento se elimina de verdad.
```
