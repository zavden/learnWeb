# JSON y copias

## Por qué importa

Casi todos los datos que maneja una web viajan como **JSON**: las respuestas de un servidor, lo que guardas en `localStorage`, los archivos de configuración. JSON nació de la sintaxis de los objetos de JavaScript, y por eso parece que cualquier objeto «es» JSON. No lo es: al convertir un objeto en texto se pierden cosas sin ningún aviso (fechas, `undefined`, `Map`, `NaN`…), y al leerlo vuelve otra cosa.

La segunda mitad de la lección trata un problema relacionado que aparece en cuanto modificas datos: **copiar** un objeto. Asignarlo a otra variable no lo copia, y las formas rápidas de copiar solo copian el primer nivel. Entender referencias y copias evita la familia de errores más frecuente en JavaScript: «he cambiado esto y se ha cambiado también aquello».

## JSON: un formato de texto

JSON (*JavaScript Object Notation*) es un formato de **texto** con seis tipos de valor: objetos, arrays, strings, números, booleanos y `null`. Sus reglas son más estrictas que las de JavaScript: las claves y los strings van entre **comillas dobles**, no hay comas finales, ni comentarios, ni `undefined`.

- `JSON.stringify(valor)` convierte un valor en un string JSON. El tercer argumento indenta el resultado para leerlo.
- `JSON.parse(texto)` analiza un string JSON y construye un valor **nuevo**.

[[exercise:01-stringify-y-parse.md-]]

> **Desde Python:** `json.dumps` y `json.loads`, con la misma correspondencia de tipos: `None` ↔ `null`, `True` ↔ `true`, `dict` ↔ objeto, `list` ↔ array.

### Lo que JSON pierde por el camino

`JSON.stringify` no falla con lo que no sabe representar: lo **descarta o lo transforma en silencio**.

| Valor | En una propiedad | En un array |
|---|---|---|
| `undefined`, funciones, símbolos | la propiedad desaparece | `null` |
| `NaN`, `Infinity`, `-Infinity` | `null` | `null` |
| `Date` | string ISO (`"2026-11-03T17:00:00.000Z"`) | string ISO |
| `Map`, `Set` | `{}` | `{}` |
| `BigInt` | lanza `TypeError` | lanza `TypeError` |

[[exercise:02-lo-que-json-pierde.md-]]

El caso más traicionero son las **fechas**: se serializan bien (como texto ISO), pero al leer el JSON vuelven como **strings**, y el primer `getFullYear()` lanza un `TypeError` lejos de donde estaba el problema.

[[exercise:03-fechas-tras-json.md-]]

### Controlar la conversión: replacer, reviver y toJSON

Ambas funciones aceptan un argumento extra para intervenir en el proceso:

- **Replacer** (segundo argumento de `stringify`): un array con las claves permitidas, o una función `(key, value)` que devuelve lo que se debe escribir (`undefined` para omitir). Útil para no filtrar datos sensibles.
- **Reviver** (segundo argumento de `parse`): una función `(key, value)` que recibe cada valor ya leído y devuelve el definitivo. Es el sitio para reconstruir fechas u otros tipos.
- **`toJSON()`**: si un objeto tiene este método, `stringify` serializa lo que devuelve. Así es como `Date` produce su string ISO.

[[exercise:04-replacer-y-reviver.md-]]

### `JSON.parse` es estricto

Cualquier desviación del formato lanza un `SyntaxError`: comillas simples, comas finales, claves sin comillas, comentarios o un texto vacío (muy frecuente cuando un servidor responde sin cuerpo). Los datos que vienen de fuera pueden estar mal formados, así que `JSON.parse` de datos externos va **siempre** dentro de un `try/catch`.

[[exercise:05-errores-de-parse.md-]]

## Referencias: asignar no es copiar

Cuando asignas un **primitivo** a otra variable, se copia el valor. Cuando asignas un **objeto** (o un array), se copia la **referencia**: las dos variables apuntan al mismo objeto, y un cambio hecho a través de una se ve a través de la otra.

```text
const original = { city: 'Sevilla' };       original ──┐
const alias = original;                      alias ─────┴──► { city: 'Sevilla' }
alias.city = 'Cádiz';  →  original.city también es 'Cádiz'
```

Por la misma razón, `===` entre objetos compara **identidad**: dos objetos con el mismo contenido son distintos. JavaScript no tiene un operador de igualdad de contenido; para datos sencillos, comparar sus JSON es un atajo válido (cuidado con el orden de las claves).

