# Integración: números, texto y colecciones

## Por qué importa

Cada lección de este módulo estudió un tipo de dato por separado: números, strings, arrays, objetos, `Map` y `Set`, JSON y fechas. En un programa real llegan todos a la vez. Una factura mezcla céntimos, porcentajes, fechas y un formato de moneda; una agenda mezcla texto con tildes, diccionarios y orden alfabético; un borrador guardado mezcla JSON, colecciones y copias. Los ejemplos de esta página combinan varias lecciones en cada programa, y los ejercicios te piden hacerlo a ti.

## Qué herramienta para cada dato

Casi todas las decisiones de esta página salen de una tabla corta. Si dudas en un ejercicio, vuelve aquí:

| El dato es… | Guárdalo como… | Y al mostrarlo… |
|-------------|----------------|-----------------|
| dinero | céntimos enteros (`Math.round(euros * 100)`) | `Intl.NumberFormat` con `style: 'currency'`, dividiendo entre 100 al final |
| texto que escribe una persona | `trim()` + `normalize()` al recibirlo | `localeCompare` o `Intl.Collator` con el idioma explícito para ordenar |
| un registro con campos fijos | objeto literal | desestructuración para leerlo |
| un diccionario con claves que llegan en ejecución | `Map` | `[...map]` o `Object.fromEntries(map)` antes de JSON |
| valores sin repetir | `Set` | `[...set]` para ordenar o serializar |
| un instante (una reunión, un pedido) | string ISO con `Z` o desfase (`+02:00`) | `Intl.DateTimeFormat` con `timeZone` explícita |
| una fecha de calendario (un festivo) | `'AAAA-MM-DD'` → medianoche UTC | `timeZone: 'UTC'` |
| una versión anterior de algo | `structuredClone` o un objeto nuevo con lo que cambia | — |

Una regla más, que atraviesa todos los ejemplos: **nunca dependas de la configuración de quien ejecuta el código**. El idioma y la zona horaria del navegador cambian de una persona a otra, así que cada `Intl` lleva su locale y, si hay fechas, su `timeZone`. Por eso las salidas de esta página son las mismas en Madrid, en Ciudad de México o en Tokio.

Los ejemplos usan funciones con la sintaxis básica `function nombre(parámetros) { … }` y las funciones flecha que ya viste en «Arrays»; las dos se estudian a fondo en el módulo «Funciones y ámbito». Cuando una flecha devuelve un objeto se escribe entre paréntesis, `(x) => ({ … })`, y el código lo señala con un comentario.

## Ejemplos combinados

### Factura con IVA por tipo

Una librería factura a un colegio libros (IVA del 4 %) y material escolar (21 %). Cada línea se calcula en céntimos, el descuento se redondea en cuanto aparece, `Map.groupBy` agrupa las líneas por tipo de IVA (la clave es un número, así que un objeto no serviría) y el vencimiento se calcula sobre una **copia** de la fecha de emisión. Fíjate en `useGrouping: 'always'`: `es-ES` no agrupa los números de cuatro cifras, y en una columna de importes queda mejor que todos lleven el punto de miles. La última línea compara con el cálculo en euros sin redondear: fracciones de céntimo y ruido binario.

[[exercise:01-factura-con-intl.md-]]

```text
FACTURA 2026-0187 · Librería El Aljibe → CEIP Rosalía de Castro
Fecha: 30 de octubre de 2026 · Vence: 29 de noviembre de 2026
Concepto                 Ud.     Precio  Dto.        Base   IVA
Diccionario escolar       25    18,95 €   5 %    450,06 €   4 %
Atlas de Geografía        10    24,50 €   5 %    232,75 €   4 %
Cuaderno A4 (5 u.)        40     6,35 €     —    254,00 €  21 %
Calculadora científica    12    15,99 €  10 %    172,69 €  21 %
───────────────────────────────────────────────────────────────
Base imponible                                 1.109,50 €
IVA 4 % sobre 682,81 €                            27,31 €
IVA 21 % sobre 426,69 €                           89,60 €
TOTAL                                          1.226,41 €
🐛 total con decimales → 1226.4172999999998
✅ total en céntimos → 122641
```

### Frecuencia de palabras

