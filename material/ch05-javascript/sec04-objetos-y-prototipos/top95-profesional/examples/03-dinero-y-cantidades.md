---
example_description: "Objetos de valor inmutables para dinero y cantidades: monedas únicas por código, importes en unidades mínimas, operaciones que devuelven objetos nuevos, reparto sin perder céntimos, conversiones de unidades y valueOf que impide comparar con < o sumar con +"
example_tags: "javascript|profesional|objetos-de-valor|freeze|dinero|intl"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// DINERO Y CANTIDADES para una tostadora de café que vende a granel en España,
// México y Estados Unidos.
//
// Decisiones:
// - Objetos de VALOR: inmutables (Object.freeze) y comparados por su contenido
//   (equals), no por identidad. Cada operación devuelve un objeto nuevo.
// - El dinero se guarda en unidades mínimas enteras (céntimos; yenes, que no tienen
//   decimales) y se crea a partir de TEXTO ('12.34'): sin coma flotante en ningún paso.
// - Currency usa el paso 4 de new: si la moneda ya existe, la constructora devuelve la
//   guardada, así que hay un único objeto por código y === funciona con monedas.
// - Money se congela solo si new.target es Money: un tipo hijo todavía tendría que
//   añadir sus propiedades después de llamar a Money.call(this, …).
// - Los estáticos (Money.of) usan new this(…): un tipo que herede de Money los hereda.
// - valueOf lanza un TypeError (como hace Temporal): así price + 1 o price < other
//   fallan en lugar de dar resultados absurdos. toString sí funciona, y las
//   plantillas lo usan.
// - Reparto (allocate) por el método del mayor resto: ningún céntimo se pierde ni
//   se inventa.
// - Todo Intl lleva su locale: la salida no depende del navegador.
//
// Alcance: módulos 1-4.

function deepFreeze(value) {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.getOwnPropertyNames(value)) deepFreeze(value[key]);
  return value;
}
function extendPrototype(Type, members) {
  for (const [key, value] of Object.entries(members)) {
    Object.defineProperty(Type.prototype, key, { value, writable: true, enumerable: false, configurable: true });
  }
}

// ── Monedas ─────────────────────────────────────────────────────────────
const CURRENCY_DATA = deepFreeze({
  EUR: { decimals: 2, locale: 'es-ES' },
  MXN: { decimals: 2, locale: 'es-MX' },
  USD: { decimals: 2, locale: 'en-US' },
  JPY: { decimals: 0, locale: 'ja-JP' },
});
const currencyRegistry = new Map();

function Currency(code) {
  if (!new.target) throw new TypeError('Currency se crea con new');
  const key = String(code).toUpperCase();
  if (currencyRegistry.has(key)) return currencyRegistry.get(key); // la ya creada
  if (!Object.hasOwn(CURRENCY_DATA, key)) throw new RangeError(`moneda desconocida: ${code}`);
  this.code = key;
  this.decimals = CURRENCY_DATA[key].decimals;
  this.locale = CURRENCY_DATA[key].locale;
  Object.freeze(this);
  currencyRegistry.set(key, this);
}

// ── Dinero ──────────────────────────────────────────────────────────────
function Money(minor, currency) {
  if (!new.target) throw new TypeError('Money se crea con new');
  if (!Number.isSafeInteger(minor)) throw new RangeError(`Money: ${minor} no es un número entero de unidades mínimas`);
  this.minor = minor;
  this.currency = new Currency(currency.code ?? currency);
  if (new.target === Money) Object.freeze(this);
}

Money.of = function (amount, code) {
  const currency = new Currency(code);
  const text = String(amount).trim();
  const negative = text.startsWith('-');
  const [whole, fraction = '', ...rest] = (negative ? text.slice(1) : text).split('.');
  const isDigits = (part) => [...part].every((char) => char >= '0' && char <= '9');
  if (rest.length > 0 || whole === '' || !isDigits(whole) || !isDigits(fraction)) {
    throw new RangeError(`importe no válido: «${amount}»`);
  }
  if (fraction.length > currency.decimals) {
    throw new RangeError(`${currency.code} admite ${currency.decimals} decimales: «${amount}»`);
  }
  const minor = Number(whole + fraction.padEnd(currency.decimals, '0'));
  return new this(negative ? -minor : minor, currency); // this: Money o un tipo hijo
};

