// Una «biblioteca de terceros» en JavaScript, sin tipos: busca las sucursales de la
// tienda más cercanas a un código postal. La usa el ejemplo 6 de la integración.
const BRANCHES = [
  { id: 'cdmx-roma', name: 'Roma Norte', city: 'Ciudad de México', postalCode: '06700', hours: { open: '09:00', close: '20:00' } },
  { id: 'cdmx-coyoacan', name: 'Coyoacán', city: 'Ciudad de México', postalCode: '04000', hours: { open: '10:00', close: '19:00' } },
  { id: 'oax-centro', name: 'Centro', city: 'Oaxaca', postalCode: '68000', hours: { open: '08:00', close: '21:00' } },
  { id: 'pue-centro', name: 'Centro', city: 'Puebla', postalCode: '72000', hours: { open: '09:00', close: '18:00' } },
];

// «Distancia» simplificada para el ejemplo: la diferencia entre los códigos postales.
export function nearestBranches(postalCode, limit = 2) {
  const target = Number(postalCode);
  return BRANCHES
    .map((branch) => ({ ...branch, distance: Math.abs(Number(branch.postalCode) - target) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// time es un texto «HH:MM»: los textos de la misma longitud se comparan bien como texto.
export function isOpen(branch, time) {
  return time >= branch.hours.open && time < branch.hours.close;
}
