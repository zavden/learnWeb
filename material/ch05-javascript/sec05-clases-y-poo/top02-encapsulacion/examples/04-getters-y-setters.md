---
example_description: "get y set en una clase: viven en el prototipo, validan al asignar, calculan al leer y guardan el dato en un campo privado, sin el setter que se llama a sí mismo"
example_tags: "javascript|python|clases|getters|setters|property|privados"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
class Thermostat {
  #celsius = 21; // el dato real: privado, con otro nombre que el accesor

  // get: se ejecuta al LEER thermostat.celsius (sin paréntesis).
  get celsius() {
    return this.#celsius;
  }

  // set: se ejecuta al ASIGNAR thermostat.celsius = valor. Valida antes de guardar.
  set celsius(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new TypeError(`Temperatura no válida: ${value}`);
    }
    if (value < 5 || value > 30) throw new RangeError(`Fuera de rango (5-30 °C): ${value}`);
    this.#celsius = Math.round(value * 2) / 2; // redondea a medio grado
  }

  // Solo get: una propiedad calculada de solo lectura.
  get fahrenheit() {
    return this.#celsius * 9 / 5 + 32;
  }
}

const livingRoom = new Thermostat();
livingRoom.celsius = 22.3;
console.log('celsius →', livingRoom.celsius, '| fahrenheit →', livingRoom.fahrenheit);

for (const value of [40, 'veinte']) {
  try {
    livingRoom.celsius = value;
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}

// Sin setter, la asignación no hace nada (en un script clásico, en silencio):
livingRoom.fahrenheit = 100;
console.log('fahrenheit tras asignar →', livingRoom.fahrenheit);

// Los accesores viven en el PROTOTIPO, una sola vez, como los métodos:
console.log('descriptor →', Object.getOwnPropertyDescriptor(Thermostat.prototype, 'celsius'));
console.log("¿'celsius' es propia? →", Object.hasOwn(livingRoom, 'celsius')); // false
// 👉 Expande livingRoom y su [[Prototype]]: celsius y fahrenheit aparecen como
//    (...), y al pulsar se ejecuta el getter.

// > Desde Python:
//   @property
//   def celsius(self): return self._celsius
//   @celsius.setter
//   def celsius(self, value): ...
//   Igual que aquí, la property vive en la clase; el dato, en la instancia.
```
