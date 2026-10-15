# Operadores de tipo

## Por qué importa

Hasta ahora has escrito cada tipo a mano. En un programa real eso duplica información: la lista de tallas existe como array **y** como unión de literales, el objeto de ajustes por defecto **y** su tipo, el tipo de un pedido **y** el de una de sus líneas. Cuando una copia cambia y la otra no, el verificador defiende la equivocada.

Los **operadores de tipo** calculan tipos a partir de otros tipos, y también a partir de valores: `keyof` saca las claves, `typeof` el tipo de una variable y los tipos indexados (`Order['items']`) el de una propiedad. Con ellos, cada dato se escribe una sola vez y el resto se deduce. La lección termina con `satisfies`, que comprueba un valor sin perder lo que TypeScript sabe de él.

## Ver los tipos que calcula TypeScript

En un editor profesional basta con pasar el ratón por encima de un nombre para ver su tipo. El editor de LearnWeb no lo tiene, y en esta lección y en las siguientes TypeScript va a calcular tipos que no se ven en ningún sitio. Este módulo usa tres herramientas para hacerlos visibles:

1. Un **comentario** con el resultado al lado del tipo: `type ProductKey = keyof Product; // → 'name' | 'price' | 'stock'`.
2. Los **mensajes de error**, que escriben los tipos expandidos.
3. Unas **comprobaciones de tipos** que solo compilan si el tipo es el que dice el comentario. Si lo que esperabas no coincide con lo que TypeScript calculó, sale un error en rojo.

Las comprobaciones son dos tipos genéricos que se copian al principio de cada ejemplo (cada ejemplo es un módulo aparte):

```ts
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
```

`Equal<A, B>` es el tipo `true` si `A` y `B` son **exactamente** el mismo tipo, y `false` si no. `Expect<T extends true>` es un genérico con restricción (lección 1) que solo acepta `true`. Juntos, `Expect<Equal<A, B>>` es un error si los tipos difieren. Cómo funciona `Equal` por dentro se entiende con los tipos condicionales de la lección 3; de momento, úsalo como una caja negra.

