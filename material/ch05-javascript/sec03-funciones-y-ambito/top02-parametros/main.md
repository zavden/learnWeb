# Parámetros

## Por qué importa

Los parámetros son el contrato de una función: qué necesita para trabajar. Python es estricto con ese contrato: si falta un argumento o sobra uno, lanza `TypeError`, y tiene argumentos con nombre, `*args` y `**kwargs`. JavaScript es mucho más permisivo (no avisa de nada) y no tiene argumentos con nombre, así que el código moderno usa otros patrones para conseguir lo mismo: valores por defecto, parámetros *rest* y objetos de opciones desestructurados.

Al final de la lección verás qué pasa exactamente cuando pasas un objeto a una función. La respuesta es la misma que en Python, y entenderla bien es la base de la lección sobre inmutabilidad.

## Argumentos que faltan o sobran

Una función de JavaScript se puede llamar con **cualquier número de argumentos**. Los parámetros que no reciben nada valen `undefined`, y los argumentos que sobran se ignoran. No hay error en ningún caso:

[[exercise:01-argumentos-que-faltan-o-sobran.md-]]

```text
describeTrip('Quito')                  → 'Viaje de Quito a undefined'
describeTrip('Quito', 'Lima', 'Cusco') → 'Viaje de Quito a Lima'
```

Esta permisividad tiene un motivo: muchas funciones del lenguaje llaman a tus callbacks con más argumentos de los que necesitas (`map` pasa elemento, índice y array), y así tu flecha puede declarar solo el primero. El precio es que un argumento olvidado no se detecta al llamar, sino más tarde, cuando un `undefined` aparece donde no debía. Si un parámetro es obligatorio, compruébalo y lanza tú el error.

> **Desde Python:** `describe_trip("Quito")` lanzaría `TypeError: missing 1 required positional argument`. En JavaScript, la comprobación es cosa tuya (o de TypeScript, que verás en su capítulo).

## Valores por defecto

Un parámetro puede tener un **valor por defecto**, con la misma sintaxis que en Python: `function greet(name, greeting = 'Hola')`. Pero hay una diferencia de fondo que juega a tu favor: en JavaScript, el valor por defecto se **evalúa en cada llamada**, en el momento en que falta el argumento.

[[exercise:02-valores-por-defecto.md-]]

Eso tiene tres consecuencias:

- `function addTag(tag, tags = [])` crea un array **nuevo** en cada llamada. El famoso error de Python con los valores por defecto mutables no existe aquí.
- Un valor por defecto puede usar los parámetros **anteriores**: `function pageRange(page, size = 20, first = (page - 1) * size + 1)`.
- Puede llamar a una función, que solo se ejecuta si el argumento falta: `function createOrder(product, id = nextId())`.

> **Desde Python:** en Python, `def add_tag(tag, tags=[])` evalúa `[]` **una sola vez**, al definir la función, y todas las llamadas comparten la misma lista. Por eso en Python se escribe `tags=None` y se crea la lista dentro. En JavaScript puedes escribir directamente `tags = []`.

### Solo `undefined` activa el valor por defecto

El valor por defecto se aplica cuando el argumento **es `undefined`**: porque falta o porque alguien pasó `undefined` explícitamente. Cualquier otro valor, incluido `null`, se respeta. Esto sorprende con datos de un servidor, que suele usar `null` para decir «sin valor»: `welcome(user.nickname)` acaba mostrando «Hola, null».

[[exercise:03-default-solo-con-undefined.md-]]

En código anterior a 2015 verás el truco `volume = volume || 50`. Además de no ser un valor por defecto de verdad, falla con los valores *falsy* legítimos: `0` y `''` se sustituyen por el valor por defecto. La regla:

| Quieres sustituir… | Escribe |
|--------------------|---------|
| solo un argumento ausente (`undefined`) | `function f(x = 50)` |
| `undefined` y también `null` | `const value = x ?? 50;` dentro de la función |
| cualquier valor *falsy* (casi nunca es lo que quieres) | `x \|\| 50` |

## Parámetros rest y spread

Un parámetro precedido de `...` recoge **todos los argumentos restantes** en un array: es el `*args` de Python. Tiene que ser el último parámetro, y si no llega ningún argumento, es un array vacío (nunca `undefined`).

El mismo símbolo `...` en una **llamada** hace lo contrario: reparte un array en argumentos sueltos. Es el *spread* que ya viste en «Arrays», y el `f(*lista)` de Python. El caso clásico es `Math.max(...temperatures)`: sin los puntos, `Math.max` recibe un único argumento (el array) y devuelve `NaN`.

[[exercise:04-parametros-rest.md-]]

| Python | JavaScript |
|--------|------------|
| `def total(*numbers):` | `function total(...numbers) {` |
| `numbers` es una tupla | `numbers` es un array |
| `total(*values)` | `total(...values)` |
| `def log(level, *messages):` | `function log(level, ...messages) {` |

### `arguments`, la forma antigua

Antes de que existieran los parámetros *rest*, toda función declarada con `function` tenía una variable implícita, `arguments`, con todos los argumentos de la llamada. Sigue existiendo y la encontrarás en código antiguo, pero tiene tres trampas: **no es un array** (no tiene `map` ni `reduce`), las **flechas no tienen** `arguments` propio (ven el de la función que las rodea) y, fuera del modo estricto, está **enlazado** con los parámetros: cambiar `arguments[0]` cambia el primer parámetro.

[[exercise:07-arguments.md-]]

En código nuevo, usa siempre `...rest`: es un array de verdad, funciona igual en flechas y en funciones normales, y no tiene enlaces ocultos.

## Parámetros con nombre: el objeto de opciones

