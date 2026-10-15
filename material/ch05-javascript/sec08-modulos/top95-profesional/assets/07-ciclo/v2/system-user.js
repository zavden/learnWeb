// ✅ v2/system-user.js (ejemplo 07): lo que creaba el ciclo, en su propio
// módulo. Depende de user.js; nadie de abajo depende de él.
import { User } from './user.js';
console.log('(evaluando v2/system-user.js)');

export const SYSTEM_USER = new User('sistema', 'admin');
