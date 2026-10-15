---
example_description: "Fábrica de formateadores por mercado (España, México y Estados Unidos): closures con locale, moneda y zona horaria explícitos, instancias de Intl memoizadas y compartidas, fechas relativas y rangos de entrega"
example_tags: "javascript|profesional|intl|closures|memoizacion|fechas"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// FÁBRICA DE FORMATEADORES para las confirmaciones de pedido de una tienda que vende
// en España, México y Estados Unidos.
//
// Decisiones:
// - Un mercado es un objeto de configuración { locale, currency, timeZone, … } y
//   createFormatters(market) devuelve un objeto de FUNCIONES listas para usar: cada
//   una es un closure que recuerda la configuración de su mercado.
// - Crear un objeto Intl cuesta: getIntl lo memoiza por (tipo, locale, opciones) en
//   una caché COMPARTIDA por todos los mercados.
// - Todo lleva locale y timeZone explícitos y «ahora» es un instante fijo: la salida es
//   la misma en cualquier ordenador, esté donde esté.
// - «Mañana» y «hoy» se calculan en días de calendario DE LA ZONA del mercado: a las
//   23:30 en Ciudad de México, en Madrid ya es el día siguiente.
// - Los textos de cada idioma son funciones que reciben los formateadores (plantillas).
//
// Alcance: módulos 1-3 y «Fechas e Intl». new con los constructores de Intl se
// estudia en el módulo «Objetos y prototipos»; aquí basta con saber que crea el objeto.

const NOW = '2026-10-31T05:30:00Z';

// ── Caché de objetos Intl ───────────────────────────────────────────────
const intlCache = new Map();
let intlRequests = 0;
function getIntl(IntlConstructor, locale, options = {}) {
  intlRequests += 1;
  const key = `${IntlConstructor.name}|${locale}|${JSON.stringify(options)}`;
  if (!intlCache.has(key)) intlCache.set(key, new IntlConstructor(locale, options));
  return intlCache.get(key);
}

