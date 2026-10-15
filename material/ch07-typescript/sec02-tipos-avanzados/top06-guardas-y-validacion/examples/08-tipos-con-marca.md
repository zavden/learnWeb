---
example_description: "Tipos con marca (branded types): Pesos y Dollars son number con una marca distinta que solo existe en el tipo, así que mezclarlos es un error (TS2345) aunque en ejecución sean números normales; se crean con constructores inteligentes"
example_tags: "typescript|python|tipos-con-marca|branded|tipado-estructural|interseccion|ts2345"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// number & { … }: un número con una propiedad «fantasma» que nunca existe en ejecución.
type Pesos = number & { readonly __brand: 'Pesos' };
type Dollars = number & { readonly __brand: 'Dollars' };

// Constructores inteligentes: el ÚNICO sitio con as. Validan y ponen la marca.
function pesos(amount: number): Pesos {
  if (!Number.isFinite(amount)) throw new RangeError(`Importe no válido: ${amount}`);
  return amount as Pesos;
}
function dollars(amount: number): Dollars {
  if (!Number.isFinite(amount)) throw new RangeError(`Importe no válido: ${amount}`);
  return amount as Dollars;
}

const USD_TO_MXN = 18.5;
function toPesos(amount: Dollars): Pesos {
  return pesos(amount * USD_TO_MXN); // la aritmética da number: hay que volver a marcar
}
function addShipping(subtotal: Pesos): Pesos {
  return pesos(subtotal + 99);
}

const cart = pesos(1250);
const imported = dollars(40);
console.log('✅ carrito →', addShipping(cart));
console.log('✅ importado →', addShipping(toPesos(imported)));

// El problema del módulo 1 (Pesos y Dollars con la misma forma), ahora detectado:
console.log('🐛 →', addShipping(imported)); // ❌ Error TS2345 a propósito: son dólares, no pesos
console.log('🐛 →', addShipping(1250)); // ❌ Error TS2345 a propósito: un number suelto no tiene marca

// La marca se borra: en ejecución son números normales.
console.log('typeof cart →', typeof cart, '| cart + 1 →', cart + 1);
```
