---
example_description: "Permisos de la colección de un museo en una máscara de 6 bits: las casillas encienden y apagan bits, el número se muestra en binario y como código hexadecimal para compartir, los perfiles son máscaras que se comprueban con (flags & PERFIL) === PERFIL y un código pegado se valida antes de usarlo"
example_tags: "javascript|bits|mascaras|flags|permisos|hexadecimal|formularios|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Permisos en la colección del museo</h1>
  <fieldset id="permissions">
    <legend>Puede…</legend>
  </fieldset>
  <p class="code-row">
    <label for="code">Código</label>
    <input id="code" type="text" inputmode="text" maxlength="2" autocomplete="off" spellcheck="false" aria-describedby="code-help">
    <button id="apply" type="button">Aplicar código</button>
  </p>
  <p id="code-help" class="help">Dos cifras hexadecimales (00-3f). Pega aquí el código de otra persona para copiar sus permisos.</p>
  <p id="status" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
fieldset { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 0.25rem 1rem; border: 1px solid #94a3b8; border-radius: 0.5rem; }
.code-row { display: flex; align-items: center; gap: 0.5rem; }
input[type="text"] { inline-size: 4rem; font: inherit; font-family: Menlo, Consolas, monospace; padding: 0.25rem 0.4rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; }
button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid #64748b; border-radius: 0.5rem; background: #ffffff; color: #1e293b; cursor: pointer; }
:is(input, button):focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.help { margin-top: 0; font-size: 0.85rem; color: #475569; }
#status { font-family: Menlo, Consolas, monospace; font-size: 0.85rem; }
.log { padding-inline-start: 1.25rem; font-size: 0.8rem; }
```

# JavaScript

```javascript
// Un bit por permiso: el número entero ES el conjunto de permisos.
const PERMISSIONS = [
  ['VIEW', 'ver las fichas'],
  ['COMMENT', 'comentar'],
  ['UPLOAD', 'subir fotografías'],
  ['EDIT', 'editar fichas'],
  ['PUBLISH', 'publicar en la web'],
  ['REMOVE', 'retirar piezas'],
];
const BIT = Object.fromEntries(PERMISSIONS.map(([key], index) => [key, 1 << index]));
const ALL = (1 << PERMISSIONS.length) - 1; // 0b111111 = 63
const PROFILES = [
  ['administración', ALL],
  ['conservación', BIT.VIEW | BIT.COMMENT | BIT.UPLOAD | BIT.EDIT],
  ['voluntariado', BIT.VIEW | BIT.COMMENT | BIT.UPLOAD],
  ['visitante', BIT.VIEW],
];
const fieldset = document.querySelector('#permissions');
const codeInput = document.querySelector('#code');
const logList = document.querySelector('#log');
let flags = BIT.VIEW | BIT.COMMENT; // empieza con «ver» y «comentar»
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

for (const [key, label] of PERMISSIONS) {
  const box = Object.assign(document.createElement('input'), { type: 'checkbox', value: key });
  const wrapper = document.createElement('label');
  wrapper.append(box, ` ${label}`);
  fieldset.append(wrapper);
}

// El perfil más amplio que cabe en los permisos: ¡con paréntesis! (lección «Bits y bytes»)
const profileOf = (value) => PROFILES.find(([, mask]) => (value & mask) === mask)?.[0] ?? 'sin perfil';
const toCode = (value) => value.toString(16).padStart(2, '0');

function render() {
  for (const box of fieldset.querySelectorAll('input')) box.checked = (flags & BIT[box.value]) !== 0;
  codeInput.value = toCode(flags);
  const summary = `${flags.toString(2).padStart(PERMISSIONS.length, '0')} = ${flags} = código ${toCode(flags)} · perfil: ${profileOf(flags)}`;
  document.querySelector('#status').textContent = summary;
  return summary;
}

fieldset.addEventListener('change', (event) => {
  flags ^= BIT[event.target.value]; // alternar el bit de esa casilla
  logLine(`${event.target.checked ? '+' : '−'} ${event.target.value} → ${render()}`);
});
document.querySelector('#apply').addEventListener('click', () => {
  const text = codeInput.value.trim();
  const value = Number.parseInt(text, 16);
  // Validar lo que viene de fuera: dos cifras hex y ningún bit fuera de la máscara.
  if (!/^[0-9a-f]{1,2}$/i.test(text) || (value & ~ALL) !== 0) {
    logLine(`⚠️ «${text}» no es un código válido (00-3f)`);
    render();
    return;
  }
  flags = value;
  logLine(`código ${text} → ${render()}`);
});

logLine(render());
logLine('Listo: marca «subir fotografías» y «editar fichas»; luego escribe 3f y pulsa «Aplicar código»');
```
