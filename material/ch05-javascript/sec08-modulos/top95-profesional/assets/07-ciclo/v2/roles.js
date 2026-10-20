// ✅ v2/roles.js (ejemplo 07): solo datos. No importa nada.
console.log('(evaluando v2/roles.js)');

export const ROLES = Object.freeze({
  admin: { label: 'Administración', actions: ['ver-ventas', 'editar-precios', 'reembolsar'] },
  staff: { label: 'Tienda', actions: ['ver-ventas'] },
  customer: { label: 'Cliente', actions: [] },
});
