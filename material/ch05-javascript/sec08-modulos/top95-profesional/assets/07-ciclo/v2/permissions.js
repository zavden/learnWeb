// ✅ v2/permissions.js (ejemplo 07): depende solo de roles.js.
import { ROLES } from './roles.js';
console.log('(evaluando v2/permissions.js)');

export function can(user, action) {
  return ROLES[user.roleId]?.actions.includes(action) ?? false;
}
