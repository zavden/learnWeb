---
example_description: "El callback de un IntersectionObserver se ejecuta en cuanto empiezas a observar, con el estado actual de cada elemento (casi todos con isIntersecting: false): quien cuenta cada llamada como «lo han visto» registra 8 impresiones de 2 ofertas visibles; hay que mirar isIntersecting"
example_tags: "javascript|intersectionobserver|isintersecting|analitica|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Ofertas de la semana</h1>
  <p class="toolbar">
    <button id="to-end" type="button">⤓ Ir al final</button>
    <button id="to-start" type="button">⤒ Volver al inicio</button>
  </p>
  <div id="promos" class="panel" tabindex="0" role="region" aria-label="Ofertas">
    <ul class="promos">
      <li>☕ Café de olla · 2 × $70</li>
      <li>🥐 Concha de vainilla · $18</li>
      <li>🍫 Chocolate de Oaxaca · $45</li>
      <li>🥐 Cuernito de mantequilla · $22</li>
      <li>🍹 Atole de guayaba · $35</li>
      <li>🥨 Oreja hojaldrada · $20</li>
      <li>🌽 Pan de elote · $38</li>
      <li>🫔 Tamal de dulce · $25</li>
    </ul>
  </div>
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
  margin: 0 0 0.5rem;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
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
button:focus-visible,
.panel:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
/* 192 px de alto: caben la primera oferta y casi toda la segunda. */
.panel {
  height: 12rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.promos {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0 0.5rem;
  list-style: none;
}
.promos li {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 6rem;
  padding: 0 1rem;
  border-radius: 0.5rem;
  background: #fef3c7;
  font-size: 1.05rem;
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
const panel = document.querySelector('#promos');
const promos = [...panel.querySelectorAll('li')];
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
// '☕ Café de olla · 2 × $70' → 'Café de olla' (sin el emoji ni el precio)
const promoName = (promo) => promo.textContent.split(' · ')[0].replace(/^\S+ /, '');

let calls = 0;
let buggyImpressions = 0;
const seen = new Set(); // ofertas vistas de verdad (una vez cada una)

const observer = new IntersectionObserver((entries) => {
  calls += 1;
  logLine(`llamada ${calls} · ${entries.length} entradas`);

  // 🐛 «Si me llaman, es que la han visto»: suma todas las entradas. Pero
  //    la PRIMERA llamada llega nada más observar, con el estado actual de
  //    cada oferta, y después también avisan las que SALEN de la vista.
  buggyImpressions += entries.length;
  logLine(`   🐛 sumando entradas → impresiones: ${buggyImpressions}`);

  // ✅ Solo cuentan las entradas con isIntersecting: true, y una vez.
  const fresh = entries.filter((entry) => entry.isIntersecting && !seen.has(entry.target));
  for (const entry of fresh) seen.add(entry.target);
  const names = fresh.map((entry) => promoName(entry.target)).join(', ');
  const detail = fresh.length === 0 ? '' : calls === 1 ? ` (${names})` : ` (+ ${names})`;
  logLine(`   ✅ con isIntersecting → impresiones: ${seen.size}${detail}`);
}, { root: panel });

for (const promo of promos) observer.observe(promo);

document.querySelector('#to-end').addEventListener('click', () => {
  panel.scrollTop = panel.scrollHeight;
});
document.querySelector('#to-start').addEventListener('click', () => {
  panel.scrollTop = 0;
});
logLine('Listo: desplaza las ofertas o usa «Ir al final» y «Volver al inicio»');

// En una analítica real, la oferta se marca como vista y se deja de observar:
// observer.unobserve(entry.target). Así tampoco hace falta el Set.
```
