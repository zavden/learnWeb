---
example_description: "Un búfer que va y vuelve: la página transfiere unas muestras de audio al worker, el worker les sube el volumen y las transfiere de vuelta; tres rondas con los mismos bytes, sin una sola copia, y en cada momento solo un lado puede tocarlos"
example_tags: "javascript|workers|transferibles|ping-pong|arraybuffer|audio"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// El worker aplica una ganancia (multiplica el volumen) y devuelve el MISMO búfer,
// transferido también a la vuelta. Los valores se recortan a [-1, 1], como en un WAV.
const code = `
  self.onmessage = (event) => {
    const { samples, gain } = event.data;
    for (let i = 0; i < samples.length; i++) samples[i] = Math.max(-1, Math.min(1, samples[i] * gain));
    self.postMessage({ samples }, [samples.buffer]);
  };
`;
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);

function applyGain(samples, gain) {
  return new Promise((resolve) => {
    worker.onmessage = (event) => resolve(event.data.samples);
    worker.postMessage({ samples, gain }, [samples.buffer]); // ida: transferido
  });
}
const peak = (data) => data.reduce((max, value) => Math.max(max, Math.abs(value)), 0);

// Una décima de segundo de un tono suave (4800 muestras, 19 200 bytes).
let samples = Float32Array.from({ length: 4800 }, (_, i) => 0.25 * Math.sin((2 * Math.PI * 440 * i) / 48_000));
console.log(`al empezar: ${samples.byteLength} bytes en la página · pico ${peak(samples).toFixed(2)}`);

for (const gain of [2, 1.5, 2]) {
  const sent = samples;
  const back = applyGain(samples, gain);
  console.log(`×${gain} → mientras el worker trabaja, la página tiene ${sent.byteLength} bytes`);
  samples = await back; // vuelta: transferido otra vez
  console.log(`   de vuelta: ${samples.byteLength} bytes · pico ${peak(samples).toFixed(2)}`);
}
worker.terminate();

// La propiedad de los bytes va y viene como una pelota de ping-pong: nunca hay
// dos hilos con acceso a la vez, así que no puede haber carreras (lección siguiente).
```