Cuenta las palabras de tres reseñas. El texto se normaliza **al recibirlo** (una reseña copiada de un PDF trae la «í» descompuesta) y se pasa a minúsculas; `Intl.Segmenter` lo parte en palabras sin necesidad de quitar la puntuación a mano. Después viene el contraste de la lección «Map, Set y WeakMap»: contar con un objeto falla con la palabra «constructor», porque el objeto ya la hereda de `Object.prototype`, mientras que el `Map` empieza vacío de verdad. El ranking ordena por frecuencia y desempata alfabéticamente encadenando comparadores con `||`.

[[exercise:02-frecuencia-de-palabras.md-]]

```text
palabras → 34
🐛 objeto: casa → 3
🐛 objeto: constructor → function Object() { [native code] }111
✅ Map: constructor → 3
✅ Map: jardín → 2 (las dos formas, unidas por normalize)
(tabla) casa 3 · constructor 3 · cocina 2 · jardín 2 · contratar 1 · cuidado 1
distintas: 15 · palabras vacías descartadas: 13
```

### Inventario que llega como JSON

El servidor devuelve el inventario como texto. `JSON.parse` va dentro de un `try/catch` (un JSON con una coma final no tumba la aplicación) y un **reviver** convierte en `Date` los campos de fecha. Con `filter`, `reduce` y `Object.groupBy` salen las alertas de stock, el valor del almacén y las unidades por categoría. La reposición se hace **sin mutar**: `map` y spread crean objetos nuevos solo para los productos que cambian, y los demás se reutilizan tal cual (`items[0] === restocked[0]`). Al final, un replacer en forma de array deja en el JSON solo las claves que necesita la tienda online.

[[exercise:03-inventario-en-json.md-]]

```text
⚠ Inventario ilegible (SyntaxError): se mantiene el anterior
⚠ 3 productos con poco stock:
  TE-0107 Rooibos con vainilla 100 g: 6/10 · repuesto hace 58 días
  CA-0012 Café de Etiopía 250 g: 3/8 · repuesto hace 39 días
  AC-0300 Tetera de hierro 0,8 l: 2/2 · repuesto hace 113 días
valor del almacén → 561,60 €
unidades por categoría → {té: 48, café: 18, accesorios: 2}
original TE-0107 → 6 | repuesto → 30
¿mismo objeto TE-0421? → true
{ "syncedAt": "2026-10-13T09:00:00.000Z", "items": [ { "sku": "TE-0107", "stock": 30 }, … ] }
```

### Etiquetas con `Set`

Cada autor de un blog escribe las etiquetas a su manera (`'CSS'`, `' grid '`, `'Diseño'`). Se normalizan a una forma canónica y cada artículo pasa a tener un `Set`, así que los repetidos desaparecen solos. La unión de todos da el catálogo de etiquetas, una clave de búsqueda **sin tildes** detecta casi duplicados (`diseño` / `diseno`) sin fusionarlos a ciegas (quitar tildes convertiría «año» en «ano»), y `intersection`, `difference` y `union` calculan la similitud entre artículos para sugerir lecturas relacionadas.

[[exercise:04-etiquetas-con-set.md-]]

```text
grid → Set(4) {'css', 'grid', 'diseño', 'maquetación'}
10 etiquetas → accesibilidad, color, css, diseno, diseño, flexbox, formularios, grid, html, maquetación
⚠ ¿Duplicado? diseño / diseno (clave «diseno»)
en común → Set(3) {'css', 'diseño', 'maquetación'}
solo en grid → Set(1) {'grid'}
en uno solo → Set(2) {'grid', 'flexbox'}
¿{css} ⊆ grid? → true
relacionados con grid:
   60 %  flexbox-sin-miedo
   14 %  colores-accesibles
    0 %  formularios-que-ayudan
```

### Calendario de plazos

Los plazos de un estudio de diseño se guardan como instantes ISO con su desfase, y el desfase cambia con la hora de invierno (el 25 de octubre de 2026 Madrid pasa de `+02:00` a `+01:00`; el formato con `timeZoneName` lo muestra como CEST y CET). Todo se calcula y se muestra en `Europe/Madrid`, con un «ahora» fijo, así que la salida es la misma en cualquier navegador. Los días que faltan se cuentan como días **de calendario** en Madrid: `formatToParts` da el año, el mes y el día en esa zona, y la resta de dos medianoches UTC siempre es un número exacto de días. Al final, la misma reunión vista desde México y Bogotá.

