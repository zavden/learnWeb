// ✅ v2/user.js (ejemplo 07): depende solo de permissions.js.
import { can } from './permissions.js';
console.log('(evaluando v2/user.js)');

export class User {
  constructor(name, roleId) {
    this.name = name;
    this.roleId = roleId;
  }

  can(action) {
    return can(this, action);
  }
}
