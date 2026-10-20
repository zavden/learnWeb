// emit.js: construye módulos de WebAssembly byte a byte, con las piezas de la lección
// «WebAssembly a mano»: enteros LEB128, vectores (cuántos + elementos) y secciones
// (id + tamaño + contenido). No lee texto WAT: describes el módulo con un objeto de
// JavaScript y encodeModule() devuelve sus bytes en un Uint8Array.
//
//   import { encodeModule, op, I32 } from './wasm/emit.js';
//   const bytes = encodeModule({
//     types: [[[I32, I32], [I32]]],                  // tipo 0: (param i32 i32) (result i32)
//     funcs: [{ type: 0, body: [op.local_get, 0, op.local_get, 1, op.i32_add] }],
//     exports: { add: { func: 0 } },
//   });
//   // → los mismos 41 bytes que la lección «WebAssembly a mano» escribe a mano.
//
// Reglas de la descripción:
// - Los cuerpos de las funciones y los valores iniciales de las globales son listas de
//   bytes SIN el `end` final (0x0b): encodeModule() lo añade.
// - Los índices de funciones cuentan primero las importadas: con una función importada,
//   la primera de `funcs` es la número 1.
// - Las secciones salen en el orden que exige el formato (1, 2, 3, 5, 6, 7, 8, 10, 11).

// ── Tipos de valor ──
export const I32 = 0x7f;
export const I64 = 0x7e;
export const F32 = 0x7d;
export const F64 = 0x7c;
export const VOID = 0x40; // bloque sin resultado: block/loop/if «vacíos»

// ── Instrucciones (opcodes). En WAT llevan un punto: op.local_get es local.get ──
export const op = {
  unreachable: 0x00, nop: 0x01, block: 0x02, loop: 0x03, if: 0x04, else: 0x05, end: 0x0b,
  br: 0x0c, br_if: 0x0d, return: 0x0f, call: 0x10, drop: 0x1a, select: 0x1b,
  local_get: 0x20, local_set: 0x21, local_tee: 0x22, global_get: 0x23, global_set: 0x24,
  i32_load: 0x28, i64_load: 0x29, f32_load: 0x2a, f64_load: 0x2b, i32_load8_u: 0x2d,
  i32_store: 0x36, i64_store: 0x37, f32_store: 0x38, f64_store: 0x39, i32_store8: 0x3a,
  memory_size: 0x3f, memory_grow: 0x40,
  i32_const: 0x41, i64_const: 0x42, f32_const: 0x43, f64_const: 0x44,
  i32_eqz: 0x45, i32_eq: 0x46, i32_ne: 0x47, i32_lt_s: 0x48, i32_lt_u: 0x49,
  i32_gt_s: 0x4a, i32_gt_u: 0x4b, i32_le_u: 0x4d, i32_ge_u: 0x4f,
  i32_add: 0x6a, i32_sub: 0x6b, i32_mul: 0x6c, i32_div_s: 0x6d, i32_div_u: 0x6e, i32_rem_u: 0x70,
  i32_and: 0x71, i32_or: 0x72, i32_xor: 0x73, i32_shl: 0x74, i32_shr_u: 0x76,
  i64_add: 0x7c, i64_mul: 0x7e,
  f32_add: 0x92, f32_mul: 0x94, f32_div: 0x95,
  f64_add: 0xa0, f64_sub: 0xa1, f64_mul: 0xa2, f64_div: 0xa3,
  f32_convert_i32_u: 0xb3, f64_convert_i32_s: 0xb7, f64_convert_i32_u: 0xb8, f64_promote_f32: 0xbb,
};

// ── Enteros LEB128: grupos de 7 bits, del menos al más significativo ──
export function uleb(value) {
  let n = BigInt(value);
  if (n < 0n) throw new RangeError(`uleb: ${value} es negativo`);
  const bytes = [];
  do {
    let byte = Number(n & 0x7fn);
    n >>= 7n;
    if (n !== 0n) byte |= 0x80; // quedan bits: enciende la continuación
    bytes.push(byte);
  } while (n !== 0n);
  return bytes;
}
export function sleb(value) {
  let n = BigInt(value);
  const bytes = [];
  for (;;) {
    const byte = Number(n & 0x7fn);
    n >>= 7n; // en BigInt, >> conserva el signo
    const signBitClear = (byte & 0x40) === 0;
    if ((n === 0n && signBitClear) || (n === -1n && !signBitClear)) {
      bytes.push(byte);
      return bytes;
    }
    bytes.push(byte | 0x80);
  }
}

