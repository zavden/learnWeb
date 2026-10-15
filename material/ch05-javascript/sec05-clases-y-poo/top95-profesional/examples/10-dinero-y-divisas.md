---
example_description: "Dinero en varias divisas: monedas únicas creadas en un bloque static, importes en unidades mínimas parseados sin coma flotante, tipos de cambio fechados con su zona horaria, repartos sin perder centavos y formato con Intl en cada idioma"
example_tags: "javascript|profesional|clases|inmutabilidad|static|intl|dinero"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// LA FACTURACIÓN DE UNA DISEÑADORA EN CIUDAD DE MÉXICO con clientes de fuera.
// - Currency: una instancia ÚNICA por código, creada en un bloque static; el
//   constructor solo se puede usar desde dentro (una llave privada).
// - Money: objeto de valor inmutable en unidades mínimas enteras (centavos, yenes,
//   fils). Se crea desde TEXTO, así que nunca pasa por la coma flotante.
// - ExchangeRate: un tipo de cambio fechado con un instante ISO (con Z); se muestra
//   en la zona que se pida, nunca en la del navegador.
// - Symbol.toPrimitive deja usar plantillas y prohíbe + y <: con dinero, mejor
//   plus() y compare(), que comprueban la divisa.

class CurrencyError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'CurrencyError';
    this.code = code;
  }
}

class Currency {
  static #key = Symbol('Currency');
  static #registry = new Map();
  static {
    const table = [
      ['MXN', 2, 'peso mexicano'], ['USD', 2, 'dólar estadounidense'], ['EUR', 2, 'euro'],
      ['JPY', 0, 'yen japonés'], ['CLP', 0, 'peso chileno'], ['KWD', 3, 'dinar kuwaití'],
    ];
    for (const [code, minorUnits, name] of table) Currency.#registry.set(code, new Currency(Currency.#key, code, minorUnits, name));
  }
  static of(code) {
    const currency = Currency.#registry.get(String(code).toUpperCase());
    if (!currency) throw new CurrencyError(`Divisa no admitida: «${code}»`, 'unknown-currency');
    return currency;
  }
  constructor(key, code, minorUnits, name) {
    if (key !== Currency.#key) throw new TypeError('Usa Currency.of(código)');
    Object.assign(this, { code, minorUnits, name });
    Object.freeze(this);
  }
  get factor() { return 10 ** this.minorUnits; }
}

class Money {
  #minor;
  #currency;

  constructor(minor, currency) {
    if (!Number.isSafeInteger(minor)) throw new RangeError(`Las unidades mínimas deben ser enteras: ${minor}`);
    this.#minor = minor;
    this.#currency = currency;
    if (new.target === Money) Object.freeze(this);
  }

  // '2450.5' → 245050 centavos, sin multiplicar decimales.
  static of(text, code) {
    const currency = Currency.of(code);
    const clean = String(text).trim().replaceAll(',', '');
    const negative = clean.startsWith('-');
    const [whole, fraction = '', extra] = (negative ? clean.slice(1) : clean).split('.');
    const isDigits = (part) => [...part].every((ch) => ch >= '0' && ch <= '9');
    if (extra !== undefined || whole === '' || !isDigits(whole) || !isDigits(fraction)) {
      throw new CurrencyError(`«${text}» no es un importe`, 'bad-amount');
    }
    if (fraction.length > currency.minorUnits) {
      throw new CurrencyError(`${currency.code} admite ${currency.minorUnits} decimales («${text}»)`, 'too-many-decimals');
    }
    const minor = Number(whole) * currency.factor + Number(fraction.padEnd(currency.minorUnits, '0') || 0);
    return new Money(negative ? -minor : minor, currency);
  }

