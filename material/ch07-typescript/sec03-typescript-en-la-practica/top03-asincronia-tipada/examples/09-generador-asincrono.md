---
example_description: "Un generador asíncrono tipado, AsyncGenerator<unknown>, lee el NDJSON que envía /api/demo/stream línea a línea; otro, onlyValid<T>, deja pasar solo lo que acepta un predicado, así que el for await recibe objetos Chunk. Con las librerías de LearnWeb, for await sobre response.body es TS2504"
example_tags: "typescript|async|generadores|asyncgenerator|for-await|streams|ndjson|predicados-de-tipo"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Chunk = { n: number; of: number; text: string };
const isChunk = (value: unknown): value is Chunk =>
  typeof value === 'object' && value !== null &&
  'n' in value && typeof value.n === 'number' &&
  'of' in value && typeof value.of === 'number' &&
  'text' in value && typeof value.text === 'string';

// 1. De la red a valores sueltos: un generador asíncrono que produce unknown.
//    (for await (const bytes of response.body) sería TS2504 aquí: el tipo de
//    ReadableStream solo es iterable con la librería «DOM.AsyncIterable».)
async function* readJsonLines(url: string): AsyncGenerator<unknown, void, undefined> {
  const response = await fetch(url);
  if (!response.ok || response.body === null) throw new Error(`HTTP ${response.status} al pedir ${url}`);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read(); // value: string cuando done es false
    if (done) break;
    buffer += value;
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? ''; // la última puede estar a medias (capítulo 6)
    for (const line of lines) if (line !== '') yield JSON.parse(line);
  }
  if (buffer !== '') yield JSON.parse(buffer);
}

// 2. De unknown a T: deja pasar solo lo que acepta el predicado.
async function* onlyValid<T>(source: AsyncIterable<unknown>, isValid: (value: unknown) => value is T): AsyncGenerator<T, void, undefined> {
  for await (const item of source) {
    if (isValid(item)) yield item;
    else console.log('⚠️ línea descartada:', JSON.stringify(item));
  }
}

// 3. Quien consume no ve la red, ni el texto, ni unknown: solo objetos Chunk.
let received = 0;
for await (const chunk of onlyValid(readJsonLines('/api/demo/stream?format=ndjson&chunks=4&interval=100'), isChunk)) {
  received += 1;
  console.log(`📦 ${chunk.n}/${chunk.of} · ${chunk.text}`);
}
console.log('✅ bloques recibidos →', received);
```
