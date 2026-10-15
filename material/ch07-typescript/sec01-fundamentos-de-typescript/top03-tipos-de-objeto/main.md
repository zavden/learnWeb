# Tipos de objeto

## Por qué importa

En JavaScript casi todo dato interesante es un objeto: un producto, un pedido, una reserva, la respuesta de una API. Describir su **forma** (qué propiedades tiene y de qué tipo es cada una) es lo que más vas a escribir en TypeScript, y también donde aparecen sus ideas más características: propiedades opcionales y de solo lectura, dos maneras de nombrar un tipo (`type` e `interface`) y, sobre todo, el **tipado estructural**, que decide qué valores encajan con un tipo mirando su forma y no su nombre. Viniendo de Python, esto último es lo que más cambia.

## Describir la forma de un objeto

Un **tipo de objeto** se escribe como un objeto literal en el que cada propiedad lleva un tipo en lugar de un valor. Se puede escribir en línea, en el parámetro que lo usa, pero lo normal es darle un nombre con `type` (un **alias de tipo**) y reutilizarlo:

```ts
type Address = {
  street: string;
  city: string;
  zip: string;
};
```

Las propiedades se separan con `;` (también vale `,`), y un tipo de objeto puede contener otros tipos de objeto, arrays o lo que haga falta:

[[exercise:01-tipos-de-objeto.md-]]

```text
Fonda Doña Mica · Calle Macedonio Alcalá 302, 68000 Oaxaca
platos → Tlayuda, Mole negro, Tasajo | nota → 4.7
restaurantes en la guía → 1
```

Recuerda la lección 1: `type Restaurant` no crea nada en ejecución. Los objetos siguen siendo objetos literales normales, y el tipo solo le dice al verificador qué esperar de ellos.

> **Desde Python:** el equivalente es un `TypedDict`, no una clase. Un `TypedDict` describe las claves de un diccionario normal sin crear ningún tipo nuevo en ejecución, igual que un `type` de TypeScript describe un objeto normal.

## Propiedades opcionales

Una propiedad con `?` detrás del nombre puede faltar. Al crear el objeto, se puede omitir; al leerla, su tipo incluye `undefined`, y TypeScript obliga a tenerlo en cuenta. Lo que no se puede omitir es una propiedad obligatoria:

