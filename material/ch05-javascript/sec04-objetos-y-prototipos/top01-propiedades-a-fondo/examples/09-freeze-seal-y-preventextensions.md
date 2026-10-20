---
example_description: "Tres niveles de bloqueo: preventExtensions impide añadir, seal además borrar y freeze además cambiar; una tabla lo comprueba en vivo"
example_tags: "javascript|python|objetos|freeze|seal|inmutabilidad"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Intenta añadir, borrar y cambiar una propiedad de un objeto bloqueado con
// lockFn, y anota qué ha funcionado. (Script clásico: lo prohibido falla en
// silencio, así que se comprueba mirando el objeto después.)
function tryChanges(lockFn) {
  const settings = { theme: 'dark', fontSize: 16 };
  lockFn(settings);
  settings.language = 'es'; // añadir
  delete settings.fontSize;   // borrar
  settings.theme = 'light';   // cambiar
  return {
    add: Object.hasOwn(settings, 'language') ? '✅' : '❌',
    delete: Object.hasOwn(settings, 'fontSize') ? '❌' : '✅',
    change: settings.theme === 'light' ? '✅' : '❌',
    isExtensible: Object.isExtensible(settings),
    isSealed: Object.isSealed(settings),
    isFrozen: Object.isFrozen(settings),
  };
}

console.table({
  'sin bloquear': tryChanges(() => {}),
  preventExtensions: tryChanges(Object.preventExtensions),
  seal: tryChanges(Object.seal),
  freeze: tryChanges(Object.freeze),
});

// Qué hace cada uno con los atributos que ya conoces:
//   preventExtensions → el objeto no admite propiedades nuevas
//   seal              → lo anterior + configurable: false en todas
//   freeze            → lo anterior + writable: false en todas
const frozen = Object.freeze({ theme: 'dark' });
console.log('freeze →', Object.getOwnPropertyDescriptor(frozen, 'theme'));

// Los tres son definitivos: no hay «descongelar». Y devuelven el mismo objeto,
// así que se pueden usar al crearlo:
const ROLES = Object.freeze(['lector', 'editor', 'admin']);
try {
  ROLES.push('superadmin'); // los métodos que mutan SÍ lanzan error, incluso sin modo estricto
} catch (error) {
  console.log('ROLES.push →', error.name, '|', error.message);
}

// > Desde Python: freeze se parece a @dataclass(frozen=True) o a pasar de list
//   a tuple; seal recuerda a __slots__ (no se añaden atributos nuevos).
```
