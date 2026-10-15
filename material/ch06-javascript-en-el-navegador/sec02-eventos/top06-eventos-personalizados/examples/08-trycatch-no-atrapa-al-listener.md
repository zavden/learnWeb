---
example_description: "Un error dentro de un listener no sale de dispatchEvent: el try/catch que lo rodea no atrapa nada, los demás listeners siguen ejecutándose y el error se informa como «Uncaught» al evento error de window, la red de seguridad global. En Chrome"
example_tags: "javascript|eventos|errores|dispatchevent|window-error|try-catch|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedido P-3310 pagado</h1>
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

// La red de seguridad: el evento error de window recibe los errores que
// nadie atrapó (en un servicio real, se enviarían a un registro de errores).
// Se ejecuta ANTES de que la consola escriba «Uncaught Error»; con
// event.preventDefault() aquí, ese mensaje no aparecería.
window.addEventListener('error', (event) => {
  logLine(`🛟 error global → ${event.error.message}`);
});

const checkout = new EventTarget();
// Listener 1: la analítica, que falla.
checkout.addEventListener('order:paid', () => {
  throw new Error('analítica caída');
});
// Listener 2: la factura. ¿Se emite aunque el anterior haya fallado?
checkout.addEventListener('order:paid', () => {
  logLine('🧾 factura emitida: el listener anterior falló, pero este se ejecuta');
});

try {
  checkout.dispatchEvent(new CustomEvent('order:paid'));
  logLine('🐛 try: dispatchEvent terminó sin lanzar nada');
} catch (error) {
  logLine(`catch → ${error.message} (esta línea nunca sale)`);
}

// dispatchEvent atrapa el error de cada listener, lo INFORMA (evento error
// de window y «Uncaught Error» en la consola) y sigue con el siguiente.
// Al contrario que el emit del EventEmitter del módulo «Clases y POO», un
// listener roto no deja sin factura al resto. Pero tu try/catch no se entera:
// si necesitas saber si algo falló, que el listener lo atrape él mismo.
```