[[exercise:02-propiedades-opcionales.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 10: TS2741: Property 'price' is missing in type '{ name: string; }' but required in type 'Dish'.
línea 14: TS18048: 'dish.discountPercent' is possibly 'undefined'.
// Consola:
🐛 tlayuda → NaN
✅ tlayuda → 120 | tasajo → 162
¿picante? → false
mole → {name: 'Mole negro'}
```

El mensaje de `TS2741` es largo pero muy concreto: «falta la propiedad `price` en el tipo `{ name: string; }`, y es obligatoria en `Dish`». El de `TS18048` es el mismo de la lección anterior: el valor puede ser `undefined`. La solución es decidir qué significa «no está» (aquí, un descuento de 0) con `??`.

Un detalle de vocabulario: `discountPercent?: number` y `discountPercent: number | undefined` **no** son lo mismo. La primera permite omitir la propiedad; la segunda obliga a escribirla, aunque sea con valor `undefined`. Casi siempre quieres la primera.

## `readonly`

Una propiedad marcada con `readonly` no se puede reasignar después de crear el objeto. Es útil para identificadores, códigos y todo lo que no debería cambiar. Pero tiene dos límites que conviene conocer desde el principio:

[[exercise:03-readonly.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 11: TS2540: Cannot assign to 'code' because it is a read-only property.
línea 15: TS2540: Cannot assign to 'visitors' because it is a read-only property.
línea 22: TS2339: Property 'push' does not exist on type 'readonly string[]'.
línea 28: TS2540: Cannot assign to 'room' because it is a read-only property.
// Consola:
🐛 code → FALSO-0001
🐛 visitors → ['Bruno']
✅ en ejecución → TypeError: Cannot assign to read only property 'room' of object '#<Object>'
✅ frozen.room → Sala 2
```

El primer límite: `readonly` es una comprobación del verificador, como todos los tipos. El JavaScript generado no sabe nada de ella, y la asignación de la línea 11 se ejecuta. El segundo: es **superficial**. Protege la propiedad (no puedes poner otro array en `visitors`), pero no el contenido del array, que sigue aceptando `push` sin ningún error. Para proteger también el contenido, el tipo del array tiene que ser `readonly string[]` (o `ReadonlyArray<string>`, la misma idea en forma genérica). Y los objetos anidados tienen el mismo problema: cada nivel necesita su `readonly`.

Si necesitas que el objeto sea inmutable **en ejecución**, la herramienta es la del capítulo 5, `Object.freeze`. TypeScript entiende que el resultado es de solo lectura y marca la asignación; además, en ejecución la asignación lanza un `TypeError`, porque con `strict` el JavaScript generado está en modo estricto (en un script no estricto se ignoraría en silencio, como viste en el capítulo 5). Recuerda que `Object.freeze` también es superficial.

## `type` e `interface`

Hay una segunda forma de nombrar un tipo de objeto, `interface`. Para describir objetos, las dos son casi equivalentes, e incluso intercambiables:

```ts
type ArtworkType = { title: string; artist: string; year: number };

interface Artwork {
  title: string;
  artist: string;
  year: number;
}
```

[[exercise:04-type-e-interface.md-]]

```text
«El valle de México desde el cerro de Santa Isabel», José María Velasco (1875)
«El valle de México desde el cerro de Santa Isabel», José María Velasco (1875) · óleo sobre tela
«El Caballito», Manuel Tolsá (1803) · bronce
pintura → reproducción de 60 × 40 cm, impresa en 2026
```

Las diferencias prácticas caben en una tabla:

| | `type` | `interface` |
|---|---|---|
| Describir un objeto | ✅ | ✅ |
| Ampliar otro tipo | con `&` (intersección) | con `extends` (comprueba compatibilidad) |
| Uniones, tuplas, primitivos, funciones | ✅ (`type Gallery = 'pintura' \| 'escultura'`) | ❌ solo objetos |
| Declarar el mismo nombre dos veces | error | se **fusionan** en un solo tipo |

Muchos equipos eligen una por convención: `interface` para las formas de objeto y `type` para todo lo demás, o `type` para todo. En este curso verás las dos; lo importante es saber leerlas y conocer sus dos diferencias de comportamiento.

### Fusión de declaraciones

Si declaras dos `interface` con el mismo nombre, TypeScript no se queja: las **fusiona** en una sola, con las propiedades de ambas (*declaration merging*). Con `type`, repetir el nombre es un error:

[[exercise:05-fusion-de-declaraciones.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 13: TS2741: Property 'breakfast' is missing in type '{ guest: string; nights: number; }' but required in type 'Booking'.
línea 18: TS2300: Duplicate identifier 'Room'.
línea 19: TS2300: Duplicate identifier 'Room'.
// Consola:
stay → {guest: 'Carmen Vidal', nights: 2}
fullStay → {guest: 'Diego Ríos', nights: 1, breakfast: true}
```

La fusión existe para **ampliar tipos que ya existen**, sobre todo los de bibliotecas y los del propio navegador, desde archivos de declaraciones (el módulo 3 lo explica). En tu propio código, dos `interface` con el mismo nombre suelen ser un descuido, y el error aparece lejos: en el objeto al que de repente le falta una propiedad que no sabías que existía.

### `extends` frente a `&`

La otra diferencia está en cómo se amplía un tipo. `extends` comprueba que la interfaz nueva es **compatible** con la base, y si no lo es, avisa en la propia declaración. `&` (la **intersección**) no comprueba nada: combina las propiedades de los dos tipos, y si una choca, su tipo pasa a ser `never` (ningún valor puede ser a la vez `number` y `string`):

[[exercise:06-extends-frente-a-interseccion.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 7: TS2430: Interface 'GiftCard' incorrectly extends interface 'Product'.
  Types of property 'price' are incompatible.
    Type 'string' is not assignable to type 'number'.
línea 16: TS2322: Type 'string' is not assignable to type 'never'.
// Consola:
voucher → {sku: 'VALE-500', price: '500'}
```

El mensaje de `TS2430` ocupa varias líneas: la primera da el problema general y cada línea sangrada explica el motivo un poco más a fondo. Merece la pena leerlo hasta el final, porque la última línea suele ser la que dice qué cambiar.

El error de la intersección, en cambio, sale en la línea 16, la del objeto: lejos de la declaración que lo causa y con un mensaje que no menciona el choque, solo un `never` que hay que saber interpretar. Por eso, para ampliar formas de objeto, `interface` con `extends` da mejores errores.

## Propiedades de más

TypeScript tiene una comprobación especial para los objetos literales: si escribes un objeto literal directamente donde se espera un tipo, avisa de las propiedades que **sobran**. Es lo que detecta las erratas en los objetos de opciones. Pero solo se aplica a los literales «frescos», los que se escriben en ese mismo sitio:

[[exercise:07-propiedades-extra.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 12: TS2561: Object literal may only specify known properties, but 'giftwrap' does not exist in type 'ShippingOptions'. Did you mean to write 'giftWrap'?
// Consola:
literal → 249
🐛 variable → 249
✅ anotada → 294
```

¿Por qué no se queja con la variable? Por el tipado estructural del apartado siguiente: un objeto con propiedades de más **sí** encaja con un tipo que pide menos (tiene todo lo que hace falta). La comprobación de propiedades extra es una excepción pensada para atrapar erratas, y TypeScript solo la aplica cuando el objeto acaba de escribirse y no puede tener otro uso. La defensa es sencilla: anota las variables de objetos de opciones, como `typedOptions`.

## Tipado estructural

Esta es la idea central de la lección. Para decidir si un valor encaja con un tipo, TypeScript compara su **forma**: si tiene las propiedades que el tipo pide, con los tipos correctos, encaja. No importa cómo se creó, si es instancia de una clase o si tiene propiedades de más. A esto se le llama **tipado estructural**:

[[exercise:08-tipado-estructural.md-]]

```text
total → 434
¿tiene price? → false
```

`Book` no menciona `Priced` en ningún sitio, y aun así sus instancias encajan. Es el *duck typing* de JavaScript («si tiene `price`, sirve»), pero comprobado antes de ejecutar. El `souvenir` del final, con `cost` en lugar de `price`, no encajaría: pasarlo a `totalOf` sería un error de tipos.

> **Desde Python:** las clases de Python son **nominales**: si una función pide un `Book`, mypy solo acepta `Book` y sus subclases, aunque otra clase tenga los mismos atributos. El tipado estructural de TypeScript es el de `typing.Protocol`: una clase encaja con un protocolo si tiene sus atributos, sin heredar de él. En TypeScript, **todos** los tipos funcionan como protocolos, incluidas las clases.

La otra cara del tipado estructural es que dos tipos con la misma forma son **el mismo tipo**, aunque signifiquen cosas distintas:

[[exercise:09-misma-forma-distinto-significado.md-]]

```text
🐛 total → 124 (¿pesos? ¿dólares?)
🐛 ¿result es Pesos? → true | ¿order es Pesos? → false
✅ 250 MXN
```

`Pesos` y `Dollars` tienen exactamente la misma forma, `{ amount: number }`, así que para TypeScript son intercambiables, aunque `instanceof` los distinga en ejecución. Cuando dos tipos no deben mezclarse, la solución es que sus formas sean distintas: una propiedad `currency` con un valor fijo, como en `PesosTagged`, basta. El módulo 2 generaliza esta idea con los «tipos con marca».

## Firmas de índice

A veces un objeto se usa como **diccionario**: las claves no se conocen al escribir el código (códigos de producto, nombres de usuario…), pero todos los valores son del mismo tipo. Para eso está la **firma de índice**, `{ [clave: string]: tipo }`. El nombre de la clave (`sku`) solo documenta:

[[exercise:10-firmas-de-indice.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 7: TS2322: Type 'string' is not assignable to type 'number'.
// Consola:
TLA-01: 12
MOL-02: 0
TAS-03: 7
TAS-04: siete
⛔ TypeError: Cannot read properties of undefined (reading 'toFixed')
🐛 prices[10] → undefined
✅ SKU desconocido
```

Los valores se comprueban, pero hay un agujero: leer una clave que no existe da `undefined` en ejecución, y el tipo dice `number`. Con `strict`, TypeScript supone que toda clave leída existe, y lo mismo con los índices de un array (`prices[10]`). Existe una opción aparte, `noUncheckedIndexedAccess`, que añade `| undefined` a esas lecturas; **no** forma parte de `strict` y muchos proyectos no la activan. Sin ella, comprueba tú la clave, o usa un `Map`, cuyo `get` sí devuelve `number | undefined`. En el módulo 2 verás `Record<string, number>`, otra forma de escribir este mismo tipo.

> **Desde Python:** `{ [sku: string]: number }` es `dict[str, int]`. La diferencia es que en Python `stock["XYZ-99"]` lanza un `KeyError` al momento; en JavaScript devuelve `undefined` y el fallo aparece más tarde.

## Bestiario

- **La propiedad opcional que se usa como obligatoria.**
  Síntoma: `TS18048: 'dish.discountPercent' is possibly 'undefined'.` y, si se ejecuta, `NaN`; o `TS2741: Property 'price' is missing…` al crear el objeto.
  Causa: una propiedad con `?` puede no estar, así que al leerla su tipo incluye `undefined`; una sin `?` es obligatoria.
  Solución: decide el valor por defecto con `??` (o comprueba con un `if`); añade las propiedades obligatorias que faltan.
  → [ver ejemplo](02-propiedades-opcionales.md)
- **`readonly` que no protege.**
  Síntoma: una propiedad `readonly` cambia en ejecución (con su `TS2540` en rojo), o el array de una propiedad `readonly` acepta `push` sin ningún error.
  Causa: `readonly` solo existe para el verificador, y es superficial: protege la propiedad, no su contenido.
  Solución: `readonly string[]` para el contenido de los arrays, `readonly` en cada nivel, y `Object.freeze` si hace falta inmutabilidad en ejecución.
  → [ver ejemplo](03-readonly.md)
- **La interfaz que crece sola.**
  Síntoma: `TS2741: Property 'breakfast' is missing…` en un objeto que parecía completo; o `TS2300: Duplicate identifier 'Room'.`
  Causa: dos `interface` con el mismo nombre se fusionan; dos `type`, chocan.
  Solución: busca la otra declaración con el mismo nombre y renombra una de las dos (o une sus propiedades a propósito).
  → [ver ejemplo](05-fusion-de-declaraciones.md)
- **La intersección imposible.**
  Síntoma: `TS2322: Type 'string' is not assignable to type 'never'.` al crear un objeto.
  Causa: un tipo hecho con `&` combina propiedades sin comprobarlas; si una choca, su tipo es `never`.
  Solución: amplía con `interface … extends`, que detecta el choque en la declaración (`TS2430`), y corrige la propiedad incompatible.
  → [ver ejemplo](06-extends-frente-a-interseccion.md)
- **La errata que solo se detecta a veces.**
  Síntoma: `TS2561 … Did you mean to write 'giftWrap'?` con el objeto escrito en la llamada, y ningún error con el mismo objeto guardado en una variable.
  Causa: la comprobación de propiedades extra solo se aplica a los objetos literales frescos.
  Solución: anota las variables que guardan objetos de opciones (`const options: ShippingOptions = …`).
  → [ver ejemplo](07-propiedades-extra.md)
- **Pesos y dólares intercambiables.**
  Síntoma: una función acepta sin error un objeto de otra clase y el resultado no tiene sentido.
  Causa: tipado estructural: dos tipos con la misma forma son el mismo tipo, sin importar el nombre de la clase.
  Solución: haz que las formas sean distintas (una propiedad como `currency: 'MXN'`); en el módulo 2, tipos con marca.
  → [ver ejemplo](09-misma-forma-distinto-significado.md)
- **La clave que no existe.**
  Síntoma: `TypeError: Cannot read properties of undefined` al usar `stock[sku]`, en un código sin errores rojos.
  Causa: con una firma de índice (o un array), TypeScript supone que toda lectura encuentra un valor.
  Solución: comprueba `=== undefined` antes de usarlo, usa un `Map`, o activa `noUncheckedIndexedAccess` en tu proyecto.
  → [ver ejemplo](10-firmas-de-indice.md)

## Resumen

- Un tipo de objeto lista las propiedades y sus tipos; se nombra con `type` (o `interface`) y no existe en ejecución, como un `TypedDict`.
- `prop?: T` puede faltar y al leerla es `T | undefined`.
- `readonly` impide reasignar mientras escribes, pero no en ejecución, y solo protege un nivel.
- `type` e `interface` describen objetos por igual; `interface` se amplía con `extends` (que comprueba) y se fusiona si se repite; `type` usa `&` y además nombra uniones, tuplas y primitivos.
- Las propiedades de más solo se detectan en objetos literales frescos.
- Tipado estructural: encaja todo valor con la forma correcta, como un `Protocol` de Python; dos tipos con la misma forma son intercambiables.
- Las firmas de índice describen diccionarios; leer una clave inexistente da `undefined` sin aviso.

## Para profundizar

- [Manual de TypeScript: tipos de objeto (en inglés)](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [Manual de TypeScript: diferencias entre type e interface (en inglés)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [Manual de TypeScript: compatibilidad de tipos y tipado estructural (en inglés)](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [Referencia de tsconfig: noUncheckedIndexedAccess (en inglés)](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess)
