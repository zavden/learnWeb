---
example_description: "Leer other.#x de un objeto que no es de la clase lanza TypeError, aunque instanceof diga true; #x in obj comprueba la marca sin fallar"
example_tags: "javascript|python|clases|privados|instanceof|in|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
class NaiveMoney {
  #cents;
  constructor(cents) {
    this.#cents = cents;
  }
  get cents() {
    return this.#cents;
  }
  // 🐛 Da por hecho que other es un NaiveMoney.
  equals(other) {
    return this.#cents === other.#cents;
  }
}

const price = new NaiveMoney(1999);
console.log('dos NaiveMoney →', price.equals(new NaiveMoney(1999))); // true

// 🐛 Con un objeto parecido (duck typing), leer other.#cents lanza un error:
try {
  price.equals({ cents: 1999 });
} catch (error) {
  console.log('🐛 objeto parecido →', error.name, '|', error.message);
}

// 🐛 instanceof tampoco basta: solo mira la cadena de prototipos, y un objeto
// creado con Object.create(NaiveMoney.prototype) no pasó por el constructor.
const impostor = Object.create(NaiveMoney.prototype);
console.log('🐛 impostor instanceof NaiveMoney →', impostor instanceof NaiveMoney); // true
try {
  price.equals(impostor);
} catch (error) {
  console.log('🐛 impostor →', error.name, '|', error.message);
}

// ✅ #cents in obj: ¿tiene obj el campo privado #cents de ESTA clase?
// Es una «comprobación de marca» (brand check): solo la pasan los objetos que
// creó el constructor. Solo se puede escribir dentro de la clase.
class Money {
  #cents;
  constructor(cents) {
    this.#cents = cents;
  }
  static isMoney(value) {
    // #x in lanza TypeError con primitivos: primero, que sea un objeto.
    return typeof value === 'object' && value !== null && #cents in value;
  }
  equals(other) {
    return Money.isMoney(other) && this.#cents === other.#cents;
  }
}

const total = new Money(1999);
console.log('✅ dos Money →', total.equals(new Money(1999)));
console.log('✅ objeto parecido →', total.equals({ cents: 1999 }));
console.log('✅ impostor →', total.equals(Object.create(Money.prototype)));
console.log('✅ número →', total.equals(1999));

// > Desde Python: isinstance(x, Money) se parece a instanceof, y comparte su
//   debilidad: no garantiza que __init__ se ejecutara. #cents in x sí lo garantiza.
```
