# Fechas e Intl

## Por qué importa

Las fechas son la parte más antigua y peor diseñada de JavaScript: el objeto `Date` se copió de Java en 1995, en diez días, con los mismos defectos que Java corrigió poco después. Meses que empiezan en 0, strings que se interpretan en UTC o en hora local según un detalle de formato, objetos mutables… Cada uno de esos detalles produce errores reales: facturas con la fecha del día anterior, citas una hora desplazadas tras el cambio de hora, plazos calculados sobre el mes equivocado.

La buena noticia es la API **`Intl`**: el navegador trae los datos de idiomas, monedas, zonas horarias y reglas gramaticales de todo el mundo, y los usa para formatear fechas y números como espera cada usuario. Esta lección te enseña a esquivar las trampas de `Date` y a dejar el formato en manos de `Intl`.

## Una fecha es un número

Un `Date` guarda **un solo número**: los milisegundos transcurridos desde el 1 de enero de 1970 a medianoche UTC (el *epoch*). Año, mes, día y hora no se guardan: se **calculan** cada vez que los pides, según la zona horaria.

- `new Date()`: el instante actual. `Date.now()`: el mismo instante como número.
- `getTime()`: el número interno. `toISOString()`: el instante en formato ISO 8601, siempre en UTC (termina en `Z`).
- Restar dos fechas las convierte en números: el resultado son milisegundos.

[[exercise:01-una-fecha-es-un-numero.md-]]

> **Desde Python:** un `datetime` guarda sus componentes (año, mes, día…) y puede ser *naive* o *aware*. Un `Date` es siempre un instante absoluto; la zona horaria solo interviene al leerlo o escribirlo.

## Construir fechas a partir de números

`new Date(año, mes, día, hora, minuto)` construye una fecha en **hora local**, y `Date.UTC(...)` devuelve el número equivalente en UTC. Aquí está la trampa más famosa: **los meses van de 0 a 11**. Los días del mes sí empiezan en 1. Y `getDay()` no es el día del mes (eso es `getDate()`), sino el día de la **semana**, empezando en domingo = 0.

Además, `Date` no valida: un 30 de febrero se convierte, sin error, en el 2 de marzo.

[[exercise:02-meses-desde-cero.md-]]

## Strings y zonas horarias

Construir un `Date` a partir de un string es peligroso, porque la regla depende del formato:

| String | Se interpreta en |
|---|---|
| `'2026-03-10'` (solo fecha ISO) | **UTC** (medianoche en Greenwich) |
| `'2026-03-10T00:00'` (fecha y hora sin zona) | hora **local** |
| `'2026-03-10T00:00:00Z'` o `'...+01:00'` | la zona indicada |
| cualquier otro formato (`'10/03/2026'`) | depende del navegador: evítalo |

La consecuencia: en una zona con desfase negativo (toda América), `new Date('2026-03-10')` mostrado en hora local es el **9 de marzo**. Es el origen de los formularios que guardan «un día menos».

[[exercise:03-strings-y-zonas-horarias.md-]]

Regla práctica: para **instantes** (una reunión, un pedido) usa strings ISO completos con zona (`Z` o `+01:00`), y guárdalos y envíalos siempre así. Para **fechas de calendario** sin hora (un cumpleaños, un día festivo) trabaja con los componentes y formatea con una zona fija.

## Date es mutable

Los métodos `setFullYear`, `setMonth`, `setDate`, `setHours`… **modifican** el objeto. Y como un `Date` es un objeto, asignarlo a otra variable no lo copia (lo viste en la lección de JSON y copias): calcular un vencimiento puede cambiar la fecha de la factura. Copia siempre con `new Date(fecha)` antes de modificar.

Para sumar días, usa `setDate(getDate() + n)`: el desbordamiento ajusta mes y año por ti. Sumar `24 * 60 * 60 * 1000` milisegundos **no** es lo mismo: el día del cambio de hora dura 23 o 25 horas.

[[exercise:04-date-es-mutable.md-]]

## Comparar y ordenar

Los operadores `<` y `>` convierten los `Date` en números y funcionan bien. `===` no: compara si son el **mismo objeto**, y dos fechas del mismo instante son objetos distintos. Compara `getTime()`. Para ordenar, resta: `fechas.toSorted((a, b) => a - b)`.

[[exercise:05-comparar-y-ordenar-fechas.md-]]

## `Intl.DateTimeFormat`: mostrar fechas

No construyas fechas legibles concatenando `getDate()` y `getMonth() + 1`: cada idioma tiene su orden, sus nombres de mes y su formato de hora. `Intl.DateTimeFormat(locale, opciones)` crea un formateador reutilizable:

