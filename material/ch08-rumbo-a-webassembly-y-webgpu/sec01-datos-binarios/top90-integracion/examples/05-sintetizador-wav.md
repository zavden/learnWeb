---
example_description: "Un sintetizador que escribe un archivo WAV: muestras Float32 de -1 a 1 calculadas con Math.sin, convertidas a PCM de 16 bits con signo, cabecera RIFF escrita con DataView en little-endian, y un Blob con URL de objeto para el <audio> y la descarga; el sonido solo se genera al pulsar"
example_tags: "javascript|wav|audio|float32array|int16|dataview|blob|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un arpegio en WAV</h1>
  <p>
    <button id="generate" type="button">Generar el arpegio</button>
    <a id="download" download="arpegio.wav" hidden>Descargar arpegio.wav</a>
  </p>
  <audio id="player" controls hidden></audio>
  <p class="note">El sonido no se genera ni suena hasta que lo pides. En las tarjetas de la galería y de la teoría la descarga no funciona (iframe aislado): ábrelo con ▶ o en el editor.</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
button { font: inherit; padding: 0.4rem 0.8rem; border: 1px solid #64748b; border-radius: 0.5rem; background: #ffffff; color: #1e293b; cursor: pointer; }
a { color: #1d4ed8; margin-inline-start: 0.75rem; }
:is(button, a, audio):focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
audio { inline-size: 100%; }
[hidden] { display: none; }
.note { font-size: 0.85rem; color: #475569; }
.log { padding-inline-start: 1.25rem; font-size: 0.8rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
const SAMPLE_RATE = 24000; // muestras por segundo (un CD usa 44100; para un arpegio sobra)
const NOTES = [['do', 523.25], ['mi', 659.25], ['sol', 783.99], ['do agudo', 1046.5]];
const NOTE_SECONDS = 0.25;
const logList = document.querySelector('#log');
let currentUrl = null;
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// 1. Las muestras, como decimales de -1 a 1 (así trabaja también la Web Audio API).
function synthesize() {
  const perNote = Math.round(SAMPLE_RATE * NOTE_SECONDS);
  const samples = new Float32Array(perNote * NOTES.length);
  NOTES.forEach(([, frequency], index) => {
    for (let i = 0; i < perNote; i += 1) {
      const fade = Math.min(1, i / 240, (perNote - i) / 240); // 10 ms de entrada y salida: sin chasquidos
      samples[index * perNote + i] = 0.6 * fade * Math.sin((2 * Math.PI * frequency * i) / SAMPLE_RATE);
    }
  });
  return samples;
}

// 2. El archivo: cabecera RIFF de 44 bytes + PCM de 16 bits con signo, todo little-endian.
function encodeWav(samples) {
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const ascii = (offset, text) => [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  ascii(0, 'RIFF');
  view.setUint32(4, view.byteLength - 8, true); // lo que queda del archivo
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);                 // tamaño del fragmento fmt
  view.setUint16(20, 1, true);                  // 1 = PCM sin comprimir
  view.setUint16(22, 1, true);                  // canales: mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);    // bytes por segundo
  view.setUint16(32, 2, true);                  // bytes por muestra (todos los canales)
  view.setUint16(34, 16, true);                 // bits por muestra
  ascii(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) => {
    const clamped = Math.max(-1, Math.min(1, sample)); // un Int16Array daría la vuelta: mejor recortar
    view.setInt16(44 + i * 2, Math.round(clamped * 32767), true);
  });
  return view.buffer;
}

document.querySelector('#generate').addEventListener('click', () => {
  const samples = synthesize();
  const wav = encodeWav(samples);
  if (currentUrl) URL.revokeObjectURL(currentUrl); // la del arpegio anterior ya no hace falta
  currentUrl = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
  const player = document.querySelector('#player');
  player.src = currentUrl;
  player.hidden = false;
  const link = document.querySelector('#download');
  link.href = currentUrl;
  link.hidden = false;
  const header = Array.from(new Uint8Array(wav, 0, 12), (byte) => byte.toString(16).padStart(2, '0')).join(' ');
  logLine(`🎵 ${NOTES.map(([name]) => name).join('-')} · ${samples.length / SAMPLE_RATE} s · ${samples.length} muestras · ${wav.byteLength} bytes`);
  logLine(`cabecera → ${header} («RIFF», tamaño, «WAVE»)`);
  logLine(`float32 → int16: ${samples[100].toFixed(4)} → ${new DataView(wav).getInt16(44 + 200, true)}`);
  logLine('Pulsa ▶ en el reproductor para escucharlo');
});
logLine('Listo: pulsa «Generar el arpegio»');
```
