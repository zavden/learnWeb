---
example_description: "Los bloques static {} se ejecutan una vez al definir la clase: preparan tablas con varias sentencias y pueden dar acceso a los privados a una función de fuera"
example_tags: "javascript|python|clases|static|inicializacion|privados"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
let auditBalance; // se rellenará dentro de la clase

class Currency {
  static #byCode = new Map();

  // Bloque static: código que se ejecuta UNA vez, al evaluar la clase.
  // Aquí cabe lo que no cabe en un inicializador: bucles, try/catch, varias líneas.
  static {
    const table = [
      ['MXN', '$', 2],
      ['EUR', '€', 2],
      ['JPY', '¥', 0],
    ];
    for (const [code, symbol, decimals] of table) {
      this.#byCode.set(code, new Currency(code, symbol, decimals)); // this = la clase
    }
    console.log(`  bloque static: ${this.#byCode.size} monedas registradas`);
  }

  constructor(code, symbol, decimals) {
    this.code = code;
    this.symbol = symbol;
    this.decimals = decimals;
  }

  static get(code) {
    const currency = Currency.#byCode.get(code);
    if (!currency) throw new RangeError(`Moneda desconocida: ${code}`);
    return currency;
  }

  format(minorUnits) {
    return `${this.symbol}${(minorUnits / 10 ** this.decimals).toFixed(this.decimals)} ${this.code}`;
  }
}

console.log('tras definir la clase'); // el bloque ya se ejecutó antes que esta línea
console.log(Currency.get('MXN').format(129900));
console.log(Currency.get('JPY').format(1500));
console.log('¿la misma instancia? →', Currency.get('EUR') === Currency.get('EUR'));

// Otro uso: dar acceso a un privado a UNA función de fuera, declarada antes.
class Wallet {
  #cents = 0;
  add(cents) {
    this.#cents += cents;
    return this;
  }
  static {
    auditBalance = (wallet) => wallet.#cents; // la flecha está dentro de la clase
  }
}
const wallet = new Wallet().add(2500).add(1250);
console.log('auditoría →', auditBalance(wallet)); // 3750: nadie más puede leerlo

// > Desde Python: el cuerpo de una clase de Python YA es código que se ejecuta
//   una vez (puedes escribir un for ahí). En JavaScript, el cuerpo solo admite
//   declaraciones; static {} es el sitio para ese código.
```
