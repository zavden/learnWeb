---
example_description: "Ejercicio: una clase Reservation escrita a la antigua deja el código de acceso en el JSON, guarda un total que no sigue a las noches y tiene un método sin tipos. Reescríbela con parameter properties, un #privado, un getter e implements Priced"
example_tags: "typescript|ejercicio|clases|parameter-properties|campos-privados|getter|implements|ts7006"
exercise: true
exercise_title: "Una reserva con parameter properties"
exercise_instructions: "Al abrirlo hay un error TS7006 en describe y cuatro de las cinco comprobaciones salen ✗ || Convierte guest, nights y nightlyRate en parameter properties (readonly guest, nights que se pueda cambiar, readonly nightlyRate), sin cambiar el orden de los argumentos del constructor || Cambia el código de acceso por un campo #privado: no debe salir en el JSON ni en Object.keys || Convierte total en un getter, para que siga a nights (un campo con valor inicial que lea los parámetros sería TS2729 y daría NaN) || Declara que la clase implementa Priced y anota el parámetro de describe: implements no se lo da || El objetivo: las cinco comprobaciones ✓ y ningún error de tipos"
exercise_hints: "accessCode sigue siendo un parámetro normal (sin modificador): en el cuerpo del constructor, this.#accessCode = accessCode || Un getter (get total(): number) cumple el readonly total de la interfaz || La comprobación de las propiedades propias espera exactamente guest, nights y nightlyRate, en ese orden"
exercise_solution_example: 09-ej-clase-con-parameter-properties-solucion.md
example_stage: exercise
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

// TODO 1: parameter properties para guest, nights y nightlyRate.
// TODO 2: un #privado para el código de acceso.
// TODO 3: total como getter.
// TODO 4: implements Priced, y el parámetro de describe con su tipo.
class Reservation {
  guest: string;
  nights: number;
  nightlyRate: number;
  private accessCode: string;
  total: number;

  constructor(guest: string, nights: number, nightlyRate: number, accessCode: string) {
    this.guest = guest;
    this.nights = nights;
    this.nightlyRate = nightlyRate;
    this.accessCode = accessCode;
    this.total = nights * nightlyRate;
  }

  checkIn(code: string): boolean {
    return code === this.accessCode;
  }

  describe(currency) {
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
