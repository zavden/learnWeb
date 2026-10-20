// FORMATO (ejemplo 01 de «Organizar el código»).
// Responsabilidad: convertir datos en texto. No conoce el carrito ni el
// catálogo, no guarda estado y no toca la página: solo funciones puras.

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function formatPrice(cents) {
  return money.format(cents / 100);
}

export function padLine(left, right, width = 34) {
  return `${left} ${'.'.repeat(Math.max(1, width - left.length - right.length))} ${right}`;
}
