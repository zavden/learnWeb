---
example_description: "La máquina expendedora de una estación de metro como máquina de estados: estados y eventos son uniones discriminadas, las monedas una unión de literales numéricos validada desde el sensor, y la transición devuelve una tupla [máquina nueva, mensajes] sin modificar la anterior"
example_tags: "typescript|profesional|maquina-de-estados|uniones-discriminadas|never|tuplas|readonly|tipos-literales"
example_stage: professional
example_importance: important
console: true
---

# TypeScript

```typescript
// ── El modelo ─────────────────────────────────────────────────────────────
type Coin = 1 | 2 | 5 | 10; // monedas aceptadas, en pesos
type ProductCode = 'A1' | 'A2' | 'B1';
type Stock = { readonly A1: number; readonly A2: number; readonly B1: number };

type MachineState =
  | { mode: 'idle' }
  | { mode: 'collecting'; credit: number }
  | { mode: 'out-of-service'; reason: string };

type MachineEvent =
  | { type: 'insert'; coin: Coin }
  | { type: 'select'; code: ProductCode }
  | { type: 'cancel' }
  | { type: 'service'; reason: string }
  | { type: 'restore' };

type Machine = { readonly state: MachineState; readonly stock: Stock };
// Una transición devuelve la máquina nueva y lo que se muestra en la pantalla.
type Step = readonly [next: Machine, messages: readonly string[]];

const PRODUCTS = {
  A1: { name: 'Agua natural 600 ml', price: 15 },
  A2: { name: 'Jugo de mango', price: 18 },
  B1: { name: 'Cacahuates enchilados', price: 12 },
} as const;
const COINS: readonly Coin[] = [10, 5, 2, 1]; // de mayor a menor, para dar el cambio

function assertNever(value: never): never {
  throw new Error(`Caso no previsto: ${JSON.stringify(value)}`);
}

// El sensor mide un número cualquiera: solo algunos son monedas válidas.
const toCoin = (value: number): Coin | null => COINS.find((coin) => coin === value) ?? null;

function changeFor(amount: number): Coin[] {
  const coins: Coin[] = [];
  let rest = amount;
  for (const coin of COINS) {
    while (rest >= coin) {
      coins.push(coin);
      rest -= coin;
    }
  }
  return coins;
}
const describeCoins = (amount: number): string => `$${amount} (${changeFor(amount).join(' + ')})`;

function select(machine: Machine, credit: number, code: ProductCode): Step {
  const product = PRODUCTS[code];
  if (machine.stock[code] === 0) return [machine, [`💬 ${product.name} está agotado`]];
  if (credit < product.price) return [machine, [`💬 faltan $${product.price - credit} para ${product.name}`]];
  const stock: Stock = { ...machine.stock, [code]: machine.stock[code] - 1 };
  const change = credit - product.price;
  return [
    { state: { mode: 'idle' }, stock },
    [`📦 sale ${product.name}${change > 0 ? ` · cambio ${describeCoins(change)}` : ''}`],
  ];
}

// Un caso por estado y, dentro, un caso por evento. Nada se modifica: todo es nuevo.
function transition(machine: Machine, event: MachineEvent): Step {
  const state = machine.state;
  switch (state.mode) {
    case 'out-of-service':
      if (event.type === 'restore') return [{ ...machine, state: { mode: 'idle' } }, ['✅ de vuelta en servicio']];
      if (event.type === 'insert') return [machine, [`↩️ moneda de $${event.coin} devuelta: fuera de servicio`]];
      return [machine, [`⛔ fuera de servicio (${state.reason})`]];
    case 'idle':
      switch (event.type) {
        case 'insert':
          return [{ ...machine, state: { mode: 'collecting', credit: event.coin } }, [`🪙 crédito $${event.coin}`]];
        case 'select':
          return [machine, [`💬 ${PRODUCTS[event.code].name} cuesta $${PRODUCTS[event.code].price}: inserta monedas`]];
        case 'cancel':
        case 'restore':
          return [machine, []];
        case 'service':
          return [{ ...machine, state: { mode: 'out-of-service', reason: event.reason } }, [`🔧 fuera de servicio: ${event.reason}`]];
        default:
          return assertNever(event);
      }
    case 'collecting':
      switch (event.type) {
        case 'insert': {
          const credit = state.credit + event.coin;
          return [{ ...machine, state: { mode: 'collecting', credit } }, [`🪙 crédito $${credit}`]];
        }
        case 'select':
          return select(machine, state.credit, event.code);
        case 'cancel':
          return [{ ...machine, state: { mode: 'idle' } }, [`↩️ devueltos ${describeCoins(state.credit)}`]];
        case 'service':
          return [
            { ...machine, state: { mode: 'out-of-service', reason: event.reason } },
            [`↩️ devueltos ${describeCoins(state.credit)}`, `🔧 fuera de servicio: ${event.reason}`],
          ];
        case 'restore':
          return [machine, []];
        default:
          return assertNever(event);
      }
    default:
      return assertNever(state);
  }
}

// ── Una mañana en la estación ─────────────────────────────────────────────
let machine: Machine = { state: { mode: 'idle' }, stock: { A1: 3, A2: 0, B1: 5 } };

function run(label: string, event: MachineEvent): void {
  const [next, messages] = transition(machine, event);
  machine = next;
  console.log(`${label.padEnd(16)} [${machine.state.mode}] ${messages.join(' · ') || '—'}`);
}

function fromSensor(value: number): void {
  const coin = toCoin(value);
  if (coin === null) console.log(`${`sensor $${value}`.padEnd(16)} [${machine.state.mode}] ↩️ moneda no aceptada`);
  else run(`moneda $${coin}`, { type: 'insert', coin });
}

run('elige B1', { type: 'select', code: 'B1' });
fromSensor(10);
run('elige B1', { type: 'select', code: 'B1' });
fromSensor(20);
fromSensor(5);
run('elige A2', { type: 'select', code: 'A2' });
run('elige B1', { type: 'select', code: 'B1' });
fromSensor(2);
run('mantenimiento', { type: 'service', reason: 'reposición de producto' });
fromSensor(1);
run('fin del servicio', { type: 'restore' });
console.log('existencias →', machine.stock);
```
