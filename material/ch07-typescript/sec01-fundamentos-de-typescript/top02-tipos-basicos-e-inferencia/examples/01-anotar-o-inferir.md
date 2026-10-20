---
example_description: "Anotaciones (nombre: tipo) frente a inferencia: los primitivos en minúsculas, variables con valor inicial sin anotar, parámetros siempre anotados y el retorno deducido del return (o anotado como contrato)"
example_tags: "typescript|python|anotaciones|inferencia|primitivos"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// 1. Anotación: «nombre: tipo». Los tipos primitivos van en minúsculas.
const title: string = 'Pan de muerto';
const unitPrice: number = 45.5; // enteros y decimales: un solo tipo, number
const inStock: boolean = true;

// 2. Inferencia: con un valor inicial, TypeScript deduce el tipo solo.
//    Estas variables están tan tipadas como las de arriba.
let units = 12; // number
let label = 'Docena'; // string
let isGift = false; // boolean

// 3. Funciones: anota los PARÁMETROS (no se pueden deducir) y deja que el
//    tipo de retorno salga del return.
function lineTotal(price: number, quantity: number) {
  return price * quantity; // retorno inferido: number
}
const total = lineTotal(unitPrice, units); // total: number

// 4. Anotar el retorno es opcional, pero sirve de contrato: si el cuerpo no
//    lo cumple, el error sale DENTRO de la función, no en quien la llama.
function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

console.log(title, '|', label, '|', units, 'piezas');
console.log('total →', formatMoney(total));
console.log('¿para regalo? →', isGift, '| ¿hay existencias? →', inStock);

// En ejecución, typeof da los mismos nombres que los tipos primitivos:
console.log(typeof title, typeof unitPrice, typeof inStock);
// > Desde Python: title: str = "Pan de muerto"; def line_total(price: float,
//   quantity: int) -> float. Allí mypy también infiere las variables locales.
```
