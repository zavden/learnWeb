---
example_description: "Validación con un Proxy: la trampa set comprueba cada asignación (el __setattr__ de Python) y deleteProperty protege los campos obligatorios (__delattr__); una trampa que devuelve false falla en silencio en un script clásico"
example_tags: "javascript|python|proxy|set|deleteproperty|validacion|setattr"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Reglas de una reserva de restaurante: qué campos hay y qué valores valen.
const rules = {
  name: (v) => typeof v === 'string' && v.trim() !== '',
  guests: (v) => Number.isInteger(v) && v >= 1 && v <= 12,
  notes: (v) => typeof v === 'string',
};
const required = ['name', 'guests'];

function validated(target) {
  return new Proxy(target, {
    set(obj, key, value) {
      if (!(key in rules)) throw new TypeError(`Campo desconocido: ${String(key)}`);
      if (!rules[key](value)) throw new RangeError(`Valor no válido para ${key}: ${JSON.stringify(value)}`);
      obj[key] = value;
      return true; // ← obligatorio: «la asignación ha funcionado»
    },
    deleteProperty(obj, key) {
      if (required.includes(key)) throw new TypeError(`No se puede borrar ${key}: es obligatorio`);
      delete obj[key];
      return true;
    },
  });
}

const booking = validated({ name: 'Familia Hernández', guests: 4 });
booking.notes = 'mesa junto a la ventana';
booking.guests = 6;
console.log('reserva →', JSON.stringify(booking));

for (const attempt of [
  () => { booking.guests = 0; },
  () => { booking.guests = '6'; },
  () => { booking.gests = 2; },      // errata: sin el proxy, crearía una propiedad nueva
  () => { delete booking.name; },
]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
delete booking.notes; // opcional: se puede borrar
console.log('reserva →', JSON.stringify(booking));

// 🤔 ¿Y si la trampa devuelve false en vez de lanzar? En un script clásico la
//    asignación se ignora EN SILENCIO; en código estricto (dentro de una clase,
//    o en un módulo) lanza un TypeError genérico. Lanza tú el error, con un
//    mensaje útil, y devuelve true cuando todo va bien.
const silent = new Proxy({ guests: 2 }, { set: () => false });
silent.guests = 99;
console.log('trampa que devuelve false →', silent.guests);

// > Desde Python: set es __setattr__ y deleteProperty es __delattr__; lo que
//   en Python harías con __slots__ (no admitir atributos nuevos) aquí sale
//   de rechazar las claves desconocidas.
```
