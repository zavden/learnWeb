---
example_description: "Solución: GiftCardError con code y cause, campos privados, una fábrica estática con un Set privado de códigos emitidos, getters de solo lectura, comprobación de marca y un fallo envuelto con cause"
example_tags: "javascript|solucion|clases|privados|static|errores|cause"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: las tarjetas de regalo de una cafetería.
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

// 'GC-' + dos bloques de 4 letras mayúsculas o dígitos: GC-AB12-7Q2M
function isGiftCode(text) {
  const parts = String(text).split('-');
  const isBlock = (part) => part.length === 4 && [...part].every((ch) => (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9'));
  return parts.length === 3 && parts[0] === 'GC' && isBlock(parts[1]) && isBlock(parts[2]);
}

class GiftCardError extends Error {
  constructor(message, { code, ...options } = {}) {
    super(message, options); // options puede traer cause
    this.name = 'GiftCardError';
    this.code = code;
  }
}

class GiftCard {
  static #issued = new Set();
  #code;
  #balanceCents;

  constructor(code, cents) {
    this.#code = code;
    this.#balanceCents = cents;
  }

  static issue(code, pesos) {
    if (!isGiftCode(code)) throw new GiftCardError(`Código mal formado: «${code}»`, { code: 'bad-code' });
    if (GiftCard.#issued.has(code)) throw new GiftCardError(`El código ${code} ya existe`, { code: 'duplicate' });
    const cents = Math.round(Number(pesos) * 100);
    if (!(cents > 0)) throw new GiftCardError(`Importe no válido: ${pesos}`, { code: 'bad-amount' });
    GiftCard.#issued.add(code);
    return new GiftCard(code, cents);
  }

  get balance() {
    return money(this.#balanceCents);
  }

  get maskedCode() {
    return `GC-••••-${this.#code.slice(-4)}`;
  }

  redeem(cents) {
    if (!Number.isInteger(cents) || cents <= 0) throw new GiftCardError(`Importe no válido: ${cents}`, { code: 'bad-amount' });
    if (cents > this.#balanceCents) {
      const error = new GiftCardError(`Saldo insuficiente en ${this.maskedCode}`, { code: 'insufficient' });
      error.missingCents = cents - this.#balanceCents;
      throw error;
    }
    this.#balanceCents -= cents;
    return this;
  }

  transferTo(other, cents) {
    if (typeof other !== 'object' || other === null || !(#balanceCents in other)) {
      throw new GiftCardError('El destino no es una tarjeta de regalo', { code: 'not-a-card' });
    }
    try {
      this.redeem(cents);
    } catch (error) {
      throw new GiftCardError(`Transferencia cancelada desde ${this.maskedCode}`, { code: 'transfer-failed', cause: error });
    }
    other.#balanceCents += cents; // privado de OTRA tarjeta: permitido dentro de la clase
    return this;
  }

  toJSON() {
    return { code: this.maskedCode, balanceCents: this.#balanceCents };
  }
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Ejecuta fn y devuelve el error que lanza (o null si no lanza ninguno).
function caught(fn) {
  try {
    fn();
    return null;
  } catch (error) {
    return error;
  }
}

const card = GiftCard.issue('GC-AB12-7Q2M', 500);
const other = GiftCard.issue('GC-CAFE-2026', 0.5);
const badCode = caught(() => GiftCard.issue('GC-12', 100));
const tooMuch = caught(() => card.redeem(60000));
const failedTransfer = caught(() => card.transferTo(other, 99999));

check('saldo inicial', card.balance, '$500.00');
check('nada público', JSON.stringify(Object.keys(card)), '[]');
check('código enmascarado', card.maskedCode, 'GC-••••-7Q2M');
check('error propio', `${badCode?.name} ${badCode instanceof Error}`, 'GiftCardError true');
check('código mal formado', badCode?.code, 'bad-code');
check('código repetido', caught(() => GiftCard.issue('GC-AB12-7Q2M', 100))?.code, 'duplicate');
check('importe no válido al emitir', caught(() => GiftCard.issue('GC-ZZZZ-0001', -5))?.code, 'bad-amount');
check('canjear 0 centavos', caught(() => card.redeem(0))?.code, 'bad-amount');
check('canjear de más', `${tooMuch?.code} ${tooMuch?.missingCents}`, 'insufficient 10000');
check('transferir a un objeto parecido', caught(() => card.transferTo({ balanceCents: 0 }, 100))?.code, 'not-a-card');
check('transferencia fallida con causa', `${failedTransfer?.code} ← ${failedTransfer?.cause?.code}`, 'transfer-failed ← insufficient');
check('el saldo no cambió tras los errores', card.balance, '$500.00');
card.transferTo(other, 15000);
check('transferencia', `${card.balance} ${other.balance}`, '$350.00 $150.50');
card.balance = '$1,000,000.00';
check('balance es de solo lectura', card.balance, '$350.00');
check('JSON', JSON.stringify(card), '{"code":"GC-••••-7Q2M","balanceCents":35000}');
```
