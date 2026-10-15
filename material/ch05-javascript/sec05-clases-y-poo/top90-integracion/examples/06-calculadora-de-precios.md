---
example_description: "Una calculadora de precios con estrategias: reglas de descuento que heredan de una base abstracta, creadas desde una configuración JSON con un registro estático, una regla escrita como objeto literal (duck typing) y un checkout inmutable"
example_tags: "javascript|integracion|clases|estrategia|fabrica|polimorfismo|duck-typing"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// LA CAJA DE UNA TIENDA DE CAFÉ Y PAN: el precio final depende de reglas que
// cambian cada temporada (configuración JSON), sin tocar el código de la caja.
// Integra: estrategia y fábrica («Patrones de diseño»), clase base abstracta con
// new.target («Herencia con extends»), registro con static privado («Encapsulación»),
// polimorfismo y duck typing («Polimorfismo y protocolos»).
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);
const sumLines = (lines) => lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0);

class PricingRule {
  static #types = new Map();
  static register(type) {
    PricingRule.#types.set(type, this);
  }
  static fromConfig({ type, ...options }) {
    const Type = PricingRule.#types.get(type);
    if (!Type) throw new TypeError(`Regla desconocida: «${type}»`);
    return new Type(options);
  }
  constructor() {
    if (new.target === PricingRule) throw new TypeError('PricingRule es abstracta');
  }
  apply() {
    throw new Error(`${this.constructor.name} debe implementar apply(lines, subtotal)`);
  }
}

class PercentOff extends PricingRule {
  constructor({ category, percent }) {
    super();
    Object.assign(this, { category, percent });
  }
  apply(lines) {
    return Math.round(sumLines(lines.filter((line) => line.category === this.category)) * this.percent / 100);
  }
  describe() {
    return `${this.percent} % en ${this.category}`;
  }
}

class BuyXPayY extends PricingRule {
  constructor({ sku, buy, pay }) {
    super();
    Object.assign(this, { sku, buy, pay });
  }
  apply(lines) {
    const line = lines.find((candidate) => candidate.sku === this.sku);
    if (!line) return 0;
    return Math.floor(line.quantity / this.buy) * (this.buy - this.pay) * line.unitCents;
  }
  describe() {
    return `${this.buy}×${this.pay} en ${this.sku}`;
  }
}

class Coupon extends PricingRule {
  constructor({ code, cents, minimumCents = 0 }) {
    super();
    Object.assign(this, { code, cents, minimumCents });
  }
  apply(lines, subtotal) {
    return subtotal >= this.minimumCents ? this.cents : 0;
  }
  describe() {
    return `cupón ${this.code}`;
  }
}
PercentOff.register('percent-off');
BuyXPayY.register('buy-x-pay-y');
Coupon.register('coupon');

class Checkout {
  #lines;
  #rules;
  constructor(lines, rules = []) {
    this.#lines = Object.freeze(lines.map((line) => Object.freeze({ ...line })));
    this.#rules = Object.freeze([...rules]);
  }
  withRules(rules) {
    return new Checkout(this.#lines, rules); // otro checkout: este no cambia
  }
  breakdown() {
    let remaining = sumLines(this.#lines);
    const rows = { subtotal: { importe: money(remaining) } };
    for (const rule of this.#rules) {
      const discount = Math.min(rule.apply(this.#lines, remaining), remaining); // polimorfismo
      if (discount > 0) rows[rule.describe()] = { importe: money(-discount) };
      remaining -= discount;
    }
    rows.total = { importe: money(remaining) };
    return rows;
  }
}

const cart = new Checkout([
  { sku: 'PAN-CONCHA', name: 'Concha de vainilla', category: 'pan', unitCents: 1800, quantity: 6 },
  { sku: 'CAF-CHIA-500', name: 'Café de Chiapas 500 g', category: 'café', unitCents: 21000, quantity: 1 },
  { sku: 'TAZ-TALAV', name: 'Taza de talavera', category: 'loza', unitCents: 34900, quantity: 2 },
]);

const seasons = {
  'Temporada normal': '[{"type":"percent-off","category":"pan","percent":10}]',
  'El Buen Fin': '[{"type":"buy-x-pay-y","sku":"PAN-CONCHA","buy":3,"pay":2},'
    + '{"type":"percent-off","category":"loza","percent":15},'
    + '{"type":"coupon","code":"BUENFIN150","cents":15000,"minimumCents":80000}]',
};
for (const [season, json] of Object.entries(seasons)) {
  console.log(`▶ ${season}`);
  console.table(cart.withRules(JSON.parse(json).map((config) => PricingRule.fromConfig(config))).breakdown());
}

// Duck typing: una regla puntual no necesita heredar de nada, solo tener apply y describe.
const coffeeTuesday = { describe: () => 'martes de café', apply: (lines) => (lines.some((l) => l.category === 'café') ? 2500 : 0) };
console.log('▶ Martes, con una regla escrita como objeto literal');
console.table(cart.withRules([coffeeTuesday]).breakdown());

// Los tres errores que protegen la caja:
class FreeGift extends PricingRule {} // registrada sin implementar apply
FreeGift.register('free-gift');
const attempts = [
  () => PricingRule.fromConfig({ type: 'two-for-one' }),
  () => new PricingRule(),
  () => cart.withRules([PricingRule.fromConfig({ type: 'free-gift' })]).breakdown(),
];
for (const attempt of attempts) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
```
