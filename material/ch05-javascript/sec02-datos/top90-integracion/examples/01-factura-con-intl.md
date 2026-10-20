---
example_description: "Factura de una librería: céntimos enteros, descuentos redondeados, IVA agrupado por tipo con Map.groupBy y fechas e importes con Intl"
example_tags: "javascript|integracion|dinero|intl|map|fechas"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// FACTURA de una librería a un colegio.
// Integra: céntimos enteros y Math.round («Números»), map/reduce y spread («Arrays»,
// «Objetos literales»), Map.groupBy («Map y Set») y Date + Intl («Fechas e Intl»).
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const invoice = {
  number: '2026-0187',
  seller: 'Librería El Aljibe',
  customer: 'CEIP Rosalía de Castro',
  // Fecha de calendario (sin hora): componentes en UTC y formato con timeZone 'UTC'.
  // Ojo: el mes 9 es OCTUBRE (los meses van de 0 a 11).
  issued: new Date(Date.UTC(2026, 9, 30)),
  paymentDays: 30,
  lines: [
    { concept: 'Diccionario escolar', quantity: 25, unitCents: 1895, vatRate: 0.04, discount: 0.05 },
    { concept: 'Atlas de Geografía', quantity: 10, unitCents: 2450, vatRate: 0.04, discount: 0.05 },
    { concept: 'Cuaderno A4 (5 u.)', quantity: 40, unitCents: 635, vatRate: 0.21, discount: 0 },
    { concept: 'Calculadora científica', quantity: 12, unitCents: 1599, vatRate: 0.21, discount: 0.1 },
  ],
};

// Un formateador se crea una vez y se reutiliza. useGrouping: 'always' agrupa también
// los importes de 4 cifras (es-ES no lo hace por defecto) para que la columna se lea bien.
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
const percent = new Intl.NumberFormat('es-ES', { style: 'percent' });
const longDate = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' });

function formatCents(cents) {
  return money.format(cents / 100); // se divide entre 100 SOLO al mostrar
}

// Bruto → descuento (redondeado a céntimos en cuanto aparecen decimales) → base.
function priceLine(line) {
  const grossCents = line.unitCents * line.quantity;
  const discountCents = Math.round(grossCents * line.discount);
  return { ...line, baseCents: grossCents - discountCents }; // copia + campo nuevo
}
const lines = invoice.lines.map((line) => priceLine(line));

// El IVA se calcula sobre la base de CADA tipo (así lo exige una factura española).
const byRate = Map.groupBy(lines, (line) => line.vatRate); // Map: 0.04 → [...], 0.21 → [...]
const vatRows = [];
for (const [rate, group] of byRate) {
  const baseCents = group.reduce((sum, line) => sum + line.baseCents, 0);
  vatRows.push({ rate, baseCents, vatCents: Math.round(baseCents * rate) });
}
const baseCents = vatRows.reduce((sum, row) => sum + row.baseCents, 0);
const vatCents = vatRows.reduce((sum, row) => sum + row.vatCents, 0);

// Vencimiento: COPIA de la fecha y luego setUTCDate (el desbordamiento ajusta el mes).
const due = new Date(invoice.issued);
due.setUTCDate(due.getUTCDate() + invoice.paymentDays);

console.log(`FACTURA ${invoice.number} · ${invoice.seller} → ${invoice.customer}`);
console.log(`Fecha: ${longDate.format(invoice.issued)} · Vence: ${longDate.format(due)}`);
console.log(`${'Concepto'.padEnd(24)}${'Ud.'.padStart(4)}${'Precio'.padStart(11)}${'Dto.'.padStart(6)}${'Base'.padStart(12)}${'IVA'.padStart(6)}`);
for (const { concept, quantity, unitCents, discount, baseCents: lineCents, vatRate } of lines) {
  console.log(
    concept.padEnd(24) + String(quantity).padStart(4) + formatCents(unitCents).padStart(11) +
    (discount > 0 ? percent.format(discount) : '—').padStart(6) +
    formatCents(lineCents).padStart(12) + percent.format(vatRate).padStart(6),
  );
}
console.log('─'.repeat(63));
console.log(`${'Base imponible'.padEnd(45)}${formatCents(baseCents).padStart(12)}`);
for (const row of vatRows) {
  const label = `IVA ${percent.format(row.rate)} sobre ${formatCents(row.baseCents)}`;
  console.log(`${label.padEnd(45)}${formatCents(row.vatCents).padStart(12)}`);
}
console.log(`${'TOTAL'.padEnd(45)}${formatCents(baseCents + vatCents).padStart(12)}`);

// 🐛 Lo mismo en euros, sin redondear cada paso: fracciones de céntimo y ruido binario.
const floatTotal = lines.reduce((sum, line) => sum + line.baseCents / 100 * (1 + line.vatRate), 0);
console.log('🐛 total con decimales →', floatTotal);
console.log('✅ total en céntimos →', baseCents + vatCents);
// Y recuerda: el texto de Intl lleva espacios de no separación (U+00A0) antes del «€».
```
