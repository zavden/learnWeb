---
example_description: "private es solo una comprobación del verificador (TS2341): en ejecución el campo es una propiedad normal que sale en JSON.stringify, en Object.keys y con (obj as any). El #privado del capítulo 5 sí es privado en ejecución"
example_tags: "typescript|clases|private|campos-privados|encapsulacion|ts2341|ts18013|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
class GiftCard {
  code: string;
  private pin: string; // privado para el VERIFICADOR
  #balance: number; // privado para JAVASCRIPT (capítulo 5)

  constructor(code: string, pin: string, balance: number) {
    this.code = code;
    this.pin = pin;
    this.#balance = balance;
  }

  redeem(pin: string, amount: number): string {
    if (pin !== this.pin) return '⛔ PIN incorrecto';
    this.#balance -= amount;
    return `✅ cobrados $${amount}, quedan $${this.#balance}`;
  }
}

const card = new GiftCard('REGALO-2026', '4821', 500);
console.log(card.redeem('0000', 50));
console.log(card.redeem('4821', 120));

console.log('pin →', card.pin); // ❌ Error TS2341 a propósito: pin es private… y se imprime

// 🐛 En ejecución, private no existe (mira compiled.js): pin es una propiedad más.
console.log('🐛 JSON →', JSON.stringify(card)); // pensado para enviarse por la red…
console.log('🐛 claves →', Object.keys(card));
console.log('🐛 as any →', (card as any).pin); // any apaga el verificador
console.log('🐛 corchetes →', card['pin']); // escape permitido a propósito por TypeScript

// ✅ #balance no aparece en ninguno de esos sitios, y no hay forma de leerlo fuera:
console.log('✅ as any →', (card as any).balance, '| ¿saldo (380) en el JSON? →', JSON.stringify(card).includes('380'));
// card.#balance ni siquiera llega al verificador: es un SyntaxError de JavaScript
// fuera de la clase, y el script entero no se ejecutaría. TypeScript lo marca con
// TS18013 («Property '#balance' is not accessible outside class 'GiftCard'…»).
```
