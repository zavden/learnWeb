# Tipos básicos e inferencia

## Por qué importa

Ya sabes qué es una anotación de tipo. Ahora toca el vocabulario: los tipos que vas a escribir a diario (primitivos, arrays, tuplas), los dos tipos «comodín» (`any` y `unknown`, que se parecen y son opuestos), los tipos de las funciones que no devuelven nada (`void` y `never`) y el tratamiento de `null` y `undefined`, que es donde TypeScript evita más errores reales. Y una pregunta que recorre toda la lección: ¿cuándo hay que escribir el tipo y cuándo lo deduce TypeScript solo?

## Anotar o dejar que TypeScript infiera

Los tipos **primitivos** de TypeScript son los de JavaScript, con el mismo nombre que devuelve `typeof` y en minúsculas: `string`, `number`, `boolean`, `bigint`, `symbol`, `null` y `undefined`. No hay tipos distintos para enteros y decimales: todo es `number`, como en JavaScript.

```ts
const title: string = 'Pan de muerto'; // anotación
let units = 12;                         // inferencia: number
```

Las dos líneas están igual de tipadas. En la segunda, TypeScript **infiere** el tipo a partir del valor inicial, y la variable queda fijada como `number` igual que si lo hubieras escrito. Por eso la regla de estilo es: **no anotes lo que TypeScript ya sabe**. Las anotaciones van donde la inferencia no llega:

- en los **parámetros** de las funciones (TypeScript no los deduce de las llamadas, como viste con `noImplicitAny`);
- en las variables **sin valor inicial** o que empiezan vacías (`const cart: string[] = []`);
- en el **retorno** de una función cuando quieres que sea un contrato: si el cuerpo no lo cumple, el error sale dentro de la función.

[[exercise:01-anotar-o-inferir.md-]]

```text
Pan de muerto | Docena | 12 piezas
total → $546.00
¿para regalo? → false | ¿hay existencias? → true
string number boolean
```

En los ejemplos, un comentario como `// number` junto a una variable dice qué tipo ha inferido TypeScript. Si alguna vez no lo tienes claro, hay un truco para preguntárselo al propio verificador: asigna el valor a una variable de un tipo que seguro que no encaja y lee el mensaje de error, que nombra el tipo inferido.

```ts
const probe: boolean = total; // TS2322: Type 'number' is not assignable to type 'boolean'.
```

> **Desde Python:** es lo mismo que hace mypy: `units = 12` ya es un `int` para mypy, y `units = "doce"` después es un error. La diferencia está en las funciones: mypy no comprueba el cuerpo de una función sin anotar, y TypeScript con `strict` exige anotar sus parámetros.

## Qué tipo elige la inferencia

Inferir no significa «sin tipo». El tipo queda fijado en la declaración, y asignar después otra cosa es un error, igual que con una anotación. Lo interesante es **qué** tipo elige TypeScript, porque depende de si la variable puede cambiar:

```ts
let methodLet = 'GET';     // string: podrá valer cualquier texto
const methodConst = 'GET'; // 'GET': no puede cambiar, su tipo es el valor exacto
```

Con `let`, TypeScript **ensancha** (*widening*) el tipo al general, `string`. Con `const`, el valor no puede cambiar, así que el tipo es el propio texto `'GET'`: un **tipo literal**, un tipo con un único valor posible. La diferencia se nota al pasar la variable a una función que solo acepta ciertos textos:

