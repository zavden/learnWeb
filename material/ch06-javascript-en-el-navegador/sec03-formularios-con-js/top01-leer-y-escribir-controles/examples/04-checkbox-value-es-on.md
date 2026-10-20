---
example_description: "El value de una casilla no dice si está marcada: sin atributo value vale 'on' (truthy) esté como esté. Lo que cambia es checked; value es lo que se ENVÍA cuando está marcada"
example_tags: "javascript|formularios|checkbox|checked|value|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tu cuenta en Librería El Faro</h1>
  <form id="account" action="/cuenta/preferencias" method="post">
    <p><label><input type="checkbox" id="newsletter" name="newsletter"> Quiero recibir el boletín de novedades</label></p>
    <p><label><input type="checkbox" id="offers" name="offers" value="yes" checked> Avísame de las ofertas</label></p>
  </form>
  <p>Boletín: <output id="state">—</output></p>
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
form {
  padding: 0.25rem 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
output {
  font-weight: 700;
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
const newsletter = document.querySelector('#newsletter');
const offers = document.querySelector('#offers');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function report(checkbox) {
  // 🐛 value NO cambia al marcar o desmarcar. Sin atributo value, vale 'on'.
  logLine(`${checkbox.name}: value → '${checkbox.value}' · checked → ${checkbox.checked}`);
}

report(newsletter);
report(offers);
// 🐛 'on' es un string no vacío, así que es truthy: esta comprobación siempre «suscribe».
logLine(`🐛 if (newsletter.value) → ${newsletter.value ? 'suscrita' : 'sin suscribir'}`);
// ✅ Lo que dice si está marcada es checked (un booleano).
logLine(`✅ if (newsletter.checked) → ${newsletter.checked ? 'suscrita' : 'sin suscribir'}`);
document.querySelector('#state').textContent = newsletter.checked ? 'sí' : 'no';

document.querySelector('#account').addEventListener('change', (event) => {
  report(event.target);
  document.querySelector('#state').textContent = newsletter.checked ? 'sí' : 'no';
});
logLine('Listo: marca y desmarca las casillas');

// ¿Para qué sirve value, entonces? Es lo que se ENVÍA si la casilla está marcada:
// newsletter=on, offers=yes. Si no está marcada, no se envía nada (lección siguiente).
```