// Redondeo «del banquero»: los .5 exactos van al par más cercano (sin sesgo al sumar mucho).
function roundHalfEven(value) {
  const floor = Math.floor(value);
  const diff = value - floor;
  if (Math.abs(diff - 0.5) < 1e-9) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(value);
}

extendPrototype(Money, {
  assertSameCurrency(other) {
    if (!(other instanceof Money)) throw new TypeError(`se esperaba Money y llegó ${typeof other}`);
    if (other.currency !== this.currency) {
      throw new TypeError(`no se mezclan monedas: ${this.currency.code} y ${other.currency.code}`);
    }
  },
  plus(other) {
    this.assertSameCurrency(other);
    return new Money(this.minor + other.minor, this.currency);
  },
  minus(other) {
    this.assertSameCurrency(other);
    return new Money(this.minor - other.minor, this.currency);
  },
  times(factor) {
    return new Money(roundHalfEven(this.minor * factor), this.currency);
  },
  allocate(ratios) { // importes positivos
    const total = ratios.reduce((sum, ratio) => sum + ratio, 0);
    const exact = ratios.map((ratio) => (this.minor * ratio) / total);
    const shares = exact.map(Math.floor);
    let remainder = this.minor - shares.reduce((sum, share) => sum + share, 0);
    // Las unidades que sobran van a las partes con mayor resto (en empate, a la primera).
    const byRemainder = exact.map((value, index) => index).toSorted((a, b) => (exact[b] - shares[b]) - (exact[a] - shares[a]));
    for (const index of byRemainder) {
      if (remainder === 0) break;
      shares[index] += 1;
      remainder -= 1;
    }
    return shares.map((share) => new Money(share, this.currency));
  },
  equals(other) {
    return other instanceof Money && other.currency === this.currency && other.minor === this.minor;
  },
  compare(other) {
    this.assertSameCurrency(other);
    return Math.sign(this.minor - other.minor);
  },
  format(locale = this.currency.locale) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: this.currency.code })
      .format(this.minor / 10 ** this.currency.decimals);
  },
  toString() {
    return this.format();
  },
  valueOf() {
    throw new TypeError('Money no se convierte a número: usa plus(), compare() o equals()');
  },
  toJSON() {
    const { decimals, code } = this.currency;
    const digits = String(Math.abs(this.minor)).padStart(decimals + 1, '0');
    const amount = decimals ? `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}` : digits;
    return { amount: (this.minor < 0 ? '-' : '') + amount, currency: code };
  },
});

// ── Cantidades ──────────────────────────────────────────────────────────
const UNITS = deepFreeze({
  g: { dimension: 'masa', toBase: 1, intl: 'gram' },
  kg: { dimension: 'masa', toBase: 1000, intl: 'kilogram' },
  oz: { dimension: 'masa', toBase: 28.349523125, intl: 'ounce' },
  lb: { dimension: 'masa', toBase: 453.59237, intl: 'pound' },
  ml: { dimension: 'volumen', toBase: 1, intl: 'milliliter' },
  l: { dimension: 'volumen', toBase: 1000, intl: 'liter' },
});

function Quantity(value, unit) {
  if (!new.target) throw new TypeError('Quantity se crea con new');
  if (!Object.hasOwn(UNITS, unit)) throw new RangeError(`unidad desconocida: ${unit}`);
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`cantidad no válida: ${value}`);
  this.value = value;
  this.unit = unit;
  if (new.target === Quantity) Object.freeze(this);
}
extendPrototype(Quantity, {
  to(unit) {
    const from = UNITS[this.unit];
    const target = UNITS[unit] ?? {};
    if (from.dimension !== target.dimension) throw new TypeError(`no se convierte ${this.unit} en ${unit}`);
    return new Quantity((this.value * from.toBase) / target.toBase, unit);
  },
  plus(other) {
    return new Quantity(this.value + other.to(this.unit).value, this.unit);
  },
  format(locale = 'es-ES') {
    return new Intl.NumberFormat(locale, { style: 'unit', unit: UNITS[this.unit].intl, maximumFractionDigits: 2 }).format(this.value);
  },
  toString() {
    return this.format();
  },
  valueOf() {
    throw new TypeError('Quantity no se convierte a número: usa to() y .value');
  },
});

