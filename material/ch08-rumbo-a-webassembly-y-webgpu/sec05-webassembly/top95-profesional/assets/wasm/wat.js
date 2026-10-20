// wat.js: un ensamblador de un SUBCONJUNTO del formato de texto de WebAssembly (WAT).
// Convierte el texto en una descripción para encodeModule() de emit.js (la lección
// «La memoria lineal») y devuelve los bytes del módulo:
//
//   import { assemble } from './wasm/wat.js';
//   const bytes = assemble(`(module (func (export "add") (param i32 i32) (result i32)
//     local.get 0  local.get 1  i32.add))`);
//
// Qué entiende:
// - Campos: func, import (func, memory, global), memory, global, export, start, data.
// - Funciones con (export "…"), (param $x i32) o (param i32 i32), (result …) y (local …).
// - Instrucciones en forma plana (local.get 0  i32.add) y en forma anidada
//   ((i32.add (local.get 0) (i32.const 1))), con block, loop e if, etiquetas $nombre,
//   if anidado con (then …) y (else …).
// - Constantes enteras en decimal o hexadecimal (0x811c9dc5, 1_000), decimales para f32/f64.
// - offset= y align= en cargas y escrituras; memory.copy y memory.fill; unas pocas
//   instrucciones SIMD (v128) en `SIMD_OPS`.
// - Una sección personalizada «name» con los nombres $… de las funciones (las pilas de
//   error y DevTools los muestran); { names: false } la omite.
// Qué NO comprueba: los tipos. Eso lo hace el navegador al compilar (CompileError).
//
// Todos sus bucles recorren el texto o la lista de tokens, así que siempre terminan.
import { encodeModule, uleb, sleb, str, vec, section, f64Const, I32, I64, F32, F64 } from './emit.js';

export class WatError extends Error {
  constructor(pos, message) {
    super(pos ? `línea ${pos.line}, columna ${pos.col}: ${message}` : message);
    this.name = 'WatError';
    this.pos = pos;
  }
}

const VALTYPES = { i32: I32, i64: I64, f32: F32, f64: F64, v128: 0x7b };
const NATURAL_ALIGN = { 8: 0, 16: 1, 32: 2, 64: 3, 128: 4 };

// ── Tabla de instrucciones: nombre → [bytes del opcode, tipo de inmediato, alineación natural] ──
const OPS = new Map();
const define = (names, firstCode, imm = 'none') => names.split(' ').forEach((name, i) => OPS.set(name, { code: [firstCode + i], imm }));
define('unreachable nop', 0x00);
define('block loop if', 0x02, 'block');
OPS.set('else', { code: [0x05], imm: 'else' });
OPS.set('end', { code: [0x0b], imm: 'end' });
define('br br_if', 0x0c, 'label');
OPS.set('br_table', { code: [0x0e], imm: 'br_table' });
OPS.set('return', { code: [0x0f], imm: 'none' });
OPS.set('call', { code: [0x10], imm: 'func' });
define('drop select', 0x1a);
define('local.get local.set local.tee', 0x20, 'local');
define('global.get global.set', 0x23, 'global');
[['i32.load', 32], ['i64.load', 64], ['f32.load', 32], ['f64.load', 64], ['i32.load8_s', 8], ['i32.load8_u', 8],
  ['i32.load16_s', 16], ['i32.load16_u', 16], ['i64.load8_s', 8], ['i64.load8_u', 8], ['i64.load16_s', 16],
  ['i64.load16_u', 16], ['i64.load32_s', 32], ['i64.load32_u', 32], ['i32.store', 32], ['i64.store', 64],
  ['f32.store', 32], ['f64.store', 64], ['i32.store8', 8], ['i32.store16', 16], ['i64.store8', 8],
  ['i64.store16', 16], ['i64.store32', 32]].forEach(([name, bits], i) => OPS.set(name, { code: [0x28 + i], imm: 'mem', align: NATURAL_ALIGN[bits] }));
