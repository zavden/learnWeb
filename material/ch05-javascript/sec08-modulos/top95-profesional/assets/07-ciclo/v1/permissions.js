// 🔁 v1/permissions.js (ejemplo 07): importa roles.js.
import { ROLES } from './roles.js';
console.log('(evaluando v1/permissions.js)');

export function can(user, action) {
  return ROLES[user.roleId]?.actions.includes(action) ?? false;
}
