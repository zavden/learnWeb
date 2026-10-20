---
example_description: "Lector de CSV exportado de Excel en español: BOM, separador ';', comillas y saltos de línea dentro de campos, columnas tipadas y errores con número de línea"
example_tags: "javascript|profesional|csv|parser|validacion|strings"
example_stage: professional
example_importance: critical
console: true
---

# JavaScript

```javascript
// LECTOR DE CSV de pedidos mayoristas, exportado de Excel en español.
//
// Lo que hace difícil un CSV «de verdad» (y que split(';') no resuelve):
// - Excel en español separa con ';' porque la coma es el separador decimal.
// - Un campo entre comillas puede contener ';', saltos de línea y comillas ("" = ").
// - «CSV UTF-8» de Excel empieza con un BOM (U+FEFF) invisible y usa \r\n (Windows).
// - Cada columna tiene un tipo: fechas dd/mm/aaaa, importes '1.234,56', «sí/no».
//
// El lector recorre el texto carácter a carácter (una pequeña máquina de estados),
// convierte cada columna según un esquema y acumula TODOS los errores de cada fila con
// su número de línea, en lugar de detenerse en el primero.
//
// Alcance: function y las funciones flecha se estudian en «Funciones y ámbito».

const CSV_TEXT = '﻿' + [
  'fecha;cliente;producto;cantidad;precio;pagado;notas',
  '03/10/2026;Panadería La Espiga, S.L.;Café de Colombia 250 g;12;9,90;sí;',
  '03/10/2026;"Bar ""El Rincón""";Taza de cerámica;24;12,50;no;"Entregar por la tarde.\nLlamar antes"',
  '05/10/2026;Hotel Mirador;Cafetera de goteo industrial;1;1.034,90;Sí;',
  '07/10/2026;Cafetería Lúa;Té verde sencha 100 g;30;6,5;si;',
  '31/09/2026;Cafetería Lúa;Rooibos con vainilla 100 g;10;5,90;no;',
  '08/10/2026;;Café de Etiopía 250 g;5;11,90;sí;',
  '09/10/2026;Hotel Mirador;Café de Etiopía 250 g;dos;11.90;tal vez;',
  '10/10/2026;Restaurante Txoko;Té rojo pu-erh 100 g;8;7,25;no;',
  '11/10/2026;Bodega Las Vides;Taza de cerámica;6;12,50',
].join('\r\n');

// ── 1. Texto → filas de celdas (respetando comillas) ────────────────────

function parseCsv(text, separator) {
  const rows = [];
  let cells = [];
  let field = '';
  let inQuotes = false;
  let line = 1;    // línea física actual
  let rowLine = 1; // línea donde empezó la fila (para los mensajes de error)
  const chars = [...text]; // por code points, no por unidades UTF-16

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (inQuotes) {
      if (ch === '"' && chars[i + 1] === '"') {
        field += '"'; // "" dentro de comillas es una comilla literal
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        if (ch === '\n') line++;
        field += ch; // ; y saltos de línea son texto normal aquí dentro
      }
    } else if (ch === '"' && field === '') {
      inQuotes = true;
    } else if (ch === separator) {
      cells.push(field);
      field = '';
    } else if (ch === '\n') {
      cells.push(field);
      rows.push({ line: rowLine, cells });
      cells = [];
      field = '';
      line++;
      rowLine = line;
    } else if (ch !== '\r') { // \r de Windows: se descarta, el \n cierra la fila
      field += ch;
    }
  }
  if (inQuotes) {
    throw new SyntaxError(`comillas sin cerrar en la fila que empieza en la línea ${rowLine}`);
  }
  if (field !== '' || cells.length > 0) {
    cells.push(field);
    rows.push({ line: rowLine, cells });
  }
  return rows;
}

// ── 2. Conversión de cada celda según su tipo ───────────────────────────

const SCHEMA = [
  { column: 'fecha', key: 'date', type: 'date', required: true },
  { column: 'cliente', key: 'customer', type: 'text', required: true },
  { column: 'producto', key: 'product', type: 'text', required: true },
  { column: 'cantidad', key: 'quantity', type: 'integer', required: true },
  { column: 'precio', key: 'priceCents', type: 'money', required: true },
  { column: 'pagado', key: 'paid', type: 'boolean', required: false },
  { column: 'notas', key: 'notes', type: 'text', required: false },
];
const YES = new Set(['si', 'sí', 's', 'x']);
const NO = new Set(['no', 'n', '']);

// 'dd/mm/aaaa' → Date a medianoche UTC (es una fecha de calendario, sin hora).
function parseDate(text) {
  const [day, month, year] = text.split('/').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day)); // los meses de Date van de 0 a 11
  // Date no valida: el 31/09 «se desborda» al 1 de octubre. Si al leerla cambia, no existía.
  if (Number.isNaN(date.getTime()) || date.getUTCDate() !== day || date.getUTCMonth() !== month - 1) {
    throw new RangeError(`«${text}» no es una fecha válida (dd/mm/aaaa)`);
  }
  return date;
}

// '1.034,90' → 103490. Exige grupos de 3 cifras tras cada punto: así '11.90' (punto
// decimal por error) no se convierte en silencio en 1190 €.
function parseMoney(text) {
  const [integerPart, decimals = '', extra] = text.split(',');
  const groups = integerPart.split('.');
  const badGroup = groups.slice(1).some((group) => group.length !== 3);
  const euros = Number(`${groups.join('')}.${decimals || '0'}`);
  if (extra !== undefined || badGroup || decimals.length > 2 || !Number.isFinite(euros) || euros < 0) {
    throw new RangeError(`«${text}» no es un importe válido (formato 1.234,56)`);
  }
  return Math.round(euros * 100);
}

function convert(text, field) {
  const value = text.trim().normalize();
  if (value === '') {
    if (field.required) throw new TypeError('es obligatorio');
    return field.type === 'boolean' ? false : null;
  }
  switch (field.type) {
    case 'text':
      return value;
    case 'date':
      return parseDate(value);
    case 'money':
      return parseMoney(value);
    case 'integer': { // las llaves dan a cada case su propio bloque para sus const
      const number = Number(value);
      if (!Number.isInteger(number) || number < 1) throw new RangeError(`«${value}» no es un entero positivo`);
      return number;
    }
    case 'boolean': {
      const answer = value.toLocaleLowerCase('es');
      if (YES.has(answer)) return true;
      if (NO.has(answer)) return false;
      throw new RangeError(`«${value}» no es «sí» ni «no»`);
    }
    default:
      throw new TypeError(`tipo desconocido en el esquema: ${field.type}`); // fallo del programa
  }
}

// ── 3. Cabecera, filas y errores ────────────────────────────────────────

const rows = parseCsv(CSV_TEXT, ';');
const [header, ...dataRows] = rows;

// 🐛 El BOM se pega al primer nombre de columna: 'fecha' tiene 6 unidades, no 5.
console.log("🐛 primera cabecera →", header.cells[0].length, 'caracteres, el primero es U+' +
  header.cells[0].codePointAt(0).toString(16).toUpperCase());
const columnNames = header.cells.map((name) => name.replace('﻿', '').trim().toLowerCase());
const columnIndex = new Map(columnNames.map((name, index) => [name, index]));
for (const field of SCHEMA) {
  if (!columnIndex.has(field.column)) throw new RangeError(`falta la columna «${field.column}»`);
}

const records = [];
const errors = [];
for (const { line, cells } of dataRows) {
  const record = { line };
  const rowErrors = [];
  for (const field of SCHEMA) {
    const text = cells[columnIndex.get(field.column)] ?? ''; // columnas finales ausentes = vacías
    try {
      record[field.key] = convert(text, field);
    } catch (error) {
      rowErrors.push(`${field.column} ${error.message}`);
    }
  }
  if (rowErrors.length === 0) {
    records.push(record);
  } else {
    errors.push(`línea ${line}: ${rowErrors.join(' · ')}`);
  }
}

// ── 4. Resultado ────────────────────────────────────────────────────────

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const shortDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
console.log(`${dataRows.length} filas → ${records.length} válidas, ${errors.length} con errores`);
console.table(records.map((record) => ({
  línea: record.line,
  fecha: shortDate.format(record.date),
  cliente: record.customer,
  producto: record.product,
  importe: money.format(record.quantity * record.priceCents / 100),
  pagado: record.paid ? 'sí' : 'no',
})));
if (errors.length > 0) {
  console.warn(`Filas rechazadas:\n  ${errors.join('\n  ')}`);
}

const pendingCents = records
  .filter((record) => !record.paid)
  .reduce((sum, record) => sum + record.quantity * record.priceCents, 0);
console.log('Pendiente de cobro →', money.format(pendingCents / 100));
console.log('Nota con salto de línea (línea 3) →', JSON.stringify(records[1].notes));
```
