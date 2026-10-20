// LA HOJA (ejemplo 12): las celdas, el grafo de dependencias y el recálculo
// incremental. Sin DOM ni mensajes: lo usa el worker, y se puede probar sin página.
//
// Cada celda guarda lo que se escribió (input), su fórmula ya analizada, su valor y
// sus precedentes (las celdas que lee). El grafo se guarda también al revés: para
// cada celda, sus dependientes (las fórmulas que la leen). Al cambiar una celda:
//   1. se buscan sus dependientes, los de estos, etc. (las «afectadas»);
//   2. se ordenan para que cada una vaya después de las que lee (orden topológico,
//      algoritmo de Kahn: primero las que no esperan a nadie);
//   3. se evalúan en ese orden, una sola vez cada una.
// Las que no se pueden ordenar están en un ciclo (o dependen de uno): #¡CICLO!.
import { ERRORS, FormulaSyntaxError, cellError, collectRefs, evaluate, parseFormula, parseRef } from './formula.js';

const NUMBER = /^[-+]?\d+(?:\.\d+)?$/;

export class Sheet {
  #cells = new Map();      // 'B5' → { input, formula, value, precedents }
  #dependents = new Map(); // 'B5' → Set de las celdas cuyas fórmulas leen B5

  constructor(columns, rows) {
    this.columns = columns;
    this.rows = rows;
  }

  isInside(ref) {
    const { column, row } = parseRef(ref);
    return column <= this.columns && row >= 1 && row <= this.rows;
  }
  value(ref) {
    return this.#cells.get(ref)?.value ?? null;
  }
  input(ref) {
    return this.#cells.get(ref)?.input ?? '';
  }
  get size() {
    return this.#cells.size;
  }
  get formulaCount() {
    let count = 0;
    for (const cell of this.#cells.values()) if (cell.formula !== null) count += 1;
    return count;
  }

  // Lo escrito → una celda. Un número se guarda como número; «=…», como fórmula;
  // lo demás, como texto. Una fórmula mal escrita es una celda con un error.
  #compile(input) {
    if (typeof input === 'number') return { input: String(input), formula: null, value: input, precedents: new Set() };
    const text = input.trim();
    if (text === '') return null;
    if (NUMBER.test(text)) return { input: text, formula: null, value: Number(text), precedents: new Set() };
    if (!text.startsWith('=')) return { input: text, formula: null, value: text, precedents: new Set() };
    try {
      const formula = parseFormula(text.slice(1));
      // Las celdas de fuera de la hoja no entran en el grafo: no cambian nunca (dan #¡REF!).
      const precedents = new Set([...collectRefs(formula)].filter((other) => this.isInside(other)));
      return { input: text, formula, value: null, precedents };
    } catch (error) {
      if (!(error instanceof FormulaSyntaxError)) throw error;
      return { input: text, formula: { type: 'invalid', error: cellError(ERRORS.syntax, error.message) }, value: null, precedents: new Set() };
    }
  }

  #write(ref, input) {
    const old = this.#cells.get(ref);
    for (const other of old?.precedents ?? []) this.#dependents.get(other)?.delete(ref);
    const cell = this.#compile(input);
    if (cell === null) {
      this.#cells.delete(ref);
      return;
    }
    this.#cells.set(ref, cell);
    for (const other of cell.precedents) {
      if (!this.#dependents.has(other)) this.#dependents.set(other, new Set());
      this.#dependents.get(other).add(ref);
    }
  }

  // Cambia una celda y recalcula solo lo que depende de ella.
  set(ref, input) {
    this.#write(ref, input);
    return this.#recalculate([ref]);
  }
  // Abre una hoja entera: todas las celdas, y un cálculo completo.
  load(entries) {
    for (const [ref, input] of entries) this.#write(ref, input);
    return this.recalculateAll();
  }
  // Lo que haría una hoja sin grafo: recalcularlo todo.
  recalculateAll() {
    return this.#recalculate([...this.#cells.keys()]);
  }

  // Las afectadas por un cambio en `starts`: ellas y todo lo que depende de ellas.
  #affected(starts) {
    const affected = new Set();
    const stack = [...starts];
    while (stack.length > 0) {
      const ref = stack.pop();
      if (affected.has(ref)) continue;
      affected.add(ref);
      for (const other of this.#dependents.get(ref) ?? []) stack.push(other);
    }
    return affected;
  }
  // Cuántas fórmulas habría que recalcular si cambiara `ref` (sin cambiarla).
  dependentsOf(ref) {
    let count = 0;
    for (const other of this.#affected([ref])) if (other !== ref && this.#cells.get(other)?.formula) count += 1;
    return count;
  }

  #recalculate(starts) {
    const affected = this.#affected(starts);
    // Kahn: cuántas de sus precedentes afectadas espera cada celda.
    const waiting = new Map();
    const ready = [];
    for (const ref of affected) {
      let count = 0;
      for (const other of this.#cells.get(ref)?.precedents ?? []) if (affected.has(other)) count += 1;
      waiting.set(ref, count);
      if (count === 0) ready.push(ref);
    }
    const read = (ref) => (this.isInside(ref) ? this.value(ref) : cellError(ERRORS.ref, `${ref} está fuera de la hoja`));
    const values = [];
    let recalculated = 0;
    while (ready.length > 0) {
      const ref = ready.pop();
      waiting.delete(ref);
      const cell = this.#cells.get(ref);
      if (cell?.formula) {
        cell.value = cell.formula.type === 'invalid' ? cell.formula.error : evaluate(cell.formula, read);
        recalculated += 1;
      }
      values.push([ref, cell?.value ?? null]);
      for (const other of this.#dependents.get(ref) ?? []) {
        if (!waiting.has(other)) continue;
        const count = waiting.get(other) - 1;
        waiting.set(other, count);
        if (count === 0) ready.push(other);
      }
    }
    // Las que siguen esperando no se pueden ordenar: hay un ciclo.
    for (const ref of waiting.keys()) {
      const cell = this.#cells.get(ref);
      cell.value = cellError(ERRORS.cycle, 'referencia circular: la celda está en un ciclo o depende de uno');
      values.push([ref, cell.value]);
    }
    return { values, recalculated: recalculated + waiting.size, cyclic: waiting.size };
  }
}