[[exercise:02-que-tipo-infiere.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 3: TS2322: Type 'string' is not assignable to type 'number'.
línea 18: TS2345: Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"'.
// Consola:
units → doce | string
✅ GET /api/pedidos
🐛 GET /api/pedidos
✅ POST /api/pedidos
```

El segundo error es el interesante: en ejecución `methodLet` vale `'GET'`, pero su **tipo** es `string`, y un `string` cualquiera podría ser `'DELETE'`. Los tipos literales y las uniones como `'GET' | 'POST'` son el tema de las lecciones 4 y 5; por ahora quédate con la idea: `const` conserva el valor exacto, `let` lo generaliza.

## Arrays

Un array de números se escribe `number[]`. Existe otra forma, `Array<number>`, que significa lo mismo; es la sintaxis de los **genéricos** (tipos con parámetros entre `< >`), que verás en el módulo 2. Por ahora, lee `Array<T>` como «array de `T`».

[[exercise:03-arrays.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 14: TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
// Consola:
withTax → (3) [53, 139, 103]
sizes → S / M / L | tags → 2 | mixed → (2) [3, 'docena']
cart → (2) ['Concha de chocolate', 3]
```

Tres detalles del ejemplo. Un array con valores iniciales se infiere solo (`string[]`), y si mezcla tipos, el tipo de sus elementos es una **unión**, `(string | number)[]`. Un array que empieza vacío necesita anotación, porque TypeScript no puede saber qué irá dentro. Y los callbacks de `map`, `filter` y compañía reciben el tipo de los elementos sin anotarlo: en `prices.map((p) => …)`, `p` ya es `number`. A esto se le llama **tipado contextual**, y es la razón de que casi nunca anotes los parámetros de una flecha que pasas como callback.

## Tuplas

Una **tupla** es un array de longitud fija con un tipo para cada posición: `[string, number]` es «un texto y después un número». Es el tipo natural para devolver dos valores desde una función, como el `return a, b` de Python:

[[exercise:04-tuplas.md-]]

```text
Café de olla → $35
Museo Nacional de Arte → 19.4352, -99.1412
de $28 a $52
brand → 3 | overlay → 4
```

Ojo con la inferencia: `['Café de olla', 35]` sin anotar es `(string | number)[]`, un array de cualquier longitud. TypeScript nunca deduce una tupla por su cuenta; hay que pedirla con una anotación, en la variable o en el tipo de retorno.

Una tupla, además, es un array normal en ejecución, y eso abre un agujero conocido: TypeScript no impide llamar a `push`, aunque el tipo diga que la longitud es 2.

[[exercise:05-push-en-una-tupla.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 10: TS2493: Tuple type '[string, number]' of length '2' has no element at index '2'.
línea 14: TS2339: Property 'push' does not exist on type 'readonly [string, number]'.
línea 15: TS2540: Cannot assign to '1' because it is a read-only property.
// Consola:
slot → (3) ['10:30', 4, 99] | length → 3
slot[2] → 99
nextSlot → (3) ['12:00', 0, 99]
```

El `push` pasa sin error, y luego leer la posición que acaba de crear **sí** es un error. La solución es una tupla `readonly`, que elimina los métodos que cambian el array. Fíjate en la última línea: `readonly` también es solo una comprobación del verificador; con el error en rojo, el array cambia igual. La lección siguiente vuelve sobre esta idea.

> **Desde Python:** una tupla de Python es inmutable en ejecución; una tupla de TypeScript no. La más parecida es `readonly [string, number]`, y aun así solo mientras escribes.

## `any` y `unknown`

Los dos admiten **cualquier** valor, pero hacen cosas opuestas con él. `any` apaga el verificador: puedes llamar a cualquier método, leer cualquier propiedad y asignarlo a cualquier variable, y TypeScript no comprueba nada. `unknown` significa «todavía no sé qué es»: lo admite todo, pero no deja **usarlo** hasta que compruebes qué es:

[[exercise:06-any-frente-a-unknown.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 15: TS18046: 'fromUnknown' is of type 'unknown'.
línea 16: TS2322: Type 'unknown' is not assignable to type 'string'.
// Consola:
any → TypeError: fromAny.toFixed is not a function
unknown sin comprobar → MOLE POBLANO
✅ MOLE POBLANO | 12 letras
dishName → Mole poblano
```

Dentro de `if (typeof fromUnknown === 'string')`, TypeScript sabe que el valor es un `string` y deja usar sus métodos. Eso es el **estrechamiento** (*narrowing*), el tema de la lección 4. La regla práctica: `unknown` para los datos que todavía no has comprobado (lo que llega de fuera, el error de un `catch`) y `any` casi nunca.

El problema de `any` no es solo que apague el verificador en una línea. Es que **se propaga**: una propiedad de un `any` es `any`, el resultado de una operación con un `any` es `any`, y así sucesivamente, sin un solo aviso:

[[exercise:07-any-se-propaga.md-]]

```text
🐛 total → 38049
⛔ TypeError: total.toFixed is not a function
✅ total → 429.00
```

El texto `"49"` entró por un JSON y se sumó a `380` como texto, y el `TypeError` salió dos líneas después, lejos de la causa. Ni un rojo en todo el camino. Convertir el dato en la frontera (`Number(settings.deliveryFee)`) corta la cadena: a partir de ahí todo es `number` y vuelve a estar comprobado.

> **Desde Python:** `Any` de mypy se comporta igual que `any` y se propaga del mismo modo. El equivalente más cercano a `unknown` es `object`: acepta cualquier valor, pero mypy no deja usar sus métodos sin comprobar el tipo con `isinstance`.

## `null` y `undefined`

Con `strictNullChecks` (incluido en `strict`), `null` y `undefined` son tipos aparte que **no caben** en los demás: una variable `string` no puede valer `null`. Si un valor puede faltar, su tipo lo dice con una unión: `string | null`, «un texto o `null`». Y muchas funciones de JavaScript ya devuelven esas uniones: `find` devuelve el elemento **o** `undefined`, porque puede no encontrar nada.

[[exercise:08-null-y-undefined.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 12: TS18048: 'guest' is possibly 'undefined'.
// Consola:
⛔ TypeError: Cannot read properties of undefined (reading 'name')
✅ a) no hay ninguna reserva para Eva Luna
✅ b) sin reserva
   Ana Ruiz: 5512345678
   Iván Soto: sin teléfono
✅ c) Ana Ruiz
```

El error `TS18048` («`guest` puede ser `undefined`») es el `TypeError` del capítulo 5 detectado **antes** de ejecutar. Hay tres respuestas:

- **Comprobarlo** con un `if`: dentro, TypeScript ya sabe que `guest` es un `Guest`.
- **Encadenar con `?.`** y dar un valor por defecto con `??`, como en JavaScript.
- **Afirmarlo con `!`** (el *non-null assertion operator*): `valor!` le dice a TypeScript «no es `null` ni `undefined`, créeme». No comprueba nada en ejecución; si te equivocas, el `TypeError` vuelve. La lección 5 explica por qué conviene evitarlo.

> **Desde Python:** `string | null` es `Optional[str]` (o `str | None`), y mypy también exige descartar el `None` antes de usar el valor. La diferencia es que JavaScript tiene **dos** valores vacíos, `null` y `undefined`, y TypeScript los distingue.

### El `null` del DOM

El caso más frecuente en el navegador es `querySelector`. Recibe el selector como un texto cualquiera, así que TypeScript no puede saber si encajará con algún elemento, y su tipo de retorno es `Element | null`. Cada uso directo sale en rojo, también cuando el elemento existe:

[[exercise:09-queryselector-puede-ser-null.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 5: TS18047: 'badge' is possibly 'null'.
línea 12: TS18047: 'typo' is possibly 'null'.
// Consola:
¿badge es null? → false
¿typo es null? → true
⛔ TypeError: Cannot set properties of null (setting 'textContent')
✅ no hay contador
✅ contador → 5
```

Puede parecer un exceso, pero es justo el error más repetido del capítulo 6: un selector con una errata, o un script que se ejecuta antes de que exista el elemento. Para TypeScript los dos `querySelector` son idénticos, así que obliga a decidir en los dos qué hacer si falta el elemento. La función `requireElement` es la respuesta para los elementos obligatorios: hace la comprobación en un solo sitio y devuelve `Element`, sin `null`. Además, `Element` es un tipo general, que no sabe que el elemento es un `<span>` o un `<input>`; cómo obtener el tipo exacto (`querySelector<T>` y el mapa de etiquetas `HTMLElementTagNameMap`) es el tema de «DOM tipado», en el módulo 3.

## `void` y `never`

Quedan dos tipos que casi solo aparecen como retorno de funciones. `void` dice que una función **no devuelve nada útil**: en ejecución devuelve `undefined`, como cualquier función de JavaScript sin `return`. `never` dice algo más fuerte: la función **nunca termina con normalidad**, porque siempre lanza un error (o entra en un bucle infinito). Ningún valor tiene tipo `never`.

[[exercise:10-void-y-never.md-]]

```text
pedido registrado → P-2001
lo que devuelve logOrder → undefined
primer precio > 100 → 120
⛔ Error: Ningún precio supera $500
```

Lo útil de `never` está en `firstAbove`: después de `if (found === undefined) fail(…)`, TypeScript sabe que la ejecución solo sigue si `found` **no** era `undefined`, así que el `return found` es un `number` sin más comprobaciones. En la lección 4, `never` servirá para algo más: comprobar que un `switch` cubre todos los casos.

> **Desde Python:** `void` es `-> None` y `never` es `-> NoReturn` (o `Never`, desde Python 3.11).

## Bestiario

- **El tipo inferido no se puede cambiar, y `let` ensancha.**
  Síntoma: `TS2322: Type 'string' is not assignable to type 'number'.` al reasignar una variable sin anotar; `TS2345: Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"'.` al pasar una variable `let`.
  Causa: la inferencia fija el tipo en la declaración; con `let` elige el tipo general (`string`) y con `const`, el literal (`'GET'`).
  Solución: usa `const` cuando el valor no cambia, o anota la variable con el tipo exacto (`let method: 'GET' | 'POST'`).
  → [ver ejemplo](02-que-tipo-infiere.md)
- **El array vacío o con el elemento equivocado.**
  Síntoma: `TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.` en un `push`.
  Causa: el tipo de los elementos se fija al declarar el array (por anotación o por inferencia).
  Solución: anota los arrays que empiezan vacíos y convierte los valores antes de añadirlos.
  → [ver ejemplo](03-arrays.md)
- **`push` en una tupla.**
  Síntoma: una tupla `[string, number]` acaba con 3 elementos sin ningún error; leer `slot[2]` sí da `TS2493`.
  Causa: una tupla es un array en ejecución y TypeScript no vigila los métodos que cambian su longitud.
  Solución: `readonly [string, number]` quita `push`, `pop` y la asignación por posición (`TS2339`, `TS2540`).
  → [ver ejemplo](05-push-en-una-tupla.md)
- **`unknown` no deja hacer nada.**
  Síntoma: `TS18046: 'fromUnknown' is of type 'unknown'.` o `TS2322: Type 'unknown' is not assignable to type 'string'.`
  Causa: es su trabajo: un `unknown` es un valor sin comprobar.
  Solución: compruébalo antes de usarlo (`typeof valor === 'string'`); no lo cambies por `any`.
  → [ver ejemplo](06-any-frente-a-unknown.md)
- **El `any` contagioso.**
  Síntoma: un `TypeError` o un texto concatenado (`'38049'`) en un código sin errores rojos.
  Causa: todo lo que sale de un `any` (propiedades, operaciones, retornos) también es `any`, sin aviso.
  Solución: convierte o comprueba en la frontera (`Number(…)`) y devuelve `unknown` en lugar de `any` en las funciones que leen datos de fuera.
  → [ver ejemplo](07-any-se-propaga.md)
- **El valor que puede faltar.**
  Síntoma: `TS18048: 'guest' is possibly 'undefined'.` (o `TS18047 … 'null'`).
  Causa: con `strictNullChecks`, `find`, `Map.get` y compañía devuelven `T | undefined`, y un campo `string | null` puede ser `null`.
  Solución: un `if`, `?.` con `??`, o (solo si es imposible que falte) `!`.
  → [ver ejemplo](08-null-y-undefined.md)
- **`querySelector` puede devolver `null`.**
  Síntoma: `TS18047: 'badge' is possibly 'null'.` aunque el elemento exista; con una errata, `TypeError: Cannot set properties of null (setting 'textContent')`.
  Causa: TypeScript no puede saber si un selector encajará; el retorno es `Element | null`.
  Solución: un `if`, `?.` para leer, o una función como `requireElement` que lanza un error claro y devuelve `Element`.
  → [ver ejemplo](09-queryselector-puede-ser-null.md)

## Resumen

- Primitivos: `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`.
- Anota los parámetros y las variables que empiezan vacías; deja que TypeScript infiera el resto. Anotar el retorno es un contrato opcional.
- `let x = 'GET'` es `string`; `const x = 'GET'` es el tipo literal `'GET'`.
- Arrays: `number[]` (o `Array<number>`); tuplas: `[string, number]`, siempre con anotación, y `readonly` para que no cambien de longitud.
- `any` apaga el verificador y se propaga; `unknown` acepta todo y obliga a comprobar antes de usar.
- Con `strictNullChecks`, `null` y `undefined` van en el tipo (`string | null`) y hay que descartarlos: `if`, `?.`, `??` o, con cuidado, `!`.
- `querySelector` devuelve `Element | null`.
- `void`: no devuelve nada útil; `never`: no termina nunca con normalidad.

## Para profundizar

- [Manual de TypeScript: tipos de uso diario (en inglés)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Manual de TypeScript: inferencia de tipos (en inglés)](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [Manual de TypeScript: tuplas (en inglés)](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)
- [Referencia de tsconfig: strictNullChecks (en inglés)](https://www.typescriptlang.org/tsconfig/#strictNullChecks)
