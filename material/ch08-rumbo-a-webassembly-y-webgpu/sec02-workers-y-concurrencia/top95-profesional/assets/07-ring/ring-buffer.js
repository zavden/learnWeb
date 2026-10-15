// BÚFER CIRCULAR DE UN PRODUCTOR Y UN CONSUMIDOR (ejemplo 07), sobre memoria que
// podría estar compartida entre dos hilos. Es la estructura con la que un
// AudioWorklet (el hilo del audio) y un worker se pasan muestras sin mensajes.
//
//   bytes 0-7:  Int32Array [escritura, lectura] — contadores que solo crecen
//   bytes 8-…:  Float32Array con `capacity` muestras (una potencia de 2)
//
// Reglas que lo hacen seguro con dos hilos, sin cerrojos:
// - Solo el productor escribe el contador de escritura; solo el consumidor, el de lectura.
// - Los contadores se leen y se publican con Atomics.load/store, y se publican DESPUÉS
//   de tocar los datos: quien ve el contador nuevo ve también las muestras.
// - Los contadores dan la vuelta al pasar de 2^31 (| 0): la resta sigue funcionando.
export class RingBuffer {
  static bytesFor(capacity) {
    return 8 + capacity * 4;
  }

  constructor(buffer, capacity) {
    if (capacity <= 0 || (capacity & (capacity - 1)) !== 0) throw new RangeError('la capacidad tiene que ser una potencia de 2');
    this.indices = new Int32Array(buffer, 0, 2);
    this.data = new Float32Array(buffer, 8, capacity);
    this.capacity = capacity;
    this.mask = capacity - 1; // posición = contador & mask, porque la capacidad es potencia de 2
  }

  available() {
    return (Atomics.load(this.indices, 0) - Atomics.load(this.indices, 1)) | 0;
  }

  // Productor: escribe lo que quepa y devuelve cuántas muestras escribió.
  push(samples) {
    const write = Atomics.load(this.indices, 0);
    const read = Atomics.load(this.indices, 1);
    const count = Math.min(samples.length, this.capacity - ((write - read) | 0));
    for (let i = 0; i < count; i++) this.data[(write + i) & this.mask] = samples[i];
    Atomics.store(this.indices, 0, (write + count) | 0);
    return count;
  }

  // Consumidor: lee hasta target.length muestras y devuelve cuántas leyó.
  pop(target) {
    const read = Atomics.load(this.indices, 1);
    const write = Atomics.load(this.indices, 0);
    const count = Math.min(target.length, (write - read) | 0);
    for (let i = 0; i < count; i++) target[i] = this.data[(read + i) & this.mask];
    Atomics.store(this.indices, 1, (read + count) | 0);
    return count;
  }
}

// La simulación: el consumidor es el hilo del audio, que cada paso necesita 128
// muestras exactas (2,7 ms a 48 kHz); si no las hay, se oye un corte. El productor es
// un worker que sintetiza hasta 256 muestras por paso, pero a veces se queda parado
// (una pausa del recolector de basura, otra tarea). Con semilla: siempre los mismos
// tropiezos. Un búfer grande aguanta los tropiezos, a cambio de más retraso.
export function createSimulation(ring, seed = 7) {
  let state = seed;
  const random = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const block = new Float32Array(256);
  const quantum = new Float32Array(128);
  let phase = 0;
  let stalled = 0;
  let fillSum = 0;
  const stats = { ticks: 0, underruns: 0, maxFill: 0, averageFill: 0 };
  const produce = (count) => {
    const samples = block.subarray(0, count);
    for (let i = 0; i < count; i++) samples[i] = 0.5 * Math.sin((phase += (2 * Math.PI * 440) / 48_000));
    ring.push(samples);
  };
  produce(Math.min(256, ring.capacity)); // se empieza con algo de margen
  return {
    stats,
    tick() {
      // El productor: hasta 256 muestras, las que quepan, salvo si está parado.
      if (stalled === 0 && random() < 0.05) stalled = 2 + Math.floor(random() * 8); // de 2 a 9 pasos
      if (stalled > 0) stalled -= 1;
      else produce(Math.min(256, ring.capacity - ring.available()));
      // El consumidor: 128 muestras, sí o sí.
      if (ring.pop(quantum) < 128) stats.underruns += 1;
      const fill = ring.available();
      fillSum += fill;
      stats.maxFill = Math.max(stats.maxFill, fill);
      stats.ticks += 1;
      stats.averageFill = fillSum / stats.ticks;
    },
  };
}
