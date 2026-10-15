---
example_description: "Uppercase, Lowercase, Capitalize y Uncapitalize transforman tipos de texto (son los únicos tipos «intrínsecos», hechos por el compilador); una función capitalize<S> con retorno Capitalize<S> necesita un as, porque TypeScript no comprueba que el JavaScript haga lo mismo"
example_tags: "typescript|template-literal-types|uppercase|capitalize|genericos"
example_stage: minimal
example_importance: useful
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Currency = 'mxn' | 'usd' | 'eur';
type EventName = 'click' | 'keydown';

type Checks = [
  Expect<Equal<Uppercase<Currency>, 'MXN' | 'USD' | 'EUR'>>,
  Expect<Equal<Lowercase<'Café'>, 'café'>>,
  Expect<Equal<Capitalize<EventName>, 'Click' | 'Keydown'>>,
  Expect<Equal<Uncapitalize<'PriceLabel'>, 'priceLabel'>>,
  // Se combinan con las plantillas:
  Expect<Equal<`on${Capitalize<EventName>}`, 'onClick' | 'onKeydown'>>,
];

// La versión en ejecución: el tipo de retorno describe lo que hace el código…
function capitalize<S extends string>(text: S): Capitalize<S> {
  // …pero TypeScript no puede comprobarlo: el as dice «confía, hago lo mismo que Capitalize».
  return (text.charAt(0).toUpperCase() + text.slice(1)) as Capitalize<S>;
}
function toCode<C extends Currency>(currency: C): Uppercase<C> {
  return currency.toUpperCase() as Uppercase<C>;
}

const handlerName = `on${capitalize('click')}` as const; // → 'onClick'
const code = toCode('mxn'); // → 'MXN'
type Checks2 = [Expect<Equal<typeof handlerName, 'onClick'>>, Expect<Equal<typeof code, 'MXN'>>];

console.log(handlerName, '|', code, '|', capitalize('mole negro'));
```