[[exercise:05-calendario-de-plazos.md-]]

```text
▼ octubre de 2026
    ⛔ vie, 9 oct   12:00 CEST Pago del dominio (hace 3 días)
    ⚠ lun, 12 oct  17:30 CEST Revisión de bocetos (hoy)
    ⚠ mar, 13 oct  18:00 CEST Entrega del diseño web (mañana)
    · mar, 20 oct  23:59 CEST Modelo 303 (IVA del 3.er trimestre) (dentro de 8 días)
▼ noviembre de 2026
    · mar, 3 nov   10:00 CET  Presentación final al cliente (dentro de 22 días)
    · lun, 30 nov  23:59 CET  Factura de noviembre (dentro de 49 días)
Europe/Madrid        → 3 nov 2026, 10:00
America/Mexico_City  → 3 nov 2026, 3:00
America/Bogota       → 3 nov 2026, 4:00
```

### Historial de «deshacer»

Un editor guarda una instantánea de la carta antes de cada cambio para poder deshacerlo. La primera versión copia con spread y **no funciona**: la instantánea es un objeto nuevo, pero su array de platos es el mismo que luego se edita. La segunda copia con `structuredClone`, que además conserva los `Set` de alérgenos y la `Date` (el truco de JSON los habría convertido en `{}` y en texto). La tercera no muta nunca: cada cambio crea un estado nuevo copiando solo lo que cambia (`with`, spread), y las partes que no cambian se comparten sin peligro.

[[exercise:06-historial-de-deshacer.md-]]

```text
🐛 tras deshacer → Gazpacho 7,00 € · Pisto con huevo 9,00 € · Flan casero 4,50 € (3 platos)
editado → Gazpacho 7,00 € · Pisto con huevo 9,00 € · Flan casero 4,50 € (3 platos)
✅ tras deshacer → Gazpacho 6,50 € · Pisto con huevo 9,00 € (2 platos)
alérgenos → Set(1) {'ajo'} | ¿Date? → true
🐛 con JSON → {} | string
versiones → (3) [2, 2, 3]
deshacer dos veces → Gazpacho 6,50 € · Pisto con huevo 9,00 € (2 platos)
¿pisto compartido en v1 y v3? → true
```

### Estadísticas de temperaturas

Las lecturas de una estación llegan como texto, con coma decimal, huecos, errores del sensor y un valor imposible. Cada lectura se valida (texto vacío antes de convertir, `Number.isFinite`, rango físico) y los descartes se agrupan por motivo en un `Map`. Después aparecen dos bichos del módulo: `toSorted()` sin comparador ordena los números **como texto** y da una mediana absurda, y la variación respecto a ayer, redondeada, es `-0`, que `Intl` escribe con su signo.

[[exercise:07-estadisticas-de-temperaturas.md-]]

```text
válidas → (7) [-1.5, -2.25, -0.5, 3, 11, 12.5, 7]
descartadas → Map(3) {'no numérica' => ['21:00'], 'vacía' => ['22:00'], 'fuera de rango' => ['23:00']}
🐛 toSorted() → (7) [-0.5, -1.5, -2.25, 11, 12.5, 3, 7]
✅ toSorted((a, b) => a - b) → (7) [-2.25, -1.5, -0.5, 3, 7, 11, 12.5]
🐛 mediana → 11 | ✅ mediana → 3
mín -2,3 °C · máx 12,5 °C · amplitud 14,8 °C
media → 4,2 °C | horas bajo cero → 3
🐛 cambio → -0 °C
✅ cambio → 0 °C | ¿era -0? → true
```

### Agenda de contactos

Fusiona los contactos del móvil y del correo. La clave de cada contacto es su email normalizado, y un `Map` elimina los duplicados. El bicho interesante está en la fusión: `{ ...a, ...b }` copia **también** las propiedades de `b` que valen `undefined`, así que un contacto sin teléfono borra el teléfono bueno; la solución filtra esas propiedades con `entries → filter → fromEntries`. Después, `Intl.Collator` ordena como un diccionario, la agrupación por inicial junta la «Á» con la «A» pero respeta la «Ñ» como letra propia, e `Intl.ListFormat` escribe cada grupo con su «y».

