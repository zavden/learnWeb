---
example_description: "Un constructor de consultas SQL con una etiqueta sql: los valores siempre viajan como parámetros $1, $2…, los fragmentos se anidan y se renumeran, las listas (cualquier iterable) se expanden para IN, los nombres de tabla se validan y Symbol.toPrimitive prohíbe convertir la consulta en texto"
example_tags: "javascript|plantillas|tagged-templates|sql|symbol|iterables|seguridad|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// LAS CONSULTAS DEL PANEL DE PEDIDOS de una tienda, montadas con una etiqueta.
// Lecciones: plantillas etiquetadas (trozos = código, valores = datos),
// iterables (IN acepta arrays, Sets…) y símbolos bien conocidos.
class Identifier {
  constructor(name) {
    const isWordChar = (ch) => ch === '_' || (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9');
    if (name === '' || !(name.split('.').every((part) => part !== '' && [...part].every(isWordChar)))) {
      throw new TypeError(`Nombre de tabla o columna no válido: «${name}»`);
    }
    this.quoted = name.split('.').map((part) => `"${part}"`).join('.');
  }
}

class Sql {
  #strings; // los trozos, con un hueco entre cada dos para cada parámetro
  #params;
  constructor(strings, params) {
    this.#strings = strings;
    this.#params = params;
  }

  // Aplana los valores: fragmentos anidados, identificadores, listas y datos.
  static from(strings, values) {
    const out = [strings[0]];
    const params = [];
    const append = (text) => (out[out.length - 1] += text);
    values.forEach((value, i) => {
      const after = strings[i + 1];
      if (value instanceof Sql) { // un fragmento: se copian sus trozos y sus parámetros
        append(value.#strings[0]);
        value.#params.forEach((param, j) => {
          params.push(param);
          out.push(value.#strings[j + 1]);
        });
        append(after);
      } else if (value instanceof Identifier) {
        append(value.quoted + after); // validado: puede ir en el texto
      } else if (typeof value === 'object' && value !== null && Symbol.iterator in value) {
        const items = [...value]; // cualquier iterable: ($1, $2, $3)
        if (items.length === 0) throw new RangeError('IN con una lista vacía');
        append('(');
        items.forEach((item, k) => {
          params.push(item);
          out.push(k < items.length - 1 ? ', ' : `)${after}`);
        });
      } else {
        params.push(value); // un dato: SIEMPRE parámetro
        out.push(after);
      }
    });
    return new Sql(out, params);
  }

  get text() {
    return this.#strings.reduce((text, part, i) => `${text}$${i}${part}`);
  }
  get params() {
    return [...this.#params];
  }
  get [Symbol.toStringTag]() {
    return 'Sql';
  }
  [Symbol.toPrimitive]() { // 'texto' + consulta sería volver a mezclar datos y código
    throw new TypeError('Una consulta no se convierte en texto: usa .text y .params');
  }
}

const sql = (strings, ...values) => Sql.from(strings, values);
const identifier = (name) => new Identifier(name);
const joinSql = (fragments, separator) => Sql.from(['', ...fragments.slice(1).map(() => separator), ''], fragments);

function findOrders({ city, minTotal, statuses, limit = 20 } = {}) {
  const conditions = [];
  if (city !== undefined) conditions.push(sql`city = ${city}`);
  if (minTotal !== undefined) conditions.push(sql`total >= ${minTotal}`);
  if (statuses !== undefined) conditions.push(sql`status IN ${statuses}`);
  const where = conditions.length > 0 ? sql` WHERE ${joinSql(conditions, ' AND ')}` : sql``;
  return sql`SELECT id, customer, total FROM ${identifier('orders')}${where} ORDER BY total DESC LIMIT ${limit}`;
}

const show = (label, query) => console.log(`${label}\n  ${query.text}\n  params → ${JSON.stringify(query.params)}`);

show('▶ con todos los filtros (y un intento de inyección)', findOrders({
  city: "Mérida' OR '1'='1' --",
  minTotal: 500,
  statuses: new Set(['pagado', 'enviado']),
}));
show('▶ sin filtros', findOrders());
show('▶ fragmento reutilizado', sql`SELECT count(*) FROM ${identifier('orders')} WHERE ${sql`total >= ${1000}`}`);

const tries = {
  "identifier('orders; DROP TABLE users')": () => identifier('orders; DROP TABLE users'),
  'statuses: []': () => findOrders({ statuses: [] }),
  "'Consulta: ' + query": () => 'Consulta: ' + findOrders(),
};
for (const [code, run] of Object.entries(tries)) {
  try {
    run();
  } catch (error) {
    console.warn(`⛔ ${code} → ${error.name}: ${error.message}`);
  }
}
console.log('etiqueta →', Object.prototype.toString.call(findOrders()));
```
