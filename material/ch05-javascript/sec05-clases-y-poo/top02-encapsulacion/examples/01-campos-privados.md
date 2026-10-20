---
example_description: "Los campos #privados solo se pueden leer y escribir dentro del cuerpo de la clase: desde fuera son un SyntaxError, y no aparecen como propiedades"
example_tags: "javascript|python|clases|privados|encapsulacion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
class BankAccount {
  #balanceCents = 0; // privado: el # forma parte del nombre
  #movements = [];

  constructor(owner) {
    this.owner = owner; // público
  }

  deposit(cents) {
    if (!Number.isInteger(cents) || cents <= 0) throw new RangeError(`Importe no válido: ${cents}`);
    this.#balanceCents += cents;
    this.#movements.push(cents);
    return this;
  }

  withdraw(cents) {
    if (cents > this.#balanceCents) throw new RangeError('Fondos insuficientes');
    this.#balanceCents -= cents;
    this.#movements.push(-cents);
    return this;
  }

  balance() {
    return `${this.owner}: $${(this.#balanceCents / 100).toFixed(2)} (${this.#movements.length} movimientos)`;
  }
}

const account = new BankAccount('Valeria Ortiz');
account.deposit(150000).withdraw(32050);
console.log(account.balance());

// Desde fuera, #balanceCents no existe como propiedad:
console.log('account →', account); // BankAccount {owner: 'Valeria Ortiz'}
console.log('Object.keys →', Object.keys(account));
console.log("account['#balanceCents'] →", account['#balanceCents']); // un string cualquiera
account.balanceCents = 99999999; // crea una propiedad pública NUEVA, sin relación
console.log('tras «hackear» →', account.balance());

// Y escribir account.#balanceCents fuera de la clase ni siquiera compila: el
// script entero no se ejecutaría. Lo comprobamos compilando ese texto aparte:
// new Function(parámetros…, cuerpo) convierte un texto en una función.
try {
  new Function('account', 'return account.#balanceCents');
} catch (error) {
  console.log('fuera de la clase →', error.name, '|', error.message);
}

// 👉 La consola de LearnWeb no enseña #balanceCents: ningún código JavaScript
//    puede leerlo desde fuera. Las DevTools de Chrome sí lo muestran (abre el
//    ejemplo con ↗ y F12): son una herramienta del navegador, no código de la página.
// > Desde Python: no hay nada parecido. self.__balance se renombra a
//   _BankAccount__balance, pero sigue siendo accesible; #balanceCents no lo es.
```
