---
example_description: "Un metrónomo que genera archivos WAV a la carta: tempo, compás, número de compases y timbre; solo calcula las muestras de cada golpe (el silencio ya está a cero en el ArrayBuffer), escribe PCM de 16 bits con su cabecera RIFF y ofrece reproducirlo en bucle y descargarlo; nada suena ni se genera hasta que lo pides"
example_tags: "javascript|wav|audio|dataview|int16|blob|descargas|formularios|profesional"
example_stage: professional
example_importance: useful
console: true
---

# HTML

```html
<main class="metronome-app">
  <h1>Metrónomo para ensayar</h1>
  <div class="controls">
    <label>Tempo (pulsos por minuto)
      <input id="tempo" type="number" min="40" max="208" step="1" value="96" required>
    </label>
    <label>Compás
      <select id="meter">
        <option value="2">2/4</option>
        <option value="3">3/4</option>
        <option value="4" selected>4/4</option>
        <option value="6">6/8</option>
      </select>
    </label>
    <label>Compases
      <input id="bars" type="number" min="1" max="16" step="1" value="4" required>
    </label>
    <label>Sonido
      <select id="timbre">
        <option value="wood">madera</option>
        <option value="bell">campana</option>
      </select>
    </label>
  </div>
  <p><button id="generate" type="button">Generar el WAV</button></p>
  <p id="error" class="error" role="alert"></p>
  <div id="result" class="result" hidden>
    <audio id="player" controls loop></audio>
    <p><a id="download">Descargar</a></p>
  </div>
  <p class="note">El audio se genera solo al pulsar el botón y suena cuando pulsas ▶. Las tarjetas de la galería y de la teoría no permiten descargas: ábrelo con ▶ o en el editor.</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --bad-ink: #7f1d1d; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.metronome-app { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.75rem; font-size: 1.25rem; }
.controls { display: grid; grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); gap: 0.75rem; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
input, select, button { font: inherit; padding: 0.3rem 0.5rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; font-weight: 600; }
a { color: var(--accent); }
:is(input, select, button, a, audio):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.error { color: var(--bad-ink); font-weight: 600; min-block-size: 1.45em; }
.result audio { inline-size: 100%; }
[hidden] { display: none; }
.note { font-size: 0.8rem; color: var(--muted); }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Metrónomo que escribe archivos WAV.
//
// Decisiones de diseño:
// - Un ArrayBuffer nuevo ya está a ceros, y cero es silencio en PCM: solo se calculan
//   las muestras de cada golpe (40 ms), no las de todo el archivo. Un minuto de
//   metrónomo cuesta lo mismo que unos pocos golpes.
// - El primer golpe de cada compás (el acento) es más agudo y más fuerte.
// - Muestras decimales recortadas a [-1, 1] antes de pasar a int16: si no, un pico
//   daría la vuelta y sonaría como un chasquido (lección «ArrayBuffer y vistas»).
// - Los campos se validan antes de generar nada; el error se dice en role="alert".
// - Cada WAV nuevo libera la URL de objeto del anterior.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, los
// formularios y este módulo.

const SAMPLE_RATE = 24000;
const CLICK_SECONDS = 0.04;
const TIMBRES = {
  wood: { accent: 1200, beat: 800, decay: 90 },
  bell: { accent: 1760, beat: 880, decay: 35 },
};
const logList = document.querySelector('#log');
let currentUrl = null;

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function readSettings() {
  const tempo = document.querySelector('#tempo').valueAsNumber;
  const bars = document.querySelector('#bars').valueAsNumber;
  if (!Number.isInteger(tempo) || tempo < 40 || tempo > 208) throw new RangeError('El tempo tiene que ser un número entero entre 40 y 208.');
  if (!Number.isInteger(bars) || bars < 1 || bars > 16) throw new RangeError('Los compases tienen que estar entre 1 y 16.');
  return {
    tempo,
    bars,
    beatsPerBar: Number(document.querySelector('#meter').value),
    meterLabel: document.querySelector('#meter').selectedOptions[0].textContent,
    timbre: TIMBRES[document.querySelector('#timbre').value],
  };
}

function writeHeader(view, sampleCount) {
  const ascii = (offset, text) => [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + sampleCount * 2, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);                // PCM
  view.setUint16(22, 1, true);                // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);  // bytes por segundo
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, sampleCount * 2, true);
}

function buildMetronome({ tempo, bars, beatsPerBar, timbre }) {
  const beats = bars * beatsPerBar;
  const samplesPerBeat = Math.round((SAMPLE_RATE * 60) / tempo);
  const sampleCount = beats * samplesPerBeat;
  const view = new DataView(new ArrayBuffer(44 + sampleCount * 2)); // todo a cero: silencio
  writeHeader(view, sampleCount);
  const clickLength = Math.round(SAMPLE_RATE * CLICK_SECONDS);
  for (let beat = 0; beat < beats; beat += 1) {
    const accent = beat % beatsPerBar === 0;
    const frequency = accent ? timbre.accent : timbre.beat;
    const volume = accent ? 0.9 : 0.55;
    const start = beat * samplesPerBeat;
    for (let i = 0; i < clickLength; i += 1) {
      const t = i / SAMPLE_RATE;
      const sample = volume * Math.exp(-t * timbre.decay) * Math.sin(2 * Math.PI * frequency * t);
      view.setInt16(44 + (start + i) * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true);
    }
  }
  return { buffer: view.buffer, beats, seconds: sampleCount / SAMPLE_RATE };
}

document.querySelector('#generate').addEventListener('click', () => {
  const errorText = document.querySelector('#error');
  let settings;
  try {
    settings = readSettings();
  } catch (error) {
    errorText.textContent = error.message;
    logLine(`⚠️ ${error.message}`);
    return;
  }
  errorText.textContent = '';
  const { buffer, beats, seconds } = buildMetronome(settings);
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
  const fileName = `metronomo-${settings.tempo}bpm-${settings.meterLabel.replace('/', 'x')}.wav`;
  document.querySelector('#player').src = currentUrl;
  Object.assign(document.querySelector('#download'), { href: currentUrl, download: fileName, textContent: `Descargar ${fileName} (${(buffer.byteLength / 1024).toFixed(0)} KB)` });
  document.querySelector('#result').hidden = false;
  logLine(`🥁 ${settings.tempo} bpm · ${settings.meterLabel} · ${settings.bars} compases → ${beats} golpes · ${seconds.toFixed(2)} s · ${buffer.byteLength} bytes`);
});
logLine('Listo: pulsa «Generar el WAV» y luego ▶; cambia el tempo a 30 para ver la validación');
```
