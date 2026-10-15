---
example_description: "Un objeto de valor Quantity para escalar recetas: privados, freeze con new.target, operaciones y with… que devuelven objetos nuevos, equals por contenido y un Symbol.toPrimitive que deja comparar con < pero prohíbe sumar con +"
example_tags: "javascript|integracion|clases|inmutabilidad|objeto-de-valor|symbol-toprimitive|privados"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// CANTIDADES PARA UN RECETARIO: escalar una receta y sumar la lista de la compra.
// Integra: privados, static y #x in («Encapsulación»), Symbol.toPrimitive y la
// falta de sobrecarga de operadores («Polimorfismo y protocolos»), objetos de
// valor inmutables y freeze con new.target («Patrones de diseño»).
const decimals = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });

class Quantity {
  static #units = new Map([
    ['g', { dimension: 'masa', factor: 1 }],
    ['kg', { dimension: 'masa', factor: 1000 }],
    ['ml', { dimension: 'volumen', factor: 1 }],
    ['l', { dimension: 'volumen', factor: 1000 }],
    ['taza', { dimension: 'volumen', factor: 240 }],
    ['cda', { dimension: 'volumen', factor: 15 }],
  ]);
  #amount;
  #unit;

  constructor(amount, unit) {
    if (!Quantity.#units.has(unit)) throw new RangeError(`Unidad desconocida: «${unit}»`);
    if (!Number.isFinite(amount) || amount < 0) throw new RangeError(`Cantidad no válida: ${amount}`);
    this.#amount = amount;
    this.#unit = unit;
    if (new.target === Quantity) Object.freeze(this); // no bloquea a una posible subclase
  }

  static parse(text) {
    const [amount, unit] = text.trim().split(' ');
    return new Quantity(Number(amount.replace(',', '.')), unit); // acepta 1.5 y 1,5
  }

  get amount() { return this.#amount; }
  get unit() { return this.#unit; }
  get dimension() { return Quantity.#units.get(this.#unit).dimension; }
  get #base() { return this.#amount * Quantity.#units.get(this.#unit).factor; } // en g o en ml

  #assertCompatible(other) {
    if (!(#amount in Object(other))) throw new TypeError(`${other} no es una Quantity`);
    if (other.dimension !== this.dimension) throw new TypeError(`No se mezclan ${this.dimension} y ${other.dimension}`);
  }

  // Todas las operaciones devuelven una Quantity NUEVA.
  to(unit) {
    const target = new Quantity(0, unit);
    this.#assertCompatible(target);
    return new Quantity(this.#base / Quantity.#units.get(unit).factor, unit);
  }
  with({ amount = this.#amount, unit = this.#unit } = {}) {
    return new Quantity(amount, unit); // cambia un dato sin convertir el otro
  }
  plus(other) {
    this.#assertCompatible(other);
    return this.with({ amount: this.#amount + other.to(this.#unit).amount });
  }
  times(factor) {
    return this.with({ amount: this.#amount * factor });
  }
  equals(other) {
    return #amount in Object(other) && other.dimension === this.dimension && Math.abs(this.#base - other.#base) < 1e-9;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.#base; // < y > comparan en g o ml
    if (hint === 'string') return `${decimals.format(this.#amount)} ${this.#unit}`;
    throw new TypeError('Quantity no se suma con + ni se compara con ==: usa plus() o equals()');
  }
}

// Una receta para 4 personas, escalada a 10 (otra receta: la original no cambia).
const moleFor4 = new Map([
  ['chile ancho', Quantity.parse('120 g')],
  ['chocolate de mesa', Quantity.parse('90 g')],
  ['caldo de pollo', Quantity.parse('1.5 l')],
  ['ajonjolí', Quantity.parse('3 cda')],
]);
const scale = (recipe, factor) => new Map([...recipe].map(([name, quantity]) => [name, quantity.times(factor)]));
const moleFor10 = scale(moleFor4, 10 / 4);
for (const [name, quantity] of moleFor10) console.log(`  ${name}: ${quantity} (eran ${moleFor4.get(name)})`);

// Lista de la compra: el mismo ingrediente en dos recetas, en unidades distintas.
const tamales = new Map([['caldo de pollo', Quantity.parse('2 taza')], ['chile ancho', Quantity.parse('0.05 kg')]]);
for (const name of ['caldo de pollo', 'chile ancho']) {
  console.log(`🛒 ${name}: ${moleFor10.get(name).plus(tamales.get(name))}`);
}

const cup = Quantity.parse('1 taza');
console.log('1 taza en ml →', `${cup.to('ml')}`, '| ¿igual a 240 ml? →', cup.equals(Quantity.parse('240 ml')), '| === →', cup === cup.to('taza'));
console.log('¿1 taza > 200 ml? →', cup > Quantity.parse('200 ml'));
console.log('ordenadas →', [Quantity.parse('1 l'), cup, Quantity.parse('3 cda')].sort((a, b) => a - b).map(String));

for (const attempt of [() => cup + cup, () => cup.plus(Quantity.parse('100 g')), () => Quantity.parse('2 pizcas')]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
cup.amount = 99; // getter sin setter, y objeto congelado
console.log('cup sigue siendo →', `${cup}`, '| ¿congelada? →', Object.isFrozen(cup));
```
