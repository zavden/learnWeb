---
example_description: "Solución: guest, nights y nightlyRate son parameter properties, el código de acceso es un #privado asignado en el constructor, total es un getter que sigue a nights y la clase declara implements Priced con describe anotado. Cinco comprobaciones ✓ y ningún error de tipos"
example_tags: "typescript|ejercicio|solucion|clases|parameter-properties|campos-privados|getter|implements"
example_stage: final-solution
example_importance: important
console: true
---

# TypeScript

```typescript
interface Priced {
  readonly total: number;
  describe(currency: 'MXN' | 'USD'): string;
}
const MXN_PER_USD = 18;

class Reservation implements Priced {
  #accessCode: string; // privado de verdad: ni en el JSON ni en Object.keys

  constructor(readonly guest: string, public nights: number, readonly nightlyRate: number, accessCode: string) {
    this.#accessCode = accessCode; // accessCode, sin modificador, es un parámetro normal
  }

  get total(): number { // se calcula al leerlo: sigue a nights
    return this.nights * this.nightlyRate;
  }

  checkIn(code: string): boolean {
    return code === this.#accessCode;
  }

  describe(currency: 'MXN' | 'USD'): string { // implements comprueba, pero no da el tipo
    const amount = currency === 'USD' ? this.total / MXN_PER_USD : this.total;
    return `${this.guest}: ${this.nights} noches · ${amount.toFixed(2)} ${currency}`;
  }
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description: string, actual: unknown, expected: unknown): void {
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const stay = new Reservation('Lucía Méndez', 3, 1450, '7731');
check('el código de acceso no sale en el JSON', JSON.stringify(stay).includes('7731'), false);
check('propiedades propias: guest, nights, nightlyRate', Object.keys(stay).join(', '), 'guest, nights, nightlyRate');
check('checkIn acepta el código correcto', stay.checkIn('7731') && !stay.checkIn('0000'), true);
stay.nights = 4;
check('total sigue a nights', stay.total, 5800);
check('describe en dólares', stay.describe('USD'), 'Lucía Méndez: 4 noches · 322.22 USD');
```
