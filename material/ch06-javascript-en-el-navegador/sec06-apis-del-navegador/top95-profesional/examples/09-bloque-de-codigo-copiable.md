---
example_description: "<copy-code>, un bloque de código con botón «Copiar»: el código vive en el light DOM (indexable, seleccionable, legible sin JS) y se proyecta con un slot; el botón (con ::part) usa navigator.clipboard.writeText y, si el navegador lo rechaza (sin foco, sin permiso, una tarjeta aislada), selecciona el código y explica cómo copiarlo a mano; avisa con un evento composed y en una región aria-live"
example_tags: "javascript|web-components|clipboard|writetext|slot|part|aria-live|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedidos por la API de la tostadora</h1>
  <p>Consulta el estado de un pedido:</p>
  <copy-code language="bash">
    <pre><code>curl https://api.cafe-la-ceiba.example/pedidos/P-2077 \
  -H "Authorization: Bearer TU_TOKEN"</code></pre>
  </copy-code>
  <p>La respuesta es un JSON como este:</p>
  <copy-code language="json">
    <pre><code>{
  "id": "P-2077",
  "estado": "en camino",
  "productos": [{ "sku": "CAF-500", "cantidad": 2 }]
}</code></pre>
  </copy-code>
  <p id="feedback" class="feedback" role="status"></p>
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
  max-width: 38rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}
/* El código es de la página: la página decide su tipografía. */
copy-code pre {
  margin: 0;
  overflow-x: auto;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
}
copy-code::part(button) {
  border-color: #fdf6e3;
}
.feedback {
  min-height: 1.4em;
  color: #52606d;
}
```

# JavaScript

```javascript
// BLOQUE DE CÓDIGO COPIABLE.
//
// Decisiones de diseño:
// - El <pre><code> se escribe en el HTML de la página (light DOM): se ve sin
//   JavaScript, los buscadores lo leen y se puede seleccionar. El componente
//   solo añade el marco, la etiqueta del lenguaje y el botón, en su Shadow
//   DOM, y proyecta el código con un <slot>.
// - Copiar: navigator.clipboard.writeText dentro del clic. Si se rechaza
//   (página sin foco, permiso denegado, un iframe sin allow="clipboard-write"),
//   el plan B selecciona el código (getSelection().selectAllChildren) y dice
//   «pulsa ⌘C»: nadie se queda sin poder copiar.
// - El resultado se anuncia en una región aria-live del propio componente, y
//   sale un evento copy-code:result (bubbles + composed) por si la página
//   quiere contarlo o mostrarlo en otro sitio.
// - El texto del botón vuelve a «Copiar» a los 2 s; cada clic cancela la
//   cuenta del anterior.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const COPY_CSS = `
  :host { display: block; margin: 0.5rem 0 1rem; border-radius: 0.5rem; overflow: hidden; background: #1f2933; color: #f5f7fa; }
  .bar { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.3rem 0.6rem; background: #323f4b; font-size: 0.8rem; }
  .language { text-transform: uppercase; letter-spacing: 0.08em; color: #cbd2d9; }
  button { font: inherit; padding: 0.15rem 0.6rem; border: 1px solid #9aa5b1; border-radius: 0.375rem; background: transparent; color: inherit; cursor: pointer; }
  button:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
  .code { padding: 0.75rem 1rem; }
  .live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
`;

class CopyCode extends HTMLElement {
  #button;
  #live;
  #resetTimer = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = COPY_CSS;
    const bar = document.createElement('div');
    bar.className = 'bar';
    const language = document.createElement('span');
    language.className = 'language';
    this.#button = document.createElement('button');
    this.#button.type = 'button';
    this.#button.setAttribute('part', 'button');
    this.#button.textContent = 'Copiar';
    this.#live = document.createElement('span');
    this.#live.className = 'live';
    this.#live.setAttribute('aria-live', 'polite');
    bar.append(language, this.#button);
    const code = document.createElement('div');
    code.className = 'code';
    code.append(document.createElement('slot'));
    root.append(style, bar, code, this.#live);
    this.#button.addEventListener('click', () => this.copy());
  }

  connectedCallback() {
    const language = this.getAttribute('language') ?? '';
    this.shadowRoot.querySelector('.language').textContent = language;
    this.#button.setAttribute('aria-label', `Copiar el código ${language}`.trim());
  }

  get code() {
    return this.querySelector('code')?.textContent ?? '';
  }

  // write se puede sustituir en las pruebas: así nunca se toca el portapapeles
  // de verdad sin que la persona pulse el botón.
  async copy(write = (text) => navigator.clipboard.writeText(text)) {
    let result;
    try {
      await write(this.code);
      result = { copied: true, message: 'Copiado' };
    } catch (error) {
      // Plan B: el código queda seleccionado para copiarlo a mano.
      getSelection().selectAllChildren(this.querySelector('code'));
      result = { copied: false, reason: error.name, message: 'Seleccionado: pulsa ⌘C o Ctrl+C' };
    }
    this.#button.textContent = result.copied ? '✓ Copiado' : 'Seleccionado';
    this.#live.textContent = result.message;
    clearTimeout(this.#resetTimer);
    this.#resetTimer = setTimeout(() => { this.#button.textContent = 'Copiar'; }, 2000);
    this.dispatchEvent(new CustomEvent('copy-code:result', { bubbles: true, composed: true, detail: result }));
    return result;
  }
}
customElements.define('copy-code', CopyCode);

// ── Comprobaciones al cargar ─────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const feedback = document.querySelector('#feedback');
const [bash, json] = document.querySelectorAll('copy-code');
audit('el código sigue en el light DOM y se proyecta en el slot', bash.shadowRoot.querySelector('slot').assignedElements()[0]?.localName, 'pre');
audit('el botón tiene nombre accesible y ::part', `${json.shadowRoot.querySelector('button').getAttribute('aria-label')} · ${json.shadowRoot.querySelector('[part="button"]') !== null}`, 'Copiar el código json · true');
audit('code: el texto exacto del bloque', bash.code.split('\n').length, 2);
// Las pruebas no tocan el portapapeles: sustituyen writeText por una función
// que se rechaza como lo haría el navegador sin foco, o que acepta.
const refuse = () => Promise.reject(new DOMException('Document is not focused.', 'NotAllowedError'));
const refused = await json.copy(refuse);
audit('si el navegador lo rechaza, plan B: el código queda seleccionado', `${refused.copied} · ${refused.reason} · ${getSelection().toString() === json.code}`, 'false · NotAllowedError · true');
audit('el botón y la región aria-live lo dicen', `${json.shadowRoot.querySelector('button').textContent} · ${json.shadowRoot.querySelector('.live').textContent}`, 'Seleccionado · Seleccionado: pulsa ⌘C o Ctrl+C');
getSelection().removeAllRanges();
const accepted = await bash.copy(async () => {});
audit('si lo acepta: «✓ Copiado»', `${accepted.copied} · ${bash.shadowRoot.querySelector('button').textContent}`, 'true · ✓ Copiado');

// ── La página escucha el resultado (después de las pruebas, para no contarlas) ──
document.addEventListener('copy-code:result', (event) => {
  const language = event.target.getAttribute('language');
  feedback.textContent = event.detail.copied
    ? `Código ${language} copiado al portapapeles.`
    : `No se pudo copiar automáticamente (${event.detail.reason}): el código ${language} está seleccionado.`;
  console.log(`📋 ${feedback.textContent}`);
});

console.log('Listo: pulsa «Copiar» en cualquiera de los dos bloques y pega en tu terminal o tu editor');
```
