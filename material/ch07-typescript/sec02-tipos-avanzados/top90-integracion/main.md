# Integración: tipos avanzados

## Por qué importa

Las seis lecciones del módulo enseñan herramientas que casi nunca aparecen solas. Un emisor de eventos tipado es una clase genérica con un tipo mapeado dentro y nombres calculados con plantillas. Un enrutador saca los parámetros de una ruta con `infer` y valida la consulta con predicados. Un formulario deriva su estado entero de un solo tipo, y una biblioteca de esquemas junta `infer`, tipos condicionales, tipos mapeados y validación en ejecución.

Los seis ejemplos de esta página combinan tres o cuatro lecciones cada uno, sin un solo error de tipos. Fíjate en la proporción: mucho trabajo en los tipos (que se escribe una vez y luego protege todas las llamadas) y muy pocos `as`, siempre dentro de una función pequeña y con un comentario que explica por qué TypeScript no puede seguir el código. En los tres ejercicios del final, el objetivo vuelve a ser doble: comprobaciones ✓ y ningún error de tipos.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|---|---|---|
| una función o clase que sirva para muchos tipos sin perderlos | un parámetro de tipo con la restricción mínima (`T extends { id: … }`) | «Genéricos» |
| que el tipo de salida dependa de una clave | `K extends keyof T` y retorno `T[K]` | «Operadores de tipo» |
| un objeto de configuración comprobado que conserve sus literales | `{…} as const satisfies Record<string, Config>` y `keyof typeof` | «Operadores de tipo» |
| varios tipos con las mismas claves que otro | un tipo mapeado `{ [K in keyof T]: … }` | «Tipos mapeados y condicionales» |
| un tipo distinto según otro tipo | un condicional `T extends U ? X : Y`, con `infer` si hay que extraer una parte | «Tipos mapeados y condicionales» |
| crear, editar y mostrar versiones de un tipo | `Omit<T, 'id'>`, `Partial<…>`, `Pick`, `Record<Unión, …>` | «Tipos de utilidad» |
| nombres calculados (`onAdded`, `priceMxn`, `:roomId`) | tipos de plantilla, `Capitalize`, `infer` en una plantilla | «Tipos de plantilla» |
| datos de fuera | `unknown`, predicados, un validador con rutas o un esquema con `Infer` | «Guardas y validación» |
| dos valores con la misma forma que no deben mezclarse | un tipo con marca y su constructor | «Guardas y validación» |

## Ejemplos combinados

### Un emisor de eventos tipado

El carrito de una tienda de discos avisa de lo que pasa con eventos. `TypedEmitter<Events>` es una clase genérica sobre un mapa «nombre del evento → datos». Su campo privado es un tipo mapeado (una lista opcional de oyentes por evento), y `on`/`emit` usan `E extends keyof Events` para que los datos sean siempre los del evento nombrado. `connect` recibe varios manejadores a la vez, con nombres calculados por una plantilla (`added` → `onAdded`), y devuelve una sola función de baja. **Fíjate en** que ningún oyente anota su parámetro: el tipado contextual les da los datos de su evento.

[[exercise:01-emisor-de-eventos.md-]]

```text
➕ Amor prohibido ×1
➕ Re ×2
líneas → {'LP-221': 2}
oyentes de cleared tras disconnect → 0
```

### Rutas y consulta de la web de un museo

Los patrones de las rutas se escriben una vez en un objeto `` as const satisfies Record<string, `/${string}`> ``, que comprueba que todos empiecen por `/` sin perder sus literales. `matchRoute<P>` devuelve `Params<P> | null`, así que después de un `if (room)` el código lee `room.museumId` y `room.roomId` y nada más. La consulta llega como texto: `isSort` es un predicado y el número de página es un `PageNumber` con marca, que solo fabrica `toPage`. **Fíjate en** que `parseSearch` devuelve un objeto o una lista de problemas, y `Array.isArray` distingue las dos ramas.

[[exercise:02-rutas-y-consulta.md-]]

```text
/museos/munal/salas/12 → 🏛️ munal, sala 12
/obras/el-valle-de-mexico → 🖼️ obra «el-valle-de-mexico»
/buscar?q=velasco&sort=year&page=2 → 🔎 «velasco» por year, página 2
/buscar?q=herr%C3%A1n → 🔎 «herrán» por relevance, página 1
/buscar?sort=color&page=0 → ⚠️ sort: «color» no es relevance | year | title · page: «0» no es un número de 1 a 50
/tienda → ❓ 404 /tienda
```

### El estado de un formulario

El formulario de una visita escolar al museo deriva todo su estado de un solo tipo, `GroupVisit`. `RawForm<T>` es un condicional dentro de un tipo mapeado: las casillas dan `boolean` y el resto de controles, texto. `Touched<T>` y `FieldErrors<T>` son mapeados, y `Validators<T>` da a cada validador el tipo exacto de su campo. `runValidator<K>` usa un parámetro genérico para que TypeScript relacione `VALIDATORS[K]` con `raw[K]`, y `byId` es genérico sobre la clase del elemento y estrecha con `instanceof`. **Fíjate en** los mensajes: un campo solo enseña su error después de haberlo dejado (o de pulsar «Reservar»), y el foco va al primer campo que falla.

[[exercise:03-estado-de-un-formulario.md]]

```text
Listo: rellena el formulario (los errores salen al dejar cada campo) y pulsa «Reservar»
// Tras pulsar «Reservar» con el formulario como viene:
⚠️ 2 campo(s) por corregir: Escuela, Correo
// Tras escribir «Secundaria Técnica 12» y «direccion@est12.edu.mx», marcar la visita guiada y pulsar «Reservar»:
✅ Secundaria Técnica 12 · 25 alumnos · 2026-11-03 · con visita guiada ($625.00)
// Tras cambiar la fecha a 2026-11-02 (lunes) y pulsar «Reservar»:
⚠️ 1 campo(s) por corregir: Fecha
```