[[exercise:01-ver-los-tipos.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 17: TS2344: Type 'false' does not satisfy the constraint 'true'.
línea 18: TS2344: Type 'false' does not satisfy the constraint 'true'.
// Consola:
tallas → (2) ['S', 'M'] | resultado → {ok: true, value: 3}
```

`TS2344` dice que el argumento de `Expect` es `false`: la comprobación de esa línea falla. Las comprobaciones se agrupan en una tupla, `type Checks = [ … ]`, para que cada una tenga su línea y el error señale cuál falla. Fíjate en la segunda que falla: `'S' | 'M' | 'L'` **cabe** en `string` (es asignable), pero no es el mismo tipo. «Asignable» e «igual» son cosas distintas, y por eso `Equal` es más complicado que una simple comparación.

Los tipos no imprimen nada. Los ejemplos de este módulo imprimen siempre los **valores** que esos tipos describen, y las comprobaciones desaparecen al compilar, como todos los tipos (pestaña `compiled.js`).

## `keyof`: las claves de un tipo

`keyof T` es la unión de las claves de `T`, cada una como tipo literal. Para `type Product = { name: string; price: number; stock: number }`, `keyof Product` es `'name' | 'price' | 'stock'`. Sirve para escribir funciones que reciben el nombre de una propiedad, como una tabla que se ordena por columnas:

[[exercise:02-keyof.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 24: TS2345: Argument of type '"colour"' is not assignable to parameter of type 'keyof Product'.
// Consola:
por precio → (3) ['Chocolate de metate', 'Mole negro', 'Café de Chiapas']
por nombre → (3) ['Café de Chiapas', 'Chocolate de metate', 'Mole negro']
🐛 por colour → (3) ['Mole negro', 'Café de Chiapas', 'Chocolate de metate']
```

Sin el error de tipos, `'colour'` habría ordenado por una propiedad que no existe: todas las comparaciones de `undefined` dan `false` y la lista queda igual, sin ningún aviso. Y si mañana `Product` gana una propiedad `weight`, `ProductKey` la incluye sola. El mensaje escribe `keyof Product` y no la unión porque `Product` tiene nombre; con un objeto sin tipo con nombre (`keyof typeof algo`, más abajo) TypeScript escribe la unión entera.

Hay un caso en el que `keyof` sorprende. Con una **firma de índice** de texto, `keyof` no da `string`, sino `string | number`:

[[exercise:03-keyof-con-firma-de-indice.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 18: TS2339: Property 'toUpperCase' does not exist on type 'string | number'.
  Property 'toUpperCase' does not exist on type 'number'.
// Consola:
shelf[7] → 40 | shelf["7"] → 40
🐛 TypeError: key.toUpperCase is not a function
✅ MOL-01 → 12
✅ CAF-02 → 0
Object.keys(shelf) → ['7']
```

La razón está en JavaScript: las claves de un objeto son textos, y `shelf[7]` convierte el `7` en `'7'` antes de buscar. Así que, en un objeto con claves de texto, un número también es una clave válida, y TypeScript lo refleja. Para quedarte solo con la parte de texto se usa una **intersección**: `keyof Stock & string` es lo que hay a la vez en `string | number` y en `string`, es decir, `string`. Verás `keyof T & string` a menudo en código genérico.

> **Desde Python:** no hay un equivalente de `keyof`. Con un `TypedDict` tendrías que escribir a mano `Literal["name", "price", "stock"]` y mantener las dos listas iguales. Y en un `dict[str, int]`, `d[7]` no es `d["7"]`: Python no convierte las claves.

## `typeof` en un tipo

`typeof` tiene dos vidas. En una **expresión** es el operador de JavaScript del capítulo 5: se ejecuta y devuelve un texto (`'object'`, `'function'`…). En la **posición de un tipo** (después de `type X =`, de los dos puntos de una anotación o dentro de `< >`) es un operador de TypeScript que devuelve **el tipo de una variable**:

[[exercise:04-typeof-en-un-tipo.md-]]

```text
typeof en ejecución → object | function
ajustes → MXN false | envío → {zone: 'national', cost: 189}
```

`type Settings = typeof DEFAULT_SETTINGS` saca el tipo del objeto de ajustes, con la inferencia de siempre: `currency` es `string`, no `'MXN'`, porque el objeto no es `as const`. Con una función, `typeof` da su tipo de función completo, y `ReturnType<typeof quoteShipping>` se queda con lo que devuelve. `ReturnType` es uno de los tipos de utilidad de la lección 4, y es la forma habitual de nombrar el resultado de una función sin escribirlo dos veces.

| Dónde | Ejemplo | Qué da | Cuándo |
|---|---|---|---|
| expresión | `typeof settings === 'object'` | un texto: `'object'` | en ejecución |
| tipo | `type S = typeof settings` | el tipo de la variable | al verificar (se borra) |

`typeof` en un tipo solo acepta nombres de variables, funciones o propiedades (`typeof settings.currency`), no expresiones: `typeof quoteShipping(800, 'local')` es un error. Para el resultado de una llamada está `ReturnType`.

## Tipos indexados

Igual que `order['status']` lee una propiedad de un valor, `Order['status']` lee el tipo de una propiedad de un tipo. Se llama **tipo indexado** (*indexed access type*), y se puede encadenar:

[[exercise:05-tipos-indexados.md-]]

```text
total → 615
envío → Oaxaca, CP 68000
¿abierto? → true
```

Tres detalles. Con tipos no se usa el punto: `Order.status` es un error, porque el punto se reserva para los espacios de nombres; se escribe siempre con corchetes y la clave entre comillas. Con una unión de claves se obtiene la unión de sus tipos: `OrderItem['sku' | 'qty']` es `string | number`. Y `[number]` sobre un tipo array da el tipo de sus elementos, porque los índices de un array son números: `Order['items'][number]` es el tipo de una línea del pedido.

Los tipos indexados permiten escribir el tipo grande una vez y nombrar sus partes cuando las necesitas, como las funciones `lineTotal` y `shippingLabel` del ejemplo. Si alguien cambia el tipo de `address` en `Order`, `Address` cambia con él.

## Los valores primero, los tipos después

Juntando `typeof`, `keyof` y los tipos indexados se cumple lo que anunciaban las lecciones 5 y 6 del módulo 1: escribir la lista de valores **una vez**, como un array u objeto `as const` que existe en ejecución, y sacar de ella los tipos.

[[exercise:06-tipos-desde-una-lista.md-]]

```text
Playera M · envío national: $189
Playera L · envío national: $189
estados → (3) ['pending', 'paid', 'shipped']
```

Léelo de dentro hacia fuera:

| Expresión | Significa | Resultado |
|---|---|---|
| `typeof SIZES` | el tipo del array | `readonly ['S', 'M', 'L', 'XL']` |
| `(typeof SIZES)[number]` | el tipo de cualquier elemento | `'S' \| 'M' \| 'L' \| 'XL'` |
| `keyof typeof SHIPPING` | las claves del objeto | `'local' \| 'national' \| 'pickup'` |
| `(typeof X)[keyof typeof X]` | todos sus valores | `'pending' \| 'paid' \| 'shipped'` |

Los paréntesis de `(typeof SIZES)[number]` son opcionales (`typeof SIZES[number]` significa lo mismo), pero dejan claro el orden. Y sin `as const` todo esto se pierde: `SIZES` sería un `string[]` y `Size`, un simple `string`.

## Relacionar claves y valores: `K extends keyof T`

Los operadores de tipo brillan dentro de los genéricos de la lección 1. `K extends keyof T` dice «`K` es una de las claves de `T`», y `T[K]` es el tipo de esa propiedad concreta. Así, el tipo de retorno depende de la clave que se pase:

[[exercise:07-k-extends-keyof-t.md-]]

```text
primera → más de 3 min
títulos → Bésame mucho · Sabor a mí
minutos → 6.1
```

Las comprobaciones con `typeof` muestran la diferencia: `getField(song, 'seconds')` es un `number`, y la versión sin genérico, `getFieldLoose`, devuelve `string | number | boolean` para cualquier clave, porque `Song[keyof Song]` es la unión de los tipos de todas las propiedades. Con `K`, TypeScript recuerda **qué** clave pasaste. Es una firma muy común en bibliotecas (los tipos del `get` de Lodash empiezan así), y la del `pick` que escribirás en la lección 4.

## `satisfies`: comprobar sin ensanchar

Hay tres formas de decirle a TypeScript que un objeto de configuración es un `Record<string, Zone>` (un objeto con claves de texto y valores `Zone`; `Record` se explica en la lección 4):

| Forma | ¿Comprueba el valor? | Tipo de la variable |
|---|---|---|
| `const zones: Record<string, Zone> = {…}` | sí | `Record<string, Zone>`: se pierden las claves concretas |
| `const zones = {…} as Record<string, Zone>` | casi nada | `Record<string, Zone>` |
| `const zones = {…} satisfies Record<string, Zone>` | sí | el inferido: `{ local: …; national: … }` |

`satisfies` (TypeScript 4.9) comprueba que el valor encaja en el tipo, igual que una anotación, pero **no cambia** el tipo de la variable: se queda con el que infiere TypeScript, con sus claves exactas.

[[exercise:08-satisfies.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 17: TS2322: Type 'string' is not assignable to type 'number'.
// Consola:
local → 569 | nacional → 689
typeof PICKUP.store.cost → string
🐛 express → undefined | total → NaN
```

`keyof typeof ZONES` sigue siendo `'local' | 'national'`, así que `quote` solo acepta zonas que existen. El `cost: '0'` se detecta en su línea. En cambio, `as Zone` no comprueba que al objeto no le falte nada: es una aserción, y como viste en el módulo 1, `as` le pide a TypeScript que se fíe de ti. Solo protesta si los dos tipos no tienen nada que ver.

¿Por qué no basta la anotación? Porque una anotación **ensancha**: el tipo de la variable pasa a ser exactamente el anotado, y todo lo que TypeScript sabía de más se olvida.

[[exercise:09-la-anotacion-ensancha.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 25: TS2551: Property 'nacional' does not exist on type '{ local: { label: string; cost: number; }; national: { label: string; cost: number; }; }'. Did you mean 'national'?
// Consola:
🐛 anotación → TypeError: Cannot read properties of undefined (reading 'cost')
⚠️ satisfies → el mismo fallo, pero avisado en rojo: TypeError: Cannot read properties of undefined (reading 'cost')
✅ national → 189
```

Con `Record<string, Zone>` como tipo, cualquier texto es una clave válida y `annotated.nacional` compila. Con `satisfies`, el mensaje escribe el tipo inferido entero y hasta sugiere la clave correcta. La regla práctica: anota cuando quieras que el tipo de la variable sea exactamente el anotado (un parámetro, un valor que cambiará); usa `satisfies` para objetos de configuración y tablas `as const` (se pueden combinar: `{…} as const satisfies Record<string, Zone>`).

> **Desde Python:** no hay nada parecido a `satisfies`. En Python anotarías el diccionario con un `TypedDict`, que equivale a la anotación de TypeScript, con el mismo ensanchamiento.

## Bestiario

- **Una comprobación de tipos que falla.**
  Síntoma: `TS2344: Type 'false' does not satisfy the constraint 'true'.` en una línea de `Checks`.
  Causa: el tipo calculado no es exactamente el esperado; a veces solo es asignable (`'S' | 'M'` frente a `string`, `string[]` frente a `readonly string[]`).
  Solución: lee los dos tipos de esa línea y decide cuál está mal: tu expectativa o el tipo.
  → [ver ejemplo](01-ver-los-tipos.md)
- **Ordenar por una columna que no existe.**
  Síntoma: `TS2345: Argument of type '"colour"' is not assignable to parameter of type 'keyof Product'.`; sin el tipo, la lista sale igual, sin error.
  Causa: el parámetro es `keyof Product` y `'colour'` no es una de sus claves.
  Solución: corrige la clave; usa `keyof` para cualquier parámetro que nombre una propiedad.
  → [ver ejemplo](02-keyof.md)
- **`keyof` de una firma de índice incluye `number`.**
  Síntoma: `TS2339: Property 'toUpperCase' does not exist on type 'string | number'.` al tratar una clave como texto.
  Causa: `keyof { [k: string]: V }` es `string | number`, porque en JavaScript `obj[7]` es `obj['7']`.
  Solución: `keyof T & string`, o directamente `string` si el tipo es una firma de índice.
  → [ver ejemplo](03-keyof-con-firma-de-indice.md)
- **`as` deja pasar un objeto incompleto.**
  Síntoma: `undefined` y `NaN` en ejecución con un objeto «de tipo `Zone`», sin ningún error de tipos.
  Causa: `{ label: 'Express' } as Zone` es una aserción; solo se rechaza si los tipos no tienen nada en común.
  Solución: `satisfies Zone` o una anotación, que comprueban que no falta nada.
  → [ver ejemplo](08-satisfies.md)
- **La anotación que olvida las claves.**
  Síntoma: una errata como `annotated.nacional` compila y da `Cannot read properties of undefined` al ejecutar; `keyof typeof annotated` es `string`.
  Causa: la anotación `Record<string, Zone>` sustituye el tipo inferido, con sus claves concretas, por uno más ancho.
  Solución: `satisfies Record<string, Zone>`: comprueba igual y conserva las claves (y sugiere «Did you mean…?»).
  → [ver ejemplo](09-la-anotacion-ensancha.md)

## Resumen

- LearnWeb no enseña los tipos al pasar el ratón: usa comentarios `// →`, los mensajes de error y `Expect<Equal<A, B>>`, que solo compila si los tipos son exactamente iguales.
- `keyof T` es la unión de las claves de `T`; con una firma de índice de texto es `string | number` (`& string` lo arregla).
- `typeof` en un tipo da el tipo de una variable o función; en una expresión sigue siendo el de JavaScript.
- `T['clave']` es el tipo de una propiedad; `T[number]`, el de los elementos de un array.
- Con `as const` + `typeof` + `[number]`/`keyof`, la lista de valores se escribe una vez y los tipos salen de ella.
- `K extends keyof T` con retorno `T[K]` hace que el tipo de salida dependa de la clave.
- `satisfies` comprueba como una anotación sin ensanchar el tipo; `as` apenas comprueba.

## Para profundizar

- [Manual de TypeScript: crear tipos a partir de tipos (en inglés)](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Manual de TypeScript: keyof, typeof y tipos indexados (en inglés)](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
- [Notas de TypeScript 4.9: el operador satisfies (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- [type-challenges: retos para practicar con tipos, con las mismas comprobaciones Expect/Equal (en inglés)](https://github.com/type-challenges/type-challenges)