[[exercise:06-referencias.md-]]

> **Desde Python:** el modelo es idéntico (`b = a` tampoco copia una lista en Python). Cambia la comparación: en Python, `==` compara contenido y `is` compara identidad; en JavaScript, `===` solo compara identidad.

## Copia superficial frente a copia profunda

Una **copia superficial** (*shallow copy*) crea un contenedor nuevo, pero sus propiedades siguen apuntando a los mismos valores. Si uno de esos valores es otro objeto, ese objeto anidado queda **compartido**:

| Copia superficial | Objetos | Arrays |
|---|---|---|
| spread | `{ ...obj }` | `[...arr]` |
| funciones | `Object.assign({}, obj)` | `arr.slice()`, `Array.from(arr)` |

[[exercise:07-copia-superficial.md-]]

Una **copia profunda** (*deep copy*) copia todos los niveles. La herramienta moderna es `structuredClone(valor)`: conserva `Date`, `Map`, `Set`, arrays tipados e incluso referencias circulares. No copia funciones ni métodos (lanza `DataCloneError`), ni elementos del DOM, ni el prototipo de las instancias de tus clases (el resultado es un objeto plano).

El viejo truco `JSON.parse(JSON.stringify(x))` es una copia profunda con todas las pérdidas de JSON: fechas convertidas en texto, `Map` vacíos, `undefined` borrados, y error con referencias circulares. Úsalo solo con datos que ya son JSON puro.

[[exercise:08-structuredclone.md-]]

> **Desde Python:** `{ ...obj }` equivale a `copy.copy(obj)` y `structuredClone(obj)` a `copy.deepcopy(obj)`.

¿Cuándo basta la copia superficial? Cuando vas a sustituir propiedades, no a modificar objetos anidados por dentro. Es el patrón habitual del código moderno: en vez de mutar, se crea un objeto nuevo con lo que cambia (`{ ...settings, theme: 'light' }`). Lo verás a fondo en el módulo de funciones (inmutabilidad).

## Bestiario

- **Mis datos han perdido campos al guardarlos.** Síntoma: tras `JSON.stringify` desaparecen propiedades o aparecen `null`. Causa: `undefined`, funciones y símbolos se descartan; `NaN` e `Infinity` pasan a `null`. Solución: usa `null` para los valores vacíos y revisa qué tipos guardas. → [ver ejemplo](02-lo-que-json-pierde.md)
- **`getFullYear is not a function` después de leer un JSON.** Síntoma: una fecha que funcionaba deja de ser `Date`. Causa: JSON la guardó como string ISO y la devuelve como string. Solución: `new Date(texto)` o un reviver. → [ver ejemplo](03-fechas-tras-json.md)
- **`JSON.parse` lanza `SyntaxError` con algo que parece un objeto.** Síntoma: un texto «casi JSON» no se puede leer. Causa: comillas simples, comas finales, claves sin comillas, comentarios o texto vacío. Solución: genera JSON con `JSON.stringify` y envuelve `JSON.parse` en `try/catch`. → [ver ejemplo](05-errores-de-parse.md)
- **He cambiado la copia y se ha cambiado el original.** Síntoma: tras `{ ...obj }` o `slice()`, modificar algo anidado afecta a los dos. Causa: la copia es superficial; los objetos anidados se comparten. Solución: `structuredClone` para copiar todos los niveles. → [ver ejemplo](07-copia-superficial.md)

## Resumen

- JSON es un formato de texto con seis tipos; `stringify` convierte a texto y `parse` crea valores nuevos.
- `stringify` descarta `undefined`, funciones y símbolos, convierte `NaN`/`Infinity` en `null`, las fechas en strings y `Map`/`Set` en `{}`; con `BigInt` lanza error.
- Replacer y `toJSON` controlan la escritura; el reviver reconstruye tipos al leer.
- `JSON.parse` es estricto: protégelo con `try/catch`.
- Asignar un objeto copia la referencia; `===` compara identidad.
- Spread, `Object.assign` y `slice` son copias superficiales; `structuredClone` hace copias profundas.

## Para profundizar

- [MDN: JSON](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [MDN: structuredClone](https://developer.mozilla.org/es/docs/Web/API/structuredClone)
- [javascript.info: JSON methods, toJSON](https://javascript.info/json)
- [javascript.info: Object references and copying](https://javascript.info/object-copy)
- [json.org: la especificación completa en una página](https://www.json.org/json-es.html)
