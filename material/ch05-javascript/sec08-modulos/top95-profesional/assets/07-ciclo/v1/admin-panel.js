// PANEL DE ADMINISTRACIÓN, v1 (ejemplo 07): importa user.js primero.
import { User } from './user.js';
import { SYSTEM_USER } from './roles.js';

export function describeAccess(name, roleId, action) {
  return `${name} → ${action}: ${new User(name, roleId).can(action) ? 'sí' : 'no'}`;
}

export const SYSTEM = SYSTEM_USER.name;
