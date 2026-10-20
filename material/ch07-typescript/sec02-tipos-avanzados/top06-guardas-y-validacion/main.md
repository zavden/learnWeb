# Guardas y validación

## Por qué importa

Todo lo que has visto en este módulo ocurre **antes** de ejecutar: los tipos se comprueban y se borran. Pero los datos de verdad llegan **durante** la ejecución: una respuesta de `fetch`, un JSON guardado, un formulario, un parámetro de la URL. La lección 1 del módulo anterior lo dejó claro: `JSON.parse` devuelve `any`, y una anotación sobre sus datos es una promesa que nadie comprueba. Allí se prometía hacer esa comprobación «de forma sistemática»; esta lección cumple la promesa.

Las herramientas son cuatro. Los **predicados de tipo** y las **funciones de aserción** convierten una comprobación de JavaScript en un estrechamiento que TypeScript entiende. Con ellos se escribe un **validador** que convierte `unknown` en un tipo del programa y explica qué falla. Los **tipos con marca** permiten que un dato ya comprobado lleve esa garantía en su tipo. La lección termina con la idea de las bibliotecas de esquemas, que juntan validación y tipo en un solo sitio.

## Predicados de tipo

Una función que devuelve `boolean` no le dice nada a TypeScript: aunque compruebe que un texto es una talla válida, fuera de ella el texto sigue siendo `string`. Un **predicado de tipo** cambia el tipo de retorno por `value is Size`, que significa «si devuelvo `true`, `value` es un `Size`»:

[[exercise:01-predicados-de-tipo.md-]]

```text
talla M → $219
«XL» no es una talla
producto → MOL-01 165.00
textos → MOL-01, CAF-02
```

El `if (isSize(input))` estrecha igual que un `typeof`, pero la comprobación tiene nombre y se reutiliza. Fíjate en el `as readonly string[]` de `isSize`: el `includes` de una tupla `as const` solo acepta sus propios literales, y para preguntar si un texto cualquiera está en la lista hay que ensanchar la tupla. `isProduct` hace con un `unknown` lo que hacía a mano la carta del restaurante en la integración del módulo 1: reúne todas las comprobaciones en una función que se puede usar en un `if`, en un `filter` o en otro predicado.

Desde TypeScript 5.5, las funciones sencillas sin anotación **infieren** su predicado: `(value: unknown) => typeof value === 'string'` es `(value: unknown) => value is string`, y por eso `filter(isText)` da un `string[]`. Solo ocurre cuando la función devuelve una comprobación que estrecha y su `false` significa exactamente lo contrario; en cuanto aparece una condición que no estrecha (un `includes`, una comparación como `price > 200`), hay que escribirlo. Y aunque se infiera, el predicado inferido describe lo comprobado (por ejemplo, `object & Record<'sku', unknown>`), no tu tipo `Product`: para eso, la anotación.

> **Desde Python:** es `typing.TypeGuard` y, desde 3.13, `typing.TypeIs`: `def is_size(value: str) -> TypeIs[Size]:`. `TypeIs` se parece más al predicado de TypeScript, porque también estrecha la rama del `else`: con `line: Product | null`, si `isProduct(line)` es falso, TypeScript sabe que `line` es `null`.

## El verificador se fía del predicado

Un predicado es una **promesa** que hace el programador. TypeScript comprueba que la función devuelve un `boolean`, pero no que el cuerpo compruebe de verdad lo que dice el tipo:

[[exercise:02-el-predicado-que-miente.md-]]

```text
🐛 predicado que miente → TypeError: product.price.toFixed is not a function
✅ ¿es un Product? → false
```

`isProduct` solo mira si existe `sku`, y con eso TypeScript trata el objeto como un `Product` completo. El fallo aparece en `priceLabel`, una función correcta, lejos del predicado culpable. Un predicado mentiroso es tan peligroso como un `as`, y más difícil de encontrar, porque no tiene pinta de aserción. La regla: cada propiedad que promete el tipo, comprobada en el cuerpo.

## Filtrar arrays con un predicado

`filter` acepta un predicado de tipo, y entonces su resultado cambia de tipo: es la firma `filter<S extends T>(predicate: (value: T) => value is S): S[]` de la biblioteca. Con la inferencia de TypeScript 5.5, el caso más común ya funciona sin escribir nada, pero no todos:

[[exercise:03-filter-con-predicado.md-]]

```text
total → 705
caros → ['MEZ-05']
mismo contenido → true
```

Las comprobaciones `Expect<Equal<…>>` muestran lo que hace TypeScript 5.9, la versión de LearnWeb:

