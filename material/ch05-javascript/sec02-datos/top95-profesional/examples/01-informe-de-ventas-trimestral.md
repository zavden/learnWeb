---
example_description: "Informe trimestral de una tienda online: pedidos en texto validados, agrupación por mes en la zona del negocio, por región y por canal, y cifras con Intl"
example_tags: "javascript|profesional|informe|map|intl|fechas"
example_stage: professional
example_importance: critical
console: true
---

# JavaScript

```javascript
// INFORME DEL 3.er TRIMESTRE de una tienda online de té y café.
//
// Decisiones de diseño:
// - Los pedidos llegan como líneas de texto exportadas del ERP: se validan una a una y
//   las inválidas se apartan con su motivo.
// - Dinero en CÉNTIMOS enteros; Intl solo al mostrar.
// - Los meses se calculan en la zona del NEGOCIO (Europe/Madrid), no en UTC ni en la del
//   navegador: un pedido de las 00:40 del 1 de agosto en Madrid es de agosto, aunque en
//   UTC todavía sea 31 de julio.
// - Diccionarios con Map; agrupaciones con Map.groupBy.
//
// Alcance: function y las funciones flecha se estudian en «Funciones y ámbito».

const ZONE = 'Europe/Madrid';

const CATALOG = new Map([
  ['CAF-ETI', 'Café de Etiopía 250 g'],
  ['CAF-COL', 'Café de Colombia 250 g'],
  ['TE-SEN', 'Té verde sencha 100 g'],
  ['TE-ROO', 'Rooibos con vainilla 100 g'],
  ['TAZ-CER', 'Taza de cerámica'],
  ['MOL-MAN', 'Molinillo manual'],
]);
const STATUSES = new Set(['entregado', 'devuelto', 'cancelado']);

// id | fecha (ISO con desfase) | región | canal | estado | sku:cantidad:precio en céntimos, …
const EXPORT = `P-24011|2026-07-02T09:14:00+02:00|Comunidad de Madrid|web|entregado|CAF-ETI:2:1190,TAZ-CER:1:1250
P-24019|2026-07-05T18:40:00+02:00|Andalucía|app|entregado|TE-SEN:3:650
P-24027|2026-07-09T11:02:00+02:00|Cataluña|marketplace|entregado|MOL-MAN:1:3490,CAF-COL:1:990
P-24035|2026-07-14T20:25:00+02:00|Comunitat Valenciana|web|cancelado|CAF-ETI:1:1190
P-24042|2026-07-19T08:51:00+02:00|Galicia|web|entregado|TE-ROO:2:590,TE-SEN:2:650
P-24050|2026-07-24T13:33:00+02:00|Comunidad de Madrid|app|entregado|CAF-COL:4:990
P-24058|2026-07-28T22:10:00+02:00|País Vasco|web|devuelto|MOL-MAN:1:3490
P-24063|2026-08-01T00:40:00+02:00|Andalucía|web|entregado|CAF-ETI:3:1190,TAZ-CER:2:1250
P-24071|2026-08-04T10:05:00+02:00|Cataluña|app|entregado|TE-SEN:1:650,TE-ROO:1:590
P-24080|2026-08-09T17:48:00+02:00|Comunidad de Madrid|web|entregado|CAF-ETI:2:1190,MOL-MAN:1:3490
P-24086|2026-08-13T09:30:00+02:00|Comunitat Valenciana|marketplace|entregado|CAF-COL:2:990
P-24093|2026-08-18T12:12:00+02:00|Galicia|app|entregado|TAZ-CER:4:1250
P-24101|2026-08-22T19:59:00+02:00|Andalucía|web|cancelado|TE-ROO:3:590
P-24110|2026-08-27T07:45:00+02:00|Comunidad de Madrid|marketplace|entregado|CAF-ETI:1:1190,CAF-COL:1:990
P-24118|2026-09-01T10:20:00+02:00|Cataluña|web|entregado|CAF-ETI:4:1190,TAZ-CER:2:1250
P-24125|2026-09-05T16:05:00+02:00|País Vasco|app|entregado|TE-SEN:2:650,MOL-MAN:1:3490
P-24133|2026-09-09T11:40:00+02:00|Comunidad de Madrid|web|entregado|CAF-COL:3:990,TE-SEN:1:650
P-24140|2026-09-14T21:15:00+02:00|Andalucía|app|devuelto|TAZ-CER:1:1250
P-24147|2026-09-18T09:00:00+02:00|Comunitat Valenciana|web|entregado|CAF-ETI:2:1190,TE-ROO:2:590
P-24155|2026-09-23T13:27:00+02:00|Galicia|marketplace|entregado|MOL-MAN:2:3490
P-24162|2026-09-27T18:38:00+02:00|Comunidad de Madrid|app|entregado|CAF-ETI:3:1190,TAZ-CER:1:1250
P-24170|2026-09-29T10:00:00+02:00|Galicia|web|entregado|CAF-KEN:1:1090
P-24176|2026-09-30T12:00:00+02:00|Cataluña|web|entregado|TE-SEN:0:650
P-24181|2026-09-30T23:50:00+02:00|Cataluña|web|entregado|TE-SEN:4:650,CAF-COL:2:990`;

// ── Lectura y validación ────────────────────────────────────────────────

function parseItem(text) {
  const [sku, quantityText, priceText] = text.split(':');
  const quantity = Number(quantityText);
  const unitCents = Number(priceText);
  if (!CATALOG.has(sku)) throw new RangeError(`producto desconocido «${sku}»`);
  if (!Number.isInteger(quantity) || quantity < 1) throw new RangeError(`cantidad no válida en ${sku} («${quantityText}»)`);
  if (!Number.isInteger(unitCents) || unitCents < 0) throw new RangeError(`precio no válido en ${sku}`);
  return { sku, quantity, unitCents }; // shorthand: { sku: sku, quantity: quantity, … }
}

function parseLine(line) {
  const fields = line.split('|');
  if (fields.length !== 6) {
    throw new RangeError(`se esperaban 6 campos y hay ${fields.length}`);
  }
  const [id, isoDate, region, channel, status, linesText] = fields;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) throw new RangeError(`fecha no válida «${isoDate}»`);
  if (!STATUSES.has(status)) throw new RangeError(`estado desconocido «${status}»`);

  const lines = linesText.split(',').map((item) => parseItem(item));
  const totalCents = lines.reduce((sum, item) => sum + item.quantity * item.unitCents, 0);
  return { id, date, region, channel, status, lines, totalCents };
}

const orders = [];
const rejected = [];
for (const line of EXPORT.split('\n')) {
  try {
    orders.push(parseLine(line));
  } catch (error) {
    rejected.push(`${line.split('|')[0]}: ${error.message}`);
  }
}

// ── Formatos (locale y zona SIEMPRE explícitos) ─────────────────────────

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
const percent = new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 });
// signDisplay: 'exceptZero' añade el «+» a las subidas (y nada al 0).
const growth = new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' });
const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: ZONE });
const utcMonthName = new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' });
function euros(cents) {
  return money.format(cents / 100);
}
function sumCents(list) {
  return list.reduce((sum, order) => sum + order.totalCents, 0);
}

// ── Cálculos ────────────────────────────────────────────────────────────

const byStatus = Map.groupBy(orders, (order) => order.status);
const delivered = byStatus.get('entregado') ?? [];
const returned = byStatus.get('devuelto') ?? [];
const cancelled = byStatus.get('cancelado') ?? [];
const revenueCents = sumCents(delivered);

console.log('INFORME DEL 3.er TRIMESTRE DE 2026 · Té y Café en Casa (tienda online)');
console.log('─'.repeat(64));
if (rejected.length > 0) {
  console.warn(`${rejected.length} líneas apartadas para revisar:\n  ${rejected.join('\n  ')}`);
}
console.log(`Pedidos: ${orders.length} (entregados ${delivered.length}, devueltos ${returned.length}, cancelados ${cancelled.length})`);
console.log(`Facturación neta: ${euros(revenueCents)} (solo pedidos entregados)`);
console.log(`Ticket medio: ${euros(Math.round(revenueCents / delivered.length))}`);
console.log(`Tasa de devolución: ${percent.format(returned.length / (delivered.length + returned.length))}`);

// Por mes, en la zona del negocio. Map.groupBy conserva el orden de aparición.
console.group('Por mes (Europe/Madrid)');
let previousCents = null;
for (const [month, group] of Map.groupBy(delivered, (order) => monthName.format(order.date))) {
  const cents = sumCents(group);
  const change = previousCents === null ? '' : `  ${growth.format((cents - previousCents) / previousCents)}`;
  console.log(`${month.padEnd(12)}${String(group.length).padStart(3)} pedidos ${euros(cents).padStart(12)}${change}`);
  previousCents = cents;
}
console.groupEnd();
const boundary = orders.find((order) => order.id === 'P-24063');
console.log(`🐛 Si agruparas en UTC, ${boundary.id} (${boundary.date.toISOString()}) contaría en ${utcMonthName.format(boundary.date)}, no en ${monthName.format(boundary.date)}.`);

// Por región: tabla con facturación, pedidos y cuota, de mayor a menor.
// ({ … }) entre paréntesis: la flecha devuelve un objeto («Funciones y ámbito»).
const regionRows = [...Map.groupBy(delivered, (order) => order.region)]
  .map(([region, group]) => ({ región: region, pedidos: group.length, cents: sumCents(group) }))
  .toSorted((a, b) => b.cents - a.cents || a.región.localeCompare(b.región, 'es'));
console.table(regionRows.map((row) => ({
  región: row.región,
  pedidos: row.pedidos,
  facturación: euros(row.cents),
  cuota: percent.format(row.cents / revenueCents),
})));

// Por canal, en una sola línea con Intl.ListFormat.
const channelParts = [...Map.groupBy(delivered, (order) => order.channel)]
  .map(([channel, group]) => `${channel} ${percent.format(sumCents(group) / revenueCents)}`);
console.log('Canales:', new Intl.ListFormat('es', { type: 'conjunction' }).format(channelParts));

// Productos más vendidos: un Map como contador sobre todas las líneas (flatMap).
const unitsBySku = new Map();
for (const item of delivered.flatMap((order) => order.lines)) {
  unitsBySku.set(item.sku, (unitsBySku.get(item.sku) ?? 0) + item.quantity);
}
const topProducts = [...unitsBySku]
  .toSorted((a, b) => b[1] - a[1] || CATALOG.get(a[0]).localeCompare(CATALOG.get(b[0]), 'es'))
  .slice(0, 3);
console.log('Más vendidos:');
for (const [position, [sku, units]] of topProducts.entries()) {
  console.log(`  ${position + 1}. ${CATALOG.get(sku)} · ${units} uds.`);
}
```
