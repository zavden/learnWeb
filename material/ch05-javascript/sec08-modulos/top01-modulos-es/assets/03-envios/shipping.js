// TARIFAS DE ENVÍO (ejemplo 03 de «Módulos ES»).

const STANDARD_CENTS = 14900;
const EXPRESS_CENTS = 30900;
const FREE_FROM_CENTS = 99900; // envío estándar gratis desde $999.00

export function standard(totalCents) {
  return totalCents >= FREE_FROM_CENTS ? 0 : STANDARD_CENTS;
}

export function express() {
  return EXPRESS_CENTS;
}

// Exportar con otro nombre: aquí dentro se llama pickup; fuera, inStore.
function pickup() {
  return 0;
}
export { pickup as inStore };

// La opción por defecto es la estándar (la misma función, con otro nombre).
export default standard;
