---
example_description: "Propiedades de acceso: get calcula el valor al leerlo y set valida al asignarlo; sin setter, la asignación se ignora. Es el @property de Python"
example_tags: "javascript|python|objetos|getters|setters|property"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una propiedad de ACCESO no guarda un valor: ejecuta una función al leerla
// (get) o al asignarla (set). Desde fuera se usa como cualquier propiedad.
const thermostat = {
  _celsius: 21, // el dato real; el _ es solo una convención («no lo toques»)

  get celsius() {
    return this._celsius;
  },
  set celsius(value) {
    if (typeof value !== 'number' || value < 5 || value > 30) {
      console.warn(`⚠️ ${value} °C está fuera del rango 5-30: se ignora`);
      return;
    }
    this._celsius = value;
  },

  // Solo get: una propiedad CALCULADA, siempre al día y de solo lectura.
  get fahrenheit() {
    return this._celsius * 9 / 5 + 32;
  },
};

console.log('celsius →', thermostat.celsius);       // sin paréntesis: llama al get
thermostat.celsius = 23.5;                            // llama al set con 23.5
console.log('fahrenheit →', thermostat.fahrenheit);  // 74.3
thermostat.celsius = 80;                              // el set lo rechaza
console.log('celsius →', thermostat.celsius);       // 23.5

// Sin setter, asignar no hace nada (en silencio; en modo estricto, TypeError).
thermostat.fahrenheit = 100;
console.log('fahrenheit tras asignar →', thermostat.fahrenheit); // 74.3

// La consola no ejecuta los getters por su cuenta: los muestra como (...).
// En la consola, (...) es un botón: púlsalo para leer el valor.
console.log('thermostat →', thermostat);

// Su descriptor no tiene value ni writable, sino get y set:
console.log('fahrenheit →', Object.getOwnPropertyDescriptor(thermostat, 'fahrenheit'));

// También se crean con defineProperty (aquí, no enumerable):
Object.defineProperty(thermostat, 'kelvin', {
  get() {
    return this._celsius + 273.15;
  },
});
console.log('kelvin →', thermostat.kelvin); // 296.65

// > Desde Python: es @property (get) y @celsius.setter (set). Diferencia: en
//   Python, asignar a una property sin setter lanza AttributeError; aquí, en un
//   script clásico, se ignora sin avisar.
```
