---
example_description: "Dentro de un try, «return promesa» no es lo mismo que «return await promesa»: sin await, la función sale del try antes de que la promesa se rechace y su catch nunca ve el error"
example_tags: "javascript|async|await|return|try-catch|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
function chargeCard(card) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (card.endsWith('0002')) reject(new Error(`Tarjeta ${card} rechazada`));
      else resolve(`PAY-${card.slice(-4)}`);
    }, 40);
  });
}

// 🐛 return de la promesa, SIN await: el try termina en el acto (la promesa
//    aún está pendiente) y el rechazo llega cuando la función ya salió de él.
async function payOrFallback(card) {
  try {
    return chargeCard(card);
  } catch (error) {
    return `pago contra entrega (${error.message})`; // nunca se ejecuta
  }
}

// ✅ return await: la función espera DENTRO del try, y el catch ve el rechazo.
async function payOrFallbackFixed(card) {
  try {
    return await chargeCard(card);
  } catch (error) {
    return `pago contra entrega (${error.message})`;
  }
}

async function main() {
  try {
    console.log('🐛 sin await →', await payOrFallback('**** 0002'));
  } catch (error) {
    console.log('🐛 sin await → el error escapó del catch de dentro:', error.message);
  }
  console.log('✅ con return await →', await payOrFallbackFixed('**** 0002'));
  console.log('✅ tarjeta buena →', await payOrFallbackFixed('**** 4242'));
}
main();

// Fuera de un try, return promesa y return await promesa dan el mismo
// resultado (la promesa de la función async sigue a la devuelta). Dentro de
// un try/catch o un try/finally, solo return await mantiene la operación
// «dentro» del bloque. Regla sencilla: en una función async, escribe siempre
// return await.
```