  get currency() { return this.#currency; }
  get minor() { return this.#minor; }

  #assertSame(other) {
    if (!(#minor in Object(other))) throw new TypeError('Solo se opera con Money');
    if (other.#currency !== this.#currency) {
      throw new CurrencyError(`No se mezclan ${this.#currency.code} y ${other.#currency.code}: convierte antes`, 'mismatch');
    }
  }
  plus(other) {
    this.#assertSame(other);
    return new Money(this.#minor + other.#minor, this.#currency);
  }
  minus(other) {
    this.#assertSame(other);
    return new Money(this.#minor - other.#minor, this.#currency);
  }
  static compare(a, b) {
    a.#assertSame(b);
    return a.#minor - b.#minor;
  }
  equals(other) {
    return #minor in Object(other) && other.#currency === this.#currency && other.#minor === this.#minor;
  }

  // Reparto por pesos sin perder ni inventar centavos (método del mayor resto).
  allocate(weights) {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const exact = weights.map((weight) => (this.#minor * weight) / total);
    const parts = exact.map(Math.floor);
    let left = this.#minor - parts.reduce((sum, part) => sum + part, 0);
    const byRemainder = exact.map((value, index) => [value - parts[index], index]).sort((a, b) => b[0] - a[0]);
    for (const [, index] of byRemainder) {
      if (left === 0) break;
      parts[index] += 1;
      left -= 1;
    }
    return parts.map((minor) => new Money(minor, this.#currency));
  }

  convert(rate) {
    if (rate.from !== this.#currency) throw new CurrencyError(`El tipo es de ${rate.from.code}, no de ${this.#currency.code}`, 'mismatch');
    const target = rate.to;
    const minor = Math.round((this.#minor / this.#currency.factor) * rate.rate * target.factor);
    return new Money(minor, target);
  }

  format(locale, options = {}) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: this.#currency.code, ...options })
      .format(this.#minor / this.#currency.factor);
  }
  toJSON() {
    const { factor, minorUnits, code } = this.#currency;
    const sign = this.#minor < 0 ? '-' : '';
    const absolute = Math.abs(this.#minor);
    const fraction = minorUnits > 0 ? `.${String(absolute % factor).padStart(minorUnits, '0')}` : '';
    return { amount: `${sign}${Math.floor(absolute / factor)}${fraction}`, currency: code }; // texto: sin coma flotante
  }
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return this.format('es-MX');
    throw new TypeError('Money no se convierte a número: usa plus(), Money.compare() o equals()');
  }
}

class ExchangeRate {
  constructor({ from, to, rate, asOf, source }) {
    const instant = Date.parse(asOf);
    if (!asOf.endsWith('Z') || Number.isNaN(instant)) throw new RangeError(`asOf debe ser un instante ISO en UTC: «${asOf}»`);
    Object.assign(this, { from: Currency.of(from), to: Currency.of(to), rate: Number(rate), asOf: instant, source });
    Object.freeze(this);
  }
  describe(locale, timeZone) {
    const when = new Intl.DateTimeFormat(locale, {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone, timeZoneName: 'short',
    });
    return `1 ${this.from.code} = ${this.rate} ${this.to.code} · ${this.source}, ${when.format(this.asOf)}`;
  }
}

// ── Una factura en dólares, cobrada en pesos y repartida ──────────────
const invoice = Money.of('2,450.00', 'USD');
const usdToMxn = new ExchangeRate({ from: 'USD', to: 'MXN', rate: '18.4215', asOf: '2026-10-12T18:00:00Z', source: 'tipo de cambio del banco' });
const received = invoice.convert(usdToMxn);

console.group('Factura F-2026-087');
console.log(`importe → ${invoice.format('en-US')} (${invoice.format('es-MX', { currencyDisplay: 'code' })})`);
console.log('tipo (CDMX) →', usdToMxn.describe('es-MX', 'America/Mexico_City'));
console.log('tipo (Madrid) →', usdToMxn.describe('es-ES', 'Europe/Madrid'));
console.log(`cobrado → ${received}`);
const fee = Money.of('350.00', 'MXN');
const net = received.minus(fee);
console.log(`comisión bancaria → ${fee} · neto → ${net}`);
const [designer, illustrator, copywriter] = net.allocate([50, 30, 20]);
console.log(`reparto 50/30/20 → ${designer} · ${illustrator} · ${copywriter}`);
console.log('¿suman el neto? →', designer.plus(illustrator).plus(copywriter).equals(net));
console.groupEnd();

console.group('Cada divisa con sus decimales y su idioma');
const samples = [['1234.5', 'EUR', 'de-DE'], ['1234', 'JPY', 'ja-JP'], ['1234', 'CLP', 'es-CL'], ['1234.567', 'KWD', 'es-MX']];
for (const [text, code, locale] of samples) {
  const amount = Money.of(text, code);
  console.log(`${code} en ${locale.padEnd(5)} → ${amount.format(locale)} | JSON ${JSON.stringify(amount)}`);
}
console.groupEnd();

console.log('ordenadas →', [Money.of('99.90', 'MXN'), Money.of('1,200', 'MXN'), Money.of('450', 'MXN')].sort(Money.compare).map(String));
const attempts = [
  () => Money.of('12.345', 'MXN'),
  () => Money.of('doce', 'MXN'),
  () => invoice.plus(received),
  () => invoice + received,
  () => Currency.of('BTC'),
  () => new ExchangeRate({ from: 'USD', to: 'MXN', rate: '18.4', asOf: '2026-10-12 12:00', source: 'x' }),
];
for (const attempt of attempts) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}${error.code ? ` [${error.code}]` : ''}: ${error.message}`);
  }
}
console.log('¿una moneda por código? →', Currency.of('mxn') === Currency.of('MXN'), '| ¿congelado? →', Object.isFrozen(invoice));
```
