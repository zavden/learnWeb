---
example_description: "JavaScript no tiene argumentos por nombre: un constructor que recibe un objeto de opciones desestructurado con valores por defecto hace el papel de los keyword arguments de Python"
example_tags: "javascript|python|clases|constructor|desestructuracion|valores-por-defecto"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Con argumentos posicionales, la llamada no se entiende y el orden importa:
class RawBooking {
  constructor(guest, nights, breakfast, pets, notes) {
    Object.assign(this, { guest, nights, breakfast, pets, notes });
  }
}
console.log('posicional →', new RawBooking('Carmen Vidal', 3, false, true));
// ¿false es el desayuno o las mascotas? Hay que ir a mirar la clase.

// ✅ Un objeto de opciones desestructurado en los parámetros, con valores por defecto.
class Booking {
  constructor({ guest, nights = 1, breakfast = false, pets = false, notes = '' } = {}) {
    if (!guest) throw new TypeError('Booking: falta guest');
    this.guest = guest;
    this.nights = nights;
    this.breakfast = breakfast;
    this.pets = pets;
    this.notes = notes;
  }
  describe() {
    const extras = [this.breakfast && 'desayuno', this.pets && 'mascota'].filter(Boolean);
    return `${this.guest}: ${this.nights} noche(s)${extras.length ? ` con ${extras.join(' y ')}` : ''}`;
  }
}

// Las opciones se nombran, en cualquier orden, y las que faltan toman su valor por defecto.
const stay = new Booking({ guest: 'Carmen Vidal', pets: true, nights: 3 });
console.log('con opciones →', stay);
console.log(stay.describe());
console.log(new Booking({ guest: 'Iker Salas', breakfast: true }).describe());

// El «= {}» final permite llamar sin argumentos: la desestructuración no falla
// y el constructor puede dar un error con un mensaje claro.
try {
  new Booking();
} catch (error) {
  console.warn(`⛔ ${error.name}: ${error.message}`);
}

// > Desde Python: Booking(guest="Carmen Vidal", pets=True, nights=3), con
//   argumentos por nombre y valores por defecto en __init__ (o una dataclass).
//   JavaScript no tiene argumentos por nombre: el objeto de opciones es el
//   equivalente habitual.
```