JavaScript no tiene argumentos con nombre (`create_button("Guardar", size="lg")`). Cuando una función tiene varias opciones, el patrón es recibir un **objeto** y desestructurarlo directamente en la lista de parámetros, con sus valores por defecto:

```js
function createButton(label, { variant = 'primary', size = 'md', disabled = false } = {}) { … }

createButton('Enviar', { disabled: true, size: 'lg' });
```

Quien llama escribe los nombres, en cualquier orden, y solo los que necesita. Dentro del patrón puedes **renombrar** (`{ unit: targetUnit = 'km' }`) y recoger el resto de opciones con `...attributes`, que hace el papel de `**kwargs`:

[[exercise:05-parametros-con-nombre.md-]]

Hay una diferencia con Python que conviene tener presente: una opción mal escrita (`varient` en lugar de `variant`) **no da error**, simplemente no se usa. TypeScript detecta ese tipo de errores; en JavaScript tienes que tener cuidado.

### El `= {}` del final

Fíjate en el `= {}` que cierra el patrón. Los valores por defecto de **dentro** (`currency = 'EUR'`) responden a «¿y si el objeto no trae esa propiedad?». El `= {}` de **fuera** responde a «¿y si no hay objeto?». Sin él, llamar a la función sin opciones intenta desestructurar `undefined` y lanza un `TypeError`:

[[exercise:06-desestructurar-sin-default.md-]]

## Cómo se pasan los argumentos

Cuando llamas a una función, cada parámetro recibe una **copia del valor** del argumento. Con un número o un string no hay más que decir. Con un objeto o un array, el valor que se copia es una **referencia**: el parámetro y la variable de fuera apuntan al mismo objeto.

```text
const myCart = { items: ['Libro'] };      myCart ──┐
addItem(myCart, 'Lámpara');                        ├──► { items: ['Libro', 'Lámpara'] }
function addItem(cart, item) { … }        cart ────┘
```

De ahí salen dos reglas que ya conoces de Python:

- **Reasignar** el parámetro (`cart = { items: [] }`) solo cambia la variable local; el objeto de fuera no se entera.
- **Modificar** el objeto a través del parámetro (`cart.items.push(item)`) se ve desde fuera, porque solo hay un objeto.

[[exercise:08-paso-por-valor-de-la-referencia.md-]]

Una función que modifica los objetos que recibe obliga a quien la llama a saberlo. Por eso el código moderno prefiere funciones que **devuelven un objeto nuevo** con los cambios (`withItem` en el ejemplo) y dejan el original intacto. Ese estilo, la inmutabilidad, tiene su sitio en la lección «Funciones de orden superior».

> **Desde Python:** es exactamente el mismo modelo, al que a veces se llama «paso por asignación» o «paso por valor de la referencia». Ni Python ni JavaScript tienen paso por referencia de verdad (el `&` de C++ o el `ref` de C#): ninguna función puede hacer que una variable de quien la llama apunte a otra cosa.

## Bestiario

- **«Hola, null».**
  Síntoma: el valor por defecto no se aplica y aparece `null` en el texto.
  Causa: el default solo actúa con `undefined`; `null` es un valor.
  Solución: `x ?? valorPorDefecto` dentro de la función si `null` también significa «sin valor».
  → [ver ejemplo](03-default-solo-con-undefined.md)
- **El volumen 0 que se convierte en 50.**
  Síntoma: un argumento `0` o `''` se sustituye por el valor por defecto.
  Causa: el patrón antiguo `x = x || 50` trata todos los valores *falsy* como ausentes.
  Solución: un parámetro por defecto (`volume = 50`) o `??`.
  → [ver ejemplo](03-default-solo-con-undefined.md)
- **`TypeError` al llamar sin el objeto de opciones.**
  Síntoma: `formatPrice(1999)` falla con `Cannot read properties of undefined` (o `Cannot destructure property…`, según la versión del navegador).
  Causa: el patrón desestructura el segundo argumento, que es `undefined`.
  Solución: añade `= {}` al final del patrón.
  → [ver ejemplo](06-desestructurar-sin-default.md)
- **`arguments.reduce is not a function` y otras rarezas de `arguments`.**
  Síntoma: `arguments` no tiene métodos de array, una flecha lee los argumentos de otra función, o un parámetro cambia solo.
  Causa: `arguments` es un objeto parecido a un array, las flechas no lo tienen y fuera del modo estricto está enlazado con los parámetros.
  Solución: parámetros rest (`...args`).
  → [ver ejemplo](07-arguments.md)
- **La opción que no hace nada.**
  Síntoma: pasas `{ varient: 'ghost' }` y el botón sigue igual.
  Causa: las propiedades que el patrón no nombra se ignoran sin aviso.
  Solución: revisa los nombres; TypeScript lo detecta por ti.
  → [ver ejemplo](05-parametros-con-nombre.md)

## Resumen

- Los argumentos que faltan valen `undefined` y los que sobran se ignoran, sin error.
- Los valores por defecto se evalúan en cada llamada (no existe el problema del default mutable de Python) y solo se aplican con `undefined`.
- `...rest` recoge los argumentos restantes en un array; `...array` en una llamada los reparte.
- `arguments` es la forma antigua: no es un array y las flechas no lo tienen. Usa `...rest`.
- Para argumentos con nombre, recibe un objeto y desestructúralo con defaults: `{ size = 'md' } = {}`.
- Los objetos se pasan como referencias copiadas: reasignar el parámetro no afecta fuera; modificar el objeto, sí.

## Para profundizar

- [MDN: parámetros predeterminados](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN: parámetros rest](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [MDN: el objeto arguments](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/arguments)
- [javascript.info: parámetros rest y sintaxis spread](https://es.javascript.info/rest-parameters-spread)
- [javascript.info: asignación desestructurante (parámetros de función)](https://es.javascript.info/destructuring-assignment#smart-function-parameters)