- `dateStyle` / `timeStyle`: `'full'`, `'long'`, `'medium'`, `'short'`.
- Campos sueltos: `weekday`, `day`, `month`, `year`, `hour`, `minute`…
- `timeZone`: la zona en la que mostrar el instante (`'Europe/Madrid'`, `'UTC'`…).

Indica siempre el `locale` y la `timeZone`: si no, se usan los del navegador del usuario, y el mismo código da resultados distintos en cada ordenador. `fecha.toLocaleDateString(locale, opciones)` es un atajo que crea un formateador nuevo en cada llamada.

[[exercise:06-intl-datetimeformat.md-]]

## `Intl.NumberFormat`: números y monedas

Lo mismo para los números: el separador decimal, la agrupación de miles y la posición del símbolo de moneda cambian con el idioma.

```text
es-ES  1234,50 €     12.345,50 €   (es-ES no agrupa los números de 4 cifras)
de-DE  1.234,50 €
en-US  $1,234.50
```

Además de monedas (`style: 'currency'`), formatea porcentajes (`'percent'`, sobre una fracción), unidades (`'unit'`) y notación compacta (`notation: 'compact'`). El texto resultante incluye **espacios de no separación** (U+00A0) para que el símbolo no quede solo al final de una línea, así que no lo compares con un string escrito a mano.

[[exercise:07-intl-numberformat.md-]]

> **Desde Python:** el módulo `locale` hace algo parecido, pero depende de los locales instalados en el sistema. `Intl` viene completo en todos los navegadores modernos.

## Tiempo relativo, plurales y listas

Tres formateadores más resuelven problemas que suelen programarse mal a mano:

- `Intl.RelativeTimeFormat`: «hace 3 días», «ayer», «dentro de 2 semanas».
- `Intl.PluralRules`: qué forma de plural usa un número en cada idioma (en español, `one` u `other`; en árabe hay seis categorías).
- `Intl.ListFormat`: une elementos con la conjunción correcta («Ana, Luis y Marta»).

[[exercise:08-intl-relativo-plurales-y-listas.md-]]

## El futuro: Temporal

Para sustituir a `Date` se ha diseñado **`Temporal`**, una API nueva con tipos distintos para cada concepto (`Temporal.PlainDate` para una fecha de calendario, `Temporal.ZonedDateTime` para un instante con zona, `Temporal.Duration`…), objetos inmutables y meses que empiezan en 1. Está llegando a los navegadores de forma progresiva: comprueba su disponibilidad con `typeof Temporal !== 'undefined'` antes de usarla. Mientras tanto, las reglas de esta lección te permiten usar `Date` sin sorpresas.

## Bestiario

- **La fecha sale un mes desplazada.** Síntoma: `new Date(2026, 3, 5)` es el 5 de **abril**. Causa: los meses van de 0 a 11. Solución: resta 1 al mes, o construye a partir de un string ISO completo. → [ver ejemplo](02-meses-desde-cero.md)
- **Guardo el 10 de marzo y aparece el 9.** Síntoma: un día menos en zonas con desfase negativo. Causa: `'2026-03-10'` se interpreta como medianoche UTC. Solución: strings ISO con zona explícita y formateo con `timeZone`. → [ver ejemplo](03-strings-y-zonas-horarias.md)
- **Al calcular el vencimiento cambió la fecha de emisión.** Síntoma: el `Date` original se modifica. Causa: los métodos `set*` mutan el objeto y la asignación no copia. Solución: `new Date(fecha)` antes de modificar. → [ver ejemplo](04-date-es-mutable.md)
- **Dos fechas iguales no son `===`.** Síntoma: `a === b` es `false` aunque representen el mismo instante. Causa: `===` compara objetos por identidad. Solución: `a.getTime() === b.getTime()`. → [ver ejemplo](05-comparar-y-ordenar-fechas.md)

## Resumen

- Un `Date` es un número de milisegundos desde 1970 UTC; los componentes se calculan según la zona horaria.
- Los meses van de 0 a 11 y `getDay()` empieza en domingo = 0; los valores fuera de rango se desbordan sin error.
- `'2026-03-10'` es UTC y `'2026-03-10T00:00'` es local: usa strings ISO con zona.
- `Date` es mutable: copia con `new Date(fecha)`; suma días con `setDate`.
- Compara con `getTime()`; ordena restando.
- Formatea siempre con `Intl` (`DateTimeFormat`, `NumberFormat`, `RelativeTimeFormat`, `PluralRules`, `ListFormat`) indicando `locale` y `timeZone`.

## Para profundizar

- [MDN: Date](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN: Intl](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [javascript.info: Date and time](https://javascript.info/date)
- [TC39: Temporal, documentación de la propuesta](https://tc39.es/proposal-temporal/docs/)
