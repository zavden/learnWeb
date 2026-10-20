// 🔁 v1/roles.js (ejemplo 07): importa user.js… y cierra el ciclo
// user.js → permissions.js → roles.js → user.js.
import { User } from './user.js';
console.log('(evaluando v1/roles.js)');

export const ROLES = {
  admin: { label: 'Administración', actions: ['ver-ventas', 'editar-precios', 'reembolsar'] },
  staff: { label: 'Tienda', actions: ['ver-ventas'] },
  customer: { label: 'Cliente', actions: [] },
};

// 🐛 Usa User en el NIVEL SUPERIOR. Si user.js todavía no terminó de
//    evaluarse (porque fue él quien empezó el ciclo), User está en su zona
//    muerta temporal: ReferenceError.
export const SYSTEM_USER = new User('sistema', 'admin');
