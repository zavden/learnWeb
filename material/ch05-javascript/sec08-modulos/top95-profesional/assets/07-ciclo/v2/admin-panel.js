// PANEL DE ADMINISTRACIÓN, v2 (ejemplo 07): el mismo orden de imports que v1.
import { User } from './user.js';
import { SYSTEM_USER } from './system-user.js';

export function describeAccess(name, roleId, action) {
  return `${name} → ${action}: ${new User(name, roleId).can(action) ? 'sí' : 'no'}`;
}

export const SYSTEM = SYSTEM_USER.name;
