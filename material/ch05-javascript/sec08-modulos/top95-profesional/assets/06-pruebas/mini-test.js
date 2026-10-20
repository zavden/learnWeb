// UN EJECUTOR DE PRUEBAS MÍNIMO (ejemplo 06 de «Ejemplos profesionales»).
// test(nombre, fn) registra; run(orden) las ejecuta en el orden pedido y
// devuelve los resultados. Una prueba falla si lanza un error.
export function createSuite() {
  const tests = [];
  return {
    test(name, fn) {
      tests.push({ name, fn });
    },
    async run(order = tests.map((_, index) => index)) {
      const results = [];
      for (const index of order) {
        const { name, fn } = tests[index];
        try {
          await fn();
          results.push({ name, ok: true });
        } catch (error) {
          results.push({ name, ok: false, message: error.message });
        }
      }
      return results;
    },
  };
}

export function expectEqual(actual, expected) {
  if (!Object.is(actual, expected)) throw new Error(`esperaba ${expected} y obtuvo ${actual}`);
}

export function expectTrue(condition, message) {
  if (!condition) throw new Error(message);
}

export function printResults(results) {
  for (const result of results) {
    console.log(result.ok ? `✓ ${result.name}` : `⚠️ ${result.name} → ${result.message}`);
  }
}
