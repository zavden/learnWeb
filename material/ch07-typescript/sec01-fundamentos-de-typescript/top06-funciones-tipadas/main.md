# Funciones tipadas

## Por qué importa

Las funciones son la frontera entre las partes de un programa: quien escribe una función decide qué recibe y qué devuelve, y quien la llama tiene que respetarlo. En JavaScript ese acuerdo solo existe en la cabeza de cada uno (o en un comentario), y por eso los argumentos de menos, los `undefined` inesperados y los callbacks que reciben lo que no esperaban están entre los fallos más comunes. En TypeScript, la firma de una función **es** el acuerdo, y el verificador lo hace cumplir en los dos lados. Esta lección recorre todo lo que se puede decir en una firma: parámetros opcionales y por defecto, rest, el tipo de una función como valor, callbacks, sobrecargas y el parámetro `this`.

## Parámetros y retorno

Ya sabes anotar parámetros y retornos. Lo nuevo es lo que TypeScript comprueba con ellos. En JavaScript puedes llamar a una función con más o menos argumentos de los que declara, sin ningún aviso; en TypeScript el **número** de argumentos también forma parte del tipo. Y un retorno anotado se comprueba en **todos** los caminos del cuerpo:

[[exercise:01-parametros-y-retorno.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 9: TS2554: Expected 2 arguments, but got 1.
línea 10: TS2554: Expected 2 arguments, but got 3.
línea 13: TS2366: Function lacks ending return statement and return type does not include 'undefined'.
// Consola:
✅ 5046
🐛 NaN
🐛 4350
🐛 1 noche → undefined
✅ 7 noches → 0.15
```

El mensaje de `TS2366` explica el problema con precisión: la función puede terminar sin `return` (y entonces devuelve `undefined`), pero su tipo de retorno no incluye `undefined`. Sin la anotación `: number`, TypeScript habría inferido `number | undefined` y el error saldría más lejos, en quien usara el resultado. Por eso conviene anotar el retorno de las funciones con varios caminos: el error aparece dentro de la función, donde está el fallo.

## Opcionales y valores por defecto

Un parámetro puede faltar de dos maneras. Con `?` es **opcional**: si no se pasa, vale `undefined`, y dentro de la función su tipo incluye `undefined`. Con un **valor por defecto**, TypeScript infiere el tipo del valor, y dentro de la función el parámetro nunca es `undefined`:

```ts
function formatGuest(name: string, title?: string) { … }        // title: string | undefined
function stayLabel(guest: string, nights = 1, breakfast = false) { … } // nights: number
```

[[exercise:02-opcionales-y-por-defecto.md-]]

```text
Carmen Vidal
Dra. Carmen Vidal
Iván Soto: 1 noche
Iván Soto: 3 noches con desayuno
Iván Soto: 1 noche con desayuno
```

Como en JavaScript, pasar `undefined` de forma explícita activa el valor por defecto, lo que permite saltarse un parámetro intermedio. Cuando eso empieza a ser necesario, es señal de que la función tiene demasiados parámetros posicionales.

> **Desde Python:** `title?: string` es `title: str | None = None`, con `undefined` haciendo de `None`, y `nights = 1` es `nights: int = 1`. TypeScript no tiene argumentos por nombre (`stay_label("Iván", breakfast=True)`); la alternativa es el objeto de opciones del siguiente ejemplo.

Los opcionales tienen una regla de orden: no pueden ir **antes** de un parámetro obligatorio. Si `subject` fuera opcional y fuera delante de `email`, en la llamada `sendInvite('ana@example.com')` no habría forma de saber a cuál de los dos corresponde el texto:

[[exercise:03-opcional-antes-de-obligatorio.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 3: TS1016: A required parameter cannot follow an optional parameter.
// Consola:
🐛 Para ana@example.com: Cena de fin de año
✅ Para ivan@example.com: (sin asunto)
✅ Para carmen@example.com (copia a reservas@example.com): (sin asunto)
```

Fíjate en el código: `TS1016` empieza por 1, como los errores de gramática de TypeScript, pero el JavaScript se genera igual. La solución sencilla es poner los obligatorios primero. Con varios opcionales, lo mejor es el **objeto de opciones** del capítulo 5. Su tipo se escribe **después** de la desestructuración completa (`{ email, subject = '(sin asunto)' }: InviteOptions`), no dentro: dentro de las llaves, los dos puntos ya significan «renombrar».

## Parámetros rest

Un parámetro rest recoge todos los argumentos sobrantes en un array, así que su tipo es un array: `...prices: number[]`. Al llamar, el *spread* hace lo contrario, repartir un array en argumentos sueltos:

[[exercise:04-parametros-rest.md-]]

```text
3 precios → 254
ninguno → 0
carrito → 434
[info] pedido P-2001 · pagado · enviado
Lucía Méndez: 3 noches
```

El último caso tiene truco. Repartir un array entre parámetros **fijos** (`stayLabel(...booking)`) solo funciona si TypeScript sabe cuántos elementos hay y de qué tipo es cada uno, es decir, si es una **tupla**. Con un array normal, como `(string | number)[]`, el mismo spread daría el error `TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.`

> **Desde Python:** `...prices: number[]` es `*prices: float`. No hay equivalente directo de `**kwargs`: se usa un objeto de opciones o una firma de índice.

## El tipo de una función

En JavaScript las funciones son valores, así que en TypeScript tienen tipo. Se escribe con la sintaxis de una flecha: `(cents: number) => number` es «una función que recibe un `number` y devuelve un `number`». Con un alias, ese tipo se puede reutilizar para variables, parámetros, arrays y retornos:

[[exercise:05-tipos-de-funcion.md-]]

```text
precio base → 450
con reglas → 446.6
redondeado → 447
```

Dos detalles. Las flechas asignadas a una variable de tipo `PriceRule` no anotan su parámetro: lo reciben del tipo (el **tipado contextual** de la lección 2). Y los nombres de los parámetros del tipo solo documentan: `roundToPeso` llama `amount` a lo que el tipo llama `cents`, y encaja igual.

> **Desde Python:** `(cents: number) => number` es `Callable[[int], int]`. La versión de TypeScript lleva nombres de parámetros, que no cambian nada pero ayudan a leer.

## Callbacks

Un callback es una función que pasas a otra. Todo lo anterior se aplica, y además hay tres comportamientos que conviene conocer. El primero es el más útil: el tipado contextual hace que casi nunca tengas que anotar los parámetros de un callback.

[[exercise:06-tipado-contextual.md-]]

```text
recomendados → (2) ['Tlayuda', 'Mole negro']
de peor a mejor → (3) ['Tasajo', 'Mole negro', 'Tlayuda']
1. Tlayuda ★★★★★ — Crujiente y generosa
2. Mole negro ★★★★ — Muy bueno, algo dulce
3. Tasajo ★★★ — Le faltó sal
solo el primero → Tlayuda
```

En tus propias funciones, el trabajo de anotar se hace una vez, en el tipo del parámetro (`callback: (review: Review, position: number) => void`), y todos los que la llaman lo aprovechan. Lo mismo pasa con las APIs del navegador: en `button.addEventListener('click', (event) => …)`, `event` ya tiene el tipo del evento de clic, deducido del nombre `'click'`. El módulo 3 («DOM tipado») lo explica con detalle.

### Un callback `void` puede devolver algo

El segundo comportamiento sorprende: un callback cuyo tipo dice que devuelve `void` **puede** devolver un valor sin ningún error.

[[exercise:07-callbacks-y-void.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 26: TS2322: Type 'number' is not assignable to type 'void'.
// Consola:
savedIds → (3) ['P-2001', 'P-2002', 'P-2003']
🐛 result → 4 | typeof → number
guardado → P-2005
```

La regla existe por comodidad: sin ella, `ids.forEach((id) => savedIds.push(id))` sería un error, porque `push` devuelve un número y `forEach` espera un callback `void`. El tipo `void` de un callback no significa «devuelve `undefined`», sino «lo que devuelva será ignorado». La trampa es la otra cara: el valor existe, y si alguien usa el resultado (como `result`), obtiene un número con tipo `void`. En cambio, una función **declarada** con `: void` sí tiene prohibido devolver un valor, como muestra el error de la línea 26.

### Un callback que pide demasiado

El tercer comportamiento es una protección de `strict` (la opción `strictFunctionTypes`). Si una función puede pasar a su callback cualquier `Item`, no puede aceptar un callback que necesite un `Dish`, con su `price`: algún `Item` llegaría sin él.

[[exercise:08-callbacks-incompatibles.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 17: TS2345: Argument of type '(dish: Dish) => void' is not assignable to parameter of type '(item: Item) => void'.
  Types of parameters 'dish' and 'item' are incompatible.
    Property 'price' is missing in type 'Item' but required in type 'Dish'.
línea 31: TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
// Consola:
⛔ TypeError: Cannot read properties of undefined (reading 'toFixed')
✅ Tlayuda
🐛 Ana: tres noches
```

Lee el mensaje de tres líneas de abajo arriba: a un `Item` le falta `price`, que `Dish` exige; por eso los parámetros son incompatibles; por eso el callback no encaja. La dirección contraria sí vale: un callback que pide **menos** (`printName`, que solo usa `name`) acepta objetos que tienen más. El segundo error es de otra opción de `strict`, `strictBindCallApply`, que comprueba los argumentos que pasas con `call`, `apply` y `bind` igual que en una llamada normal.

Un aviso: esta comprobación estricta se aplica a las propiedades escritas como función (`onSave: (item: Item) => void`), pero no a los métodos escritos con la sintaxis abreviada (`onSave(item: Item): void`), que por compatibilidad se comprueban de forma más laxa. Por eso muchas guías de estilo prefieren la primera forma en los tipos.

## Sobrecargas

A veces el tipo de retorno depende de lo que recibe la función: con un texto devuelve un número, con un array de textos devuelve un array de números. Una unión (`number | number[]`) obligaría a quien llama a comprobar cuál le ha tocado, aunque él ya lo sepa. Las **sobrecargas** lo resuelven: varias firmas sin cuerpo, una por caso, seguidas de una única implementación que los cubre todos.

[[exercise:09-sobrecargas.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 21: TS2769: No overload matches this call.
  Overload 1 of 2, '(text: string): number', gave the following error.
    Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
      Type 'string[]' is not assignable to type 'string'.
  Overload 2 of 2, '(texts: string[]): number[]', gave the following error.
    Argument of type 'string | string[]' is not assignable to parameter of type 'string[]'.
      Type 'string' is not assignable to type 'string[]'.
// Consola:
uno → 1250.50
varios → (2) ['35.00', '1099.00']
🐛 (2) [10, 20]
sobrecargas en ejecución → 1 parámetro
```

El mensaje de `TS2769` es el más largo que has visto, pero se lee con método: prueba cada sobrecarga y explica por qué no encaja. Ninguna acepta `string | string[]`, porque cada firma se comprueba **por separado**, y la firma de la implementación no cuenta: es invisible desde fuera. Si necesitas aceptar la unión, añade una tercera sobrecarga para ella. En ejecución solo existe la implementación; las firmas se borran.

Las sobrecargas son la herramienta adecuada cuando el retorno depende de los argumentos. Si no es así, una unión o un parámetro opcional son más sencillos. En el módulo 2, los genéricos resolverán muchos de estos casos de forma más general.

> **Desde Python:** es exactamente `@overload` del módulo `typing`: varias firmas decoradas sin cuerpo y una implementación final, que mypy no deja llamar directamente.

## El parámetro `this`

Una función que usa `this` depende de **cómo se la llame**, como aprendiste en el capítulo 5. TypeScript permite declarar qué `this` espera, con un primer parámetro especial llamado `this`. No es un parámetro de verdad: quien llama no lo pasa, y desaparece del JavaScript generado.

[[exercise:10-el-parametro-this.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 14: TS2684: The 'this' context of type 'void' is not assignable to method's 'this' of type 'Product'.
línea 22: TS2683: 'this' implicitly has type 'any' because it does not have a type annotation.
// Consola:
✅ Taza de barro: $180.00
🐛 TypeError: Cannot read properties of undefined (reading 'title')
🐛 Taza de barro
function describe() {
    return `${this.title}: $${(this.cents / 100).toFixed(2)}`;
}
```

Con el parámetro `this` declarado, TypeScript comprueba cada llamada: `mug.describe()` encaja porque `mug` tiene la forma de `Product`; `describe()` suelta, no, y en ejecución falla: el JavaScript generado está en modo estricto, donde `this` es `undefined` en una llamada sin objeto (en un script no estricto sería `window`, y saldría un silencioso `undefined: $NaN`). El segundo error es la opción `noImplicitThis` de `strict`: una función normal que usa `this` sin declararlo tendría un `this` de tipo `any`, y eso no se permite. En los métodos de una clase no hace falta declarar nada, porque TypeScript ya sabe que `this` es la instancia (el módulo 3 trata las clases en TypeScript).

## Bestiario

- **Argumentos de más o de menos, y retornos que faltan.**
  Síntoma: `TS2554: Expected 2 arguments, but got 1.` (o `got 3`); `TS2366: Function lacks ending return statement…`
  Causa: el número de argumentos forma parte del tipo; un retorno anotado debe cumplirse en todos los caminos.
  Solución: pasa los argumentos que pide la firma (o haz opcional el parámetro); añade el `return` del caso que falta.
  → [ver ejemplo](01-parametros-y-retorno.md)
- **El opcional que va delante.**
  Síntoma: `TS1016: A required parameter cannot follow an optional parameter.`
  Causa: con un opcional antes de un obligatorio, una llamada con menos argumentos sería ambigua.
  Solución: obligatorios primero; con varios opcionales, un objeto de opciones con su tipo tras la desestructuración.
  → [ver ejemplo](03-opcional-antes-de-obligatorio.md)
- **El callback `void` que devuelve un valor.**
  Síntoma: ningún error al pasar `(id) => savedIds.push(id)` como callback `void`, y un número guardado en una variable de tipo `void`.
  Causa: en un tipo de función, `void` significa «el valor de retorno se ignorará», no «no hay valor».
  Solución: no uses nunca el resultado de una llamada `void`; si necesitas el valor, cambia el tipo de retorno.
  → [ver ejemplo](07-callbacks-y-void.md)
- **El callback que pide más de lo que recibirá.**
  Síntoma: `TS2345: Argument of type '(dish: Dish) => void' is not assignable to parameter of type '(item: Item) => void'.`, con la propiedad que falta en la última línea.
  Causa: la función puede pasar al callback valores sin esa propiedad (`strictFunctionTypes`).
  Solución: haz que el callback acepte el tipo general y estreche dentro, o cambia la función para que solo pase `Dish`.
  → [ver ejemplo](08-callbacks-incompatibles.md)
- **La unión que no encaja en ninguna sobrecarga.**
  Síntoma: `TS2769: No overload matches this call.` con una explicación por cada sobrecarga.
  Causa: cada firma se comprueba por separado, y la implementación no es visible desde fuera.
  Solución: estrecha el valor antes de llamar, o añade una sobrecarga que acepte la unión.
  → [ver ejemplo](09-sobrecargas.md)
- **`this` suelto o sin tipo.**
  Síntoma: `TS2684: The 'this' context of type 'void' is not assignable…` o `TS2683: 'this' implicitly has type 'any'…`; en ejecución, `undefined` y `NaN`.
  Causa: la función depende de `this` y se llama sin objeto, o usa `this` sin declarar su tipo.
  Solución: declara el parámetro `this` y llama a la función como método (o con `call`); para métodos, usa una clase.
  → [ver ejemplo](10-el-parametro-this.md)

## Resumen

- El número y el tipo de los argumentos forman parte de la firma; un retorno anotado se comprueba en todos los caminos.
- `param?: T` es opcional (dentro, `T | undefined`); `param = valor` infiere el tipo y nunca es `undefined`; los opcionales van al final.
- `...rest: T[]` recoge argumentos; el spread a parámetros fijos necesita una tupla.
- El tipo de una función es `(a: A) => R`, como `Callable` en Python; las flechas asignadas a él no anotan sus parámetros.
- Los callbacks reciben sus tipos del contexto; un callback `void` puede devolver un valor (que nunca debes usar); `strictFunctionTypes` impide callbacks que piden más de lo que recibirán.
- Las sobrecargas dan un retorno distinto según los argumentos, como `@overload`; la implementación no es visible desde fuera.
- El parámetro `this` declara el `this` esperado y se borra del JavaScript.

## Para profundizar

- [Manual de TypeScript: más sobre funciones (en inglés)](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [Manual de TypeScript: sobrecargas (en inglés)](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
- [Manual de TypeScript: el tipo de retorno void (en inglés)](https://www.typescriptlang.org/docs/handbook/2/functions.html#return-type-void)
- [Referencia de tsconfig: strictFunctionTypes (en inglés)](https://www.typescriptlang.org/tsconfig/#strictFunctionTypes)
