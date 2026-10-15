---
example_description: "Errores propios con class extends Error: instanceof funciona, pero name sigue siendo «Error» si no lo cambias; datos extra, cause y por qué con una función constructora no se podía"
example_tags: "javascript|python|clases|herencia|errores|error|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 1. Una subclase vacía: instanceof funciona, pero el nombre es el del padre.
class PlainValidationError extends Error {}
const plain = new PlainValidationError('El correo no es válido');
console.log('🐛 name →', plain.name, '| String →', String(plain));
console.log('   instanceof →', plain instanceof PlainValidationError, plain instanceof Error);
// name se hereda de Error.prototype ('Error'): en la consola y en los
// registros verías «Error: …», sin pista del tipo real.

// ✅ 2. Una base que pone el nombre de la clase real (new.target) y pasa
//    las opciones (como { cause }) al constructor de Error.
class AppError extends Error {
  constructor(message, options) {
    super(message, options); // Error guarda message, cause y la pila
    this.name = new.target.name; // la clase con la que se llamó a new
  }
}
class ValidationError extends AppError {
  constructor(field, message, options) {
    super(message, options);
    this.field = field; // datos extra para quien atrape el error
  }
}
class NetworkError extends AppError {}

function saveSignup(data) {
  if (!data.email) throw new ValidationError('email', 'El correo es obligatorio');
  try {
    JSON.parse(data.response); // simulamos la respuesta del servidor
  } catch (error) {
    throw new NetworkError('El servidor respondió algo ilegible', { cause: error });
  }
}

for (const data of [{ name: 'Lucía' }, { email: 'lucia@example.com', response: '<html>' }]) {
  try {
    saveSignup(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.warn(`⛔ ${error.name} en «${error.field}»: ${error.message}`);
    } else if (error instanceof NetworkError) {
      console.warn(`⛔ ${error.name}: ${error.message} | causa: ${error.cause.name}`);
    } else {
      throw error; // lo que no sabemos manejar, sigue subiendo
    }
  }
}
const sample = new ValidationError('email', 'El correo es obligatorio');
console.log('✅ String →', String(sample));
console.log('✅ stack, 1.ª línea →', sample.stack.split('\n')[0]);
// (new.target.name depende del nombre de la clase: si una herramienta de
//  producción acorta los nombres, escribe el nombre a mano: this.name = 'ValidationError'.)

// 🐛 3. Antes de class no había forma limpia: Error.call(this) no rellena this.
function OldError(message) {
  Error.call(this, message); // Error crea y devuelve OTRO objeto; this no cambia
}
OldError.prototype = Object.create(Error.prototype);
const old = new OldError('Fallo antiguo');
console.log('🐛 OldError: message →', JSON.stringify(old.message), '| stack →', old.stack);

// > Desde Python: class ValidationError(Exception) con su __init__.
//   Python pone el nombre de la clase solo; en JavaScript hay que asignar name.
```