| Llamada | Tipo del resultado |
|---|---|
| `lines.filter((line) => line !== null)` | `Product[]` (predicado inferido) |
| `lines.filter(Boolean)` | `(Product \| null)[]` |
| `lines.filter((line) => line !== null && line.price > 200)` | `(Product \| null)[]` |
| `lines.filter((line): line is Product => line !== null && line.price > 200)` | `Product[]` |

`filter(Boolean)` quita los `null` en ejecución, pero `Boolean` no es un predicado. Y con `&&`, un `false` puede significar «es `null`» o «es barato», así que TypeScript no puede inferir que `false` implica `null`. En esos casos, el predicado escrito a mano lo arregla. Mucho código anterior a TypeScript 5.5 escribe siempre el predicado, incluso en el primer caso.

## Funciones de aserción

Un predicado obliga a usar un `if`. Una **función de aserción** hace otra cosa: si la comprobación falla, **lanza** un error; si vuelve, TypeScript da por buena la condición en todo lo que sigue. Hay dos formas: `asserts value is T` (como un predicado) y `asserts condition` (cualquier condición):

[[exercise:04-funciones-de-asercion.md-]]

```text
✅ Lucía Méndez: 2 noches, cupón OTONO26
⚠️ Iván Soto → Falta el cupón
⚠️ Ana Ruiz → Una reserva necesita al menos una noche
```

Después de `assertDefined(booking.coupon, 'el cupón')`, `booking.coupon` es `string` sin `if`, sin `!` y sin `as`. Son útiles al principio de una función, para las condiciones que «no deberían pasar nunca» y que, si pasan, deben parar el programa con un mensaje claro. Las funciones de aserción devuelven `void`: su efecto es el estrechamiento.

> **Desde Python:** es lo que hace `assert isinstance(booking.coupon, str)` con mypy: después del `assert`, mypy estrecha el tipo. La diferencia es que en TypeScript la comprobación tiene nombre, y que no desaparece en producción (`python -O` sí quita los `assert`).

Las funciones de aserción tienen un requisito que sorprende la primera vez: TypeScript tiene que conocer su tipo **sin inferirlo**. Si llamas a una flecha guardada en una `const` sin anotar, o a un método de un objeto sin tipo escrito, la aserción no funciona:

