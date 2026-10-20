---
example_description: "Si una constructora devuelve un objeto, new devuelve ese objeto y descarta this; útil para reutilizar instancias desde una caché"
example_tags: "javascript|prototipos|new|return|cache"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Uso real del paso 4 de new: una constructora que REUTILIZA instancias.
// Solo debe existir un objeto Currency por código ('EUR', 'MXN'…).
const currencyCache = new Map();

function Currency(code, symbol) {
  if (currencyCache.has(code)) {
    return currencyCache.get(code); // objeto → new devuelve este y descarta this
  }
  this.code = code;
  this.symbol = symbol;
  currencyCache.set(code, this);
  // sin return → new devuelve this
}
Currency.prototype.format = function (cents) {
  return `${(cents / 100).toFixed(2)} ${this.symbol}`;
};

const euro = new Currency('EUR', '€');
const euroAgain = new Currency('EUR', 'EUR'); // ya existe: se devuelve el guardado
const peso = new Currency('MXN', '$');

console.log('¿el mismo objeto? →', euro === euroAgain); // true
console.log('euroAgain.symbol →', euroAgain.symbol);     // '€': el segundo símbolo se ignoró
console.log('instancias creadas →', currencyCache.size); // 2
console.log(euro.format(129900), '|', peso.format(45050));

// Un primitivo en el return no cuenta: new lo ignora y devuelve this.
function Ticket(id) {
  this.id = id;
  return 'ignorado';
}
console.log('new Ticket →', new Ticket('T-881'));

// Regla de estilo: no devuelvas nada desde una constructora salvo que
// quieras exactamente este comportamiento. Las clases (módulo «Clases y POO»)
// siguen la misma regla.
```
