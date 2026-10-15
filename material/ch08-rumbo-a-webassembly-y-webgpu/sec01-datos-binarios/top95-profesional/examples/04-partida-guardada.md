---
example_description: "El formato de partida guardada de un juego: firma, versión, fecha, campos de 8, 16 y 32 bits, posición en float32, logros como máscara de bits, nombre UTF-8 y un CRC-32 al final; se guarda en base64 en localStorage, rechaza los datos dañados sin cargar nada a medias y migra las partidas de la versión anterior"
example_tags: "javascript|formato-binario|dataview|crc32|base64|localstorage|versiones|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="save-app">
  <h1>La ruta del cacao</h1>
  <section class="state" aria-labelledby="state-title">
    <h2 id="state-title">Tu partida</h2>
    <p><label>Nombre <input id="name" type="text" maxlength="20" value="Xóchitl" autocomplete="off"></label></p>
    <dl id="stats"></dl>
    <ul id="achievements" class="achievements" aria-label="Logros"></ul>
    <div class="actions">
      <button type="button" data-action="walk">Avanzar</button>
      <button type="button" data-action="collect">Recoger 25 monedas</button>
      <button type="button" data-action="level">Subir de nivel</button>
    </div>
  </section>
  <section class="storage" aria-labelledby="storage-title">
    <h2 id="storage-title">Guardar y cargar</h2>
    <div class="actions">
      <button id="save" type="button">Guardar</button>
      <button id="load" type="button">Cargar</button>
      <button id="damage" type="button">Simular un byte dañado</button>
      <button id="legacy" type="button">Cargar una partida de la versión 1</button>
      <button id="forget" type="button">Borrar la partida guardada</button>
    </div>
    <p><label for="code">Código guardado (base64)</label></p>
    <textarea id="code" rows="2" readonly></textarea>
    <p id="status" class="status" role="status"></p>
    <p class="note">La partida se guarda en este navegador con la clave <code>lw-bin-partida</code>. En una tarjeta de la teoría el almacenamiento es una simulación en memoria: ábrelo con ▶ para que sobreviva a una recarga.</p>
  </section>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --gold-bg: #fef3c7; --gold-ink: #78350f; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.save-app { max-width: 40rem; margin: 0 auto; padding: 1rem; display: grid; gap: 1rem; }
