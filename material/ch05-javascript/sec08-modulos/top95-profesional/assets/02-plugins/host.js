// ANFITRIÓN DE PLUGINS DE INFORMES (ejemplo 02 de «Ejemplos profesionales»).
//
// - El manifiesto (un módulo JSON) dice qué plugins existen; ninguno se
//   descarga hasta que alguien lo usa.
// - Cada plugin es un módulo con un export default que cumple un CONTRATO:
//   { id, apiVersion, run(datos, anfitrión) }. Se comprueba al cargarlo.
// - Los plugins reciben lo que necesitan del anfitrión como parámetro
//   (inyección): no importan nada de la aplicación, así que no hay ciclos ni
//   dependencias ocultas.
// - Cada plugin recibe una COPIA congelada de los datos: no puede cambiar
//   los del anfitrión ni los que verá el plugin siguiente.
// - Un plugin roto no rompe a los demás: sus errores se envuelven en un
//   PluginError con el id y la causa.
import manifest from './manifest.json' with { type: 'json' };

export class PluginError extends Error {
  constructor(message, { pluginId, cause } = {}) {
    super(message, { cause });
    this.name = 'PluginError';
    this.pluginId = pluginId;
  }
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function createPluginHost(services) {
  const hostApi = Object.freeze({ apiVersion: manifest.apiVersion, ...services });
  const loading = new Map(); // id → promesa del plugin: dos peticiones a la vez, una carga

  function entryOf(id) {
    const entry = manifest.plugins.find((plugin) => plugin.id === id);
    if (!entry) throw new PluginError(`Plugin desconocido: ${id}`, { pluginId: id });
    return entry;
  }

  function validate(plugin, entry) {
    const problems = [];
    if (typeof plugin !== 'object' || plugin === null) {
      problems.push('no tiene export default');
    } else {
      if (plugin.id !== entry.id) problems.push(`su id «${plugin.id}» no coincide con el manifiesto`);
      if (typeof plugin.run !== 'function') problems.push('le falta run()');
      if (plugin.apiVersion !== manifest.apiVersion) {
        problems.push(`usa la API v${plugin.apiVersion}; este anfitrión ofrece la v${manifest.apiVersion}`);
      }
    }
    if (problems.length > 0) {
      throw new PluginError(`«${entry.id}» no cumple el contrato: ${problems.join('; ')}`, { pluginId: entry.id });
    }
  }

  async function importPlugin(entry) {
    let namespace;
    try {
      // La ruta sale del manifiesto: import() la resuelve contra ESTE archivo.
      // (Un empaquetador no puede adivinar rutas que vienen de datos: los
      // plugins se sirven como archivos sueltos.)
      namespace = await import(entry.entry);
    } catch (cause) {
      throw new PluginError(`No se pudo cargar «${entry.id}»: ${cause.name}: ${cause.message}`, { pluginId: entry.id, cause });
    }
    validate(namespace.default, entry);
    return namespace.default;
  }

  async function load(id) {
    const entry = entryOf(id);
    if (!loading.has(id)) loading.set(id, importPlugin(entry));
    try {
      return await loading.get(id);
    } catch (error) {
      loading.delete(id); // olvida el fallo: el siguiente intento vuelve a probar
      throw error;
    }
  }

  async function run(id, data) {
    const plugin = await load(id);
    try {
      return await plugin.run(deepFreeze(structuredClone(data)), hostApi);
    } catch (cause) {
      throw new PluginError(`«${id}» falló al ejecutarse: ${cause.message}`, { pluginId: id, cause });
    }
  }

  return {
    list: () => manifest.plugins.map(({ id, label }) => ({ id, label })),
    loadedIds: () => [...loading.keys()],
    load,
    run,
  };
}
