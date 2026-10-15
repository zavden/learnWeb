// EL ESQUEMA DE LA CONFIGURACIÓN (ejemplo 12 de «Ejemplos profesionales»).
// Cada validador recibe un valor y devuelve un texto con el problema, o
// null si está bien. validate() recorre el esquema y junta TODOS los
// problemas (no solo el primero), cada uno con su ruta: «api.timeoutMs».

const describe = (value) => (typeof value === 'string' ? `«${value}», un string` : JSON.stringify(value));

export const text = () => (value) => (typeof value === 'string' && value.trim() !== '' ? null : `debe ser un texto (es ${describe(value)})`);
export const flag = () => (value) => (typeof value === 'boolean' ? null : `debe ser true o false (es ${describe(value)})`);
export const integer = ({ min = -Infinity, max = Infinity } = {}) => (value) => {
  if (!Number.isInteger(value)) return `debe ser un entero (es ${describe(value)})`;
  if (value >= min && value <= max) return null;
  return max === Infinity ? `debe ser ${min} o más (es ${value})` : `debe estar entre ${min} y ${max} (es ${value})`;
};
export const number = ({ min = -Infinity, max = Infinity } = {}) => (value) => (
  typeof value === 'number' && value >= min && value <= max ? null : `debe ser un número entre ${min} y ${max} (es ${describe(value)})`
);
export const oneOf = (options) => (value) => (options.includes(value) ? null : `debe ser uno de: ${options.join(', ')} (es ${describe(value)})`);
// URL.canParse y new URL(…).protocol: la API URL se estudia en el capítulo 6.
export const httpUrl = () => (value) => (
  typeof value === 'string' && URL.canParse(value) && ['http:', 'https:'].includes(new URL(value).protocol)
    ? null
    : `debe ser una URL http(s) completa (es ${describe(value)})`
);
export const arrayOf = (check) => (value) => {
  if (!Array.isArray(value) || value.length === 0) return `debe ser una lista no vacía (es ${describe(value)})`;
  const problems = value.map(check).filter(Boolean);
  return problems.length > 0 ? problems.join('; ') : null;
};

export const SCHEMA = {
  shop: { name: text(), currency: oneOf(['MXN', 'USD']), locale: text(), timeZone: text() },
  api: { baseUrl: httpUrl(), timeoutMs: integer({ min: 100, max: 30000 }) },
  shipping: { standardCents: integer({ min: 0 }), freeFromCents: integer({ min: 0 }), carriers: arrayOf(oneOf(['estafeta', 'dhl', 'fedex'])) },
  payments: { methods: arrayOf(oneOf(['card', 'oxxo', 'spei'])), cardFeePercent: number({ min: 0, max: 10 }) },
  features: { giftWrap: flag(), sameDayDelivery: flag() },
};

export function validate(value, schema, path = '') {
  const problems = [];
  for (const [key, rule] of Object.entries(schema)) {
    const childPath = path ? `${path}.${key}` : key;
    const child = value?.[key];
    if (typeof rule === 'function') {
      const problem = child === undefined ? 'falta' : rule(child);
      if (problem) problems.push(`${childPath}: ${problem}`);
    } else {
      problems.push(...validate(child, rule, childPath));
    }
  }
  for (const key of Object.keys(value ?? {})) {
    if (!Object.hasOwn(schema, key)) problems.push(`${path ? `${path}.` : ''}${key}: clave desconocida (¿una errata?)`);
  }
  return problems;
}