define('memory.size memory.grow', 0x3f, 'memidx');
['i32', 'i64', 'f32', 'f64'].forEach((type, i) => OPS.set(`${type}.const`, { code: [0x41 + i], imm: type }));
define('i32.eqz i32.eq i32.ne i32.lt_s i32.lt_u i32.gt_s i32.gt_u i32.le_s i32.le_u i32.ge_s i32.ge_u', 0x45);
define('i64.eqz i64.eq i64.ne i64.lt_s i64.lt_u i64.gt_s i64.gt_u i64.le_s i64.le_u i64.ge_s i64.ge_u', 0x50);
define('f32.eq f32.ne f32.lt f32.gt f32.le f32.ge f64.eq f64.ne f64.lt f64.gt f64.le f64.ge', 0x5b);
define('i32.clz i32.ctz i32.popcnt i32.add i32.sub i32.mul i32.div_s i32.div_u i32.rem_s i32.rem_u i32.and i32.or i32.xor i32.shl i32.shr_s i32.shr_u i32.rotl i32.rotr', 0x67);
define('i64.clz i64.ctz i64.popcnt i64.add i64.sub i64.mul i64.div_s i64.div_u i64.rem_s i64.rem_u i64.and i64.or i64.xor i64.shl i64.shr_s i64.shr_u i64.rotl i64.rotr', 0x79);
define('f32.abs f32.neg f32.ceil f32.floor f32.trunc f32.nearest f32.sqrt f32.add f32.sub f32.mul f32.div f32.min f32.max f32.copysign', 0x8b);
define('f64.abs f64.neg f64.ceil f64.floor f64.trunc f64.nearest f64.sqrt f64.add f64.sub f64.mul f64.div f64.min f64.max f64.copysign', 0x99);
define('i32.wrap_i64 i32.trunc_f32_s i32.trunc_f32_u i32.trunc_f64_s i32.trunc_f64_u i64.extend_i32_s i64.extend_i32_u i64.trunc_f32_s i64.trunc_f32_u i64.trunc_f64_s i64.trunc_f64_u f32.convert_i32_s f32.convert_i32_u f32.convert_i64_s f32.convert_i64_u f32.demote_f64 f64.convert_i32_s f64.convert_i32_u f64.convert_i64_s f64.convert_i64_u f64.promote_f32 i32.reinterpret_f32 i64.reinterpret_f64 f32.reinterpret_i32 f64.reinterpret_i64 i32.extend8_s i32.extend16_s i64.extend8_s i64.extend16_s i64.extend32_s', 0xa7);
OPS.set('memory.copy', { code: [0xfc, 0x0a], imm: 'memcopy' });
OPS.set('memory.fill', { code: [0xfc, 0x0b], imm: 'memidx' });
// SIMD: prefijo 0xfd y el número de la instrucción en LEB128. Solo las que usan los ejemplos.
export const SIMD_OPS = {
  'v128.load': [0x00, 'mem', 4], 'v128.store': [0x0b, 'mem', 4], 'v128.const': [0x0c, 'v128'],
  'i8x16.splat': [0x0f], 'i32x4.splat': [0x11], 'i8x16.extract_lane_u': [0x16, 'lane'], 'i32x4.extract_lane': [0x1b, 'lane'],
  'v128.not': [0x4d], 'v128.and': [0x4e], 'v128.or': [0x50], 'v128.xor': [0x51],
  'i8x16.add_sat_u': [0x70], 'i8x16.sub_sat_u': [0x73], 'i8x16.min_u': [0x77], 'i8x16.max_u': [0x79], 'i8x16.avgr_u': [0x7b],
  'i32x4.add': [0xae], 'i32x4.mul': [0xb5],
};
for (const [name, [number, imm = 'none', align]] of Object.entries(SIMD_OPS)) OPS.set(name, { code: [0xfd, ...uleb(number)], imm, align });

