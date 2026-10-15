---
example_description: "Ejercicio: una tarjeta de regalo con datos privados, una fábrica estática que valida, errores propios con code y cause, getters de solo lectura, comprobación de marca en las transferencias y un toJSON que enmascara el código"
example_tags: "javascript|ejercicio|clases|privados|static|errores|cause"
exercise: true
exercise_title: "Una tarjeta de regalo"
exercise_instructions: "GiftCardError hereda de Error: su constructor recibe (message, { code, ...options }), pasa options a super y guarda name = 'GiftCardError' y code || Guarda el código y el saldo en los campos privados #code y #balanceCents: Object.keys de una tarjeta debe dar [] || GiftCard.issue(code, pesos) valida antes de crear: código con un formato distinto del de isGiftCode → error 'bad-code'; código ya emitido → 'duplicate'; importe que no es un número mayor que 0 → 'bad-amount'. Guarda los códigos emitidos en un Set estático privado || Añade los getters balance (el saldo con money) y maskedCode ('GC-••••-' más los 4 últimos caracteres), sin setters || redeem(cents): si cents no es un entero mayor que 0, error 'bad-amount'; si supera el saldo, error 'insufficient' con la propiedad missingCents; en los dos casos, sin tocar el saldo || transferTo(other, cents): si other no tiene #balanceCents (compruébalo con #balanceCents in other), error 'not-a-card'; si el redeem falla, lanza un error 'transfer-failed' con el error original como cause || toJSON devuelve { code: maskedCode, balanceCents } || Ejecuta hasta que todas las comprobaciones salgan ✓"
exercise_hints: "En GiftCardError: constructor(message, { code, ...options } = {}) { super(message, options); this.name = 'GiftCardError'; this.code = code; } || Los privados se declaran en el cuerpo de la clase (#code; #balanceCents;) y se usan como this.#code || Dentro de un método estático, los estáticos privados se leen con el nombre de la clase: GiftCard.#issued || #balanceCents in other lanza un TypeError con primitivos: comprueba antes typeof other === 'object' && other !== null || Para la causa: try { this.redeem(cents); } catch (error) { throw new GiftCardError('…', { code: 'transfer-failed', cause: error }); }"
exercise_solution_example: 09-ej-tarjeta-de-regalo-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: las tarjetas de regalo de una cafetería. Completa cada TODO hasta
// que todas las comprobaciones del final salgan ✓.
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

// 'GC-' + dos bloques de 4 letras mayúsculas o dígitos: GC-AB12-7Q2M
function isGiftCode(text) {
  const parts = String(text).split('-');
  const isBlock = (part) => part.length === 4 && [...part].every((ch) => (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9'));
  return parts.length === 3 && parts[0] === 'GC' && isBlock(parts[1]) && isBlock(parts[2]);
}

// TODO 1: name 'GiftCardError', code y options (cause) para super.
class GiftCardError extends Error {}

class GiftCard {
  // TODO 2: campos privados #code y #balanceCents (y un Set estático privado
  //         con los códigos ya emitidos, para el TODO 3).
  constructor(code, cents) {
    this.code = code;
    this.balanceCents = cents;
  }

  // TODO 3: valida el código (bad-code), los repetidos (duplicate) y el importe (bad-amount).
  static issue(code, pesos) {
    return new GiftCard(code, Math.round(pesos * 100));
  }

  // TODO 4: get balance → money(saldo) · get maskedCode → 'GC-••••-' + 4 últimos.

  // TODO 5: valida cents (bad-amount) y el saldo (insufficient, con missingCents).
  redeem(cents) {
    this.balanceCents -= cents;
    return this;
  }

  // TODO 6: comprueba la marca (not-a-card) y envuelve el fallo de redeem (transfer-failed + cause).
  transferTo(other, cents) {
    this.balanceCents -= cents;
    other.balanceCents += cents;
    return this;
  }

  // TODO 7: el código, enmascarado.
  toJSON() {
    return { code: this.code, balanceCents: this.balanceCents };
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
