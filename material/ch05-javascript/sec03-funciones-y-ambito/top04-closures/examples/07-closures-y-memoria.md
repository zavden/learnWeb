---
example_description: "Un closure mantiene vivo todo lo que captura: oyentes que nunca se dan de baja retienen sus datos. La función de baja (también un closure) lo evita"
example_tags: "javascript|closures|memoria|recolector-de-basura|suscripciones"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Mientras un closure sea alcanzable, las variables que captura NO se pueden liberar.
// El caso típico: funciones registradas como «oyentes» que nadie elimina.

function createPriceFeed() {
  const listeners = new Set();
  return {
    subscribe(listener) {
      listeners.add(listener);
      // Devuelve la función para darse de baja: otro closure (recuerda listener).
      return () => listeners.delete(listener);
    },
    publish(price) {
      listeners.forEach((listener) => listener(price));
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

// Un «gráfico» guarda las últimas 50 000 cotizaciones (≈ 400 KB de números).
function mountChart(feed) {
  const history = new Array(50_000).fill(0);
  return feed.subscribe((price) => {
    history.push(price); // el oyente captura history…
    history.shift();     // …así que history vive mientras viva el oyente
  });
}

// 🐛 Cada vez que el usuario abre la pestaña «Gráfico» se monta uno nuevo,
// pero nadie desmonta el anterior: los closures se acumulan con sus datos.
const leakyFeed = createPriceFeed();
for (let visit = 1; visit <= 5; visit++) {
  mountChart(leakyFeed); // se tira la función de baja
}
leakyFeed.publish(101.5);
console.log('🐛 oyentes vivos →', leakyFeed.listenerCount()); // 5 (≈ 2 MB retenidos)

// ✅ Guarda la función de baja y llámala al desmontar.
const feed = createPriceFeed();
let unmountChart = null;
for (let visit = 1; visit <= 5; visit++) {
  if (unmountChart) unmountChart(); // desmonta el anterior
  unmountChart = mountChart(feed);
}
feed.publish(101.5);
console.log('✅ oyentes vivos →', feed.listenerCount()); // 1

// Cuando nada apunta ya a un oyente, el recolector de basura libera el oyente
// y su history. Para medir la memoria de verdad: abre el ejemplo con ↗ y usa
// DevTools → Memory → Heap snapshot.
```
