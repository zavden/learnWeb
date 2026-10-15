---
example_description: "Ejercicio: el código asíncrono de una tienda de café tiene seis bugs del módulo (un then sin return, un forEach con async, un bucle en fila que debía ir en paralelo, un return sin await en un try, un plazo con race que no cancela el cobro y un sondeo con setInterval que se solapa); encuéntralos con las comprobaciones"
example_tags: "javascript|ejercicio|promesas|async|depuracion|bug"
exercise: true
exercise_title: "Caza los seis bugs asíncronos"
exercise_instructions: "Cada función de la tienda tiene UN bug de este módulo; ninguno detiene el script, pero las comprobaciones los delatan || cartTotal debe devolver la suma de los precios del carrito || reserveAll debe devolver cuántas reservas se hicieron, y todas deben haber terminado al volver || reserveFast debe hacer las reservas a la vez (las tres en marcha juntas) y devolverlas en orden || payOrFallback debe devolver 'pago contra entrega' cuando la tarjeta rechaza el cobro || chargeWithDeadline no debe dejar ningún cobro hecho si se agota el plazo || pollStatus no debe tener nunca dos consultas en marcha a la vez || No toques el objeto que devuelve createShop ni las comprobaciones; dos de ellas ya salen ✓ y deben seguir así"
exercise_hints: "cartTotal: un then con llaves que llama a algo que devuelve una promesa necesita return || reserveAll: forEach no espera a callbacks async; usa for…of con await o Promise.all con map || reserveFast: un await dentro del for…of espera a cada reserva antes de lanzar la siguiente || payOrFallback: dentro de un try, return promesa sale del try antes del rechazo; escribe return await || chargeWithDeadline: race no cancela al perdedor; shop.charge acepta { signal }, y AbortSignal.timeout(ms) es una señal con plazo || pollStatus: setInterval lanza consultas aunque la anterior no haya terminado; programa la siguiente con setTimeout cuando llegue la respuesta"
exercise_solution_example: 11-ej-caza-los-bugs-asincronos-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: la tienda «Café La Huasteca» tiene seis bugs asíncronos, uno por
// función. Arregla las funciones (no createShop) hasta que todo salga ✓.

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

// ── Las seis funciones (cada una con UN bug) ────────────────────────────
function cartTotal(shop) {
  return shop.getCart()
    .then((products) => {
      Promise.all(products.map((product) => shop.getPrice(product)));
    })
    .then((prices) => prices.reduce((sum, cents) => sum + cents, 0));
}

async function reserveAll(shop, products) {
  products.forEach(async (product) => {
    await shop.reserve(product);
  });
  return shop.reserved.length;
}

async function reserveFast(shop, products) {
  const reservations = [];
  for (const product of products) {
    reservations.push(await shop.reserve(product));
  }
  return reservations;
}

async function payOrFallback(shop, cents) {
  try {
    return shop.charge(cents);
  } catch (error) {
    return 'pago contra entrega';
  }
}

function chargeWithDeadline(shop, cents, ms) {
  const timeout = new Promise((_, reject) => setTimeout(reject, ms, new Error(`sin respuesta en ${ms} ms`)));
  return Promise.race([shop.charge(cents), timeout]);
}

function pollStatus(shop, times) { // consulta `times` veces, una cada 30 ms
  return new Promise((resolve) => {
    let sent = 0;
    let received = 0;
    const intervalId = setInterval(() => {
      sent += 1;
      if (sent === times) clearInterval(intervalId);
      shop.getStatus().then(() => {
        received += 1;
        if (received === times) resolve(received);
      });
    }, 30);
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
