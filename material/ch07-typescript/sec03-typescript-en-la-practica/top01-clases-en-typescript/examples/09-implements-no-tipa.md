---
example_description: "implements solo COMPRUEBA que la clase encaja con la interfaz (TS2420 si falta algo); no le da tipos: un parámetro sin anotar sigue siendo any implícito (TS7006) y total('500') concatena en silencio"
example_tags: "typescript|clases|implements|interface|ts7006|ts2420|bug|python"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
interface PaymentMethod {
  label: string;
  total(amount: number): number; // importe + comisión, en pesos
  accepts(currency: 'MXN' | 'USD'): boolean;
}

class CardPayment implements PaymentMethod {
  label = 'Tarjeta';

  total(amount) { // ❌ Error TS7006 a propósito: implements NO le da el tipo number
    return amount + amount * 0.035; // comisión del 3.5 %
  }

  accepts(currency: 'MXN' | 'USD'): boolean {
    return currency === 'MXN' || currency === 'USD';
  }
}

// Esto SÍ lo comprueba implements: que no falte nada.
class CashPayment implements PaymentMethod { // ❌ Error TS2420 a propósito: falta accepts
  label = 'Efectivo en tienda';
  total(amount: number): number {
    return amount;
  }
}

const card = new CardPayment();
console.log('✅ total de 500 →', card.total(500));
// 🐛 total acepta cualquier cosa (amount es any), y el + concatena:
const wrong = card.total('500');
console.log('🐛 total de «500» →', wrong, '|', typeof wrong);

// A través de la interfaz, las llamadas sí se comprueban (method.total('500')
// sería TS2345): quien usa la interfaz está protegido; la clase, no.
const method: PaymentMethod = card;
console.log(`${method.label} → $${method.total(1200).toFixed(2)}`);
console.log('efectivo →', new CashPayment().total(1200));
```
