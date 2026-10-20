---
example_description: "Conciliación bancaria de un estudio de diseño: importes en céntimos, comprobación del saldo línea a línea, emparejado con un Map por importe y referencias de 19 cifras con BigInt"
example_tags: "javascript|profesional|dinero|bigint|map|fechas"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// CONCILIACIÓN BANCARIA de octubre de 2026 · Estudio Lumen (diseño gráfico).
//
// Conciliar es comprobar que cada movimiento del banco tiene su apunte en la
// contabilidad y al revés. Decisiones:
// - Importes en CÉNTIMOS enteros: con enteros, === compara importes de forma exacta.
// - Se comprueba el saldo de CADA línea del extracto (saldo anterior + importe): si no
//   cuadra, falta una línea o el extracto está mal copiado.
// - Emparejar: mismo importe y fecha con ±3 días de margen (las transferencias tardan).
//   Un Map importe → apuntes evita recorrer toda la contabilidad por cada movimiento.
// - Las referencias del banco tienen 19 cifras, más que Number.MAX_SAFE_INTEGER (16):
//   se guardan como TEXTO y, para compararlas como números, se usa BigInt.
//
// Alcance: function y las flechas, en «Funciones y ámbito».

const OPENING_BALANCE = '12.430,55';
const STATEMENT = `02/10/2026;TRANSFERENCIA DE ACME IBERIA SL FRA 2026-0141;2.420,00;14.850,55;7203685477580012345
03/10/2026;RECIBO ADOBE SYSTEMS SOFTWARE;-71,39;14.779,16;7203685477580012346
05/10/2026;NOMINA OCTUBRE L. PEREZ;-1.650,00;13.129,16;7203685477580029001
07/10/2026;TRANSF. FRA 2026-0143 HOTEL MIRADOR;968,00;14.097,16;7203685477580031177
09/10/2026;COMISION MANTENIMIENTO CUENTA;-6,00;14.091,16;7203685477580034502
12/10/2026;BIZUM DE MARTA GIL;45,00;14.136,16;7203685477580040010
14/10/2026;RECIBO TELEFONICA DE ESPANA;-58,08;14.078,08;7203685477580041999
16/10/2026;TRANSFERENCIA FRA 2026-0145 BODEGA LAS VIDES;1.210,00;15.388,08;7203685477580045260`;

const LEDGER = [
  { date: '2026-10-01', concept: 'Cobro factura 2026-0141 · Acme Iberia', amountCents: 242000 },
  { date: '2026-10-03', concept: 'Adobe Creative Cloud (octubre)', amountCents: -7139 },
  { date: '2026-10-05', concept: 'Nómina octubre · Laura Pérez', amountCents: -165000 },
  { date: '2026-10-06', concept: 'Cobro factura 2026-0143 · Hotel Mirador', amountCents: 96800 },
  { date: '2026-10-12', concept: 'Cobro factura 2026-0144 · Restaurante Txoko', amountCents: 60500 },
  { date: '2026-10-14', concept: 'Telefónica · fibra y móviles', amountCents: -5808 },
  { date: '2026-10-15', concept: 'Cobro factura 2026-0145 · Bodega Las Vides', amountCents: 121000 },
];
const MAX_DAYS_APART = 3;

// ── Conversión ──────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

// '-1.650,00' → -165000. El extracto del banco siempre trae dos decimales.
function parseCents(text) {
  const euros = Number(text.trim().replaceAll('.', '').replace(',', '.'));
  if (!Number.isFinite(euros)) throw new RangeError(`importe no válido «${text}»`);
  return Math.round(euros * 100);
}

// Fechas de calendario como número de día (medianoche UTC / un día): restar es exacto
// y no depende de la zona horaria de quien ejecute el programa.
function dayFromSpanish(text) {
  const [day, month, year] = text.split('/').map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS; // los meses de Date empiezan en 0
}
function dayFromIso(text) {
  return new Date(text).getTime() / DAY_MS; // 'AAAA-MM-DD' (solo fecha) es medianoche UTC
}

function parseMovement(line, index) {
  const [date, concept, amount, balance, reference] = line.split(';');
  return {
    line: index + 1,
    date,
    day: dayFromSpanish(date),
    concept,
    amountCents: parseCents(amount),
    balanceCents: parseCents(balance),
    reference, // texto: 19 cifras no caben en un number
  };
}

const movements = STATEMENT.split('\n').map((line, index) => parseMovement(line, index));
const entries = LEDGER.map((entry) => ({ ...entry, day: dayFromIso(entry.date) })); // ({ … }): devuelve un objeto

