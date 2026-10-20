// WORKER DEL EJEMPLO 12 (de módulo): la hoja vive aquí; la página solo pinta valores.
// Protocolo (cada respuesta lleva el id de su petición; un solo worker: llegan en orden):
//   { id, type: 'open' }                  → { id, type: 'snapshot', columns, rows, cells, formulas }
//   { id, type: 'set', ref, input }       → { id, type: 'patch', values, inputs, recalculated, cyclic, formulas, ms }
//   { id, type: 'recalculate-all' }       → { id, type: 'patch', … }
//   { id, type: 'goal-seek', months }     → { id, type: 'patch', …, goal: { months, iterations } }
//   { id, type: 'dependents', refs }      → { id, type: 'dependents', counts }
// Un parche lleva solo las celdas recalculadas: [ref, valor], nunca la hoja entera.
import { Sheet } from './sheet.js';

const COLUMNS = 6;      // A-F
const FIRST_ROW = 12;   // la primera fila de la tabla de pagos
const MONTHS = 240;     // 20 años
const LAST_ROW = FIRST_ROW + MONTHS - 1;

// La hoja «guardada»: [celda, lo escrito, formato]. El formato es cosa de la página.
function mortgageTemplate() {
  const cells = [
    ['A1', 'Crédito hipotecario', 'title'],
    ['A2', 'Precio de la vivienda'], ['B2', '2500000', 'money'],
    ['A3', 'Enganche (%)'], ['B3', '20'],
    ['A4', 'Monto del crédito'], ['B4', '=B2*(1-B3/100)', 'money'],
    ['A5', 'Tasa anual (%)'], ['B5', '10.5'],
    ['A6', 'Plazo (meses)'], ['B6', String(MONTHS), 'integer'],
    ['A7', 'Pago mensual'], ['B7', '=REDONDEAR(-PAGO(B5/1200, B6, B4), 2)', 'money'],
    ['A8', 'Pago extra al mes'], ['B8', '0', 'money'],
    ['A9', 'Intereses totales'], ['B9', `=SUMA(C${FIRST_ROW}:C${LAST_ROW})`, 'money'],
    ['A10', `Saldo tras ${MONTHS} meses`], ['B10', `=E${LAST_ROW}`, 'money'],
    ['A11', 'Mes', 'header'], ['B11', 'Saldo inicial', 'header'], ['C11', 'Interés', 'header'],
    ['D11', 'Pago', 'header'], ['E11', 'Saldo final', 'header'], ['F11', 'Notas', 'header'],
  ];
  for (let row = FIRST_ROW; row <= LAST_ROW; row++) {
    cells.push(
      [`A${row}`, String(row - FIRST_ROW + 1), 'integer'],
      [`B${row}`, row === FIRST_ROW ? '=B4' : `=E${row - 1}`, 'money'],
      [`C${row}`, `=B${row}*B5/1200`, 'money'],
      [`D${row}`, `=MIN(B7+B8, B${row}+C${row})`, 'money'], // el último pago es lo que quede
      [`E${row}`, `=B${row}+C${row}-D${row}`, 'money'],
    );
  }
  return cells;
}

let sheet = null;
function open() {
  const template = mortgageTemplate();
  sheet = new Sheet(COLUMNS, LAST_ROW);
  sheet.load(template.map(([ref, input]) => [ref, input]));
  return {
    type: 'snapshot', columns: COLUMNS, rows: LAST_ROW, formulas: sheet.formulaCount,
    cells: template.map(([ref, input, format = 'general']) => [ref, input, sheet.value(ref), format]),
  };
}

const patch = ({ values, recalculated, cyclic }, inputs, extra = {}) => ({
  type: 'patch', values, inputs, recalculated, cyclic, formulas: sheet.formulaCount, ...extra,
});

// Buscar objetivo: el pago extra más pequeño (en centavos) que deja el saldo en 0 al
// terminar el mes `months`. Bisección: cuanto más se paga, menos saldo queda.
function goalSeek(months) {
  const target = `E${FIRST_ROW + months - 1}`;
  const before = sheet.input('B8');
  let low = 0;
  let high = sheet.value('B4'); // pagar el monto entero el primer mes lo liquida seguro
  const touched = new Map();
  let recalculated = 0;
  let iterations = 0;
  const attempt = (extra) => {
    const result = sheet.set('B8', extra);
    for (const [ref, value] of result.values) touched.set(ref, value);
    recalculated += result.recalculated;
    iterations += 1;
    return sheet.value(target) === 0; // ¿liquidado? (el último pago deja el saldo en 0 exacto)
  };
  if (!(typeof high === 'number' && high > 0 && attempt(high))) {
    sheet.set('B8', before); // la hoja queda como estaba
    throw new RangeError('con estas fórmulas no hay un pago extra que liquide el crédito a tiempo');
  }
  for (let i = 0; i < 40; i++) {
    const middle = (low + high) / 2;
    if (attempt(middle)) high = middle;
    else low = middle;
  }
  attempt((Math.ceil(high * 100) / 100).toFixed(2)); // hacia arriba: en centavos, y que liquide
  return patch({ values: [...touched], recalculated, cyclic: 0 }, [['B8', sheet.input('B8')]], { goal: { months, iterations } });
}

self.onmessage = (event) => {
  const { id, type } = event.data;
  const start = performance.now();
  let reply;
  try {
    if (type === 'open') {
      reply = open();
    } else if (type === 'set') {
      const { ref, input } = event.data;
      reply = patch(sheet.set(ref, input), [[ref, sheet.input(ref)]]);
    } else if (type === 'recalculate-all') {
      reply = patch(sheet.recalculateAll(), []);
    } else if (type === 'goal-seek') {
      reply = goalSeek(event.data.months);
    } else if (type === 'dependents') {
      reply = { type: 'dependents', counts: Object.fromEntries(event.data.refs.map((ref) => [ref, sheet.dependentsOf(ref)])) };
    } else {
      throw new TypeError(`petición desconocida: ${type}`);
    }
  } catch (error) {
    reply = { type: 'error', message: `${error.name}: ${error.message}` };
  }
  self.postMessage({ id, ...reply, ms: performance.now() - start });
};
