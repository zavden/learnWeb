// 🔁 v1/user.js (ejemplo 07 de «Ejemplos profesionales»): importa permissions.js.
import { can } from './permissions.js';
console.log('(evaluando v1/user.js)');

export class User {
  constructor(name, roleId) {
    this.name = name;
    this.roleId = roleId;
  }

  can(action) {
    return can(this, action);
  }
}