[[exercise:03-estado-de-un-formulario.md-(script.ts)]]

### Un repositorio con ids con marca

Un repositorio genérico para los museos y sus exposiciones. Cada entidad tiene su propio tipo de id, `Id<'Museum'>` o `Id<'Exhibition'>`, así que pasar el id de una exposición donde se espera el de un museo es un error. `create` recibe `Omit<T, 'id'>` (el id lo fabrica el repositorio), `update` un `Partial` sin id, y lo que sale es `DeepReadonly<T>` y, además, está congelado con `deepFreeze`. **Fíjate en** la definición de `DeepReadonly`: una marca es una intersección con un objeto, así que la versión de la lección 3 la habría «mapeado» y estropeado; esta deja pasar los primitivos primero.

[[exercise:04-repositorio-con-ids-con-marca.md-]]

```text
creada → exp-1 «Velasco: el valle» en Museo Nacional de Arte
ampliada → 2027-03-15 | la versión anterior sigue igual → 2027-01-31
🧊 congelada → TypeError: Cannot add property 1, object is not extensible
```

El último mensaje sale de un `TypeError` real: las páginas de TypeScript se ejecutan en modo estricto, y en él cambiar un objeto congelado lanza un error en lugar de fallar en silencio.

### Una tienda en tres países

La configuración de una tienda que vende en México, Estados Unidos y España. `as const satisfies` comprueba cada país y conserva sus literales, y de ese objeto salen `StoreId` (`keyof typeof`) y `Currency` (un tipo indexado encadenado). `SHIPPING_NOTE` es un `satisfies Record<StoreId, string>`: si mañana se añade un país, sale en rojo hasta tener su nota. Los precios de cada producto son propiedades calculadas con una plantilla, `priceMxn`, `priceUsd` y `priceEur`, y `priceKey<C>` devuelve la clave exacta de una moneda. **Fíjate en** `product[priceKey(store.currency)]`: un acceso con una clave calculada en ejecución que TypeScript sabe que es un `number`.

[[exercise:05-configuracion-por-pais.md-]]

```text
mx · 4 × Mole negro (500 g) → $864.60 (Envío por paquetería en 2–4 días hábiles)
us · 4 × Mole negro (500 g) → $44.00 (Ships from Laredo, TX in 5–7 days)
es · 4 × Mole negro (500 g) → 49,08 € (Envío desde Madrid en 3–5 días)
claves de precio → priceMxn, priceUsd, priceEur
```

### Un mini-Zod con campos opcionales

La versión más completa del esquema de la lección 6 valida las obras de un museo que llegan en `artworks.json` (ábrelo con «Assets»). `s.oneOf` usa un parámetro de tipo `const` para que la lista de valores sea una unión de literales; `s.optional` marca un esquema con `optional: true`; y `InferObject` usa un condicional para encontrar las claves opcionales y `never` para separarlas, de modo que `room` sale como `room?: number`. Cada problema se anota con su ruta. **Fíjate en** la comprobación `Expect<Equal<Artwork, …>>`: el tipo `Artwork` no se escribe en ningún sitio, sale del esquema.

[[exercise:06-esquemas-con-opcionales.md-]]

```text
⚠️ artworks[1].year: debe ser un entero entre 1500 y 2026, llegó "1913"
⚠️ artworks[3].artist: falta
⚠️ artworks[3].kind: debe ser painting | sculpture | photo, llegó "mural"
✅ El valle de México desde el cerro de Santa Isabel · José María Velasco (1875) · painting · sala 12
✅ Malgré tout · Jesús F. Contreras (1898) · sculpture
```

## Ejercicios

Los tres ejercicios se corrigen solos: al cargar, cada comprobación imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Están terminados cuando las comprobaciones salen ✓ **y** el verificador no marca ningún error de tipos (en el editor o en la franja del diálogo «▶ Run»). Las comprobaciones no hace falta tocarlas.

### Un emisor sin erratas

El emisor de eventos de una tienda acepta cualquier nombre y cualquier dato, porque usa `string` y `any`. Por eso el ejercicio empieza sin errores de tipos, y aun así tres comprobaciones fallan: un oyente escucha `'chekout'` y dos leen propiedades que no existen. Hazlo genérico sobre un mapa de eventos y el verificador señalará las tres erratas. Cuatro comprobaciones.

[[exercise:07-ej-emisor-sin-erratas.md]]

### Valida el catálogo

`parseProduct` convierte un `unknown` en `Product` con un `as` que no comprueba nada, y cuatro comprobaciones lo delatan. Escríbelo de verdad, con un predicado `isRecord`, comprobando cada campo y anotando cada problema con su ruta, como el validador de la lección 6. Seis comprobaciones.

[[exercise:08-ej-valida-el-catalogo.md]]

### Rutas con parámetros

Escribe el tipo que saca los parámetros de una ruta y la función que los sustituye. Al abrirlo, dos comprobaciones de tipos fallan, y las llamadas a `buildPath` aceptan cualquier objeto porque `Params<P>` es todavía un objeto vacío. Cuando `ParamNames` esté bien, una llamada con un parámetro de más o de menos será un error de tipos; la última comprobación simula unos parámetros que llegan incompletos de un JSON, que el verificador no puede ver. Cinco comprobaciones.

[[exercise:09-ej-rutas-con-parametros.md]]