// ── 1. Texto → tokens: paréntesis, textos entre comillas y «átomos» (palabras, números, $nombres) ──
function tokenize(source) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const step = () => {
    if (source[i] === '\n') { line += 1; col = 1; } else col += 1;
    i += 1;
  };
  while (i < source.length) {
    const ch = source[i];
    const pos = { line, col };
    if (/\s/.test(ch)) { step(); continue; }
    if (ch === ';' && source[i + 1] === ';') { while (i < source.length && source[i] !== '\n') step(); continue; }
    if (ch === '(' && source[i + 1] === ';') {
      const end = source.indexOf(';)', i + 2);
      if (end < 0) throw new WatError(pos, 'un comentario (; … sin cerrar con ;)');
      while (i < end + 2) step();
      continue;
    }
    if (ch === '(' || ch === ')') { tokens.push({ type: ch, pos }); step(); continue; }
    if (ch === '"') { tokens.push({ type: 'string', bytes: readString(), pos }); continue; }
    const start = i;
    while (i < source.length && !/[\s()";]/.test(source[i])) step();
    if (i === start) throw new WatError(pos, `carácter inesperado «${ch}»`);
    tokens.push({ type: 'atom', value: source.slice(start, i), pos });
  }
  return tokens;

  function readString() { // "texto" con \n \t \\ \" \hh (un byte en hexadecimal) y UTF-8 para lo demás
    const pos = { line, col };
    const bytes = [];
    step(); // la comilla de apertura
    while (i < source.length && source[i] !== '"') {
      if (source[i] === '\n') throw new WatError(pos, 'un texto sin cerrar (falta la comilla)');
      if (source[i] === '\\') {
        const next = source[i + 1];
        const simple = { n: 10, t: 9, r: 13, '"': 34, "'": 39, '\\': 92 }[next];
        if (simple !== undefined) { bytes.push(simple); step(); step(); continue; }
        const pair = source.slice(i + 1, i + 3);
        if (!/^[0-9a-fA-F]{2}$/.test(pair)) throw new WatError({ line, col }, `escape no válido «\\${next ?? ''}»`);
        bytes.push(parseInt(pair, 16));
        step(); step(); step();
        continue;
      }
      const char = String.fromCodePoint(source.codePointAt(i));
      bytes.push(...new TextEncoder().encode(char));
      for (let k = 0; k < char.length; k++) step();
    }
    if (i >= source.length) throw new WatError(pos, 'un texto sin cerrar (falta la comilla)');
    step(); // la comilla de cierre
    return bytes;
  }
}

// ── 2. Tokens → listas anidadas (expresiones S) ──
function parseLists(tokens) {
  let k = 0;
  function node() {
    const token = tokens[k];
    if (token.type === ')') throw new WatError(token.pos, 'sobra un «)»');
    k += 1;
    if (token.type !== '(') return token;
    const items = [];
    while (k < tokens.length && tokens[k].type !== ')') items.push(node());
    if (k >= tokens.length) throw new WatError(token.pos, 'falta cerrar este paréntesis');
    k += 1;
    return { type: 'list', items, pos: token.pos };
  }
  const nodes = [];
  while (k < tokens.length) nodes.push(node());
  return nodes;
}

const isList = (node, head) => node?.type === 'list' && (head === undefined || node.items[0]?.value === head);
const isAtom = (node) => node?.type === 'atom';
const isId = (node) => isAtom(node) && node.value.startsWith('$');
function valtype(node) {
  const type = isAtom(node) ? VALTYPES[node.value] : undefined;
  if (type === undefined) throw new WatError(node?.pos, `se esperaba un tipo (i32, i64, f32, f64, v128) y hay «${node?.value ?? '…'}»`);
  return type;
}
function parseInteger(node, bits) {
  const text = isAtom(node) ? node.value.replaceAll('_', '') : '';
  if (!/^[+-]?(0x[0-9a-f]+|[0-9]+)$/i.test(text)) throw new WatError(node?.pos, `número entero no válido «${node?.value ?? '…'}»`);
  const negative = text.startsWith('-');
  let value = BigInt(text.replace(/^[+-]/, ''));
  if (negative) value = -value;
  const limit = 1n << BigInt(bits);
  if (value < -(limit >> 1n) || value >= limit) throw new WatError(node.pos, `${node.value} no cabe en ${bits} bits`);
  return BigInt.asIntN(bits, value); // 0xffffffff es -1 como i32: los bits son los mismos
}
function parseFloatAtom(node) {
  const text = isAtom(node) ? node.value.replaceAll('_', '') : '';
  const special = { inf: Infinity, '+inf': Infinity, '-inf': -Infinity, nan: NaN };
  if (text in special) return special[text];
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(text)) throw new WatError(node?.pos, `número decimal no válido «${node?.value ?? '…'}»`);
  return Number(text);
}