[[exercise:05-asercion-sin-anotacion.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 15: TS2775: Assertions require every name in the call target to be declared with an explicit type annotation.
línea 16: TS2775: Assertions require every name in the call target to be declared with an explicit type annotation.
línea 18: TS2776: Assertions require the call target to be an identifier or qualified name.
// Consola:
las aserciones se ejecutaron, pero no estrechan: string number
✅ mol-01 165.00
```

`TS2775` dice que cada nombre de la llamada (`assertText`, o `checks` y `number` en `checks.number`) debe tener un tipo **escrito**. La razón es interna: para saber si una llamada estrecha, TypeScript tendría que inferir tipos en mitad del análisis del flujo de control, y eso puede crear dependencias circulares; por eso exige tipos escritos. `TS2776` sale al llamar con corchetes (`validators[0](…)`): la llamada tiene que ser un nombre o una cadena de nombres con puntos. Las dos soluciones: una declaración `function`, que siempre tiene su tipo escrito, o una `const` anotada con un tipo de función.

## Validar lo que llega de fuera

### `JSON.parse` devuelve `any`

El error del módulo 1 tiene una versión aún más tentadora: `JSON.parse(text) as Product[]`. Parece explícito y responsable, pero es la misma promesa sin comprobar:

[[exercise:06-json-parse-es-any.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 18: TS18046: 'data' is of type 'unknown'.
// Consola:
🐛 total → 37595 | typeof → string
elementos → 3
✅ válidos → 2 | total → 375.00
```

El tercer precio llega como texto, y `invoiceTotal`, que hace bien su trabajo, concatena `375 + '95'`. Su tipo de retorno dice `number`; el valor es el texto `'37595'`. La defensa es guardar lo que llega como `unknown`, que no deja hacer **nada** (ni siquiera `.length`) hasta comprobarlo. `response.json()` también devuelve `any`: trátalo igual. Los ayudantes de `fetch` tipados se ven en el módulo «TypeScript en la práctica».

### Un validador que explica los errores

Un predicado responde «sí» o «no». Para datos reales hace falta más: saber **qué** falla y **dónde**, y no parar en el primer error. El ejemplo descarga el catálogo de una tienda (el archivo `catalog.json` de esta lección; ábrelo con «Assets») y lo valida campo por campo:

[[exercise:07-validar-json-con-rutas.md-]]

```text
⚠️ items[2].price: debe ser un número ≥ 0, llegó "95"
⚠️ items[3].name: falta
⚠️ items[3].stock: debe ser un entero ≥ 0, llegó -2
⚠️ items[3].tags[1]: debe ser texto, llegó 7
✅ 3 de 5 productos válidos: MOL-01, CAF-02, MEZ-05
```

Las piezas son pequeñas y genéricas. Un `Check<T>` junta un predicado con la descripción de lo que espera. `read<T>` lee un campo, devuelve un `T` o `undefined` y anota el problema con su ruta. `readProduct` solo construye el `Product` cuando todos los campos son buenos, así que no hay ningún camino por el que un objeto sin comprobar llegue a ser un producto. Las rutas (`items[3].tags[1]`) son las que verías en el mensaje de error de una API bien hecha, y en un formulario sirven para marcar el campo exacto. Al final, el `filter` con el predicado inferido de este mismo apartado deja un `Product[]`.

## Tipos con marca

El tipado estructural del módulo 1 tiene un límite que allí quedó pendiente: `Pesos` y `Dollars` con la misma forma eran intercambiables. Un **tipo con marca** (*branded type*) añade a un tipo primitivo una propiedad que **solo existe en el tipo**: `number & { readonly __brand: 'Pesos' }`. Dos marcas distintas hacen incompatibles dos tipos que, en ejecución, son números normales:

[[exercise:08-tipos-con-marca.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 29: TS2345: Argument of type 'Dollars' is not assignable to parameter of type 'Pesos'.
  Type 'Dollars' is not assignable to type '{ readonly __brand: "Pesos"; }'.
    Types of property '__brand' are incompatible.
      Type '"Dollars"' is not assignable to type '"Pesos"'.
línea 30: TS2345: Argument of type 'number' is not assignable to parameter of type 'Pesos'.
  Type 'number' is not assignable to type '{ readonly __brand: "Pesos"; }'.
// Consola:
✅ carrito → 1349
✅ importado → 839
🐛 → 139
🐛 → 1349
typeof cart → number | cart + 1 → 1251
```

El mensaje de cuatro líneas cuenta exactamente lo que pasa: las dos marcas no coinciden. Ningún número llega a tener una propiedad `__brand`; el `as Pesos` de los **constructores inteligentes** (*smart constructors*) `pesos()` y `dollars()` es el único sitio donde se pone la marca, y allí se comprueba que el valor tiene sentido. Las operaciones aritméticas devuelven `number` sin marca, así que el resultado de `subtotal + 99` vuelve a pasar por `pesos()`: es deliberado, porque sumar pesos con un número cualquiera es justo lo que la marca quiere vigilar.

> **Desde Python:** es `typing.NewType`: `Pesos = NewType("Pesos", float)` crea un tipo distinto para mypy que en ejecución es un `float` normal, y `Pesos(1250.0)` hace de constructor. TypeScript no tiene `NewType`, y la intersección con una marca es la forma habitual de conseguirlo.

Las marcas sirven también para datos **validados**. La lección 5 dejaba pendiente el código postal de cinco dígitos, que no cabía en un tipo de plantilla. Con una marca, el tipo `PostalCode` significa «un texto que ya pasó la comprobación»:

[[exercise:09-marca-con-validacion.md-]]

```text
📧 lucia@example.com · envíos a Ciudad de México
⚠️ correo no válido
⚠️ código postal no válido
```

`parsePostalCode` y `parseEmail` son las únicas puertas de entrada: devuelven el tipo con marca o `null`. A partir de ahí, `shippingZone` y `welcome` reciben datos garantizados y no repiten ninguna comprobación, y pasarles un `string` suelto es un error. Esta idea tiene un lema famoso, «parsea, no valides» (*parse, don't validate*): en lugar de comprobar un dato y seguir usando el tipo amplio, conviértelo en un tipo más preciso que guarde lo que ya sabes de él.

## Esquemas: un valor que también es un tipo

El validador del catálogo tiene un problema de mantenimiento: el tipo `Product` y las comprobaciones de `readProduct` están escritos por separado, y nada impide que alguien añada un campo a uno y se olvide del otro. Las bibliotecas de validación resuelven eso con **esquemas**: un valor que existe en ejecución, sabe validar, y del que se **infiere** el tipo. El ejemplo construye una versión mínima con todo lo de este módulo:

[[exercise:10-esquemas-a-mano.md-]]

```text
✅ La Llorona (296 s) · Chavela Vargas, Lila Downs
⚠️ track.seconds: se esperaba un número, llegó "182"
⚠️ track.artists[1]: se esperaba texto, llegó null
```

`Schema<T>` es un genérico (lección 1); `Infer<S>` saca el `T` con `infer` (lección 3); `s.object` calcula el tipo del objeto con un tipo mapeado sobre su molde. `Track` no se escribe nunca a mano: es `Infer<typeof TrackSchema>`, el operador `typeof` de la lección 2. Si añades un campo al esquema, el tipo cambia con él.

Esa es exactamente la idea de **Zod** y **Valibot**, las bibliotecas de validación más usadas en TypeScript: `const Track = z.object({ title: z.string(), seconds: z.number() })` y `type Track = z.infer<typeof Track>`. Añaden lo que a esta versión le falta (opcionales, uniones, mensajes configurables, transformar datos, reunir todos los errores en vez de parar en el primero), pero el mecanismo es el mismo. No las usarás en este curso, que no instala paquetes, aunque ahora puedes leer su documentación entendiendo qué hacen los tipos por debajo.

> **Desde Python:** el equivalente es **pydantic**, con una diferencia de dirección: en pydantic escribes la clase (`class Track(BaseModel): title: str; seconds: int`) y la biblioteca lee las anotaciones en ejecución para validar. En TypeScript las anotaciones se borran, así que se hace al revés: el esquema es el valor, y el tipo se deduce de él.

## Bestiario

- **El predicado que miente.**
  Síntoma: `TypeError: product.price.toFixed is not a function` en código sin ningún error de tipos, después de un `if (isProduct(x))`.
  Causa: TypeScript se fía del predicado (`value is Product`) sin mirar qué comprueba su cuerpo.
  Solución: comprueba en el predicado cada propiedad que promete el tipo, con su tipo (`typeof value.price === 'number'`).
  → [ver ejemplo](02-el-predicado-que-miente.md)
- **La aserción que no estrecha.**
  Síntoma: `TS2775: Assertions require every name in the call target to be declared with an explicit type annotation.` o `TS2776: Assertions require the call target to be an identifier or qualified name.`
  Causa: la función de aserción está en una `const` sin anotar, en un objeto sin tipo escrito o se llama con corchetes.
  Solución: decláralas con `function`, o anota la `const` con su tipo de función; llámalas por su nombre.
  → [ver ejemplo](05-asercion-sin-anotacion.md)
- **`JSON.parse(…) as T`.**
  Síntoma: un total que vale `'37595'` (o un `TypeError`) en una función correcta, lejos de donde llegaron los datos.
  Causa: `JSON.parse` y `response.json()` devuelven `any`, y `as` no comprueba nada.
  Solución: guarda el resultado como `unknown` y conviértelo con un predicado o un validador antes de usarlo.
  → [ver ejemplo](06-json-parse-es-any.md)
- **Pesos que se suman a dólares.**
  Síntoma: sin marcas, un total mezcla monedas sin ningún error (el problema del módulo 1); con marcas, `TS2345: Argument of type 'Dollars' is not assignable to parameter of type 'Pesos'.`
  Causa: el tipado estructural no distingue dos `number`; la marca hace que sus tipos sean distintos.
  Solución: tipos con marca y constructores inteligentes (`pesos()`, `dollars()`), con conversiones explícitas entre ellos.
  → [ver ejemplo](08-tipos-con-marca.md)

## Resumen

- Un predicado de tipo (`value is T`) convierte una comprobación en un estrechamiento reutilizable; TypeScript 5.5+ lo infiere en funciones sencillas.
- TypeScript se cree los predicados: el cuerpo debe comprobar todo lo que promete el tipo.
- `filter` con un predicado cambia el tipo del array; `x => x !== null` se infiere, `filter(Boolean)` y las condiciones con `&&` no.
- Las funciones de aserción (`asserts value is T`, `asserts condition`) lanzan si falla y estrechan si vuelven; necesitan un tipo escrito (`TS2775`, `TS2776`).
- Lo que llega de fuera es `unknown`: un validador lo convierte en tipos del programa y explica cada fallo con su ruta.
- Un tipo con marca (`number & { readonly __brand: 'Pesos' }`) distingue tipos con la misma forma y guarda que un dato ya fue validado; solo existe al verificar.
- Un esquema es un valor que valida y del que se infiere el tipo: la idea de Zod y Valibot (y, al revés, de pydantic).

## Para profundizar

- [Manual de TypeScript: predicados de tipo y funciones de aserción (en inglés)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Notas de TypeScript 5.5: predicados de tipo inferidos (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates)
- [Alexis King: Parse, don't validate (en inglés)](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
- [Zod: documentación (en inglés)](https://zod.dev/)
- [Documentación de Python: TypeIs y NewType (en inglés)](https://docs.python.org/3/library/typing.html#typing.TypeIs)
