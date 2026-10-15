---
example_description: "Una saga para crear un pedido entre tres servicios (stock, pagos, paquetería): cada paso tiene su plazo y su compensación; si un paso falla, las compensaciones de los pasos ya hechos se ejecutan en orden inverso, se reintentan si fallan y, si no hay manera, el caso queda apuntado para revisión manual"
example_tags: "javascript|profesional|async|saga|compensacion|abortsignal|reintentos"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// CREAR UN PEDIDO ENTRE TRES SERVICIOS, con una SAGA.
//
// Decisiones:
// - No hay una transacción que abarque stock, pagos y paquetería: cada
//   servicio confirma lo suyo. Si un paso falla a mitad, hay que DESHACER lo
//   que ya se hizo con operaciones contrarias (compensaciones): liberar el
//   stock, reembolsar el cobro, cancelar el envío.
// - Las compensaciones se ejecutan en orden INVERSO (como los using del
//   módulo 6) y se reintentan: dejar un cobro sin reembolsar es peor que tardar.
// - Si una compensación falla del todo, no se esconde: el caso queda en una
//   lista de revisión manual.
// - Cada paso tiene su plazo (AbortSignal.timeout): un servicio colgado no
//   deja la saga esperando para siempre.
// - Las compensaciones son idempotentes: reembolsar dos veces el mismo cobro
//   no devuelve el dinero dos veces.
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

class ServiceError extends Error {
  constructor(service, message, { retryable = false } = {}) {
    super(`${service}: ${message}`);
    this.name = 'ServiceError';
    this.retryable = retryable;
  }
}

// ── Los servicios simulados (con un libro de cuentas para comprobar) ───────
const ledger = { reserved: new Map(), charges: new Map(), shipments: new Set() };
const faults = { cardDeclined: false, carrierHangs: false, refundFailures: 0 };

const services = {
  async reserveStock(orderId, items, { signal }) {
    await wait(15, { signal });
    ledger.reserved.set(orderId, items);
    return `R-${orderId}`;
  },
  async releaseStock(orderId) {
    await wait(10);
    ledger.reserved.delete(orderId);
  },
  async charge(orderId, cents, { signal }) {
    await wait(20, { signal });
    if (faults.cardDeclined) throw new ServiceError('pagos', 'tarjeta rechazada');
    ledger.charges.set(orderId, cents);
    return `PAY-${orderId}`;
  },
  async refund(orderId) {
    await wait(10);
    if (faults.refundFailures > 0) {
      faults.refundFailures -= 1;
      throw new ServiceError('pagos', '503 al reembolsar', { retryable: true });
    }
    ledger.charges.delete(orderId); // idempotente: borrar dos veces no cambia nada
  },
  async createShipment(orderId, { signal }) {
    await wait(faults.carrierHangs ? 400 : 25, { signal });
    ledger.shipments.add(orderId);
    return `MX-${orderId}`;
  },
  async cancelShipment(orderId) {
    await wait(10);
    ledger.shipments.delete(orderId);
  },
};

// ── El orquestador ───────────────────────────────────────────────────────
const manualReview = [];

async function withRetries(fn, { attempts = 3, delayMs = 20 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!error.retryable || attempt === attempts) throw error;
      console.log(`    ↻ ${error.message}: reintento ${attempt}`);
      await wait(delayMs);
    }
  }
}

async function runSaga(order, steps) {
  const done = [];
  for (const step of steps) {
    try {
      const result = await step.run(order, { signal: AbortSignal.timeout(step.timeoutMs ?? 100) });
      console.log(`  ✓ ${step.name}${result ? ` → ${result}` : ''}`);
      done.push(step);
    } catch (error) {
      const why = error.name === 'TimeoutError' ? `sin respuesta en ${step.timeoutMs ?? 100} ms` : error.message;
      console.log(`  ✗ ${step.name}: ${why} · compensando ${done.length} paso(s)`);
      for (const completed of done.toReversed()) { // en orden inverso
        try {
          await withRetries(() => completed.compensate(order));
          console.log(`    ↩️ ${completed.undo}`);
        } catch (compensationError) {
          console.log(`    ⚠️ no se pudo ${completed.undoAction}: ${compensationError.message} → revisión manual`);
          manualReview.push({ pedido: order.id, paso: completed.name, motivo: compensationError.message });
        }
      }
      return { ok: false, reason: why };
    }
  }
  return { ok: true };
}

const CHECKOUT = [
  { name: 'reservar stock', undo: 'Stock liberado', undoAction: 'liberar el stock', run: (o, opts) => services.reserveStock(o.id, o.items, opts), compensate: (o) => services.releaseStock(o.id) },
  { name: 'cobrar', undo: 'Cobro reembolsado', undoAction: 'reembolsar el cobro', run: (o, opts) => services.charge(o.id, o.cents, opts), compensate: (o) => services.refund(o.id) },
  { name: 'crear envío', undo: 'Envío cancelado', undoAction: 'cancelar el envío', timeoutMs: 100, run: (o, opts) => services.createShipment(o.id, opts), compensate: (o) => services.cancelShipment(o.id) },
];

async function main() {
  const scenarios = [
    { id: 'P-701', label: 'todo va bien', faults: {} },
    { id: 'P-702', label: 'la tarjeta se rechaza', faults: { cardDeclined: true } },
    { id: 'P-703', label: 'la paquetería no responde; el reembolso falla una vez', faults: { carrierHangs: true, refundFailures: 1 } },
    { id: 'P-704', label: 'la paquetería no responde; el reembolso falla siempre', faults: { carrierHangs: true, refundFailures: 9 } },
  ];
  for (const { id, label, faults: scenarioFaults } of scenarios) {
    Object.assign(faults, { cardDeclined: false, carrierHangs: false, refundFailures: 0 }, scenarioFaults);
    console.log(`▶ ${id}: ${label}`);
    const result = await runSaga({ id, items: ['café de olla', 'cajeta'], cents: 30500 }, CHECKOUT);
    console.log(`  → ${result.ok ? '✅ pedido creado' : `⛔ pedido no creado (${result.reason})`}`);
  }

  console.log('▼ comprobación del libro de cuentas');
  console.log('  stock reservado →', [...ledger.reserved.keys()].join(', ') || '—');
  console.log('  cobros vigentes →', [...ledger.charges.keys()].join(', ') || '—');
  console.log('  envíos vigentes →', [...ledger.shipments].join(', ') || '—');
  console.log('  revisión manual →', manualReview.map((entry) => `${entry.pedido} (${entry.paso})`).join(', ') || '—');
}
main();

// > Desde Python: el mismo patrón se escribe con try/except y una lista de
//   compensaciones; contextlib.AsyncExitStack con callbacks que solo se
//   ejecutan si hubo error es una variante elegante.
```