h1 { margin: 0; font-size: 1.25rem; }
h2 { margin: 0 0 0.5rem; font-size: 1rem; }
section { padding: 0.75rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.15rem 1rem; margin: 0 0 0.5rem; font-variant-numeric: tabular-nums; }
dt { color: var(--muted); }
dd { margin: 0; }
.achievements { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0 0 0.75rem; padding: 0; list-style: none; font-size: 0.85rem; }
.achievements li { padding: 0.1rem 0.5rem; border: 1px dashed var(--line); border-radius: 1rem; color: var(--muted); }
.achievements li[data-unlocked] { border-style: solid; border-color: var(--gold-ink); background: var(--gold-bg); color: var(--gold-ink); }
.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
input, textarea, button { font: inherit; color: var(--ink); }
input, textarea { padding: 0.25rem 0.4rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); }
textarea { inline-size: 100%; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
button { padding: 0.3rem 0.65rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); cursor: pointer; }
:is(input, textarea, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.status { font-weight: 600; }
.note { font-size: 0.8rem; color: var(--muted); }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Formato de partida guardada «LWSV», versión 2 (todo en little-endian):
//   0  'LWSV'  firma            4  u8 versión         5  u8 reservado (0)
//   6  u32 fecha (s)           10  u8 nivel          11  u32 monedas
//  15  f32 x                   19  f32 y              23  u16 logros (máscara de bits)
//  25  u8 longitud + nombre en UTF-8                  …  u32 CRC-32 de todo lo anterior
// La versión 1 no tenía logros (el nombre empezaba en 23).
//
// Decisiones de diseño:
// - Cargar es todo o nada: se comprueban firma, versión, longitud y CRC ANTES de
//   tocar el estado del juego. Un código dañado no deja una partida a medias.
// - Versionado: el lector conoce las versiones 1 y 2; la 1 se migra recalculando
//   los logros. El escritor solo escribe la última.
// - El CRC-32 detecta daños accidentales (un byte cambiado, un código copiado a
//   medias); no impide hacer trampas: quien sepa el formato puede recalcularlo.
// - localStorage solo guarda texto: el binario viaja en base64 (toBase64 en Chrome;
//   si no existe, btoa con una cadena binaria). Todo con try/catch: el almacenamiento
//   puede estar lleno o bloqueado.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, los
// formularios, el almacenamiento (capítulo 6) y este módulo.

const STORAGE_KEY = 'lw-bin-partida';
const MAGIC = [0x4c, 0x57, 0x53, 0x56]; // 'LWSV'
const VERSION = 2;
const LEGACY_V1 = 'TFdTVgEAIORGaQSCAAAAAABIQQAAUMAFSXR6ZWxwdyLV'; // una partida de diciembre de 2025
const ACHIEVEMENTS = [
  ['Primeras monedas', (s) => s.coins >= 25],
  ['Exploradora', (s) => s.x >= 5],
  ['Veterana', (s) => s.level >= 3],
  ['Cacao de oro', (s) => s.coins >= 100],
];
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const logList = document.querySelector('#log');
let state = { name: 'Xóchitl', level: 1, coins: 0, x: 0, y: 0, achievements: 0 };

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const setStatus = (text) => { document.querySelector('#status').textContent = text; };

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let bit = 0; bit < 8; bit += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
const toBase64 = (bytes) => (bytes.toBase64 ? bytes.toBase64() : btoa(String.fromCharCode(...bytes)));
const fromBase64 = (text) => (Uint8Array.fromBase64 ? Uint8Array.fromBase64(text) : Uint8Array.from(atob(text), (char) => char.charCodeAt(0)));
const unlocked = (s) => ACHIEVEMENTS.reduce((mask, [, test], bit) => (test(s) ? mask | (1 << bit) : mask), 0);

function encodeSave(s, savedAt) {
  const nameBytes = encoder.encode(s.name);
  if (nameBytes.length > 255) throw new RangeError('el nombre ocupa más de 255 bytes');
  const bytes = new Uint8Array(26 + nameBytes.length + 4); // primero, el tamaño exacto
  const view = new DataView(bytes.buffer);
  bytes.set(MAGIC);
  view.setUint8(4, VERSION);
  view.setUint32(6, Math.floor(savedAt / 1000), true);
  view.setUint8(10, s.level);
  view.setUint32(11, s.coins, true);
  view.setFloat32(15, s.x, true);
  view.setFloat32(19, s.y, true);
  view.setUint16(23, s.achievements, true);
  view.setUint8(25, nameBytes.length);
  bytes.set(nameBytes, 26);
  view.setUint32(26 + nameBytes.length, crc32(bytes.subarray(0, 26 + nameBytes.length)), true);
  return bytes;
}

// Devuelve { save, migrated } o lanza un Error con un mensaje para la persona.
function decodeSave(bytes) {
  if (bytes.length < 28 || !MAGIC.every((byte, index) => bytes[index] === byte)) throw new Error('no es una partida de este juego');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const stored = view.getUint32(bytes.length - 4, true);
  if (stored !== crc32(bytes.subarray(0, bytes.length - 4))) throw new Error('la partida está dañada (el CRC no coincide)');
  const version = view.getUint8(4);
  if (version !== 1 && version !== 2) throw new Error(`la versión ${version} es de un juego más nuevo`);
  const nameAt = version === 1 ? 23 : 25;
  const nameLength = view.getUint8(nameAt);
  if (nameAt + 1 + nameLength + 4 !== bytes.length) throw new Error('la longitud del nombre no cuadra con el tamaño');
  const save = {
    name: decoder.decode(bytes.subarray(nameAt + 1, nameAt + 1 + nameLength)),
    level: view.getUint8(10),
    coins: view.getUint32(11, true),
    x: view.getFloat32(15, true),
    y: view.getFloat32(19, true),
    achievements: version === 2 ? view.getUint16(23, true) : 0,
    savedAt: new Date(view.getUint32(6, true) * 1000),
  };
  if (version === 1) save.achievements = unlocked(save); // migración: la v1 no guardaba logros
  return { save, migrated: version === 1 };
}

function render() {
  document.querySelector('#name').value = state.name;
  const rows = [['nivel', state.level], ['monedas', state.coins], ['posición', `(${state.x.toFixed(2)}, ${state.y.toFixed(2)})`]];
  document.querySelector('#stats').replaceChildren(...rows.flatMap(([term, value]) => [
    Object.assign(document.createElement('dt'), { textContent: term }),
    Object.assign(document.createElement('dd'), { textContent: value }),
  ]));
  document.querySelector('#achievements').replaceChildren(...ACHIEVEMENTS.map(([label], bit) => {
    const item = Object.assign(document.createElement('li'), { textContent: label });
    const on = (state.achievements & (1 << bit)) !== 0;
    item.toggleAttribute('data-unlocked', on);
    item.setAttribute('aria-label', `${label}: ${on ? 'conseguido' : 'pendiente'}`);
    return item;
  }));
}

function act(action) {
  if (action === 'walk') { state.x += 1.25; state.y += 0.5; }
  if (action === 'collect') state.coins += 25;
  if (action === 'level') state.level = Math.min(255, state.level + 1);
  const before = state.achievements;
  state.achievements |= unlocked(state);
  const fresh = ACHIEVEMENTS.filter((_, bit) => (state.achievements & ~before) & (1 << bit)).map(([label]) => label);
  render();
  logLine(`🎮 nivel ${state.level} · ${state.coins} monedas · (${state.x.toFixed(2)}, ${state.y.toFixed(2)})${fresh.length ? ` · 🏆 ${fresh.join(', ')}` : ''}`);
}

function readStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function writeStorage(value) {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
    return true;
  } catch (error) {
    setStatus(`No se pudo guardar en este navegador: ${error.message}`);
    return false;
  }
}

