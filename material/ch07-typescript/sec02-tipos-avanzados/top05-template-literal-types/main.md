# Tipos de plantilla

## Por qué importa

Mucha información de una aplicación web vive en textos con estructura: el SKU `M-negro` de una playera, el nombre de un manejador `onAdd`, una ruta `/museos/:museumId/salas/:roomId`, una longitud CSS `1.5rem`, una variable `--brand`. Con `string` a secas, cualquier errata en esos textos pasa sin aviso; con una unión de literales, hay que escribir a mano todas las combinaciones.

Los **tipos de plantilla** (*template literal types*, TypeScript 4.1) son la versión para tipos de los *template literals* del capítulo 5: `` `${Size}-${Color}` `` construye tipos de texto a partir de otros tipos. Combinados con `infer` y con los tipos mapeados, permiten que TypeScript **entienda** la estructura de un texto: sacar los parámetros de una ruta, derivar los nombres de los eventos o comprobar que una longitud termina en `px`.

> **Desde Python:** no hay nada equivalente. `Literal["S-negro", "M-negro"]` obliga a escribir cada texto, y las *f-strings* solo existen en ejecución. Igual que los tipos mapeados y condicionales, esta es una capacidad propia del sistema de tipos de TypeScript.

## Plantillas con tipos

Un tipo de plantilla se escribe con comillas invertidas, como un *template literal*, pero lo que va dentro de `${ }` son **tipos**. Si son literales, el resultado es otro literal; si son uniones, el resultado es la unión de **todas las combinaciones**:

[[exercise:01-tipos-de-plantilla.md-]]

```text
S-negro → 0 uds.
S-arena → 0 uds.
M-negro → 4 uds.
M-arena → 0 uds.
L-negro → 0 uds.
L-arena → 1 uds.
```

`Sku` tiene seis miembros, 3 tallas por 2 colores, y se actualiza solo si cambian los arrays. En ejecución, un *template literal* normal tiene tipo `string`; con `as const` detrás (`` `${size}-${color}` as const ``), TypeScript le da el tipo de plantilla, y `allSkus` es un array de `Sku`. El inventario usa `Partial<Record<Sku, number>>` (lección 4): no todos los SKU tienen existencias, y una errata en una clave sería un error.

## Las uniones se multiplican

Ese producto cartesiano tiene un precio. Cada unión dentro de la plantilla **multiplica** el número de miembros, y TypeScript tiene un límite: a partir de 100 000 miembros, se rinde.