// ── Piezas del formato ──
const encoder = new TextEncoder();
export const vec = (items) => [...uleb(items.length), ...items.flat()];
export const str = (text) => vec([...encoder.encode(text)]);
export const section = (id, contents) => [id, ...uleb(contents.length), ...contents];

// Instrucciones con su inmediato: i32Const(64) → [0x41, 0xc0, 0x00].
export const i32Const = (value) => [op.i32_const, ...sleb(value)];
export const i64Const = (value) => [op.i64_const, ...sleb(value)];
export function f64Const(value) {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setFloat64(0, value, true); // little-endian
  return [op.f64_const, ...bytes];
}
// memArg(alineación en log2, desplazamiento): el inmediato de cargas y escrituras.
// i32.load offset=8 align=4 → [op.i32_load, ...memArg(2, 8)].
export const memArg = (alignLog2, offset = 0) => [alignLog2, ...uleb(offset)];

// Un volcado corto en hexadecimal: hex([0, 97]) → '00 61'.
export const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

function limits({ min, max, shared = false }) {
  if (shared) return [0x03, ...uleb(min), ...uleb(max)];
  return max === undefined ? [0x00, ...uleb(min)] : [0x01, ...uleb(min), ...uleb(max)];
}
function importDesc(entry) {
  if ('func' in entry) return [0x00, ...uleb(entry.func)];
  if ('memory' in entry) return [0x02, ...limits(entry.memory)];
  if ('global' in entry) return [0x03, entry.global.type, entry.global.mutable ? 1 : 0];
  throw new TypeError(`importación sin func, memory ni global: ${entry.module}.${entry.name}`);
}
const EXPORT_KINDS = { func: 0x00, memory: 0x02, global: 0x03 };
function exportDesc(name, desc) {
  const kind = Object.keys(desc).find((key) => key in EXPORT_KINDS);
  if (!kind) throw new TypeError(`exportación «${name}» sin func, memory ni global`);
  return [...str(name), EXPORT_KINDS[kind], ...uleb(desc[kind])];
}
// Locales: [I32, I32, F64] → 2 × i32, 1 × f64 (el formato agrupa los seguidos).
function localGroups(locals) {
  const groups = [];
  for (const type of locals) {
    const last = groups.at(-1);
    if (last && last[1] === type) last[0] += 1;
    else groups.push([1, type]);
  }
  return vec(groups.map(([count, type]) => [...uleb(count), type]));
}

// La descripción completa → los bytes del módulo.
export function encodeModule({ types = [], imports = [], funcs = [], memory, globals = [], exports = {}, start, data = [] }) {
  const sections = [];
  const add = (id, items) => { if (items.length) sections.push(...section(id, vec(items))); };
  add(1, types.map(([params, results]) => [0x60, ...vec(params), ...vec(results)]));
  add(2, imports.map((entry) => [...str(entry.module), ...str(entry.name), ...importDesc(entry)]));
  add(3, funcs.map((fn) => uleb(fn.type)));
  if (memory) add(5, [limits(memory)]);
  add(6, globals.map((g) => [g.type, g.mutable ? 1 : 0, ...g.init, op.end]));
  add(7, Object.entries(exports).map(([name, desc]) => exportDesc(name, desc)));
  if (start !== undefined) sections.push(...section(8, uleb(start)));
  add(10, funcs.map((fn) => {
    const body = [...localGroups(fn.locals ?? []), ...fn.body, op.end];
    return [...uleb(body.length), ...body];
  }));
  add(11, data.map(({ offset, bytes }) => {
    const content = typeof bytes === 'string' ? [...encoder.encode(bytes)] : [...bytes];
    return [0x00, ...i32Const(offset), op.end, ...vec(content)];
  }));
  return new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, ...sections]);
}
