---
example_description: "Una carrera de datos sin hilos: cinco compras a la vez leen el mismo saldo antes de que ninguna lo actualice (lecturas y escrituras con await en medio) y se aprueban compras sin fondos; un mutex asíncrono (cola FIFO de promesas, liberado con using y Symbol.dispose) lo arregla, y un semáforo limita las conexiones a la base de datos"
example_tags: "javascript|profesional|async|mutex|semaforo|carrera|using"
example_stage: professional
example_importance: critical
console: true
---

# JavaScript

```javascript
// EL MONEDERO DE UNA TIENDA Y UNA CARRERA DE DATOS.
//
// Decisiones:
// - JavaScript tiene una sola hebra, pero eso no evita las carreras: entre un
//   await y el siguiente, otras funciones async avanzan. «Leer, esperar,
//   escribir» no es atómico.
// - Mutex: una cola FIFO de promesas. acquire() devuelve un «cerrojo» cuando
//   llega tu turno; su [Symbol.dispose]() lo libera, así que «using lock =
//   await mutex.acquire()» lo suelta al salir del bloque pase lo que pase
//   (using: módulo 6, lección «Symbol»; Chrome 134+).
// - Semáforo: un mutex con N permisos. Limita cuántas operaciones usan a la
//   vez un recurso (aquí, 2 conexiones a la base de datos).
// - Orden justo: los que esperan entran por orden de llegada.
//
// Alcance: módulos 1-7.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

class Semaphore {
  #available;
  #waiters = []; // resolve de quien espera, en orden de llegada
  inUse = 0;
  maxInUse = 0;

  constructor(permits) {
    this.#available = permits;
  }
  async acquire() {
    if (this.#available > 0) {
      this.#available -= 1;
    } else {
      await new Promise((resolve) => this.#waiters.push(resolve)); // espera su turno
    }
    this.inUse += 1;
    this.maxInUse = Math.max(this.maxInUse, this.inUse);
    let released = false;
    const release = () => {
      if (released) return; // liberar dos veces no debe regalar un permiso
      released = true;
      this.inUse -= 1;
      const next = this.#waiters.shift();
      if (next) next(); // el permiso pasa directamente al siguiente
      else this.#available += 1;
    };
    return { release, [Symbol.dispose]: release };
  }
}

class Mutex extends Semaphore {
  constructor() {
    super(1);
  }
}

// ── La base de datos simulada ────────────────────────────────────────────
const connections = new Semaphore(2); // la base de datos acepta 2 conexiones
const db = {
  data: new Map([['wallet:ana', 50000]]),
  async read(key) {
    using connection = await connections.acquire();
    await wait(10);
    return this.data.get(key);
  },
  async write(key, value) {
    using connection = await connections.acquire();
    await wait(10);
    this.data.set(key, value);
  },
};
const chargeCard = () => wait(20); // la pasarela de pago

// 🐛 Sin cerrojo: leer → cobrar → escribir, con awaits en medio.
async function buyUnsafe(wallet, item) {
  const balance = await db.read(wallet);
  if (balance < item.cents) return `⛔ ${item.name}: saldo insuficiente`;
  await chargeCard(); // ← mientras tanto, las otras compras leen el MISMO saldo
  await db.write(wallet, balance - item.cents);
  return `✅ ${item.name}`;
}

// ✅ Con un mutex por monedero: la sección crítica, de una en una.
const walletLocks = new Map();
const lockFor = (wallet) => {
  if (!walletLocks.has(wallet)) walletLocks.set(wallet, new Mutex());
  return walletLocks.get(wallet);
};
async function buySafe(wallet, item) {
  using lock = await lockFor(wallet).acquire(); // se libera al salir, también con return o throw
  const balance = await db.read(wallet);
  if (balance < item.cents) return `⛔ ${item.name}: saldo insuficiente`;
  await chargeCard();
  await db.write(wallet, balance - item.cents);
  return `✅ ${item.name}`;
}

const cart = ['café de Chiapas', 'mole poblano', 'cajeta', 'vainilla', 'chocolate']
  .map((name) => ({ name, cents: 15000 }));

async function main() {
  for (const [label, buy] of [['🐛 sin cerrojo', buyUnsafe], ['✅ con mutex', buySafe]]) {
    db.data.set('wallet:ana', 50000);
    console.log(`▶ ${label}: 5 compras de $150.00 a la vez con ${money(50000)} de saldo`);
    const results = await Promise.all(cart.map((item) => buy('wallet:ana', item)));
    const approved = results.filter((result) => result.startsWith('✅')).length;
    console.log(`  ${results.join(' · ')}`);
    console.log(`  aprobadas → ${approved} (${money(approved * 15000)} cobrados) | saldo final → ${money(db.data.get('wallet:ana'))}`);
    console.log('  ¿cuadran las cuentas? →', 50000 - approved * 15000 === db.data.get('wallet:ana'));
  }
  console.log('conexiones a la vez (máximo) →', connections.maxInUse, '| nunca más de 2 →', connections.maxInUse <= 2);
}
main();

// Sin cerrojo, las cinco compras leen $500.00 antes de que ninguna escriba:
// se aprueban todas (¡$750.00 cobrados!) y cada una escribe $350.00 encima de
// la anterior. Es una «actualización perdida», igual que con hilos.
// > Desde Python: asyncio tiene el mismo problema y la misma solución:
//   «async with lock:» con un asyncio.Lock, y asyncio.Semaphore(2).
```
