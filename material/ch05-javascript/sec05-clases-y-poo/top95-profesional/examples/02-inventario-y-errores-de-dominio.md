---
example_description: "El inventario de un almacén con estado privado, movimientos inmutables creados por fábricas estáticas, reservas atómicas que validan todas las líneas antes de tocar nada y una jerarquía de errores de dominio con code, detalles y cause"
example_tags: "javascript|profesional|clases|privados|errores|inmutabilidad|iterable"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// ALMACÉN DE UNA TOSTADORA DE CAFÉ: entradas, reservas de pedidos, envíos,
// cancelaciones y recuentos físicos, con un historial que nadie puede reescribir.
// - Estado privado (#items, #movements, #reservations): solo los métodos lo cambian.
// - Movimientos inmutables creados por fábricas estáticas con número correlativo.
// - Errores de dominio: una jerarquía con code y detalles; un lote con varios
//   fallos lanza UN error que los contiene a todos, y un CSV mal formado
//   conserva el error original como cause.
// - Operaciones atómicas: se valida todo y, solo si todo es válido, se aplica.

// ── Errores del dominio ───────────────────────────────────────────────
class InventoryError extends Error {
  constructor(message, { code, details = {}, ...options } = {}) {
    super(message, options);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }
}
class UnknownSkuError extends InventoryError {
  constructor(sku) {
    super(`No existe el artículo ${sku}`, { code: 'unknown-sku', details: { sku } });
  }
}
class OutOfStockError extends InventoryError {
  constructor(sku, requested, available) {
    super(`${sku}: se piden ${requested} y hay ${available} disponibles`, { code: 'out-of-stock', details: { sku, requested, available } });
  }
}
class InvalidQuantityError extends InventoryError {
  constructor(quantity) {
    super(`Cantidad no válida: ${quantity}`, { code: 'bad-quantity', details: { quantity } });
  }
}
// Varios errores a la vez (JavaScript trae AggregateError para esto; aquí, uno del dominio).
class BatchError extends InventoryError {
  constructor(message, errors) {
    super(`${message}: ${errors.length} problema(s)`, { code: 'batch', details: { count: errors.length } });
    this.errors = errors;
  }
}

// ── Movimientos: registros inmutables ─────────────────────────────────
class Movement {
  static #next = 1;
  constructor(kind, sku, quantity, reference) {
    this.number = Movement.#next++;
    Object.assign(this, { kind, sku, quantity, reference });
    Object.freeze(this);
  }
  static receipt(sku, quantity, reference) { return new Movement('entrada', sku, quantity, reference); }
  static shipment(sku, quantity, reference) { return new Movement('envío', sku, -quantity, reference); }
  static adjustment(sku, difference, reference) { return new Movement('ajuste', sku, difference, reference); }
}