// ── 3. El módulo ──
export function assemble(source, { names = true } = {}) {
  const nodes = parseLists(tokenize(source));
  const fields = nodes.length === 1 && isList(nodes[0], 'module') ? nodes[0].items.slice(1) : nodes;
  const desc = { types: [], imports: [], funcs: [], globals: [], exports: {}, data: [] };
  const funcNames = new Map();
  const globalNames = new Map();
  const funcIdNames = [];
  const typeIndex = (params, results) => {
    const key = `${params}|${results}`;
    let index = desc.types.findIndex(([p, r]) => `${p}|${r}` === key);
    if (index < 0) index = desc.types.push([params, results]) - 1;
    return index;
  };
  const addExport = (nameNode, kind, index) => {
    const name = new TextDecoder().decode(new Uint8Array(nameNode.bytes));
    if (name in desc.exports) throw new WatError(nameNode.pos, `la exportación «${name}» está repetida`);
    desc.exports[name] = { [kind]: index };
  };

  // Primera pasada: los índices. Las importaciones van primero en cada espacio de índices.
  const definedFuncs = fields.filter((field) => isList(field, 'func'));
  const importedFuncs = fields.filter((field) => isList(field, 'import') && isList(field.items[3], 'func'));
  [...importedFuncs.map((field) => field.items[3]), ...definedFuncs].forEach((func, index) => {
    if (isId(func.items[1])) {
      if (funcNames.has(func.items[1].value)) throw new WatError(func.items[1].pos, `la función ${func.items[1].value} está repetida`);
      funcNames.set(func.items[1].value, index);
      funcIdNames.push([index, func.items[1].value.slice(1)]);
    }
  });
  const importedGlobals = fields.filter((field) => isList(field, 'import') && isList(field.items[3], 'global'));
  [...importedGlobals.map((field) => field.items[3]), ...fields.filter((field) => isList(field, 'global'))].forEach((global, index) => {
    if (isId(global.items[1])) globalNames.set(global.items[1].value, index);
  });
  const resolve = (map, node, what) => {
    if (isId(node)) {
      if (!map.has(node.value)) throw new WatError(node.pos, `${what} ${node.value} no existe`);
      return map.get(node.value);
    }
    return Number(parseInteger(node, 32));
  };

  // Segunda pasada: cada campo, en orden.
  let funcCursor = 0;
  for (const field of fields) {
    if (!isList(field)) throw new WatError(field.pos, `se esperaba un campo del módulo entre paréntesis y hay «${field.value ?? 'un texto'}»`);
    const head = field.items[0];
    switch (head?.value) {
      case 'import': {
        const [, moduleName, itemName, what] = field.items;
        if (moduleName?.type !== 'string' || itemName?.type !== 'string' || !isList(what)) throw new WatError(field.pos, 'una importación es (import "módulo" "nombre" (func …)), (memory …) o (global …)');
        const entry = { module: decodeName(moduleName), name: decodeName(itemName) };
        if (isList(what, 'func')) {
          const signature = parseSignature(what.items.slice(isId(what.items[1]) ? 2 : 1));
          entry.func = typeIndex(signature.params, signature.results);
        } else if (isList(what, 'memory')) {
          entry.memory = parseLimits(what.items.slice(1));
        } else if (isList(what, 'global')) {
          entry.global = parseGlobalType(what.items[isId(what.items[1]) ? 2 : 1]);
        } else throw new WatError(what.pos, 'solo se importan func, memory y global');
        desc.imports.push(entry);
        break;
      }
      case 'func': {
        const index = importedFuncs.length + funcCursor;
        funcCursor += 1;
        let items = field.items.slice(isId(field.items[1]) ? 2 : 1);
        while (isList(items[0], 'export')) { addExport(items[0].items[1], 'func', index); items = items.slice(1); }
        const signature = parseSignature(items);
        const body = compileBody(items.slice(signature.consumed), signature, { funcNames, globalNames, resolve });
        desc.funcs.push({ type: typeIndex(signature.params, signature.results), locals: signature.locals, body });
        break;
      }
      case 'memory': {
        if (desc.memory) throw new WatError(field.pos, 'este ensamblador solo admite una memoria');
        let items = field.items.slice(isId(field.items[1]) ? 2 : 1);
        while (isList(items[0], 'export')) { addExport(items[0].items[1], 'memory', 0); items = items.slice(1); }
        desc.memory = parseLimits(items);
        break;
      }
      case 'global': {
        let items = field.items.slice(isId(field.items[1]) ? 2 : 1);
        const index = importedGlobals.length + desc.globals.length;
        while (isList(items[0], 'export')) { addExport(items[0].items[1], 'global', index); items = items.slice(1); }
        const { type, mutable } = parseGlobalType(items[0]);
        if (!isList(items[1])) throw new WatError(field.pos, 'falta el valor inicial de la global, como (i32.const 0)');
        desc.globals.push({ type, mutable, init: compileBody([items[1]], { params: [], localNames: new Map() }, { funcNames, globalNames, resolve }) });
        break;
      }
      case 'export': {
        const [, name, target] = field.items;
        const kind = isList(target) ? target.items[0].value : '';
        if (name?.type !== 'string' || !['func', 'memory', 'global'].includes(kind)) throw new WatError(field.pos, 'una exportación es (export "nombre" (func $f)), (memory 0) o (global $g)');
        const index = kind === 'func' ? resolve(funcNames, target.items[1], 'la función') : kind === 'global' ? resolve(globalNames, target.items[1], 'la global') : 0;
        addExport(name, kind, index);
        break;
      }
      case 'start':
        desc.start = resolve(funcNames, field.items[1], 'la función');
        break;
      case 'data': {
        const [, offsetNode, ...strings] = field.items;
        if (!isList(offsetNode, 'i32.const')) throw new WatError(field.pos, 'un segmento de datos es (data (i32.const posición) "bytes" …)');
        if (strings.some((node) => node.type !== 'string')) throw new WatError(field.pos, 'después de la posición solo van textos entre comillas');
        desc.data.push({ offset: Number(parseInteger(offsetNode.items[1], 32)), bytes: strings.flatMap((node) => node.bytes) });
        break;
      }
      default:
        throw new WatError(field.pos, `«${head?.value ?? '…'}» no está en el subconjunto de WAT que entiende este ensamblador`);
    }
  }
  const bytes = encodeModule(desc);
  if (!names || funcIdNames.length === 0) return bytes;
  // La sección «name»: subsección 1, nombres de funciones (índice → nombre), ordenados por índice.
  const functionNames = vec(funcIdNames.sort((a, b) => a[0] - b[0]).map(([index, name]) => [...uleb(index), ...str(name)]));
  return new Uint8Array([...bytes, ...section(0, [...str('name'), 1, ...uleb(functionNames.length), ...functionNames])]);
}