[[exercise:08-agenda-de-contactos.md-]]

```text
🐛 teléfono de José → undefined
9 contactos → 7 sin duplicados
✅ José fusionado → {name: 'José Martín', phone: '+34 611 222 333', email: 'jmartin@example.com', company: 'Ferretería Martín'}
A: Álvaro Ruiz, Ana Torres y Andrés Gil
J: José Martín
N: Núria Puig
Ñ: Ñuño Campos
Z: Zoe Navarro
«jose» → ['José Martín (+34 611 222 333)']
```

## Ejercicios

Los cuatro ejercicios se corrigen solos, como los del módulo anterior: al final del código hay una función `check` que compara lo que obtienes con lo esperado e imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Los arrays y los `Map` se comparan a través de su JSON (`JSON.stringify([...map])`), el atajo para datos sencillos que viste en «JSON y copias». Al abrir cada ejercicio verás casi todo en rojo; tu objetivo es dejarlo todo en verde. Las instrucciones, las pistas y la solución están en el panel del ejercicio.

### Resume los gastos de un viaje

Tres amigos comparten los gastos de un viaje. Escribe `parseCents`, que lee importes en formato español (`'1.050,00'`) y los pasa a céntimos sin perder ninguno (`19.99 * 100` no es `1999`); `totalsByCategory`, que acumula en un `Map`; `splitEvenly`, que reparte el total sin inventar ni perder céntimos; y `formatEuros`, con `Intl`. Las comprobaciones cambian el espacio de no separación de `Intl` por uno normal antes de comparar.

[[exercise:09-ej-resumen-de-gastos.md-]]

### Prepara textos para una red social

Cuatro funciones de texto que fallan con emojis si cuentas con `length`: contar grafemas, recortar un mensaje sin partir una bandera, crear el *slug* de una URL quitando tildes y signos (`'Café y Ñandú: ¡guía 2026!'` → `'cafe-y-nandu-guia-2026'`) y quitar hashtags repetidos, incluido uno que llega en NFD.

[[exercise:10-ej-textos-para-redes.md-]]

### Calcula plazos en días hábiles

Una tienda promete «entrega en tres días hábiles». Escribe `parseDay`, que rechaza fechas que no existen (`Date` convierte el 30 de febrero en un día de marzo sin avisar), `isBusinessDay`, que descarta fines de semana y festivos guardados en un `Set`, y `addBusinessDays`, que avanza sobre una **copia** de la fecha. Todo trabaja en UTC, así que el resultado es el mismo en cualquier zona horaria.

[[exercise:11-ej-dias-habiles.md-]]

### Guarda y restaura un borrador

Un borrador de encuesta tiene una `Date`, un `Set` de etiquetas y un `Map` de respuestas. La versión inicial lo guarda con `JSON.stringify` y pierde la mitad de los datos sin ningún error; arréglalo, restaura el borrador reconstruyendo cada tipo (y devolviendo `null` si el texto no es JSON) y duplícalo con una copia que no comparta nada con el original.

[[exercise:12-ej-guardar-un-borrador.md-]]

## Resumen

- Dinero en céntimos enteros con `Math.round`; `Intl.NumberFormat` solo al mostrar, dividiendo entre 100 en el último momento.
- Texto de personas: `trim` y `normalize` al recibirlo; `Intl.Segmenter` para palabras y grafemas; `localeCompare` o `Intl.Collator` para ordenar.
- `Map` para diccionarios y contadores (nunca un objeto con claves que vienen de los datos); `Set` para valores únicos y operaciones de conjuntos.
- `JSON.parse` dentro de `try/catch`; reviver para reconstruir fechas; `Map` y `Set` se convierten en arrays antes de guardar.
- `{ ...obj }` copia un nivel y además copia las propiedades `undefined`; `structuredClone` copia todos los niveles; no mutar evita la mayoría de los problemas.
- Fechas: instantes como ISO con zona, fechas de calendario en UTC, y siempre `locale` y `timeZone` explícitos en `Intl`.

## Para profundizar

- [MDN: Intl](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [MDN: Intl.DateTimeFormat.prototype.formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts)
- [MDN: structuredClone](https://developer.mozilla.org/es/docs/Web/API/structuredClone)
- [javascript.info: Map and Set](https://javascript.info/map-set)
