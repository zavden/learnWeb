---
example_description: "static: campos y métodos de la propia clase, no de sus instancias; constructores alternativos con new this (el @classmethod de Python) y utilidades (el @staticmethod)"
example_tags: "javascript|python|clases|static|classmethod|staticmethod"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
class Temperature {
  static ABSOLUTE_ZERO = -273.15; // campo estático: propiedad de la CLASE
  static #created = 0;            // también puede ser privado

  #celsius;

  constructor(celsius) {
    if (celsius < Temperature.ABSOLUTE_ZERO) throw new RangeError(`${celsius} °C es imposible`);
    this.#celsius = celsius;
    Temperature.#created += 1;
  }

  // Constructor alternativo: this es la clase sobre la que se llama.
  static fromFahrenheit(fahrenheit) {
    return new this(((fahrenheit - 32) * 5) / 9);
  }

  // Utilidad que no necesita ninguna instancia: sirve como comparador de sort.
  static compare(a, b) {
    return a.celsius - b.celsius;
  }

  static get created() {
    return Temperature.#created;
  }

  get celsius() {
    return this.#celsius;
  }
}

const readings = [new Temperature(24.5), Temperature.fromFahrenheit(212), new Temperature(-3)];
console.log('ordenadas →', readings.sort(Temperature.compare).map((t) => `${t.celsius.toFixed(1)} °C`).join(' < '));
console.log('creadas →', Temperature.created);
console.log('cero absoluto →', Temperature.ABSOLUTE_ZERO);

// Los estáticos están en la función, no en Temperature.prototype: las instancias no los ven.
const first = readings[0];
console.log('first.ABSOLUTE_ZERO →', first.ABSOLUTE_ZERO); // undefined
console.log('first.constructor.ABSOLUTE_ZERO →', first.constructor.ABSOLUTE_ZERO);
console.log('Object.keys(Temperature) →', Object.keys(Temperature)); // los campos sí son enumerables

try {
  new Temperature(-300);
} catch (error) {
  console.warn(`⛔ ${error.name}: ${error.message}`);
}

// > Desde Python:
//   @classmethod def from_fahrenheit(cls, f): return cls((f - 32) * 5 / 9)
//       → static fromFahrenheit(f) { return new this(…) }: this hace de cls.
//   @staticmethod def compare(a, b): …   → static compare(a, b): no usa this.
//   ABSOLUTE_ZERO = -273.15 (atributo de clase) → static ABSOLUTE_ZERO.
//   Diferencia: en Python, reading.ABSOLUTE_ZERO funciona (la instancia busca en
//   su clase); en JavaScript, no (el prototipo de las instancias no es la clase).
```