[[exercise:02-las-uniones-se-multiplican.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 8: TS2322: Type '"M-rojo-slim"' is not assignable to type '"XS-negro-regular" | "XS-negro-slim" | "XS-negro-oversize" | "XS-blanco-regular" | "XS-blanco-slim" | "XS-blanco-oversize" | "XS-arena-regular" | "XS-arena-slim" | "XS-arena-oversize" | ... 80 more ... | "XL-marino-oversize"'.
línea 13: TS2590: Expression produces a union type that is too complex to represent.
// Consola:
combinaciones de Sku → 90 | M-vino-slim M-rojo-slim
🐛 combinaciones de PostalCode → 100000 | acepta → hola
✅ 68000 → true
✅ hola → false
✅ 6800 → false
```

Los 90 SKU funcionan, y el mensaje de error enseña los primeros y resume el resto («… 80 more …»). Un código postal de cinco dígitos, en cambio, son 10⁵ = 100 000 textos: TypeScript da el error `TS2590` y, peor todavía, deja el tipo como `any`, así que `'hola'` se acepta sin más avisos. Las uniones enormes también hacen lento al editor mucho antes del límite. Una regla como «cinco dígitos» no se describe bien con un tipo: se comprueba en ejecución, con una expresión regular. En la lección 6 verás cómo darle a ese texto comprobado un tipo propio, `PostalCode`, sin enumerar nada.

## Mayúsculas y minúsculas

TypeScript trae cuatro tipos que transforman textos: `Uppercase`, `Lowercase`, `Capitalize` (primera letra en mayúscula) y `Uncapitalize`. Son especiales: no están escritos en TypeScript como los de la lección 4, sino implementados dentro del compilador (*intrinsic*).

[[exercise:03-mayusculas-y-minusculas.md-]]

```text
onClick | MXN | Mole negro
```

Se combinan con las plantillas (`` `on${Capitalize<EventName>}` `` da `'onClick' | 'onKeydown'`). La parte interesante está en las funciones: `capitalize<S>` promete devolver `Capitalize<S>`, y su implementación necesita un `as`. TypeScript no ejecuta tu código para comprobar que `charAt(0).toUpperCase()` hace lo mismo que `Capitalize`; el tipo describe lo que haces, pero la responsabilidad de que coincidan es tuya. Es uno de los pocos sitios donde un `as` es razonable: dentro de una función pequeña, con un tipo de retorno que la describe.

## Eventos tipados

Un patrón muy común en bibliotecas es un **mapa de eventos**: un tipo cuyas claves son los nombres de los eventos y cuyos valores son los datos que lleva cada uno. De él salen los nombres de los manejadores, con una plantilla y el remapeo de claves de la lección 3, y una función `emit` que exige los datos del evento que se emite:

[[exercise:04-eventos-tipados.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 30: TS2345: Argument of type '{ sku: string; }' is not assignable to parameter of type '{ sku: string; qty: number; }'.
  Property 'qty' is missing in type '{ sku: string; }' but required in type '{ sku: string; qty: number; }'.
línea 32: TS2345: Argument of type '"ad"' is not assignable to parameter of type 'keyof ShopEvents'.
// Consola:
➕ MOL-01 ×2
➖ MOL-01
💳 total $330
➕ CAF-02 ×undefined
🐛 TypeError: handler is not a function
```

`emit<E extends keyof ShopEvents>(event: E, data: ShopEvents[E])` es la firma de la lección 2: el primer argumento fija `E` y el segundo debe ser `ShopEvents[E]`. Por eso un `add` sin `qty` sale en rojo, y en ejecución se habría pintado `×undefined`. Dentro de `handlers`, los parámetros `data` no llevan anotación: el tipado contextual les da el tipo de cada evento. Es la misma idea con la que el DOM tipa `addEventListener('keydown', …)` (el mapa se llama `HTMLElementEventMap`), que verás en el módulo «TypeScript en la práctica».

## Rutas tipadas: `infer` en una plantilla

`infer` también funciona dentro de una plantilla, como un patrón con huecos: `` P extends `${string}:${infer Name}/${infer Rest}` `` se lee «`P` empieza con cualquier cosa, luego `:`, luego un nombre hasta la siguiente `/`, y luego el resto». Con un poco de recursión, saca todos los parámetros de una ruta:

[[exercise:05-rutas-tipadas.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 26: TS2353: Object literal may only specify known properties, and 'room' does not exist in type 'Params<"/museos/:museumId/salas/:roomId">'.
línea 27: TS2345: Argument of type '{ museumId: string; }' is not assignable to parameter of type 'Params<"/museos/:museumId/salas/:roomId">'.
  Property 'roomId' is missing in type '{ museumId: string; }' but required in type 'Params<"/museos/:museumId/salas/:roomId">'.
// Consola:
/museos/munal/salas/12
/productos/caf%C3%A9%20de%20olla
/carrito
/museos/munal/salas/
/museos/munal/salas/
```

Así se evalúa `ParamNames<'/museos/:museumId/salas/:roomId'>`, paso a paso:

```text
'/museos/:museumId/salas/:roomId'  → Name = 'museumId', Rest = 'salas/:roomId'
'/salas/:roomId'                   → no hay '/' después del nombre: segunda rama, Name = 'roomId'
resultado                          → 'museumId' | 'roomId'
```

Fíjate en que `infer Name` se detiene en la **primera** `/`: un `infer` seguido de texto fijo captura lo mínimo. `Params<P>` convierte esa unión en un objeto con un tipo mapeado. *Routers* como React Router o TanStack Router usan esta técnica para que un enlace con un parámetro de menos sea un error de tipos. En ejecución, `buildPath` no sabe nada de todo esto: hace un `replace` con una expresión regular (capítulo 5) y codifica cada valor con `encodeURIComponent`.

## Patrones: `${number}` y las unidades CSS

Dentro de una plantilla también caben tipos amplios como `string` o `number`, que funcionan como **patrones**: `` `${number}px` `` es «cualquier texto que sea un número, seguido de `px`». No se enumeran (son infinitos), así que no hay explosión de combinaciones. Pero «ser un número» significa lo que entiende `Number()`, que no es lo mismo que lo que entiende CSS:

[[exercise:06-unidades-css.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 7: TS2322: Type '"px"' is not assignable to type '`${number}px`'.
línea 8: TS2322: Type '"1,5px"' is not assignable to type '`${number}px`'.
// Consola:
margin-top: 1.5rem → ✅ válido
margin-top: -2px → ✅ válido
margin-top: px → ❌ CSS lo rechaza
margin-top: 1,5px → ❌ CSS lo rechaza
margin-top: 16 px → ❌ CSS lo rechaza
margin-top: 0x10px → ❌ CSS lo rechaza
margin-top: 1e3px → ✅ válido
```

`'16 px'` y `'0x10px'` pasan la comprobación de tipos porque `Number('16 ')` y `Number('0x10')` son números, y CSS los rechaza (en CSS no puede haber un espacio entre el número y la unidad, ni existe el hexadecimal). `CSS.supports(propiedad, valor)` pregunta al navegador; es la prueba de verdad. Los patrones son útiles para atrapar los errores gordos (una unidad olvidada, una coma decimal), pero no sustituyen a la validación.

## Renombrar claves con plantillas

La lección 3 adelantó el remapeo `` `get${Capitalize<K>}` ``. El mismo mecanismo sirve para cualquier convención de nombres; por ejemplo, las propiedades personalizadas de CSS (`--brand`) de un tema:

[[exercise:07-variables-css.md-]]

```text
:root {
  --brand: #1d4ed8;
  --surface: #0f172a;
  --text: #e2e8f0;
  --radius: 0.5rem;
}
marca → #1d4ed8
```

`keyof T & string` deja solo las claves de texto, porque una plantilla no acepta un `symbol`. `toCssVars` vuelve a necesitar un `as`: `Object.entries` devuelve claves `string`, y TypeScript no puede seguir la transformación de `'brand'` a `'--brand'` dentro del bucle. A cambio, quien use `vars` tiene autocompletado y comprobación de cada nombre de variable.

## Bestiario

- **Una unión de plantilla demasiado grande.**
  Síntoma: `TS2590: Expression produces a union type that is too complex to represent.` y, a partir de ahí, ningún error con ese tipo (se ha convertido en `any`).
  Causa: las uniones dentro de una plantilla se multiplican; a partir de 100 000 miembros, TypeScript se rinde.
  Solución: no enumeres reglas de formato en tipos; usa un patrón (`${number}`) o valida en ejecución y dale al resultado un tipo con marca (lección 6).
  → [ver ejemplo](02-las-uniones-se-multiplican.md)
- **Un evento con los datos equivocados.**
  Síntoma: `TS2345: Argument of type '{ sku: string; }' is not assignable to parameter of type '{ sku: string; qty: number; }'.`; en ejecución, `×undefined` o `handler is not a function`.
  Causa: `emit<E>` relaciona el nombre del evento con sus datos, y los datos no coinciden (o el nombre tiene una errata).
  Solución: completa los datos; el mapa de eventos es la única fuente de verdad de nombres y datos.
  → [ver ejemplo](04-eventos-tipados.md)
- **Una ruta con parámetros de más o de menos.**
  Síntoma: `TS2353 … 'room' does not exist in type 'Params<…>'` o `TS2345 … Property 'roomId' is missing…`; en ejecución, una ruta con un hueco (`/salas/`).
  Causa: `Params<P>` saca los nombres exactos de la ruta y el objeto no coincide.
  Solución: pasa exactamente los parámetros que pide la ruta; los nombres los da el propio patrón.
  → [ver ejemplo](05-rutas-tipadas.md)
- **`${number}` acepta más de lo que parece.**
  Síntoma: `'16 px'` o `'0x10px'` no dan error de tipos, pero CSS los rechaza.
  Causa: `${number}` admite cualquier texto que `Number()` convierta en un número finito, con espacios, hexadecimal o exponentes.
  Solución: usa el patrón como primer filtro y comprueba en ejecución (`CSS.supports`, una expresión regular) lo que de verdad importa.
  → [ver ejemplo](06-unidades-css.md)

## Resumen

- `` `${A}-${B}` `` construye tipos de texto; con uniones, produce todas las combinaciones.
- Las combinaciones se multiplican: por encima de 100 000, `TS2590` y el tipo pasa a ser `any`.
- `Uppercase`, `Lowercase`, `Capitalize` y `Uncapitalize` transforman tipos de texto; las funciones que hacen lo mismo en ejecución necesitan un `as`.
- Un mapa de eventos + `` `on${Capitalize<E>}` `` + `emit<E extends keyof Events>` da eventos con nombres y datos comprobados.
- `infer` dentro de una plantilla extrae partes de un texto, como los parámetros de una ruta.
- `${number}` y `${string}` son patrones: no se enumeran, pero `${number}` acepta todo lo que acepta `Number()`.
- El remapeo de claves con plantillas cambia convenciones de nombres (`--brand`, `getName`, `onAdd`).

## Para profundizar

- [Manual de TypeScript: tipos de plantilla (en inglés)](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Notas de TypeScript 4.1: tipos de plantilla y remapeo de claves (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html)
- [MDN: CSS.supports() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/CSS/supports_static)