// ── La fábrica ──────────────────────────────────────────────────────────
function createFormatters({ locale, currency, timeZone, weightUnit = 'kilogram', now = NOW }) {
  // Número de día de calendario de un instante, en la zona del mercado.
  const calendarDay = (iso) => {
    const parts = getIntl(Intl.DateTimeFormat, 'en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(new Date(iso));
    const get = (type) => Number(parts.find((part) => part.type === type).value);
    return Date.UTC(get('year'), get('month') - 1, get('day')) / 86_400_000;
  };

  return {
    money: (cents) => getIntl(Intl.NumberFormat, locale, { style: 'currency', currency }).format(cents / 100),
    percent: (fraction) => getIntl(Intl.NumberFormat, locale, { style: 'percent' }).format(fraction),
    weight: (grams) => {
      const value = weightUnit === 'kilogram' ? grams / 1000 : grams / 453.59237; // libras en EE. UU.
      return getIntl(Intl.NumberFormat, locale, { style: 'unit', unit: weightUnit, maximumFractionDigits: 1 }).format(value);
    },
    dateTime: (iso) =>
      getIntl(Intl.DateTimeFormat, locale, { dateStyle: 'long', timeStyle: 'short', timeZone }).format(new Date(iso)),
    window: (startIso, endIso) =>
      getIntl(Intl.DateTimeFormat, locale, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', timeZone })
        .formatRange(new Date(startIso), new Date(endIso)),
    relativeDay: (iso) =>
      getIntl(Intl.RelativeTimeFormat, locale, { numeric: 'auto' }).format(calendarDay(iso) - calendarDay(now), 'day'),
    list: (items) => getIntl(Intl.ListFormat, locale, { style: 'long', type: 'conjunction' }).format(items),
    items: (count) => getIntl(Intl.PluralRules, locale).select(count), // 'one' | 'other'
  };
}

// ── Mercados y textos ───────────────────────────────────────────────────
const MARKETS = {
  ES: { locale: 'es-ES', currency: 'EUR', timeZone: 'Europe/Madrid', language: 'es' },
  MX: { locale: 'es-MX', currency: 'MXN', timeZone: 'America/Mexico_City', language: 'es' },
  US: { locale: 'en-US', currency: 'USD', timeZone: 'America/New_York', language: 'en', weightUnit: 'pound' },
};

const MESSAGES = {
  es: {
    title: (order) => `Pedido ${order.id} confirmado`,
    placed: (f, order) => `Realizado el ${f.dateTime(order.placedAt)}`,
    summary: (f, order, units) =>
      `${units} ${f.items(units) === 'one' ? 'artículo' : 'artículos'}: ${f.list(order.lines.map((line) => line.name))}`,
    total: (f, gross, discountRate) => `Total ${f.money(gross)} (incluye un ${f.percent(discountRate)} de descuento)`,
    delivery: (f, order) => `Entrega ${f.relativeDay(order.delivery.from)}: ${f.window(order.delivery.from, order.delivery.to)}`,
    parcel: (f, grams) => `Paquete de ${f.weight(grams)}`,
  },
  en: {
    title: (order) => `Order ${order.id} confirmed`,
    placed: (f, order) => `Placed on ${f.dateTime(order.placedAt)}`,
    summary: (f, order, units) =>
      `${units} ${f.items(units) === 'one' ? 'item' : 'items'}: ${f.list(order.lines.map((line) => line.nameEn))}`,
    total: (f, gross, discountRate) => `Total ${f.money(gross)} (${f.percent(discountRate)} discount included)`,
    delivery: (f, order) => `Delivery ${f.relativeDay(order.delivery.from)}: ${f.window(order.delivery.from, order.delivery.to)}`,
    parcel: (f, grams) => `Parcel: ${f.weight(grams)}`,
  },
};

// ── El mismo pedido en tres mercados ────────────────────────────────────
const order = {
  id: 'P-2051',
  placedAt: '2026-10-31T05:10:00Z',
  delivery: { from: '2026-11-01T15:00:00Z', to: '2026-11-01T19:00:00Z' },
  discountRate: 0.15,
  grams: 1850,
  lines: [
    { name: 'tetera de hierro', nameEn: 'cast-iron teapot', qty: 1, cents: { ES: 3450, MX: 72900, US: 3990 } },
    { name: 'té verde sencha', nameEn: 'sencha green tea', qty: 2, cents: { ES: 690, MX: 14500, US: 790 } },
    { name: 'taza de cerámica', nameEn: 'ceramic cup', qty: 2, cents: { ES: 1150, MX: 23900, US: 1290 } },
  ],
};

for (const [code, market] of Object.entries(MARKETS)) {
  const f = createFormatters(market);
  const text = MESSAGES[market.language];
  const units = order.lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = order.lines.reduce((sum, line) => sum + line.cents[code] * line.qty, 0);
  const gross = Math.round(subtotal * (1 - order.discountRate));
  console.log(`▼ ${code} · ${market.timeZone}`);
  console.log(`  ${text.title(order)}`);
  console.log(`  ${text.placed(f, order)}`);
  console.log(`  ${text.summary(f, order, units)}`);
  console.log(`  ${text.total(f, gross, order.discountRate)}`);
  console.log(`  ${text.delivery(f, order)}`);
  console.log(`  ${text.parcel(f, order.grams)}`);
}

// Un formateador derivado por aplicación parcial: el mismo money, con el IVA ya dentro.
const spain = createFormatters(MARKETS.ES);
const withVat = (rate) => (netCents) => spain.money(Math.round(netCents * (1 + rate)));
console.log('IVA general →', [1000, 2490].map(withVat(0.21)).join(' · '));
console.log(`objetos Intl creados: ${intlCache.size} para ${intlRequests} usos`);

// Un día de trabajo: mil importes más con los mismos formateadores. La caché no crece.
Array.from({ length: 1000 }, (_, i) => 1000 + i * 37).forEach((cents) => spain.money(cents));
console.log(`tras 1000 importes más: ${intlCache.size} objetos Intl para ${intlRequests} usos`);
```