// ── En la tienda ────────────────────────────────────────────────────────
const attempt = (label, action) => {
  try {
    console.log(`${label} → ${action()}`);
  } catch (error) {
    console.warn(`⛔ ${label} → ${error.name}: ${error.message}`);
  }
};

console.group('Venta a granel');
const pricePerKg = { ES: Money.of('32.00', 'EUR'), MX: Money.of('689.00', 'MXN'), US: Money.of('34.50', 'USD') };
const orders = [['ES', new Quantity(250, 'g')], ['MX', new Quantity(1.5, 'kg')], ['US', new Quantity(12, 'oz')]];
for (const [market, quantity] of orders) {
  const kilos = quantity.to('kg').value;
  const price = pricePerKg[market].times(kilos);
  const inKilos = quantity.unit === 'kg' ? '' : ` (${quantity.to('kg')})`;
  console.log(`${market} · ${quantity}${inKilos} × ${pricePerKg[market]}/kg = ${price}`);
}
const bag = new Quantity(1, 'lb').plus(new Quantity(250, 'g'));
console.log(`1 lb + 250 g → ${bag.format('en-US')} → ${bag.to('kg')}`);
console.groupEnd();

console.group('Sin coma flotante');
console.log('0.1 + 0.2 →', 0.1 + 0.2);
console.log(`Money: 0,10 € + 0,20 € → ${Money.of('0.10', 'EUR').plus(Money.of('0.20', 'EUR'))}`);
console.log(`IVA del 21 % de 19,99 € → ${Money.of('19.99', 'EUR').times(0.21)}`);
console.log(`redondeo del banquero: 1,25 € × 0,1 → ${new Money(125, 'EUR').times(0.1)} · 1,35 € × 0,1 → ${new Money(135, 'EUR').times(0.1)}`);
console.groupEnd();

console.group('Repartos sin perder céntimos');
const dinner = Money.of('100.00', 'EUR');
console.log(`cena de 3 → ${dinner.allocate([1, 1, 1]).join(' + ')}`);
const tips = Money.of('1250.00', 'MXN').allocate([6, 4, 2]); // por horas trabajadas
console.log(`propinas por horas (6/4/2) → ${tips.join(' · ')} (suma ${tips.reduce((sum, tip) => sum.plus(tip))})`);
console.groupEnd();

console.group('Seguridad');
attempt('euros + pesos', () => pricePerKg.ES.plus(pricePerKg.MX));
attempt('precio + 1', () => pricePerKg.ES + 1);
attempt('precio < otro', () => pricePerKg.ES < Money.of('40', 'EUR'));
attempt('compare', () => pricePerKg.ES.compare(Money.of('40', 'EUR')));
attempt("Money.of('1.999', 'EUR')", () => Money.of('1.999', 'EUR'));
attempt("Money.of('1500', 'JPY')", () => Money.of('1500', 'JPY'));
attempt("Money.of('12.5', 'JPY')", () => Money.of('12.5', 'JPY'));
attempt('250 g en litros', () => new Quantity(250, 'g').to('l'));
const price = pricePerKg.ES;
price.minor = 1; // congelado: no hace nada (en silencio, script clásico)
console.log(`congelado → ${price} | ¿isFrozen? ${Object.isFrozen(price)}`);
console.log("misma moneda → new Currency('eur') === new Currency('EUR'):", new Currency('eur') === new Currency('EUR'));
console.log("valor → === :", Money.of('5', 'EUR') === Money.of('5.00', 'EUR'), '| equals:', Money.of('5', 'EUR').equals(Money.of('5.00', 'EUR')));
console.log('JSON →', JSON.stringify({ total: Money.of('-12.05', 'EUR'), yen: Money.of('980', 'JPY') }));
console.groupEnd();
```
