---
example_description: "Solución: los seis bugs asíncronos de la tienda arreglados: return en el then, Promise.all en vez de forEach, reservas en paralelo, return await dentro del try, un AbortSignal.timeout que cancela el cobro y un setTimeout recursivo en vez de setInterval"
example_tags: "javascript|solucion|promesas|async|depuracion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: las seis funciones de «Café La Huasteca», arregladas. Cada
// arreglo lleva un comentario con la lección donde se explica el bug.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// La tienda simulada. Cada comprobación crea la suya, con sus contadores.
function createShop() {
  const shop = {
    reserved: [], charges: [], inFlight: 0, maxInFlight: 0, statusInFlight: 0, maxStatusInFlight: 0,
    getCart: () => wait(10).then(() => ['café de olla', 'cajeta']),
    getPrice: (product) => wait(10).then(() => ({ 'café de olla': 21000, cajeta: 9500 })[product]),
    async reserve(product) {
      shop.inFlight += 1;
      shop.maxInFlight = Math.max(shop.maxInFlight, shop.inFlight);
      await wait(30);
      shop.inFlight -= 1;
      shop.reserved.push(product);
      return `R-${product}`;
    },
    charge(cents, { signal } = {}) { // tarda 80 ms; se puede cancelar con una señal
      return new Promise((resolve, reject) => {
        if (cents > 100000) return setTimeout(reject, 10, new Error('la tarjeta superó su límite'));
        const timerId = setTimeout(() => {
          shop.charges.push(cents);
          resolve(`PAY-${cents}`);
        }, 80);
        signal?.addEventListener('abort', () => { // addEventListener: capítulo 6
          clearTimeout(timerId);
          reject(signal.reason);
        }, { once: true });
      });
    },
    async getStatus() { // tarda 50 ms
      shop.statusInFlight += 1;
      shop.maxStatusInFlight = Math.max(shop.maxStatusInFlight, shop.statusInFlight);
      await wait(50);
      shop.statusInFlight -= 1;
      return 'enviado';
    },
  };
  return shop;
}

// ── Las seis funciones, arregladas ──────────────────────────────────────
function cartTotal(shop) {
  return shop.getCart()
    .then((products) => {
      return Promise.all(products.map((product) => shop.getPrice(product))); // ✅ return («Promesas»)
    })
    .then((prices) => prices.reduce((sum, cents) => sum + cents, 0));
}

async function reserveAll(shop, products) {
  await Promise.all(products.map((product) => shop.reserve(product))); // ✅ nada de forEach («async/await»)
  return shop.reserved.length;
}

async function reserveFast(shop, products) {
  return Promise.all(products.map((product) => shop.reserve(product))); // ✅ a la vez, en orden («async/await»)
}

async function payOrFallback(shop, cents) {
  try {
    return await shop.charge(cents); // ✅ return await dentro del try («async/await»)
  } catch (error) {
    return 'pago contra entrega';
  }
}

function chargeWithDeadline(shop, cents, ms) {
  return shop.charge(cents, { signal: AbortSignal.timeout(ms) }); // ✅ el plazo cancela el cobro («Combinadores y cancelación»)
}

function pollStatus(shop, times) { // consulta `times` veces, 30 ms después de cada respuesta
  return new Promise((resolve) => {
    let received = 0;
    function poll() {
      shop.getStatus().then(() => {
        received += 1;
        if (received === times) resolve(received);
        else setTimeout(poll, 30); // ✅ setTimeout recursivo («Callbacks y temporizadores»)
      });
    }
    setTimeout(poll, 30);
  });
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
async function check(description, compute, expected) {
  let actual;
  try {
    const limit = new Promise((resolve) => setTimeout(resolve, 600, '⏰ no terminó en 600 ms'));
    actual = await Promise.race([compute(), limit]);
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === expected) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}

async function runChecks() {
  await check('cartTotal suma el carrito', () => cartTotal(createShop()), 30500);
  await check('reserveAll espera a todas las reservas', () => reserveAll(createShop(), ['café de olla', 'cajeta', 'canela']), 3);
  await check('reserveFast hace las tres reservas a la vez', async () => {
    const shop = createShop();
    await reserveFast(shop, ['café de olla', 'cajeta', 'canela']);
    return `a la vez: ${shop.maxInFlight}`;
  }, 'a la vez: 3');
  await check('reserveFast devuelve las reservas en orden', async () => (await reserveFast(createShop(), ['café de olla', 'cajeta'])).join(', '),
    'R-café de olla, R-cajeta');
  await check('payOrFallback ofrece pago contra entrega si la tarjeta falla', () => payOrFallback(createShop(), 250000), 'pago contra entrega');
  await check('chargeWithDeadline: un cobro rápido funciona', () => chargeWithDeadline(createShop(), 21000, 200), 'PAY-21000');
  await check('chargeWithDeadline: tras el plazo no queda ningún cobro hecho', async () => {
    const shop = createShop();
    try {
      await chargeWithDeadline(shop, 21000, 40);
    } catch {
      // se esperaba: plazo agotado
    }
    await wait(100); // el cobro habría terminado a los 80 ms
    return `cobros tras el plazo: ${shop.charges.length}`;
  }, 'cobros tras el plazo: 0');
  await check('pollStatus nunca tiene dos consultas a la vez', async () => {
    const shop = createShop();
    await pollStatus(shop, 3);
    return `a la vez como mucho: ${shop.maxStatusInFlight}`;
  }, 'a la vez como mucho: 1');
}
runChecks();
```
