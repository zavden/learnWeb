---
example_description: "Un objeto de valor inmutable: campos privados sin setters, Object.freeze(this), operaciones que devuelven objetos nuevos y equals por contenido; el @dataclass(frozen=True) de Python, a mano"
example_tags: "javascript|python|patrones|inmutabilidad|objeto-de-valor|freeze|privados"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
class Money {
  #cents;
  #currency;

  constructor(cents, currency) {
    if (!Number.isInteger(cents)) throw new TypeError(`Los centavos deben ser enteros: ${cents}`);
    this.#cents = cents;
    this.#currency = currency;
    Object.freeze(this); // tampoco se le pueden añadir ni cambiar propiedades públicas
  }

  static of(amount, currency = 'MXN') {
    return new Money(Math.round(Number(amount) * 100), currency);
  }

  get cents() {
    return this.#cents;
  }
  get currency() {
    return this.#currency;
  }

  // Ninguna operación cambia this: todas devuelven un Money NUEVO.
  add(other) {
    this.#assertSameCurrency(other);
    return new Money(this.#cents + other.#cents, this.#currency);
  }
  times(factor) {
    return new Money(Math.round(this.#cents * factor), this.#currency);
  }

  equals(other) {
    // Object(x) envuelve los primitivos para que #cents in no lance un error.
    return #cents in Object(other) && this.#cents === other.#cents && this.#currency === other.#currency;
  }

  #assertSameCurrency(other) {
    if (other.#currency !== this.#currency) throw new TypeError(`No se pueden sumar ${this.#currency} y ${other.#currency}`);
  }

  toString() {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: this.#currency }).format(this.#cents / 100);
  }
}

const price = Money.of('249.90');
const shipping = Money.of(99);
const total = price.times(2).add(shipping);

console.log(`precio ${price} · envío ${shipping} · total ${total}`);
console.log('¿price sigue igual? →', `${price}`); // las operaciones no lo tocaron

// Nada lo cambia desde fuera:
price.cents = 1;       // getter sin setter: ignorado (en silencio, en un script clásico)
price.discount = 0.5;  // objeto congelado: no admite propiedades nuevas
console.log('tras «cambiarlo» →', `${price}`, '| discount →', price.discount);

// Igualdad por CONTENIDO con un método (=== sigue siendo identidad):
console.log('equals →', Money.of(10).equals(Money.of('10.00')), '| === →', Money.of(10) === Money.of(10));
try {
  price.add(Money.of(10, 'EUR'));
} catch (error) {
  console.warn(`⛔ ${error.message}`);
}

// > Desde Python: @dataclass(frozen=True) da todo esto de serie (__init__,
//   __eq__ por contenido, error al asignar). Aquí se escribe a mano.
```
