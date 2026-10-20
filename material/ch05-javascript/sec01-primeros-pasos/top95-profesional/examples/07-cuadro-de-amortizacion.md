---
example_description: "Cuadro de amortización de un préstamo (sistema francés): validación de parámetros, céntimos, ajuste de la última cuota y caso de interés cero"
example_tags: "javascript|profesional|finanzas|dinero|bucles|consola"
example_stage: professional
example_importance: useful
console: true
---

# JavaScript

```javascript
// CUADRO DE AMORTIZACIÓN de un préstamo con cuota fija (sistema francés).
//
// cuota = capital · i / (1 − (1 + i) ** −n), con i = interés anual / 12 y n = meses.
//
// Decisiones de diseño:
// - Los importes se redondean a CÉNTIMOS en cada mes, como hace el banco; la
//   última cuota se ajusta para que el capital pendiente quede exactamente en 0.
// - Con interés 0 la fórmula divide entre 0 (daría NaN): ese caso se trata aparte.
// - Los parámetros se validan con mensajes concretos antes de calcular nada.
//
// Alcance: function se estudia en «Funciones y ámbito»; arrays y métodos de string
// (padStart, replace) en «Números, texto y colecciones».

function validateLoan(principal, annualRatePercent, months) {
  // Primero el TIPO (fallo del programa: alguien olvidó convertir), luego el RANGO.
  if (typeof principal !== 'number' || typeof annualRatePercent !== 'number') {
    throw new TypeError(`capital e interés deben ser number (llegó ${typeof principal} y ${typeof annualRatePercent})`);
  }
  // !(x > 0) en lugar de x <= 0: también rechaza NaN, que no es mayor ni menor que nada.
  if (!(principal > 0)) {
    throw new RangeError(`el capital debe ser positivo (recibido: ${principal})`);
  }
  if (!(annualRatePercent >= 0 && annualRatePercent < 100)) {
    throw new RangeError(`el interés debe estar entre 0 y 100 % (recibido: ${annualRatePercent})`);
  }
  if (!Number.isInteger(months) || months < 1 || months > 480) {
    throw new RangeError(`el plazo debe ser de 1 a 480 meses enteros (recibido: ${months})`);
  }
}

// Devuelve las filas del cuadro, con todos los importes en céntimos.
function buildSchedule(principal, annualRatePercent, months) {
  validateLoan(principal, annualRatePercent, months);
  const monthlyRate = annualRatePercent / 100 / 12;
  let balanceCents = Math.round(principal * 100);

  let paymentCents;
  if (monthlyRate === 0) {
    paymentCents = Math.ceil(balanceCents / months);
  } else {
    paymentCents = Math.round(balanceCents * monthlyRate / (1 - (1 + monthlyRate) ** -months));
  }

  const rows = [];
  for (let month = 1; month <= months; month++) {
    const interestCents = Math.round(balanceCents * monthlyRate);
    let principalCents = paymentCents - interestCents;
    // Último mes (o cuota mayor que la deuda): se paga justo lo que queda.
    if (month === months || principalCents > balanceCents) {
      principalCents = balanceCents;
    }
    balanceCents -= principalCents;
    rows.push({
      month: month,
      payment: interestCents + principalCents,
      interest: interestCents,
      principal: principalCents,
      balance: balanceCents,
    });
    if (balanceCents === 0) {
      break;
    }
  }
  return rows;
}

function euros(cents) {
  return (cents / 100).toFixed(2).replace('.', ',');
}

function printSchedule(title, principal, annualRatePercent, months) {
  console.group(title);
  try {
    const rows = buildSchedule(principal, annualRatePercent, months);
    console.log(`${'Mes'.padStart(3)} ${'Cuota'.padStart(10)} ${'Intereses'.padStart(10)} ${'Capital'.padStart(10)} ${'Pendiente'.padStart(11)}`);
    let totalInterest = 0;
    let totalPaid = 0;
    for (const row of rows) {
      totalInterest += row.interest;
      totalPaid += row.payment;
      console.log(
        `${String(row.month).padStart(3)} ${euros(row.payment).padStart(10)} ${euros(row.interest).padStart(10)} ` +
        `${euros(row.principal).padStart(10)} ${euros(row.balance).padStart(11)}`,
      );
    }
    console.log(`Total pagado: ${euros(totalPaid)} € · de ellos, intereses: ${euros(totalInterest)} €`);
  } catch (error) {
    console.log(`❌ ${error.name}: ${error.message}`);
  }
  console.groupEnd();
}

printSchedule('Préstamo de 6.000 € al 6,5 % en 12 meses', 6000, 6.5, 12);
printSchedule('Financiación sin intereses: 999 € en 10 meses', 999, 0, 10);
printSchedule('Datos de un formulario sin convertir', '6000', 6.5, 12);
printSchedule('Plazo con decimales', 6000, 6.5, 12.5);
printSchedule('Interés que no es un número', 6000, NaN, 12);
```
