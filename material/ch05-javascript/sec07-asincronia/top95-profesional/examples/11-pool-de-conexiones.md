---
example_description: "Un pool de conexiones a una base de datos simulada: como mucho 2 conexiones, una cola de espera FIFO, plazo de espera con AbortSignal.timeout, conexiones rotas que se descartan y se reemplazan, y préstamos que se devuelven solos con await using y Symbol.asyncDispose, también cuando la consulta falla"
example_tags: "javascript|profesional|async|await-using|symbol-asyncdispose|pool|abortsignal"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UN POOL DE CONEXIONES para los informes de una tienda.
//
// Decisiones:
// - Abrir una conexión es caro: el pool las reutiliza, y como mucho tiene 2.
// - acquire() presta una conexión: una libre, una nueva si caben, o espera su
//   turno en una cola FIFO. La espera acepta { signal } (un plazo con
//   AbortSignal.timeout): quien se cansa sale de la cola.
// - El préstamo tiene [Symbol.asyncDispose](): con «await using» se devuelve
//   solo al salir del bloque, también si la consulta lanza (lección
//   «async/await»; Chrome 134+). Devolver es asíncrono: se deshacen las
//   transacciones abiertas antes de prestarla a otro.
// - Una conexión marcada como rota no vuelve al pool: se cierra, y la próxima
//   petición abre una nueva.
// - El propio pool es «async disposable»: al salir de su bloque cierra todas
//   las conexiones y rechaza a quien siguiera esperando.
//
// Alcance: módulos 1-7.

function wait(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const timerId = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { // addEventListener: capítulo 6
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

// ── La base de datos simulada ────────────────────────────────────────────
let connectionsOpened = 0;
let connectionsClosed = 0;
class Connection {
  constructor() {
    connectionsOpened += 1;
    this.id = `conn-${connectionsOpened}`;
    this.broken = false;
  }
  async query(sql) {
    await wait(40);
    if (sql.includes('FROM ventas_2019')) throw new Error(`la tabla ventas_2019 no existe (${this.id})`);
    if (sql.includes('pesada')) {
      this.broken = true; // el servidor cortó la conexión
      throw new Error(`conexión perdida (${this.id})`);
    }
    return `${sql.split(' ')[0]} ok en ${this.id}`;
  }
  async rollback() {
    await wait(5);
  }
  async close() {
    await wait(5);
    connectionsClosed += 1;
  }
}

// ── El pool ──────────────────────────────────────────────────────────────
class ConnectionPool {
  #all = new Set();
  #idle = [];
  #waiters = [];
  #closed = false;
  stats = { maxInUse: 0, inUse: 0 };

  constructor({ max }) {
    this.max = max;
  }

  async acquire({ signal } = {}) {
    if (this.#closed) throw new Error('el pool está cerrado');
    signal?.throwIfAborted();
    let connection = this.#idle.pop();
    if (!connection && this.#all.size < this.max) {
      connection = new Connection();
      this.#all.add(connection);
    }
    if (!connection) connection = await this.#waitForTurn(signal);
    this.stats.inUse += 1;
    this.stats.maxInUse = Math.max(this.stats.maxInUse, this.stats.inUse);
    return this.#lease(connection);
  }

  #waitForTurn(signal) {
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject };
      this.#waiters.push(waiter);
      signal?.addEventListener('abort', () => {
        const index = this.#waiters.indexOf(waiter);
        if (index === -1) return; // ya le había tocado
        this.#waiters.splice(index, 1); // sale de la cola
        reject(signal.reason);
      }, { once: true });
    });
  }

  #lease(connection) {
    let returned = false;
    return {
      id: connection.id,
      query: (sql) => connection.query(sql),
      [Symbol.asyncDispose]: async () => {
        if (returned) return;
        returned = true;
        this.stats.inUse -= 1;
        await this.#giveBack(connection);
      },
    };
  }

  async #giveBack(connection) {
    if (connection.broken || this.#closed) {
      this.#all.delete(connection);
      await connection.close();
      if (!this.#closed && this.#waiters.length > 0) { // hueco libre: una conexión nueva para el siguiente
        const fresh = new Connection();
        this.#all.add(fresh);
        this.#waiters.shift().resolve(fresh);
      }
      return;
    }
    await connection.rollback(); // nada de transacciones a medias para el siguiente
    const next = this.#waiters.shift();
    if (next) next.resolve(connection);
    else this.#idle.push(connection);
  }

  async [Symbol.asyncDispose]() {
    this.#closed = true;
    for (const waiter of this.#waiters.splice(0)) waiter.reject(new Error('el pool se cerró'));
    this.#idle = [];
    await Promise.all([...this.#all].map((connection) => connection.close()));
    this.#all.clear();
  }
}

// ── Los informes ─────────────────────────────────────────────────────────
async function runReport(pool, sql, options) {
  await using connection = await pool.acquire(options); // se devuelve al salir, pase lo que pase
  return await connection.query(sql);
}

async function main() {
  {
    await using pool = new ConnectionPool({ max: 2 });
    const reports = [
      'SELECT ventas por estado',
      'SELECT consulta pesada de devoluciones',
      'SELECT clientes nuevos',
      'SELECT * FROM ventas_2019',
      'SELECT productos agotados',
    ];
    const outcomes = await Promise.allSettled([
      ...reports.map((sql) => runReport(pool, sql)),
      runReport(pool, 'SELECT informe urgente', { signal: AbortSignal.timeout(30) }), // no puede esperar más de 30 ms
    ]);
    const describe = (outcome) => {
      if (outcome.status === 'fulfilled') return `✅ ${outcome.value}`;
      if (outcome.reason.name === 'TimeoutError') return '⛔ TimeoutError: ninguna conexión libre en 30 ms'; // el message varía según el navegador
      return `⛔ ${outcome.reason.message}`;
    };
    outcomes.forEach((outcome, index) => console.log(`  ${reports[index] ?? 'SELECT informe urgente'} → ${describe(outcome)}`));
    console.log('nunca más de 2 conexiones prestadas a la vez →', pool.stats.maxInUse <= 2);
    console.log('todas devueltas, también las de consultas que fallaron →', pool.stats.inUse === 0);
    console.log('conexiones abiertas →', connectionsOpened, '(una se rompió y se reemplazó)');
  } // ← aquí, await using cierra el pool y sus conexiones
  console.log('conexiones cerradas (la rota y, al salir del bloque, las del pool) →', connectionsClosed, 'de', connectionsOpened);
}
main();

// > Desde Python: es un pool de asyncpg o aiomysql: «async with
//   pool.acquire() as connection:» devuelve la conexión al salir del bloque, y
//   «async with pool:» lo cierra todo.
```