function decodeName(node) {
  return new TextDecoder().decode(new Uint8Array(node.bytes));
}
function parseLimits(items) {
  const numbers = items.filter(isAtom);
  if (numbers.length < 1 || numbers.length > 2) throw new WatError(items[0]?.pos, 'una memoria lleva sus páginas: mínimo y, si quieres, máximo');
  const [min, max] = numbers.map((node) => Number(parseInteger(node, 32)));
  return max === undefined ? { min } : { min, max };
}
function parseGlobalType(node) {
  if (isList(node, 'mut')) return { type: valtype(node.items[1]), mutable: true };
  return { type: valtype(node), mutable: false };
}
// (param $a i32) (param i32 i32) (result i32) (local $x i32) … al principio de una función.
function parseSignature(items) {
  const params = [];
  const results = [];
  const locals = [];
  const localNames = new Map();
  let consumed = 0;
  for (const item of items) {
    const kind = isList(item) ? item.items[0].value : null;
    if (!['param', 'result', 'local'].includes(kind)) break;
    consumed += 1;
    const rest = item.items.slice(1);
    if (kind === 'result') { results.push(...rest.map(valtype)); continue; }
    const target = kind === 'param' ? params : locals;
    if (isId(rest[0])) {
      localNames.set(rest[0].value, params.length + locals.length);
      target.push(valtype(rest[1]));
    } else target.push(...rest.map(valtype));
  }
  return { params, results, locals, localNames, consumed };
}

