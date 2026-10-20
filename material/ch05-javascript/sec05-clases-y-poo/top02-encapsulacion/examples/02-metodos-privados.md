---
example_description: "Métodos y getters #privados: ayudantes internos que no forman parte de la API pública ni del prototipo"
example_tags: "javascript|clases|privados|metodos|encapsulacion"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
class PasswordPolicy {
  #minLength;

  constructor(minLength = 10) {
    this.#minLength = minLength;
  }

  // API pública: un solo método.
  check(password) {
    const problems = [this.#lengthProblem(password), this.#varietyProblem(password)].filter(Boolean);
    return problems.length === 0 ? '✅ válida' : `⛔ ${problems.join('; ')}`;
  }

  // Ayudantes privados: detalles de implementación que se pueden cambiar
  // sin romper el código de nadie, porque nadie más puede llamarlos.
  #lengthProblem(password) {
    return password.length < this.#minLength && `mínimo ${this.#minLength} caracteres`;
  }

  #varietyProblem(password) {
    return this.#kinds(password) < 3 && 'mezcla minúsculas, mayúsculas, números o símbolos';
  }

  // También puede haber getters privados.
  get #charKinds() {
    const isDigit = (ch) => ch >= '0' && ch <= '9';
    return [
      (ch) => ch >= 'a' && ch <= 'z',
      (ch) => ch >= 'A' && ch <= 'Z',
      isDigit,
      (ch) => ch.toLowerCase() === ch.toUpperCase() && !isDigit(ch), // ni letra ni número
    ];
  }

  #kinds(password) {
    const chars = [...password];
    return this.#charKinds.filter((isKind) => chars.some(isKind)).length;
  }
}

const policy = new PasswordPolicy();
for (const candidate of ['gato123', 'margaritas-del-campo', 'Margaritas-2026']) {
  console.log(`${candidate} →`, policy.check(candidate));
}

// Los métodos privados no están en el prototype: no se heredan ni se pueden tomar prestados.
console.log('PasswordPolicy.prototype →', Object.getOwnPropertyNames(PasswordPolicy.prototype)); // ['constructor', 'check']
console.log('policy.lengthProblem →', policy.lengthProblem); // undefined

// Si alguien «toma prestado» check con otro this, los privados lo detectan:
try {
  PasswordPolicy.prototype.check.call({}, 'Abc-123456');
} catch (error) {
  console.log('check con otro this →', error.name, '|', error.message);
}
```
