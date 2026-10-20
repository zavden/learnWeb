---
example_description: "Inyección de dependencias frente a singletons de módulo, con pruebas: el servicio de puntos con estado de módulo da pruebas que dependen del orden y no deja cambiar el reloj; la versión con fábrica que recibe reloj y almacén se prueba en cualquier orden y en cualquier fecha"
example_tags: "javascript|profesional|modulos|inyeccion-de-dependencias|singleton|pruebas"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// INYECCIÓN DE DEPENDENCIAS FRENTE A SINGLETONS DE MÓDULO, CON PRUEBAS.
//
// Archivos (assets/06-pruebas/):
//   mini-test.js          → createSuite(), expectEqual(), expectTrue(), printResults()
//   singleton/clock.js    → now(): la fecha del ordenador
//   singleton/loyalty.js  → 🐛 earn(), balance(): Map de módulo + reloj importado
//   injected/loyalty.js   → ✅ createLoyalty({ clock, balances })
//
// La regla de negocio: 1 punto por cada $10, el doble los martes (en la hora
// de Ciudad de México, donde está la tienda).
//
// Decisiones:
// - Un singleton de módulo es cómodo para la aplicación, pero sus
//   dependencias están escondidas: las pruebas comparten su estado y no
//   pueden cambiar lo que importa (los imports son de solo lectura).
// - Con una fábrica que RECIBE sus dependencias, cada prueba crea su propio
//   servicio con un reloj fijo: resultados iguales en cualquier orden y fecha.
// - La aplicación sigue teniendo un solo servicio: lo crea una vez el script
//   de entrada (o un módulo app.js) y lo pasa a quien lo necesite.
//
// Alcance: módulos 1-8.
import { createSuite, expectEqual, expectTrue, printResults } from './06-pruebas/mini-test.js';
import * as singletonLoyalty from './06-pruebas/singleton/loyalty.js';
import * as clockModule from './06-pruebas/singleton/clock.js';
import { createLoyalty } from './06-pruebas/injected/loyalty.js';

// ── 🐛 Pruebas del singleton ─────────────────────────────────────────────
// (No pueden comprobar «21 puntos por $210»: los martes serían 42 y la
// prueba fallaría según el día en que la ejecutes. Se conforman con menos.)
const singletonSuite = createSuite();
singletonSuite.test('earn suma los puntos al saldo', () => {
  const before = singletonLoyalty.balance('ana');
  const points = singletonLoyalty.earn('ana', 21000);
  expectTrue(before === 0 && singletonLoyalty.balance('ana') === points, 'ana ya tenía puntos de antes');
});
singletonSuite.test('una clienta nueva empieza con 0 puntos', () => {
  expectTrue(singletonLoyalty.balance('ana') === 0, 'ana tiene los puntos de otra prueba');
});

console.group('▶ 🐛 singleton: primero la clienta nueva, después earn');
printResults(await singletonSuite.run([1, 0]));
console.groupEnd();
console.group('▶ 🐛 singleton: las mismas pruebas, otra vez, en el otro orden');
printResults(await singletonSuite.run([0, 1])); // el Map del módulo sigue lleno
console.groupEnd();

// ── ✅ Pruebas de la versión inyectada ───────────────────────────────────
const at = (iso) => () => new Date(iso); // un reloj parado en esa fecha
const MONDAY = at('2026-10-12T18:00:00Z');
const TUESDAY = at('2026-10-13T18:00:00Z');
const TUESDAY_NIGHT = at('2026-10-14T03:00:00Z'); // ya es miércoles en UTC

const injectedSuite = createSuite();
injectedSuite.test('$210 un lunes dan 21 puntos', () => {
  expectEqual(createLoyalty({ clock: MONDAY }).earn('ana', 21000), 21);
});
injectedSuite.test('el martes, puntos dobles', () => {
  expectEqual(createLoyalty({ clock: TUESDAY }).earn('ana', 21000), 42);
});
injectedSuite.test('martes a las 21:00 en México (miércoles en UTC), dobles', () => {
  expectEqual(createLoyalty({ clock: TUESDAY_NIGHT }).earn('ana', 21000), 42);
});
injectedSuite.test('una clienta nueva empieza con 0 puntos', () => {
  expectEqual(createLoyalty({ clock: MONDAY }).balance('ana'), 0);
});

console.group('▶ ✅ inyección, en un orden');
printResults(await injectedSuite.run([0, 1, 2, 3]));
console.groupEnd();
console.group('▶ ✅ inyección, al revés');
printResults(await injectedSuite.run([3, 2, 1, 0]));
console.groupEnd();

// ── Los atajos que no funcionan ──────────────────────────────────────────
console.group('▶ ¿y si cambiamos el reloj del módulo desde la prueba?');
try {
  clockModule.now = TUESDAY;
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}
// Una copia nueva del módulo (otra URL) trae saldos vacíos…
const fresh = await import('./06-pruebas/singleton/loyalty.js?prueba=1');
console.log('saldo de ana en una copia nueva →', fresh.balance('ana'));
// …pero su './clock.js' es la MISMA URL de antes: el reloj sigue sin poder cambiarse.
console.log('¿la copia es otro módulo? →', fresh !== singletonLoyalty);
console.groupEnd();

// La aplicación, mientras tanto, crea UN servicio con el reloj de verdad y
// lo pasa a quien lo use: un singleton por decisión, no por accidente.
const loyalty = createLoyalty();
console.log('servicio de la aplicación →', typeof loyalty.earn, typeof loyalty.balance);
```