// ── 4. El cuerpo de una función: instrucciones planas o anidadas → bytes ──
function compileBody(items, signature, { funcNames, globalNames, resolve }) {
  const out = [];
  const labels = []; // la etiqueta de cada bloque abierto, del más externo al más interno
  const localIndex = (node) => {
    if (isId(node)) {
      if (!signature.localNames.has(node.value)) throw new WatError(node.pos, `${node.value} no es un parámetro ni una variable local de esta función`);
      return signature.localNames.get(node.value);
    }
    return Number(parseInteger(node, 32));
  };
  const labelDepth = (node) => {
    if (isId(node)) {
      const position = labels.lastIndexOf(node.value);
      if (position < 0) throw new WatError(node.pos, `la etiqueta ${node.value} no es de ningún bloque que contenga esta instrucción`);
      return labels.length - 1 - position;
    }
    return Number(parseInteger(node, 32));
  };
  const blockType = (list, k) => { // [$etiqueta] [(result t)] tras block/loop/if
    let label = null;
    let type = 0x40;
    if (isId(list[k])) { label = list[k].value; k += 1; }
    if (isList(list[k], 'result')) { type = valtype(list[k].items[1]); k += 1; }
    return { label, type, next: k };
  };
  // Emite una instrucción con nombre en list[k]; devuelve la posición siguiente.
  function instruction(list, k) {
    const node = list[k];
    const op = OPS.get(node.value);
    if (!op) throw new WatError(node.pos, `instrucción desconocida «${node.value}»`);
    k += 1;
    switch (op.imm) {
      case 'none': out.push(...op.code); break;
      case 'block': {
        const { label, type, next } = blockType(list, k);
        out.push(...op.code, type);
        labels.push(label);
        return next;
      }
      case 'else': out.push(...op.code); break;
      case 'end':
        if (labels.length === 0) throw new WatError(node.pos, 'sobra un «end»: no hay ningún bloque abierto');
        labels.pop();
        out.push(...op.code);
        break;
      case 'label': out.push(...op.code, ...uleb(labelDepth(list[k]))); return k + 1;
      case 'br_table': {
        const targets = [];
        while (isAtom(list[k]) && /^(\$|\d)/.test(list[k].value)) { targets.push(labelDepth(list[k])); k += 1; }
        if (targets.length === 0) throw new WatError(node.pos, 'br_table necesita al menos una etiqueta');
        const fallback = targets.pop();
        out.push(...op.code, ...vec(targets.map((depth) => uleb(depth))), ...uleb(fallback));
        return k;
      }
      case 'func': out.push(...op.code, ...uleb(resolve(funcNames, list[k], 'la función'))); return k + 1;
      case 'local': out.push(...op.code, ...uleb(localIndex(list[k]))); return k + 1;
      case 'global': out.push(...op.code, ...uleb(resolve(globalNames, list[k], 'la global'))); return k + 1;
      case 'mem': {
        let align = op.align;
        let offset = 0;
        while (isAtom(list[k]) && /^(offset|align)=/.test(list[k].value)) {
          const [key, value] = list[k].value.split('=');
          const number = Number(parseInteger({ ...list[k], value }, 32));
          if (key === 'offset') offset = number;
          else if (number > 0 && (number & (number - 1)) === 0) align = Math.log2(number);
          else throw new WatError(list[k].pos, `align=${value}: la alineación es una potencia de 2, en bytes`);
          k += 1;
        }
        out.push(...op.code, align, ...uleb(offset));
        return k;
      }
      case 'memidx': out.push(...op.code, 0x00); break;
      case 'memcopy': out.push(...op.code, 0x00, 0x00); break;
      case 'i32': out.push(...op.code, ...sleb(parseInteger(list[k], 32))); return k + 1;
      case 'i64': out.push(...op.code, ...sleb(parseInteger(list[k], 64))); return k + 1;
      case 'f32': {
        const bytes = new Uint8Array(4);
        new DataView(bytes.buffer).setFloat32(0, parseFloatAtom(list[k]), true);
        out.push(...op.code, ...bytes);
        return k + 1;
      }
      case 'f64': out.push(...f64Const(parseFloatAtom(list[k]))); return k + 1;
      case 'lane': out.push(...op.code, Number(parseInteger(list[k], 8)) & 0xff); return k + 1;
      case 'v128': { // v128.const i8x16 … (16 números) o i32x4 … (4 números)
        const shape = list[k]?.value;
        const lanes = { i8x16: [16, 8], i32x4: [4, 32] }[shape];
        if (!lanes) throw new WatError(node.pos, 'v128.const lleva i8x16 o i32x4 y sus valores');
        const bytes = new Uint8Array(16);
        const view = new DataView(bytes.buffer);
        for (let lane = 0; lane < lanes[0]; lane++) {
          const value = Number(parseInteger(list[k + 1 + lane], lanes[1]));
          if (lanes[1] === 8) view.setInt8(lane, value); else view.setInt32(lane * 4, value, true);
        }
        out.push(...op.code, ...bytes);
        return k + 1 + lanes[0];
      }
      default: throw new WatError(node.pos, `«${node.value}» no se puede usar aquí`);
    }
    return k;
  }
  // Forma anidada: (op inmediatos… (operando) (operando)) o (block …), (if … (then …) (else …)).
  function folded(list) {
    const head = list.items[0];
    if (!isAtom(head)) throw new WatError(list.pos, 'se esperaba una instrucción');
    if (head.value === 'block' || head.value === 'loop') {
      const { label, type, next } = blockType(list.items, 1);
      out.push(...OPS.get(head.value).code, type);
      labels.push(label);
      sequence(list.items.slice(next));
      labels.pop();
      out.push(0x0b);
      return;
    }
    if (head.value === 'if') {
      const { label, type, next } = blockType(list.items, 1);
      const rest = list.items.slice(next);
      const thenIndex = rest.findIndex((item) => isList(item, 'then'));
      if (thenIndex < 0) throw new WatError(list.pos, 'un if anidado lleva (then …)');
      rest.slice(0, thenIndex).forEach(expression); // la condición
      out.push(0x04, type);
      labels.push(label);
      sequence(rest[thenIndex].items.slice(1));
      const elseNode = rest[thenIndex + 1];
      if (isList(elseNode, 'else')) { out.push(0x05); sequence(elseNode.items.slice(1)); }
      labels.pop();
      out.push(0x0b);
      return;
    }
    // Primero los operandos (las listas), después la instrucción con sus inmediatos (los átomos).
    const immediates = list.items.slice(1).filter((item) => !isList(item));
    list.items.slice(1).filter((item) => isList(item)).forEach(expression);
    const after = instruction([head, ...immediates], 0);
    if (after !== immediates.length + 1) throw new WatError(list.pos, `«${head.value}» lleva otros inmediatos`);
  }
  function expression(node) {
    if (isList(node)) folded(node);
    else throw new WatError(node.pos, `se esperaba una instrucción entre paréntesis y hay «${node.value ?? 'un texto'}»`);
  }
  function sequence(list) {
    let k = 0;
    while (k < list.length) {
      const node = list[k];
      if (isList(node)) { folded(node); k += 1; } else if (isAtom(node)) k = instruction(list, k);
      else throw new WatError(node.pos, 'un texto entre comillas no es una instrucción');
    }
  }
  sequence(items);
  if (labels.length > 0) throw new WatError(items.at(-1)?.pos, 'falta un «end»: hay un bloque sin cerrar');
  return out;
}
