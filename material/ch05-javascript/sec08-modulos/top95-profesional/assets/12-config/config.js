// CARGAR LA CONFIGURACIÓN (ejemplo 12).
//
// - base.json se importa con un import estático: siempre hace falta.
// - El archivo de cada entorno se carga con import() solo para ese entorno.
// - Se MEZCLAN sin tocar base.json: un módulo JSON es un objeto compartido
//   por todos los que lo importan, y cambiarlo cambiaría la base de todos.
// - Se valida entera y, si algo está mal, se lanza un ConfigError con TODOS
//   los problemas: mejor que la tienda no arranque a que arranque mal.
// - El resultado se congela a fondo: nadie la cambia después.
import base from './base.json' with { type: 'json' };
import { SCHEMA, validate } from './schema.js';

const ENVIRONMENTS = {
  development: async () => ({ default: {} }), // la base, tal cual
  production: () => import('./production.json', { with: { type: 'json' } }),
  staging: () => import('./staging.json', { with: { type: 'json' } }),
};

export class ConfigError extends Error {
  constructor(environment, problems) {
    super(`Configuración «${environment}» no válida: ${problems.length} problema(s)`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

// Los objetos se mezclan clave a clave; los arrays y los valores, se sustituyen.
function deepMerge(target, source) {
  const result = structuredClone(target);
  for (const [key, value] of Object.entries(source)) {
    result[key] = isPlainObject(value) && isPlainObject(result[key]) ? deepMerge(result[key], value) : structuredClone(value);
  }
  return result;
}

function deepFreeze(value) {
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export async function loadConfig(environment) {
  if (!Object.hasOwn(ENVIRONMENTS, environment)) throw new RangeError(`Entorno desconocido: ${environment}`);
  const { default: overrides } = await ENVIRONMENTS[environment]();
  const config = deepMerge(base, overrides);
  const problems = validate(config, SCHEMA);
  if (problems.length > 0) throw new ConfigError(environment, problems);
  return deepFreeze(config);
}
