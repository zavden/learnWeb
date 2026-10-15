---
example_description: "En una clase de TypeScript cada propiedad se declara en el cuerpo con su tipo (con o sin valor inicial, u opcional con ?); el constructor solo puede asignar las que están declaradas, y una errata en el nombre es un error en vez de una propiedad nueva"
example_tags: "typescript|clases|campos|propiedades|opcionales|python"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Cada propiedad se DECLARA en el cuerpo de la clase, con su tipo.
class Reservation {
  guest: string; // sin valor: lo asigna el constructor
  nights: number;
  extras: string[] = []; // con valor inicial: un array nuevo para cada objeto
  notes?: string; // opcional: su tipo es string | undefined

  constructor(guest: string, nights: number) {
    this.guest = guest; // sin la declaración de arriba, esto sería un error (TS2339)
    this.nights = nights;
  }

  addExtra(extra: string): void {
    this.extras.push(extra);
  }

  summary(): string {
    const extras = this.extras.length > 0 ? ` + ${this.extras.join(', ')}` : '';
    const notes = this.notes === undefined ? '' : ` (${this.notes})`;
    return `${this.guest}: ${this.nights} noches${extras}${notes}`;
  }
}

const stay = new Reservation('Lucía Méndez', 3);
stay.addExtra('desayuno');
stay.notes = 'llegada tarde';
console.log(stay.summary());

// stay.nigths = 4 sería TS2551 («Did you mean 'nights'?»). En el JavaScript
// del capítulo 5 habría creado una propiedad nueva, sin ningún aviso.

// Los campos declarados existen aunque no tengan valor (mira compiled.js):
const quick = new Reservation('Iván Soto', 1);
console.log('propias →', Object.keys(quick));
console.log('notes →', quick.notes);
```
