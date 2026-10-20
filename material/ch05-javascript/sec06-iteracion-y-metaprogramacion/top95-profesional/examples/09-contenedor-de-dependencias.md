---
example_description: "Un contenedor de inyección de dependencias con tokens Symbol: vidas singleton, scoped y transient, ámbitos desechables con using que liberan sus servicios en orden inverso, y errores claros para ciclos, tokens sin registrar y dependencias cautivas"
example_tags: "javascript|profesional|symbol|using|symbol-dispose|inyeccion-de-dependencias|patrones"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UN CONTENEDOR DE INYECCIÓN DE DEPENDENCIAS para la caja de una cafetería.
//
// Decisiones:
// - Cada servicio se identifica con un SÍMBOLO (un token). Dos plugins pueden
//   registrar su propio «Logger» sin pisarse, y la descripción del símbolo da
//   mensajes de error legibles. Symbol.for no se usa a propósito: un token es
//   de quien lo crea, no de un registro global.
// - Tres vidas: singleton (uno para toda la app), scoped (uno por ámbito: aquí,
//   por ticket) y transient (uno nuevo en cada resolución).
// - createScope() devuelve un ámbito DESECHABLE: con `using` (Chrome 134+), al
//   salir del bloque se llama a [Symbol.dispose]() de sus servicios en orden
//   inverso a su creación, también si el bloque sale por un error.
// - Errores con contexto: ciclos (A → B → A), tokens sin registrar (y quién los
//   pide) y «dependencias cautivas» (un singleton que retendría para siempre
//   un servicio que debería vivir solo un ámbito).
//
// Alcance: módulos 1-6.

class ContainerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContainerError';
  }
}

const describe = (token) => token.description;

class Container {
  #registrations = new Map(); // token → { deps, factory, lifetime }
  #singletons = new Map();

  register(token, { deps = [], factory, lifetime = 'transient' }) {
    if (typeof token !== 'symbol') throw new TypeError('El token de un servicio debe ser un símbolo');
    this.#registrations.set(token, { deps, factory, lifetime });
    return this;
  }

  resolve(token) {
    return this.#resolve(token, null, []);
  }

  createScope(name) {
    const scope = { instances: new Map(), disposables: [] };
    return {
      resolve: (token) => this.#resolve(token, scope, []),
      [Symbol.dispose]() {
        for (const service of scope.disposables.toReversed()) service[Symbol.dispose]();
        console.log(`  🧹 ámbito «${name}» liberado`);
      },
    };
  }

  #resolve(token, scope, path) {
    const registration = this.#registrations.get(token);
    if (!registration) {
      const requester = path.length > 0 ? ` (lo necesita ${describe(path.at(-1))})` : '';
      throw new ContainerError(`Servicio no registrado: ${describe(token)}${requester}`);
    }
    if (path.includes(token)) throw new ContainerError(`Ciclo: ${[...path, token].map(describe).join(' → ')}`);
    const { deps, factory, lifetime } = registration;
    if (lifetime === 'scoped' && !scope) throw new ContainerError(`${describe(token)} vive en un ámbito: resuélvelo con scope.resolve()`);

    const cache = lifetime === 'singleton' ? this.#singletons : lifetime === 'scoped' ? scope.instances : null;
    if (cache?.has(token)) return cache.get(token);

    const instances = deps.map((dep) => {
      if (lifetime === 'singleton' && this.#registrations.get(dep)?.lifetime === 'scoped') {
        throw new ContainerError(`Dependencia cautiva: ${describe(token)} (singleton) no puede depender de ${describe(dep)} (scoped)`);
      }
      return this.#resolve(dep, lifetime === 'singleton' ? null : scope, [...path, token]);
    });
    const service = factory(...instances);
    cache?.set(token, service);
    if (scope && lifetime !== 'singleton' && typeof service?.[Symbol.dispose] === 'function') scope.disposables.push(service);
    return service;
  }
}

// ── Los servicios de la caja ───────────────────────────────────────────────
const TOKENS = Object.freeze({
  Clock: Symbol('Clock'),
  Logger: Symbol('Logger'),
  Taxes: Symbol('TaxCalculator'),
  Orders: Symbol('OrderRepository'),
  Checkout: Symbol('CheckoutService'),
});

const database = []; // los pedidos confirmados
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function createClock(isoStart) { // reloj simulado: avanza un minuto en cada lectura
  let instant = Date.parse(isoStart);
  return { time: () => new Date((instant += 60_000)).toISOString().slice(11, 16) + ' UTC' };
}

function createOrderRepository(logger) {
  const pending = [];
  let committed = false;
  logger.info('🔓 abre transacción');
  return {
    add(order) {
      pending.push(order);
    },
    commit() {
      database.push(...pending);
      committed = true;
      logger.info(`💾 confirma ${pending.length} pedido(s)`);
    },
    [Symbol.dispose]() {
      if (!committed && pending.length > 0) logger.info(`↩️ deshace ${pending.length} pedido(s)`);
      logger.info('🔒 cierra transacción');
    },
  };
}