// ── Un artículo: existencias y reservas ───────────────────────────────
class StockItem {
  #onHand = 0;
  #reserved = 0;
  constructor(sku, name) {
    this.sku = sku;
    this.name = name;
  }
  get onHand() { return this.#onHand; }
  get reserved() { return this.#reserved; }
  get available() { return this.#onHand - this.#reserved; }
  // Solo el almacén llama a estos métodos, y siempre después de validar.
  apply(movement) { this.#onHand += movement.quantity; }
  reserve(quantity) { this.#reserved += quantity; }
  release(quantity) { this.#reserved -= quantity; }
}

const assertQuantity = (quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new InvalidQuantityError(quantity);
};

// ── El almacén ────────────────────────────────────────────────────────
class Warehouse {
  #items = new Map();
  #movements = [];
  #reservations = new Map(); // pedido → líneas reservadas

  register(sku, name) {
    this.#items.set(sku, new StockItem(sku, name));
    return this;
  }
  #item(sku) {
    const item = this.#items.get(sku);
    if (!item) throw new UnknownSkuError(sku);
    return item;
  }
  #record(movement) {
    this.#item(movement.sku).apply(movement);
    this.#movements.push(movement);
  }

  receive(sku, quantity, reference) {
    this.#item(sku);
    assertQuantity(quantity);
    this.#record(Movement.receipt(sku, quantity, reference));
  }

  // Atómica: si UNA línea falla, no se reserva ninguna.
  reserve(orderId, lines) {
    const problems = [];
    for (const { sku, quantity } of lines) {
      try {
        assertQuantity(quantity);
        const item = this.#item(sku);
        if (quantity > item.available) throw new OutOfStockError(sku, quantity, item.available);
      } catch (error) {
        if (!(error instanceof InventoryError)) throw error;
        problems.push(error);
      }
    }
    if (problems.length > 0) throw new BatchError(`El pedido ${orderId} no se puede reservar`, problems);
    for (const { sku, quantity } of lines) this.#item(sku).reserve(quantity);
    this.#reservations.set(orderId, lines);
  }

  ship(orderId) {
    const lines = this.#takeReservation(orderId);
    for (const { sku, quantity } of lines) this.#record(Movement.shipment(sku, quantity, orderId));
  }
  cancel(orderId) {
    this.#takeReservation(orderId);
  }
  #takeReservation(orderId) {
    const lines = this.#reservations.get(orderId);
    if (!lines) throw new InventoryError(`No hay reserva para ${orderId}`, { code: 'no-reservation', details: { orderId } });
    for (const { sku, quantity } of lines) this.#item(sku).release(quantity);
    this.#reservations.delete(orderId);
    return lines;
  }

  // Recuento físico: el sistema se ajusta a lo que hay en la estantería.
  count(sku, counted, reference) {
    const difference = counted - this.#item(sku).onHand;
    if (difference !== 0) this.#record(Movement.adjustment(sku, difference, reference));
    return difference;
  }

  // Carga de un CSV «sku;cantidad;albarán»: un error por línea, con su causa.
  importReceipts(csv) {
    const failures = [];
    for (const [index, line] of csv.trim().split('\n').entries()) {
      try {
        const [sku, quantityText, reference] = line.split(';');
        const quantity = Number(quantityText);
        if (quantityText === undefined || Number.isNaN(quantity)) throw new SyntaxError(`«${line}» no tiene el formato sku;cantidad;albarán`);
        this.receive(sku, quantity, reference);
      } catch (error) {
        failures.push(new InventoryError(`Línea ${index + 1} del CSV`, { code: 'import', cause: error }));
      }
    }
    return failures;
  }

  report() {
    const rows = {};
    for (const item of this.#items.values()) {
      rows[item.sku] = { artículo: item.name, existencias: item.onHand, reservadas: item.reserved, disponibles: item.available };
    }
    return rows;
  }

  // Iterable: recorre el historial sin exponer el array (y sin poder cambiarlo).
  [Symbol.iterator]() {
    const movements = this.#movements;
    let index = 0;
    return { next: () => (index < movements.length ? { value: movements[index++], done: false } : { value: undefined, done: true }) };
  }
}

// ── Una semana en el almacén ──────────────────────────────────────────
const warehouse = new Warehouse()
  .register('CAF-CHIA-500', 'Café de Chiapas 500 g')
  .register('CAF-VERA-250', 'Café de Veracruz 250 g')
  .register('MOL-RUTA-01', 'Molinillo manual Ruta');

const failures = warehouse.importReceipts(`CAF-CHIA-500;40;ALB-1031
CAF-VERA-250;24;ALB-1031
MOL-RUTA-01;cinco;ALB-1032
CAF-OAXA-500;10;ALB-1032
MOL-RUTA-01;6;ALB-1033`);
console.group('Importar entradas');
for (const failure of failures) console.warn(`⛔ ${failure.message} → ${failure.cause.name}: ${failure.cause.message}`);
console.groupEnd();

console.group('Pedidos');
const orders = [
  ['PED-2001', [{ sku: 'CAF-CHIA-500', quantity: 12 }, { sku: 'MOL-RUTA-01', quantity: 2 }]],
  ['PED-2002', [{ sku: 'CAF-CHIA-500', quantity: 30 }, { sku: 'MOL-RUTA-01', quantity: 0 }, { sku: 'TAZ-0001', quantity: 1 }]],
  ['PED-2003', [{ sku: 'CAF-VERA-250', quantity: 24 }]],
];
for (const [orderId, lines] of orders) {
  try {
    warehouse.reserve(orderId, lines);
    console.log(`✅ ${orderId} reservado`);
  } catch (error) {
    if (!(error instanceof BatchError)) throw error;
    console.warn(`⛔ ${error.message}`);
    for (const problem of error.errors) console.warn(`   · [${problem.code}] ${problem.message}`);
  }
}
warehouse.ship('PED-2001');
warehouse.cancel('PED-2003');
console.log('✅ PED-2001 enviado · PED-2003 cancelado');
try {
  warehouse.ship('PED-2003');
} catch (error) {
  console.warn(`⛔ ${error.name} [${error.code}] ${error.message}`, error.details);
}
console.groupEnd();

const difference = warehouse.count('CAF-CHIA-500', 27, 'RECUENTO-OCT');
console.log(`recuento de CAF-CHIA-500 → diferencia ${difference}`);
console.table(warehouse.report());

console.log('historial:');
for (const { number, kind, sku, quantity, reference } of warehouse) {
  console.log(`  #${number} ${kind.padEnd(7)} ${sku.padEnd(13)} ${String(quantity).padStart(4)}  ${reference}`);
}
const [firstMovement] = warehouse;
firstMovement.quantity = 9999; // congelado: el historial no se reescribe
console.log('¿el primer movimiento sigue igual? →', firstMovement.quantity === 40, '| claves del almacén →', Object.keys(warehouse));
```
