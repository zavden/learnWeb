---
example_description: "Un evento propio cancelable para pedir permiso: las pestañas despachan tab:change con cancelable: true; el formulario con cambios sin guardar llama a preventDefault() y dispatchEvent devuelve false, así que la pestaña no cambia"
example_tags: "javascript|eventos|customevent|cancelable|preventdefault|dispatchevent|pestanas"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mi cuenta</h1>
  <div id="tabs" class="tabs" role="tablist" aria-label="Secciones de la cuenta">
    <button type="button" role="tab" id="tab-profile" aria-selected="true" data-panel="Perfil">Perfil</button>
    <button type="button" role="tab" id="tab-addresses" aria-selected="false" data-panel="Direcciones">Direcciones</button>
    <button type="button" role="tab" id="tab-payments" aria-selected="false" data-panel="Pagos">Pagos</button>
  </div>
  <section id="panel" class="panel" role="tabpanel" aria-labelledby="tab-profile">
    <p id="panel-text">Perfil: Lucía Méndez · lucia@example.com</p>
    <label><input type="checkbox" id="dirty"> Hay cambios sin guardar en este formulario</label>
  </section>
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
.tabs {
  display: flex;
  gap: 0.25rem;
}
.tabs button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-bottom: 0;
  border-radius: 0.5rem 0.5rem 0 0;
  background: #e4e7eb;
  color: #1f2933;
  cursor: pointer;
}
.tabs button[aria-selected="true"] {
  background: #ffffff;
  font-weight: 700;
}
.tabs button:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.panel {
  padding: 0.75rem;
  border: 1px solid #7b8794;
  background: #ffffff;
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
const tabs = document.querySelector('#tabs');
const panel = document.querySelector('#panel');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// ── Las pestañas: antes de cambiar, PREGUNTAN con un evento cancelable.
tabs.addEventListener('click', (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab || tab.getAttribute('aria-selected') === 'true') return;
  const allowed = tabs.dispatchEvent(new CustomEvent('tab:change', {
    bubbles: true,
    cancelable: true,               // ← alguien puede decir que no
    detail: { to: tab.dataset.panel },
  }));
  // dispatchEvent devuelve false si algún listener llamó a preventDefault().
  if (!allowed) {
    logLine(`⛔ tab:change → ${tab.dataset.panel}: cancelado (dispatchEvent devolvió false)`);
    return;
  }
  for (const other of tabs.querySelectorAll('[role="tab"]')) other.setAttribute('aria-selected', String(other === tab));
  panel.setAttribute('aria-labelledby', tab.id);
  document.querySelector('#panel-text').textContent = `${tab.dataset.panel}: (contenido de ejemplo)`;
  logLine(`✅ tab:change → ${tab.dataset.panel}: pestaña cambiada`);
});

// ── El formulario: si tiene cambios sin guardar, dice que no.
document.addEventListener('tab:change', (event) => {
  if (document.querySelector('#dirty').checked) {
    event.preventDefault();
    logLine('   el formulario tiene cambios sin guardar → preventDefault()');
  }
});
logLine('Listo: pulsa «Direcciones»; luego marca la casilla y pulsa «Pagos»');

// Es el mismo mecanismo que un enlace o un submit: el evento se anuncia
// ANTES de actuar, y la acción solo ocurre si nadie la cancela. Sin
// cancelable: true, preventDefault() no haría nada.
// Un tablist completo también se mueve con las flechas; aquí basta con Tab.
```