function createCheckout(orders, taxes, logger) {
  return {
    pay(ticket, lines, { card }) {
      const subtotal = lines.reduce((sum, line) => sum + line.cents * line.qty, 0);
      const total = taxes.withTax(subtotal);
      orders.add({ ticket, total });
      if (card === 'rechazada') throw new Error(`tarjeta rechazada en ${ticket}`);
      orders.commit();
      logger.info(`✅ ${ticket} cobrado: ${pesos.format(total / 100)}`);
    },
  };
}

const container = new Container()
  .register(TOKENS.Clock, { lifetime: 'singleton', factory: () => createClock('2026-10-13T15:00:00Z') })
  .register(TOKENS.Logger, {
    lifetime: 'singleton',
    deps: [TOKENS.Clock],
    factory: (clock) => ({ info: (text) => console.log(`  📝 ${clock.time()} ${text}`) }),
  })
  .register(TOKENS.Taxes, { lifetime: 'singleton', factory: () => ({ withTax: (cents) => Math.round(cents * 1.16) }) })
  .register(TOKENS.Orders, { lifetime: 'scoped', deps: [TOKENS.Logger], factory: createOrderRepository })
  .register(TOKENS.Checkout, { lifetime: 'transient', deps: [TOKENS.Orders, TOKENS.Taxes, TOKENS.Logger], factory: createCheckout });

const coffeeAndBread = [{ cents: 4500, qty: 2 }, { cents: 1800, qty: 3 }];

console.log('▶ ticket T-501');
{
  using scope = container.createScope('T-501');
  scope.resolve(TOKENS.Checkout).pay('T-501', coffeeAndBread, { card: 'aprobada' });
} // ← aquí se libera el ámbito: la transacción se cierra

console.log('▶ ticket T-502 (la tarjeta falla)');
try {
  using scope = container.createScope('T-502');
  scope.resolve(TOKENS.Checkout).pay('T-502', coffeeAndBread, { card: 'rechazada' });
} catch (error) {
  console.warn(`  ⛔ ${error.message}`); // el ámbito ya se liberó (y deshizo el pedido)
}
console.log('pedidos confirmados →', JSON.stringify(database));

console.log('▶ ¿cuántas instancias hay de cada servicio?');
{
  using first = container.createScope('A');
  using second = container.createScope('B');
  console.table({
    'Logger (singleton)': { 'mismo en un ámbito': first.resolve(TOKENS.Logger) === first.resolve(TOKENS.Logger), 'mismo entre ámbitos': first.resolve(TOKENS.Logger) === second.resolve(TOKENS.Logger) },
    'OrderRepository (scoped)': { 'mismo en un ámbito': first.resolve(TOKENS.Orders) === first.resolve(TOKENS.Orders), 'mismo entre ámbitos': first.resolve(TOKENS.Orders) === second.resolve(TOKENS.Orders) },
    'CheckoutService (transient)': { 'mismo en un ámbito': first.resolve(TOKENS.Checkout) === first.resolve(TOKENS.Checkout), 'mismo entre ámbitos': first.resolve(TOKENS.Checkout) === second.resolve(TOKENS.Checkout) },
  });
} // se liberan B y luego A: orden inverso al de las declaraciones using

console.log('▶ errores de configuración');
const Notifier = Symbol('NotificationService');
const Mailer = Symbol('EmailService');
const Payments = Symbol('PaymentGateway');
const Reports = Symbol('DailyReport');
container
  .register(Notifier, { deps: [Mailer], factory: () => ({}) })
  .register(Mailer, { deps: [Notifier], factory: () => ({}) })
  .register(Reports, { lifetime: 'singleton', deps: [TOKENS.Orders], factory: () => ({}) });
const failing = {
  'ciclo': () => container.resolve(Notifier),
  'token sin registrar': () => container.createScope('C').resolve(Symbol('Refunds')),
  'falta una dependencia': () => {
    const tipJar = Symbol('TipJar');
    container.register(tipJar, { deps: [Payments], factory: () => ({}) });
    return container.resolve(tipJar);
  },
  'dependencia cautiva': () => container.resolve(Reports),
  'scoped desde la raíz': () => container.resolve(TOKENS.Orders),
};
for (const [label, run] of Object.entries(failing)) {
  try {
    run();
  } catch (error) {
    console.warn(`  ⛔ ${label} → ${error.message}`);
  }
}

// Dos plugins con un token «Logger» cada uno: misma descripción, distintos símbolos.
const pluginLogger = Symbol('Logger');
container.register(pluginLogger, { lifetime: 'singleton', factory: () => ({ info: (text) => console.log(`  🔌 plugin: ${text}`) }) });
container.resolve(pluginLogger).info('mi propio logger');
console.log('¿los dos tokens «Logger» son el mismo? →', pluginLogger === TOKENS.Logger, '| descripción →', describe(pluginLogger));
```