function load(code, origin) {
  let bytes;
  try {
    bytes = fromBase64(code);
  } catch {
    setStatus('❌ El código no es base64 válido: no se carga nada.');
    logLine('❌ código no válido (no es base64)');
    return;
  }
  try {
    const { save, migrated } = decodeSave(bytes);
    state = { name: save.name, level: save.level, coins: save.coins, x: save.x, y: save.y, achievements: save.achievements };
    render();
    setStatus(`✅ Partida de ${save.name} cargada (guardada el ${save.savedAt.toLocaleDateString('es-MX', { timeZone: 'UTC', dateStyle: 'long' })}).`);
    logLine(`📂 ${origin}: ${bytes.length} bytes · ${save.name} · nivel ${save.level} · ${save.coins} monedas${migrated ? ' · ⬆️ migrada de la versión 1' : ''}`);
  } catch (error) {
    setStatus(`❌ ${error.message[0].toUpperCase()}${error.message.slice(1)}: no se carga nada.`);
    logLine(`❌ ${origin}: ${error.message}`);
  }
}

document.querySelector('.state .actions').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button) act(button.dataset.action);
});
document.querySelector('#name').addEventListener('change', (event) => {
  state.name = event.target.value.trim() || 'Sin nombre';
});
document.querySelector('#save').addEventListener('click', () => {
  const bytes = encodeSave(state, Date.now());
  const code = toBase64(bytes);
  document.querySelector('#code').value = code;
  if (writeStorage(code)) {
    setStatus(`✅ Guardado: ${bytes.length} bytes (${code.length} caracteres en base64).`);
    logLine(`💾 guardada: ${bytes.length} bytes → ${code.length} caracteres en base64`);
  }
});
document.querySelector('#load').addEventListener('click', () => {
  const code = readStorage();
  if (code === null) {
    setStatus('No hay ninguna partida guardada en este navegador.');
    logLine('📂 no hay partida guardada');
    return;
  }
  load(code, 'guardada');
});
document.querySelector('#damage').addEventListener('click', () => {
  const code = readStorage();
  if (code === null) {
    setStatus('Guarda primero una partida para poder dañarla.');
    return;
  }
  const bytes = fromBase64(code);
  bytes[11] ^= 0x01; // un bit de las monedas, como un disco que falla
  writeStorage(toBase64(bytes));
  document.querySelector('#code').value = toBase64(bytes);
  setStatus('Se ha cambiado un bit de la partida guardada. Pulsa «Cargar».');
  logLine('🔧 un bit cambiado en el byte 11 (las monedas)');
});
document.querySelector('#legacy').addEventListener('click', () => load(LEGACY_V1, 'versión 1'));
document.querySelector('#forget').addEventListener('click', () => {
  if (writeStorage(null)) {
    document.querySelector('#code').value = '';
    setStatus('Partida borrada de este navegador.');
    logLine('🗑️ partida borrada');
  }
});

render();
setStatus(readStorage() === null ? 'No hay ninguna partida guardada en este navegador.' : 'Hay una partida guardada: pulsa «Cargar» para continuarla.');
logLine('Listo: pulsa «Recoger 25 monedas» y «Guardar»; luego «Simular un byte dañado» y «Cargar»; y prueba «Cargar una partida de la versión 1»');
```
