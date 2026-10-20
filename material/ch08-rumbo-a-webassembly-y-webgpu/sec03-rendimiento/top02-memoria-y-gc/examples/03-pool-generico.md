---
example_description: "Un pool de objetos genérico con acquire() y release(): una pila de objetos libres (O(1) para sacar y devolver), una función que crea y otra que limpia, un tope de objetos guardados y una defensa contra devolver dos veces el mismo objeto. Tres tormentas de 300 gotas crean 300 objetos en lugar de 900"
example_tags: "javascript|rendimiento|memoria|object-pooling|clases|recolector-de-basura"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// El pool del confeti (capítulo 6, «El bucle de animación») buscaba una partícula libre
// recorriendo el array con un flag `active`. Este es general: sirve para cualquier objeto.
class Pool {
  #free = [];            // pila de objetos libres: pop/push son O(1)
  #inUse = new Set();    // para detectar un release doble
  #create;
  #reset;
  #maxFree;
  created = 0;

  constructor(create, reset, { maxFree = Infinity } = {}) {
    this.#create = create;
    this.#reset = reset;
    this.#maxFree = maxFree;
  }
  acquire() {
    let obj = this.#free.pop();
    if (obj === undefined) {
      obj = this.#create();
      this.created += 1;
    }
    this.#inUse.add(obj);
    return obj;
  }
  release(obj) {
    if (!this.#inUse.delete(obj)) throw new Error('este objeto no estaba en uso (¿release doble?)');
    this.#reset(obj);                                         // limpio ANTES de guardarlo (ejemplo 04)
    if (this.#free.length < this.#maxFree) this.#free.push(obj); // si sobran, que se los lleve el GC
  }
  get free() { return this.#free.length; }
  get inUse() { return this.#inUse.size; }
}

// Gotas de lluvia de una simulación: muchas, de vida corta, todas iguales.
const drops = new Pool(
  () => ({ x: 0, y: 0, speed: 0 }),
  (drop) => { drop.x = 0; drop.y = 0; drop.speed = 0; },
  { maxFree: 500 },
);

let withoutPool = 0;
for (let storm = 1; storm <= 3; storm++) {
  const falling = [];
  for (let i = 0; i < 300; i++) {
    const drop = drops.acquire();
    drop.x = (i * 37) % 480;
    drop.speed = 200 + ((i * storm * 13) % 100);
    falling.push(drop);
    withoutPool += 1; // sin pool, cada gota sería un objeto nuevo
  }
  // … la tormenta cae y termina: cada gota vuelve al pool …
  for (const drop of falling) drops.release(drop);
  console.log(`tormenta ${storm} → objetos creados en total: ${drops.created} · libres: ${drops.free} · en uso: ${drops.inUse}`);
}
console.log(`sin pool → ${withoutPool} objetos · con pool → ${drops.created}`);

// Devolver dos veces el mismo objeto lo metería dos veces en la pila: dos «gotas» compartirían
// el mismo objeto y una movería a la otra. El Set de objetos en uso lo detecta.
const drop = drops.acquire();
drops.release(drop);
try {
  drops.release(drop);
} catch (error) {
  console.log('release doble →', error.message);
}

// ¿Cuándo merece la pena? Cuando se crean miles de objetos por segundo durante una animación
// (partículas, proyectiles, mensajes). Para el resto, crear objetos en V8 es muy barato:
// un pool añade código y errores posibles (ejemplo 04). Mide antes.
```
