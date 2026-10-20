// UN CONTENEDOR DE SERVICIOS (ejemplo 11).
// register(clave, fábrica, { deps, lifetime }) dice cómo crear un servicio;
// resolve(clave) lo crea (y antes, sus dependencias). Con lifetime
// 'singleton' (por defecto) se crea una vez por contenedor; con 'transient',
// uno nuevo cada vez. Los ciclos entre servicios se detectan con una pila.
export function createContainer() {
  const registrations = new Map(); // clave → { factory, deps, lifetime }
  const instances = new Map(); // clave → instancia (singletons)
  const resolving = []; // las claves que se están creando ahora mismo

  const container = {
    register(token, factory, { deps = [], lifetime = 'singleton' } = {}) {
      if (typeof token !== 'symbol') throw new TypeError('La clave de un servicio debe ser un símbolo');
      registrations.set(token, { factory, deps, lifetime });
      instances.delete(token);
      return container;
    },

    resolve(token) {
      const registration = registrations.get(token);
      if (!registration) throw new Error(`Servicio no registrado: ${token.description}`);
      if (instances.has(token)) return instances.get(token);
      if (resolving.includes(token)) {
        throw new Error(`Ciclo de servicios: ${[...resolving, token].map((key) => key.description).join(' → ')}`);
      }
      resolving.push(token);
      try {
        const instance = registration.factory(...registration.deps.map((dependency) => container.resolve(dependency)));
        if (registration.lifetime === 'singleton') instances.set(token, instance);
        return instance;
      } finally {
        resolving.pop();
      }
    },

    get [Symbol.toStringTag]() {
      return `Container(${registrations.size})`;
    },
  };
  return container;
}
