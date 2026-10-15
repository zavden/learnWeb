---
example_description: "Los decoradores de Python sin @: funciones que envuelven a otras para añadir registro, ejecución única (once) o un valor de respaldo ante errores"
example_tags: "javascript|python|orden-superior|decoradores|once|envoltorios"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un decorador de Python (@cache, @wraps…) es una función que recibe una función
// y devuelve OTRA que la envuelve. JavaScript no tiene la sintaxis @ para
// funciones sueltas, pero el patrón es idéntico: const f = decorador(f).

// 1) Registro: anota cada llamada con sus argumentos y su resultado.
function withLogging(fn, label = fn.name) {
  return (...args) => {
    const result = fn(...args);
    console.log(`  📝 ${label}(${args.join(', ')}) → ${result}`);
    return result;
  };
}
function shippingCents(weightGrams, express) {
  const base = weightGrams <= 2000 ? 495 : 795;
  return express ? base + 600 : base;
}
const loggedShipping = withLogging(shippingCents);
loggedShipping(1500, false);
loggedShipping(3200, true);

// 2) once: la función solo se ejecuta la PRIMERA vez; después devuelve
//    el mismo resultado (útil para inicializar algo una sola vez).
function once(fn) {
  let done = false;
  let result;
  return (...args) => {
    if (!done) {
      done = true;
      result = fn(...args);
    }
    return result;
  };
}
const connectPayments = once(() => {
  console.log('  ⚙️ conectando con la pasarela de pago…');
  return 'conexión lista';
});
console.log(connectPayments(), '|', connectPayments(), '|', connectPayments());

// 3) Respaldo ante errores: si la función lanza, devuelve un valor por defecto.
function withFallback(fn, fallback) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      console.log(`  ⚠️ ${error.name}: se usa el valor de respaldo`);
      return fallback;
    }
  };
}
const parseSettings = withFallback(JSON.parse, { theme: 'claro' });
console.log('válido →', parseSettings('{"theme": "oscuro"}'));
console.log('roto →', parseSettings('{theme: oscuro}'));

// Se pueden apilar, como varios @ seguidos (el de fuera envuelve al de dentro):
const parseLogged = withLogging(withFallback(JSON.parse, null), 'parseLogged');
parseLogged('{roto');

// > Desde Python:  @once                       const init = once(function init() {
//                  def init(): …                  …
//                                              });
```