// ── Formatos ────────────────────────────────────────────────────────────

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
const signedMoney = new Intl.NumberFormat('es-ES', {
  style: 'currency', currency: 'EUR', useGrouping: 'always', signDisplay: 'exceptZero',
});
function euros(cents) {
  return money.format(cents / 100);
}
function signed(cents) {
  return signedMoney.format(cents / 100);
}

console.log('CONCILIACIÓN · Estudio Lumen · octubre de 2026');

// ── 1. Referencias: texto y BigInt, nunca Number ────────────────────────

const references = movements.map((movement) => movement.reference);
console.log('🐛 referencias distintas como Number →', new Set(references.map(Number)).size, 'de', references.length);
console.log('✅ referencias distintas como texto →', new Set(references).size, 'de', references.length);
const lastReference = references.reduce((max, reference) => (BigInt(reference) > BigInt(max) ? reference : max));
console.log('última referencia procesada →', lastReference);

// ── 2. El saldo de cada línea debe cuadrar ──────────────────────────────

let expectedBalance = parseCents(OPENING_BALANCE);
for (const movement of movements) {
  expectedBalance += movement.amountCents;
  if (expectedBalance !== movement.balanceCents) {
    console.warn(`Línea ${movement.line} (${movement.date}): el saldo debería ser ${euros(expectedBalance)} y el banco dice ` +
      `${euros(movement.balanceCents)}. Diferencia: ${signed(movement.balanceCents - expectedBalance)}. ¿Falta un movimiento?`);
    expectedBalance = movement.balanceCents; // seguimos con el saldo del banco
  }
}

// ── 3. Emparejar banco ↔ contabilidad ───────────────────────────────────

const byAmount = new Map(); // importe en céntimos → apuntes con ese importe
for (const entry of entries) {
  if (!byAmount.has(entry.amountCents)) byAmount.set(entry.amountCents, []);
  byAmount.get(entry.amountCents).push(entry);
}

const matched = [];
const onlyInBank = [];
const usedEntries = new Set(); // cada apunte se puede emparejar una sola vez
for (const movement of movements) {
  const candidates = byAmount.get(movement.amountCents) ?? [];
  const entry = candidates.find((candidate) =>
    !usedEntries.has(candidate) && Math.abs(candidate.day - movement.day) <= MAX_DAYS_APART);
  if (entry === undefined) {
    onlyInBank.push(movement);
  } else {
    usedEntries.add(entry); // un Set de objetos: compara por referencia, justo lo que queremos
    matched.push({ movement, entry });
  }
}
const onlyInLedger = entries.filter((entry) => !usedEntries.has(entry));

console.group(`Conciliados (${matched.length})`);
for (const { movement, entry } of matched) {
  const delay = movement.day - entry.day;
  const note = delay === 0 ? '' : ` (${delay} ${Math.abs(delay) === 1 ? 'día' : 'días'} de diferencia)`;
  console.log(`✓ ${movement.date} ${signed(movement.amountCents).padStart(12)}  ${entry.concept}${note}`);
}
console.groupEnd();

console.group(`Solo en el banco (${onlyInBank.length}): hay que contabilizarlos`);
for (const movement of onlyInBank) {
  console.log(`+ ${movement.date} ${signed(movement.amountCents).padStart(12)}  ${movement.concept}`);
}
console.groupEnd();

console.group(`Solo en la contabilidad (${onlyInLedger.length}): aún no han llegado al banco`);
for (const entry of onlyInLedger) {
  console.log(`? ${entry.date} ${signed(entry.amountCents).padStart(12)}  ${entry.concept}`);
}
console.groupEnd();

// ── 4. Cuadre final ─────────────────────────────────────────────────────

function total(list) {
  return list.reduce((sum, item) => sum + item.amountCents, 0);
}
const bankBalance = movements.at(-1).balanceCents;
const bookBalance = parseCents(OPENING_BALANCE) + total(entries);
const explained = bookBalance + total(onlyInBank) - total(onlyInLedger);
console.log(`Saldo según el banco:        ${euros(bankBalance).padStart(12)}`);
console.log(`Saldo según la contabilidad: ${euros(bookBalance).padStart(12)}`);
console.log(`Contabilidad ± pendientes:   ${euros(explained).padStart(12)}`);
const gap = bankBalance - explained;
console.log(gap === 0 ? '✅ Todo cuadra.' : `⚠ Queda sin explicar ${signed(gap)}: revisa la línea marcada arriba.`);
```
